import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Table,
  Input,
  Typography,
  DatePicker,
  Form,
  Button,
  Spin,
} from "antd";
import { useProductsQuery } from "../../hooks/products/useProductsQuery";
import {
  useCreateOrderMutation,
  useUpdateOrderMutation,
} from "../../hooks/orders/useOrderMutations";
import { toast } from "react-hot-toast";
import dayjs, { Dayjs } from "dayjs";
import {
  IOrderDetails,
  IOrderUpdateRequest,
  ICreateOrderRequest,
  IOrder,
} from "../../api/ordersApi";
import { useOrdersQuery } from "../../hooks/orders/useOrderQuery";

const { Text } = Typography;

const DATE_FORMAT = "DD.MM.YYYY";

interface IOrderFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  order?: IOrderDetails;
}

export const OrderFormModal: React.FC<IOrderFormModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  order,
}) => {
  const [form] = Form.useForm();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [displayQuantities, setDisplayQuantities] = useState<
    Record<string, string | number>
  >({});
  const { data: productsData, isLoading: isProductsLoading } =
    useProductsQuery();
  const createMutation = useCreateOrderMutation();
  const updateMutation = useUpdateOrderMutation(order?.id || "");
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const isEditMode = !!order;

  const { data: allOrdersResponse } = useOrdersQuery({
    limit: 10,
    offset: 0,
  });

  const allOrders = allOrdersResponse?.data || [];

  const handleKeyDown = (
    recordId: string,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const productIds = productsData?.map((product) => product.id) || [];
      const currentIndex = productIds.indexOf(recordId);

      if (currentIndex < productIds.length - 1) {
        const nextId = productIds[currentIndex + 1];
        inputRefs.current[nextId]?.focus();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const productIds = productsData?.map((product) => product.id) || [];
      const currentIndex = productIds.indexOf(recordId);

      if (currentIndex > 0) {
        const prevId = productIds[currentIndex - 1];
        inputRefs.current[prevId]?.focus();
      }
    }
  };

  const productColumns = [
    {
      title: "Название продукта",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Количество (шт.)",
      key: "quantity",
      render: (_: any, record: any) => (
        <Input
          ref={(el) => {
            const nativeInput = el?.input;
            if (nativeInput) {
              inputRefs.current[record.id] = nativeInput;
            } else {
              inputRefs.current[record.id] = null;
            }
          }}
          type="number"
          min={0}
          value={displayQuantities[record.id]}
          onChange={(e) => {
            const value = e.target.value;
            setDisplayQuantities((prev) => ({ ...prev, [record.id]: value }));
            const numericValue = value === "" ? 0 : parseInt(value) || 0;
            setQuantities((prev) => ({ ...prev, [record.id]: numericValue }));
          }}
          onKeyDown={(e) => handleKeyDown(record.id, e)}
          style={{ width: 100 }}
          onFocus={(e) => {
            e.target.select();
            if (quantities[record.id] === 0) {
              setDisplayQuantities((prev) => ({ ...prev, [record.id]: "" }));
            }
          }}
          onBlur={() => {
            if (displayQuantities[record.id] === "") {
              setQuantities((prev) => ({ ...prev, [record.id]: 0 }));
            }
          }}
        />
      ),
    },
  ];

  const handleSubmit = async () => {
    try {
      const products = Object.entries(quantities)
        .filter(([_, quantity]) => quantity > 0)
        .map(([id, qt]) => ({
          id,
          qt,
        }));

      if (products.length === 0) {
        toast.error("Укажите количество хотя бы для одного продукта");
        return;
      }

      if (isEditMode) {
        const orderData: IOrderUpdateRequest = {
          products,
        };
        updateMutation.mutate(orderData, {
          onSuccess: () => {
            onSuccess();
            form.resetFields();
            setQuantities({});
            setDisplayQuantities({});
          },
        });
      } else {
        const values = await form.validateFields();
        const selectedDate = values.date;

        const orderData: ICreateOrderRequest = {
          date: selectedDate.format("YYYY-MM-DDTHH:mm:ss"),
          products,
        };

        createMutation.mutate(orderData, {
          onSuccess: () => {
            onSuccess();
            form.resetFields();
            setQuantities({});
            setDisplayQuantities({});
          },
        });
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  useEffect(() => {
    if (visible) {
      if (isEditMode && order) {
        const initialQuantities: Record<string, number> = {};
        const initialDisplayQuantities: Record<string, string | number> = {};

        order.products.forEach((product) => {
          const qt = parseInt(product.qt) || 0;
          initialQuantities[product.id] = qt;
          initialDisplayQuantities[product.id] = qt === 0 ? "" : qt;
        });

        productsData?.forEach((product) => {
          if (initialQuantities[product.id] === undefined) {
            initialQuantities[product.id] = 0;
            initialDisplayQuantities[product.id] = "";
          }
        });

        setQuantities(initialQuantities);
        setDisplayQuantities(initialDisplayQuantities);
      } else if (productsData) {
        const initialQuantities: Record<string, number> = {};
        const initialDisplayQuantities: Record<string, string | number> = {};

        productsData.forEach((product) => {
          initialQuantities[product.id] = 0;
          initialDisplayQuantities[product.id] = "";
        });

        setQuantities(initialQuantities);
        setDisplayQuantities(initialDisplayQuantities);
        form.resetFields();
      }
    }
  }, [visible, productsData, order, isEditMode, form]);

  const disabledDate = (current: Dayjs) => {
    const today = dayjs().startOf("day");
    const minDate = today.add(3, "day");
    const maxDate = today.add(6, "day");

    // Проверяем, что дата входит в допустимый диапазон
    return current && (current < minDate || current > maxDate);
  };

  const isDateOccupied = (date: Dayjs) => {
    return allOrders
      .filter((order: IOrder) => !isEditMode || order.id !== order?.id)
      .some((order: IOrder) => dayjs(order.delivery_date).isSame(date, "day"));
  };

  const dateRender = (current: Dayjs) => {
    const isOutOfRange = disabledDate(current);
    const isOccupied = isDateOccupied(current);

    let style: React.CSSProperties = {};

    if (isOutOfRange) {
      style.color = "#ccc"; // Серый для дат вне диапазона
      style.cursor = "not-allowed";
    } else if (isOccupied) {
      style.color = "#f7a8a8"; // Красный для занятых дат
      style.cursor = "not-allowed";
      style.fontWeight = "bold";
    }

    return (
      <div className="ant-picker-cell-inner" style={style}>
        {current.date()}
      </div>
    );
  };

  return (
    <Modal
      title={isEditMode ? "Редактировать заявку" : "Добавить новую заявку"}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Отмена
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {isEditMode ? "Сохранить изменения" : "Сохранить заявку"}
        </Button>,
      ]}
      width={800}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {!isEditMode && (
          <>
            <Form.Item
              label="Дата перемещения"
              name="date"
              rules={[{ required: true, message: "Пожалуйста, выберите дату" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                disabledDate={disabledDate}
                dateRender={dateRender}
                placeholder="Выберите дату"
                format={DATE_FORMAT}
              />
            </Form.Item>

            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">
                Доступные даты: от {dayjs().add(3, "day").format(DATE_FORMAT)}
                до {dayjs().add(6, "day").format(DATE_FORMAT)} (кроме уже
                занятых)
              </Text>
            </div>
          </>
        )}

        <Spin spinning={isProductsLoading}>
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
