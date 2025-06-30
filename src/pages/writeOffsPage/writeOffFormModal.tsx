import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Table,
  Input,
  Typography,
  DatePicker,
  Form,
  Button,
  Spin,
  Alert,
  Select,
} from "antd";
import { useProductsQuery } from "../../hooks/products/useProductsQuery";
import { useBalanceQuery } from "../../hooks/balance/useBalanceQuery";
import { useCreateWriteOffMutation } from "../../hooks/writeOffs/useWriteOffMutations";
import { useWriteOffDetailsQuery } from "../../hooks/writeOffs/useWriteOffsQuery";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import { ICreateWriteOffsRequest } from "../../api/writeOffsApi";

const { Text } = Typography;
const { Option } = Select;

interface IWriteOffFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  write_off?: any;
}

export const WriteOffFormModal: React.FC<IWriteOffFormModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  write_off,
}) => {
  const [form] = Form.useForm();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [productDates, setProductDates] = useState<Record<string, string>>({});
  const { data: productsData, isLoading: isProductsLoading } =
    useProductsQuery();
  const { data: balanceData, isLoading: isBalanceLoading } = useBalanceQuery();
  const createMutation = useCreateWriteOffMutation();

  const isEditMode = !!write_off;

  const getAvailableQuantity = (productId: string) => {
    const productBalance = balanceData?.find(
      (item) => item.product === productId
    );
    return productBalance ? productBalance.qt : 0;
  };

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
      // Если количество 0, удаляем дату из состояния
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
        <Input
          type="number"
          min={0}
          max={getAvailableQuantity(record.id)}
          value={quantities[record.id] || 0}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 0;
            handleQuantityChange(record.id, value);
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
        toast.error("Укажите количество хотя бы для одного продукта");
        return;
      }

      const values = await form.validateFields();

      const writeOffData: ICreateWriteOffsRequest = {
        date: values.date.format("YYYY-MM-DDTHH:mm:ss"),
        description: values.description,
        products,
      };

      createMutation.mutate(writeOffData, {
        onSuccess: () => {
          onSuccess();
          form.resetFields();
          setQuantities({});
          setProductDates({});
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
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
    if (visible) {
      if (isEditMode && write_off) {
        const initialQuantities: Record<string, number> = {};
        const initialDates: Record<string, string> = {};

        write_off.products.forEach((product: any) => {
          initialQuantities[product.id] = parseInt(product.qt) || 0;
          initialDates[product.id] = product.date;
        });

        setQuantities(initialQuantities);
        setProductDates(initialDates);
      } else if (productsData) {
        const initialQuantities: Record<string, number> = {};
        const initialDates: Record<string, string> = {};

        productsData.forEach((product) => {
          initialQuantities[product.id] = 0;
        });

        setQuantities(initialQuantities);
        setProductDates(initialDates);
        form.resetFields();
      }
    }
  }, [visible, productsData, write_off, isEditMode, form]);

  const hasNegativeBalance = useMemo(() => {
    return balanceData?.some((item) => item.qt < 0);
  }, [balanceData]);

  return (
    <Modal
      title={isEditMode ? "Редактировать списание" : "Добавить новое списание"}
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
          // disabled={hasNegativeBalance}
        >
          {isEditMode ? "Сохранить изменения" : "Создать списание"}
        </Button>,
      ]}
      width={1000}
      destroyOnClose
    >
      {hasNegativeBalance && (
        <Alert
          message="Внимание"
          description="Создание списаний недоступно, так как есть нераспределенные реализации (отрицательные остатки)."
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical">
        {!isEditMode && (
          <>
            <Form.Item
              label="Дата списания"
              name="date"
              rules={[{ required: true, message: "Пожалуйста, выберите дату" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Выберите дату"
              />
            </Form.Item>

            <Form.Item
              label="Описание"
              name="description"
              rules={[
                { required: true, message: "Пожалуйста, введите описание" },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Введите описание списания"
              />
            </Form.Item>
          </>
        )}

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
