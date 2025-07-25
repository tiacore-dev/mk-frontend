"use client";

import type React from "react";
import { useMemo, useState } from "react";
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
import "../../styles/pageStyles.css";

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
    <div className="page-container">
      <Spin spinning={isLoading}>
        {order && (
          <>
            <div className="detail-card">
              <div className="detail-card-header">
                <Button
                  color="primary"
                  variant="link"
                  onClick={handleBack}
                  icon={<ArrowLeftOutlined />}
                  size="large"
                  className="detail-back-button"
                  style={{ color: "#005696" }}
                >
                  <span style={{ color: "#000000a0" }}>Назад</span>
                </Button>

                <div className="detail-card-title">
                  <Title level={4} style={{ margin: 0 }}>
                    Детали заявки от {new Date(order.date).toLocaleDateString()}
                  </Title>
                </div>

                <div className="detail-actions">
                  {canEdit && (
                    <Button
                      icon={<EditOutlined />}
                      type="primary"
                      onClick={() => setIsEditModalVisible(true)}
                    >
                      Редактировать
                    </Button>
                  )}
                </div>
              </div>

              <div className="detail-content">
                <Descriptions
                  className="detail-descriptions"
                  bordered
                  column={1}
                  style={{
                    marginBottom: "0px",
                  }}
                >
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
                    <Tag
                      className="status-tag"
                      color={
                        order.status === "Новая"
                          ? "green"
                          : order.status === "Перемещение"
                          ? "cyan"
                          : order.status === "Принята"
                          ? "geekblue"
                          : "blue"
                      }
                    >
                      {order.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Дата перемещения">
                    {new Date(order.delivery_date).toLocaleDateString()}
                  </Descriptions.Item>
                </Descriptions>

                <Title
                  level={4}
                  style={{
                    marginLeft: "8px",
                    marginBottom: "16px",
                    marginTop: "16px",
                  }}
                >
                  Продукты
                </Title>

                <Table
                  className="detail-table"
                  columns={productColumns}
                  dataSource={order.products}
                  rowKey="id"
                  pagination={false}
                  bordered
                />
              </div>
            </div>

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
