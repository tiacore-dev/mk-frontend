import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Input,
  Typography,
  DatePicker,
  Form,
  Button,
  Spin,
  Tag,
} from "antd";
import { useProductsQuery } from "../../hooks/products/useProductsQuery";
import {
  useCreateOrderMutation,
  useUpdateOrderMutation,
} from "../../hooks/orders/useOrderMutations";
import { toast } from "react-hot-toast";
import dayjs, { Dayjs } from "dayjs";
import { IOrderDetails, IOrderRequest } from "../../api/ordersApi";

const { Text } = Typography;

interface IOrderFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  order?: IOrderDetails; // Для режима редактирования
}

export const OrderFormModal: React.FC<IOrderFormModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  order,
}) => {
  const [form] = Form.useForm();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { data: productsData, isLoading: isProductsLoading } =
    useProductsQuery();
  const createMutation = useCreateOrderMutation();
  const updateMutation = useUpdateOrderMutation(order?.id || "");

  const isEditMode = !!order;

  const disabledDate = (current: Dayjs) => {
    const today = dayjs().startOf("day");
    const minDate = today.add(3, "day");
    const maxDate = today.add(7, "day");
    return current && (current < minDate || current > maxDate);
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
          type="number"
          min={0}
          value={quantities[record.id] || 0}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 0;
            setQuantities((prev) => ({
              ...prev,
              [record.id]: value,
            }));
          }}
          style={{ width: 100 }}
        />
      ),
    },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const selectedDate = values.date;

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

      const orderData: IOrderRequest = {
        date: selectedDate.format("YYYY-MM-DDTHH:mm:ss"),
        products,
      };

      if (isEditMode) {
        updateMutation.mutate(orderData, {
          onSuccess: () => {
            onSuccess();
            form.resetFields();
            setQuantities({});
          },
        });
      } else {
        createMutation.mutate(orderData, {
          onSuccess: () => {
            onSuccess();
            form.resetFields();
            setQuantities({});
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
        // Заполняем форму данными для редактирования
        form.setFieldsValue({
          date: dayjs(order.date),
        });

        const initialQuantities: Record<string, number> = {};
        order.products.forEach((product) => {
          initialQuantities[product.id] = parseInt(product.qt) || 0;
        });

        // Добавляем нули для остальных продуктов
        productsData?.forEach((product) => {
          if (initialQuantities[product.id] === undefined) {
            initialQuantities[product.id] = 0;
          }
        });

        setQuantities(initialQuantities);
      } else if (productsData) {
        // Режим создания - инициализируем нулями
        const initialQuantities: Record<string, number> = {};
        productsData.forEach((product) => {
          initialQuantities[product.id] = 0;
        });
        setQuantities(initialQuantities);
      }
    }
  }, [visible, productsData, order, isEditMode, form]);

  return (
    <Modal
      title={isEditMode ? "Редактировать заявку" : "Добавить новую заявку"}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Отмена
        </Button>,
        <Button
          key="submit"
          type="primary"
          //   loading={createMutation.isLoading || updateMutation.isLoading}
          onClick={handleSubmit}
        >
          {isEditMode ? "Сохранить изменения" : "Создать заявку"}
        </Button>,
      ]}
      width={800}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Дата доставки"
          name="date"
          rules={[{ required: true, message: "Пожалуйста, выберите дату" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            disabledDate={disabledDate}
            placeholder="Выберите дату"
          />
        </Form.Item>

        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Доступные даты: от {dayjs().add(3, "day").format("DD.MM.YYYY")} до{" "}
            {dayjs().add(7, "day").format("DD.MM.YYYY")}
          </Text>
        </div>

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
