import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  Table,
  Input,
  Typography,
  DatePicker,
  Form,
  Button,
  Spin,
  Select,
  Alert,
  InputNumber,
} from "antd";
import { useProductsQuery } from "../../hooks/products/useProductsQuery";
import { useBalanceQuery } from "../../hooks/balance/useBalanceQuery";
import {
  useCreateWriteOffMutation,
  useUpdateWriteOffMutation,
} from "../../hooks/writeOffs/useWriteOffMutations";
import { toast } from "react-hot-toast";
import dayjs, { Dayjs } from "dayjs";
import {
  ICreateWriteOffsRequest,
  IWriteOffUpdateRequest,
} from "../../api/writeOffsApi";

const { Text } = Typography;
const { Option } = Select;

const WRITE_OFF_REASON_OTHER = "Иная причина (указать в комментарии)";
const WRITE_OFF_REASONS = [
  "Истечение срока годности",
  "Бой",
  "Бракераж",
  "Брак",
  "Представительские расходы",
  "Передано в бюджет",
  WRITE_OFF_REASON_OTHER,
];

const resolveWriteOffReasonFields = (description?: string) => {
  const normalizedDescription = description || "";
  const isKnownReason = WRITE_OFF_REASONS.includes(normalizedDescription);
  const writeOffReason = isKnownReason
    ? normalizedDescription
    : WRITE_OFF_REASON_OTHER;

  return {
    writeOffReason,
    writeOffComment:
      writeOffReason === WRITE_OFF_REASON_OTHER
        ? normalizedDescription || undefined
        : undefined,
  };
};

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
  const selectedWriteOffReason = Form.useWatch("writeOffReason", form);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [productDates, setProductDates] = useState<Record<string, string>>({});
  const { data: productsData, isLoading: isProductsLoading } =
    useProductsQuery();
  const { data: balanceData, isLoading: isBalanceLoading } = useBalanceQuery();

  const createMutation = useCreateWriteOffMutation();
  const updateMutation = useUpdateWriteOffMutation(write_off?.id);

  const today = dayjs().startOf("day");
  const minOffsetDays = -1;
  const availableDays = 2;
  const minDate = today.add(minOffsetDays, "day");
  const maxDate = today.add(minOffsetDays + availableDays - 1, "day");

  const disabledDate = (current: Dayjs) => {
    return current && (current < minDate || current > maxDate);
  };

  const isEditMode = !!write_off;

  const getOriginalWriteOffQuantity = useCallback(
    (productId: string, date?: string) => {
      if (!isEditMode || !write_off?.products) return 0;

      return write_off.products.reduce(
        (acc: number, product: any) =>
          product.id === productId && (!date || product.date === date)
            ? acc + (parseInt(product.qt) || 0)
            : acc,
        0,
      );
    },
    [isEditMode, write_off],
  );

  const getBalanceQuantity = useCallback(
    (productId: string, date?: string) => {
      return (
        balanceData?.reduce(
          (acc, item) =>
            item.product === productId && (!date || item.date === date)
              ? acc + item.qt
              : acc,
          0,
        ) ?? 0
      );
    },
    [balanceData],
  );

  const getAvailableQuantity = useCallback(
    (productId: string) => {
      return Math.max(
        0,
        getBalanceQuantity(productId) + getOriginalWriteOffQuantity(productId),
      );
    },
    [getBalanceQuantity, getOriginalWriteOffQuantity],
  );

  const getAvailableQuantityByDate = useCallback(
    (productId: string, date: string) => {
      return Math.max(
        0,
        getBalanceQuantity(productId, date) +
          getOriginalWriteOffQuantity(productId, date),
    );
    },
    [getBalanceQuantity, getOriginalWriteOffQuantity],
  );

  const getAvailableDates = useCallback(
    (productId: string): string[] => {
      const balanceDates =
        balanceData
          ?.filter((item) => item.product === productId && item.date !== null)
          .map((item) => item.date as string) || [];
      const documentDates =
        isEditMode && write_off?.products
          ? write_off.products
              .filter((product: any) => product.id === productId && product.date)
              .map((product: any) => product.date as string)
          : [];

      return Array.from(new Set([...balanceDates, ...documentDates]))
        .filter((date) => getAvailableQuantityByDate(productId, date) > 0)
        .sort(
          (firstDate, secondDate) =>
            new Date(firstDate).getTime() - new Date(secondDate).getTime(),
        );
    },
    [balanceData, getAvailableQuantityByDate, isEditMode, write_off],
  );

  const getOldestDate = (dates: string[]): string | null => {
    if (dates.length === 0) return null;
    return dates.reduce((oldest, current) =>
      new Date(current) < new Date(oldest) ? current : oldest,
    );
  };

  const handleQuantityChange = (productId: string, value: number) => {
    const availableDates = getAvailableDates(productId);
    const currentDate = productDates[productId];
    const selectedDate =
      currentDate && availableDates.includes(currentDate)
        ? currentDate
        : getOldestDate(availableDates);
    const maxQuantity = selectedDate
      ? getAvailableQuantityByDate(productId, selectedDate)
      : getAvailableQuantity(productId);
    const quantity = Math.min(Math.max(value, 0), maxQuantity);
    const newQuantities = { ...quantities, [productId]: quantity };
    setQuantities(newQuantities);

    if (quantity > 0) {
      if (selectedDate && productDates[productId] !== selectedDate) {
        setProductDates((prev) => {
          const newDates = { ...prev };
          newDates[productId] = selectedDate;
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
      render: (_: any, record: any) => {
        const selectedDate = productDates[record.id];
        const maxQuantity = selectedDate
          ? getAvailableQuantityByDate(record.id, selectedDate)
          : getAvailableQuantity(record.id);

        return (
          <InputNumber
            min={0}
            max={maxQuantity}
            precision={0}
            value={quantities[record.id] || 0}
            onChange={(value) => {
              handleQuantityChange(record.id, Number(value) || 0);
            }}
            style={{ width: 100 }}
            disabled={getAvailableQuantity(record.id) <= 0}
          />
        );
      },
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
              setQuantities((prev) => ({
                ...prev,
                [record.id]: Math.min(
                  prev[record.id] || 0,
                  getAvailableQuantityByDate(record.id, value),
                ),
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
          const productDate = productDates[id];

          if (!productDate) {
            throw new Error(
              `Не выбрана дата партии для продукта ${productsMap[id]}`,
            );
          }
          const availableQuantity = getAvailableQuantityByDate(id, productDate);
          if (qt > availableQuantity) {
            throw new Error(
              `Количество для ${productsMap[id]} не может быть больше остатка (${availableQuantity} шт.)`,
            );
          }
          return {
            id,
            qt,
            date: productDate,
          };
        });

      if (products.length === 0) {
        toast.error("Укажите количество хотя бы для одного продукта");
        return;
      }

      const values = await form.validateFields();
      const description =
        values.writeOffReason === WRITE_OFF_REASON_OTHER
          ? values.writeOffComment
          : values.writeOffReason;

      if (isEditMode) {
        // Режим редактирования
        const writeOffData: IWriteOffUpdateRequest = {
          products,
          description,
        };
        updateMutation.mutate(writeOffData, {
          onSuccess: () => {
            onSuccess();
            form.resetFields();
            setQuantities({});
            setProductDates({});
          },
        });
      } else {
        // Режим создания
        const formattedDate = values.date?.format("YYYY-MM-DDTHH:mm:ss");
        const writeOffData: ICreateWriteOffsRequest = {
          date: formattedDate,
          description,
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
      }
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
        const reasonFields = resolveWriteOffReasonFields(write_off.description);

        form.setFieldsValue({
          date: write_off.date ? dayjs(write_off.date) : undefined,
          writeOffReason: reasonFields.writeOffReason,
          writeOffComment: reasonFields.writeOffComment,
        });
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
          loading={createMutation.isPending || updateMutation.isPending}
          disabled={hasNegativeBalance}
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
        <Form.Item
          label="Дата списания"
          name="date"
          rules={[{ required: true, message: "Пожалуйста, выберите дату" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Выберите дату"
            disabledDate={isEditMode ? undefined : disabledDate}
            disabled={isEditMode}
          />
        </Form.Item>

        <Form.Item
          label="Причина списания"
          name="writeOffReason"
          rules={[
            {
              required: true,
              message: "Пожалуйста, выберите причину списания",
            },
          ]}
        >
          <Select
            placeholder="Выберите причину списания"
            onChange={(value) => {
              if (value !== WRITE_OFF_REASON_OTHER) {
                form.setFieldValue("writeOffComment", undefined);
              }
            }}
          >
            {WRITE_OFF_REASONS.map((reason) => (
              <Option key={reason} value={reason}>
                {reason}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedWriteOffReason === WRITE_OFF_REASON_OTHER && (
          <Form.Item
            label="Комментарий"
            name="writeOffComment"
            rules={[
              {
                required: true,
                message: "Пожалуйста, введите комментарий",
              },
              {
                whitespace: true,
                message: "Комментарий не может быть пустым",
              },
            ]}
          >
            <Input.TextArea rows={3} placeholder="Введите комментарий" />
          </Form.Item>
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
