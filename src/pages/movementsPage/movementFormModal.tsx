"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  Table,
  Typography,
  Form,
  Button,
  Spin,
  Select,
  InputNumber,
} from "antd";
import { useRecipientsQuery } from "../../hooks/recipients/useRecipientsQuery";
import { useProductsQuery } from "../../hooks/products/useProductsQuery";
import { useBalanceQuery } from "../../hooks/balance/useBalanceQuery";
import { useCreateMovementMutation } from "../../hooks/movements/useMovementMutations";
import type { ICreateMovementRequest } from "../../api/movomentsApi";
import dayjs from "dayjs";
import { message } from "antd";

const { Text } = Typography;
const { Option } = Select;

interface MovementFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const MovementFormModal: React.FC<MovementFormModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [productDates, setProductDates] = useState<Record<string, string>>({});
  const { data: recipients, isLoading: isRecipientsLoading } =
    useRecipientsQuery();
  const { data: productsData, isLoading: isProductsLoading } =
    useProductsQuery();
  const { data: balanceData, isLoading: isBalanceLoading } = useBalanceQuery();
  const createMutation = useCreateMovementMutation();

  // Устанавливаем текущую дату при открытии модального окна
  useEffect(() => {
    if (visible) {
      const today = dayjs().format("YYYY-MM-DDTHH:mm:ss");
      form.setFieldsValue({ date: today });
    }
  }, [visible, form]);

  const getAvailableQuantity = useCallback(
    (productId: string) => {
      return (
        balanceData?.reduce(
          (acc, item) => (item.product === productId ? acc + item.qt : acc),
          0
        ) ?? 0
      );
    },
    [balanceData]
  );

  const getAvailableDates = (productId: string): string[] => {
    return (
      balanceData
        ?.filter((item) => item.product === productId && item.date !== null)
        .map((item) => item.date as string) || []
    );
  };

  const getOldestDate = (dates: string[]): string | null => {
    if (dates.length === 0) return null;
    return dates.reduce((oldest, current) =>
      new Date(current) < new Date(oldest) ? current : oldest
    );
  };

  const handleQuantityChange = (productId: string, value: number) => {
    const newQuantities = { ...quantities, [productId]: value };
    setQuantities(newQuantities);

    if (value > 0) {
      const availableDates = getAvailableDates(productId);
      const oldestDate = getOldestDate(availableDates);

      if (
        oldestDate &&
        (!productDates[productId] ||
          !availableDates.includes(productDates[productId]))
      ) {
        setProductDates((prev) => {
          const newDates = { ...prev };
          newDates[productId] = oldestDate;
          return newDates;
        });
      }
    } else {
      setProductDates((prev) => {
        const newDates = { ...prev };
        delete newDates[productId];
        return newDates;
      });
    }
  };

  const productColumns = [
    {
      title: "Название продукта",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text>
          <div>
            <Text type="secondary">
              В наличии: {getAvailableQuantity(record.id)} шт.
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Количество (шт.)",
      key: "quantity",
      render: (_: any, record: any) => (
        <InputNumber
          min={0}
          max={getAvailableQuantity(record.id)}
          value={quantities[record.id] || 0}
          onChange={(value) => {
            handleQuantityChange(record.id, value || 0);
          }}
          style={{ width: 100 }}
          disabled={getAvailableQuantity(record.id) <= 0}
        />
      ),
    },
    {
      title: "Дата партии",
      key: "date",
      render: (_: any, record: any) => {
        const availableDates = getAvailableDates(record.id);
        const selectedDate = productDates[record.id];

        return (
          <Select
            disabled={!quantities[record.id] || quantities[record.id] <= 0}
            value={selectedDate || undefined}
            onChange={(value) => {
              setProductDates((prev) => ({
                ...prev,
                [record.id]: value,
              }));
            }}
            style={{ width: "100%" }}
            placeholder="Выберите дату партии"
          >
            {availableDates.map((date) => (
              <Option key={date} value={date}>
                {new Date(date).toLocaleDateString()}
              </Option>
            ))}
          </Select>
        );
      },
    },
  ];

  const handleSubmit = async () => {
    try {
      const products = Object.entries(quantities)
        .filter(([_, quantity]) => quantity > 0)
        .map(([id, qt]) => {
          if (!productDates[id]) {
            throw new Error(
              `Не выбрана дата партии для продукта ${productsMap[id]}`
            );
          }
          return {
            id,
            qt,
            date: productDates[id],
          };
        });

      if (products.length === 0) {
        message.error("Укажите количество хотя бы для одного продукта");
        return;
      }

      const values = await form.validateFields();

      const movementData: ICreateMovementRequest = {
        date: dayjs().format("YYYY-MM-DDTHH:mm:ss"), // Всегда используем текущую дату
        recipient: values.recipient,
        products,
      };

      createMutation.mutate(movementData, {
        onSuccess: () => {
          onSuccess();
          form.resetFields();
          setQuantities({});
          setProductDates({});
        },
        onError: (error) => {
          message.error(error.message || "Ошибка при создании перемещения");
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const productsMap = useMemo(() => {
    const result: Record<string, string> = {};
    productsData?.forEach((el) => {
      result[el.id] = el.name;
    });
    return result;
  }, [productsData]);

  useEffect(() => {
    if (visible && productsData) {
      const initialQuantities: Record<string, number> = {};
      const initialDates: Record<string, string> = {};

      productsData.forEach((product) => {
        initialQuantities[product.id] = 0;
      });

      setQuantities(initialQuantities);
      setProductDates(initialDates);
      form.resetFields();
    }
  }, [visible, productsData, form]);

  return (
    <Modal
      title="Создать перемещение"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Отмена
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={createMutation.isPending}
        >
          Создать перемещение
        </Button>,
      ]}
      width={1000}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {/* Скрытое поле для даты */}
        <Form.Item name="date" hidden>
          <input type="hidden" />
        </Form.Item>

        <Form.Item
          label="Получатель"
          name="recipient"
          rules={[
            { required: true, message: "Пожалуйста, выберите получателя" },
          ]}
        >
          <Select
            placeholder="Выберите получателя"
            loading={isRecipientsLoading}
          >
            {recipients?.map((recipient) => (
              <Option key={recipient.id} value={recipient.id}>
                {recipient.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Spin spinning={isProductsLoading || isBalanceLoading}>
          <Table
            columns={productColumns}
            dataSource={productsData}
            rowKey="id"
            pagination={false}
            scroll={{ y: 400 }}
            bordered
          />
        </Spin>
      </Form>
    </Modal>
  );
};
