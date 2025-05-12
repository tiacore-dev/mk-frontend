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
import { useProductsQuery } from "../../hooks/products/useProductsQuery";
import { OrderFormModal } from "./orderFormModal";
import { EditOutlined, ArrowLeftOutlined } from "@ant-design/icons";

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
    <div style={{ padding: "16px" }}>
      <Spin spinning={isLoading}>
        {order && (
          <>
            <Card
              title={
                <div
                  style={{
                    display: "flex",
                  }}
                >
                  <Button
                    onClick={handleBack}
                    style={{
                      marginRight: 16,
                      marginTop: 24,
                    }}
                    icon={<ArrowLeftOutlined />}
                  ></Button>
                  <Title level={4}>
                    Детали заявки от {new Date(order.date).toLocaleDateString()}
                  </Title>
                </div>
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

              {canEdit && (
                <Button
                  icon={<EditOutlined />}
                  type="primary"
                  onClick={() => setIsEditModalVisible(true)}
                  style={{ marginTop: 16 }}
                >
                  Редактировать
                </Button>
              )}
              <Title
                level={4}
                style={{ marginTop: "24px", marginBottom: "16px" }}
              >
                Продукты:
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
