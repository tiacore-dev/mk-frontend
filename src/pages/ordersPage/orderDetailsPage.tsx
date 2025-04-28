import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  Alert,
  Button,
  Descriptions,
  Table,
  Typography,
  Tag,
} from "antd";
import { useOrderDetailsQuery } from "../../hooks/orders/useOrderQuery";
import { IOrderDetails } from "../../api/ordersApi";
import { useProductsQuery } from "../../hooks/products/useProductsQuery";
import { OrderFormModal } from "./orderFormModal";

const { Title, Text } = Typography;

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const {
    data: order,
    isLoading: isOrderLoading,
    isError: isOrderError,
    error: orderError,
  } = useOrderDetailsQuery(id || "");

  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
  } = useProductsQuery();

  const productsMap = useMemo(() => {
    const result: Record<string, string> = {};
    productsData?.forEach((el) => {
      result[el.id] = el.name;
    });
    return result;
  }, [productsData]);

  const handleBack = () => {
    navigate(-1);
  };

  const productColumns = [
    {
      title: "Название",
      dataIndex: "id",
      key: "name",
      render: (id: string) => (
        <Text strong>
          {productsMap[id] ?? `Неизвестный продукт (ID: ${id})`}
        </Text>
      ),
    },
    {
      title: "Количество (шт.)",
      dataIndex: "qt",
      key: "quantity",
      render: (text: string) => <Text>{text}</Text>,
    },
  ];

  if (isOrderError || isProductsError) {
    const error = orderError || productsError;
    return (
      <Alert
        message="Ошибка"
        description={
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }
        type="error"
        showIcon
        style={{ margin: "24px" }}
      />
    );
  }

  const isLoading = isOrderLoading || isProductsLoading;
  const canEdit = order?.status === "Новая";

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <Button onClick={handleBack}>Назад</Button>
        {canEdit && (
          <Button type="primary" onClick={() => setIsEditModalVisible(true)}>
            Редактировать
          </Button>
        )}
      </div>

      <Spin spinning={isLoading}>
        {order && (
          <>
            <Card
              title={
                <Title level={3}>
                  Детали заявки от {new Date(order.date).toLocaleDateString()}
                </Title>
              }
            >
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Производство">
                  <Text strong>{order.production}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Дата заявки">
                  {new Date(order.date).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Пользователь">
                  {order.user}
                </Descriptions.Item>
                <Descriptions.Item label="Статус">
                  <Tag color="blue">{order.status}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Дата доставки">
                  {new Date(order.delivery_date).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>

              <Title
                level={4}
                style={{ marginTop: "24px", marginBottom: "16px" }}
              >
                Продукты в заявке
              </Title>

              <Table
                columns={productColumns}
                dataSource={order.products}
                rowKey="id"
                pagination={false}
                bordered
                size="middle"
              />
            </Card>

            <OrderFormModal
              visible={isEditModalVisible}
              onCancel={() => setIsEditModalVisible(false)}
              onSuccess={() => setIsEditModalVisible(false)}
              order={order}
            />
          </>
        )}
      </Spin>
    </div>
  );
};
