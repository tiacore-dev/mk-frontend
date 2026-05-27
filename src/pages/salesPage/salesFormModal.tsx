import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  Table,
  Typography,
  DatePicker,
  Form,
  Button,
  Spin,
  InputNumber,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { toast } from "react-hot-toast";
import { useProductsQuery } from "../../hooks/products/useProductsQuery";
import { useBalanceQuery } from "../../hooks/balance/useBalanceQuery";
import {
  useCreateSaleMutation,
  useUpdateSaleMutation,
} from "../../hooks/sales/useSalesMutations";
import { ICreateSaleRequest, IUpdateSaleRequest } from "../../api/salesApi";

const { Text } = Typography;

interface ISalesFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  sale?: any;
}

export const SalesFormModal: React.FC<ISalesFormModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  sale,
}) => {
  const [form] = Form.useForm();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [sums, setSums] = useState<Record<string, number>>({});
  const { data: productsData, isLoading: isProductsLoading } =
    useProductsQuery();
  const { data: balanceData, isLoading: isBalanceLoading } = useBalanceQuery();

  const createMutation = useCreateSaleMutation();
  const updateMutation = useUpdateSaleMutation(sale?.id);
  const isEditMode = !!sale;

  const today = dayjs().startOf("day");
  const minOffsetDays = -1;
  const availableDays = 2;
  const minDate = today.add(minOffsetDays, "day");
  const maxDate = today.add(minOffsetDays + availableDays - 1, "day");

  const disabledDate = (current: Dayjs) => {
    return current && (current < minDate || current > maxDate);
  };

  const getOriginalSaleQuantity = useCallback(
    (productId: string) => {
      if (!isEditMode || !sale?.products) return 0;

      return sale.products.reduce(
        (acc: number, product: any) =>
          product.id === productId ? acc + (parseInt(product.qt) || 0) : acc,
        0
      );
    },
    [isEditMode, sale]
  );

  const getAvailableQuantity = useCallback(
    (productId: string) => {
      const balanceQuantity =
        balanceData?.reduce(
          (acc, item) => (item.product === productId ? acc + item.qt : acc),
          0
        ) ?? 0;

      return Math.max(
        0,
        balanceQuantity + getOriginalSaleQuantity(productId)
      );
    },
    [balanceData, getOriginalSaleQuantity]
  );

  const handleSubmit = async () => {
    try {
      const products = Object.entries(quantities)
        .filter(([_, quantity]) => quantity > 0)
        .map(([id, qt]) => ({
          id,
          qt,
          summ: sums[id] || 0,
        }));

      if (products.length === 0) {
        toast.error("Укажите количество хотя бы для одного продукта");
        return;
      }

      const hasInvalidSumm = products.some((product) => product.summ <= 0);
      if (hasInvalidSumm) {
        toast.error("Укажите сумму больше 0 для выбранных продуктов");
        return;
      }

      const productOverBalance = products.find(
        (product) => product.qt > getAvailableQuantity(product.id)
      );
      if (productOverBalance) {
        const productName =
          productsData?.find((product) => product.id === productOverBalance.id)
            ?.name || "выбранного продукта";
        toast.error(
          `Количество для ${productName} не может быть больше остатка (${getAvailableQuantity(
            productOverBalance.id
          )} шт.)`
        );
        return;
      }

      const values = await form.validateFields();

      if (isEditMode) {
        const saleData: IUpdateSaleRequest = { products };
        updateMutation.mutate(saleData, {
          onSuccess: () => {
            onSuccess();
            form.resetFields();
            setQuantities({});
            setSums({});
          },
        });
      } else {
        const saleData: ICreateSaleRequest = {
          date: values.date?.format("YYYY-MM-DDTHH:mm:ss"),
          products,
        };
        createMutation.mutate(saleData, {
          onSuccess: () => {
            onSuccess();
            form.resetFields();
            setQuantities({});
            setSums({});
          },
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  useEffect(() => {
    if (!visible || !productsData) return;

    const initialQuantities: Record<string, number> = {};
    const initialSums: Record<string, number> = {};

    productsData.forEach((product) => {
      initialQuantities[product.id] = 0;
      initialSums[product.id] = 0;
    });

    if (isEditMode && sale) {
      sale.products.forEach((product: any) => {
        initialQuantities[product.id] = parseInt(product.qt) || 0;
        initialSums[product.id] = Number(product.summ) || 0;
      });
      form.setFieldsValue({
        date: sale.date ? dayjs(sale.date) : undefined,
      });
    } else {
      form.resetFields();
    }

    setQuantities(initialQuantities);
    setSums(initialSums);
  }, [visible, productsData, sale, isEditMode, form]);

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
        const maxQuantity = getAvailableQuantity(record.id);

        return (
          <InputNumber
            min={0}
            max={maxQuantity}
            precision={0}
            value={quantities[record.id] || 0}
            onChange={(value) => {
              const quantity = Math.min(Number(value) || 0, maxQuantity);
              setQuantities((prev) => ({
                ...prev,
                [record.id]: quantity,
              }));
            }}
            style={{ width: 120 }}
            disabled={maxQuantity <= 0}
          />
        );
      },
    },
    {
      title: "Сумма",
      key: "summ",
      render: (_: any, record: any) => (
        <InputNumber
          min={0}
          value={sums[record.id] || 0}
          onChange={(value) => {
            setSums((prev) => ({
              ...prev,
              [record.id]: value || 0,
            }));
          }}
          style={{ width: 160 }}
        />
      ),
    },
  ];

  return (
    <Modal
      title={isEditMode ? "Редактировать реализацию" : "Добавить реализацию"}
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
        >
          {isEditMode ? "Сохранить изменения" : "Создать реализацию"}
        </Button>,
      ]}
      width={1000}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Дата реализации"
          name="date"
          rules={[{ required: true, message: "Пожалуйста, выберите дату" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Выберите дату"
            disabledDate={disabledDate}
            disabled={isEditMode}
          />
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
