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
  Modal,
  Input,
} from "antd";
import { useProductsQuery } from "../../hooks/products/useProductsQuery";
import { useMovementDetailsQuery } from "../../hooks/movements/useMovementsQuery";
import { useAcceptMovement } from "../../hooks/movements/useMovementMutations";
import {
  EditOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import "../../styles/pageStyles.css";

const { Title, Text } = Typography;
const { TextArea } = Input;

export const MovementDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);

  const acceptMovementMutation = useAcceptMovement();

  const {
    data: movement,
    isLoading: isMovementLoading,
    isError: isMovementError,
    error: movementError,
    refetch: refetchMovementDetails,
  } = useMovementDetailsQuery(id || "");

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

  const handleAccept = async () => {
    if (!id) return;

    try {
      await acceptMovementMutation.mutateAsync({ id });
      refetchMovementDetails();
    } catch (error) {}
  };

  const handleAcceptWithComment = async () => {
    if (!id) return;

    try {
      await acceptMovementMutation.mutateAsync({ id, comment });
      setIsCommentModalVisible(false);
      setComment("");
      refetchMovementDetails();
    } catch (error) {}
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

  if (isMovementError || isProductsError) {
    const error = movementError || productsError;
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

  const isLoading = isMovementLoading || isProductsLoading;
  const canConfirm = movement?.status === "В работе";

  return (
    <div className="page-container">
      <Spin spinning={isLoading}>
        {movement && (
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
                    Детали перемещения от{" "}
                    {new Date(movement.date).toLocaleDateString()}
                  </Title>
                </div>

                <div className="detail-actions">
                  {canConfirm && (
                    <>
                      <Button
                        icon={<CheckOutlined />}
                        type="primary"
                        onClick={handleAccept}
                        loading={acceptMovementMutation.isPending}
                      >
                        Принять
                      </Button>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => setIsCommentModalVisible(true)}
                        loading={acceptMovementMutation.isPending}
                      >
                        Принять с корректировкой
                      </Button>
                    </>
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
                  <Descriptions.Item label="Производитель">
                    <Text strong>{movement.sender}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Статус">
                    <Tag
                      className="status-tag"
                      color={
                        movement.status === "Новое"
                          ? "green"
                          : movement.status === "В работе"
                          ? "cyan"
                          : movement.status === "Завершено"
                          ? "geekblue"
                          : "blue"
                      }
                    >
                      {movement.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Пользователь">
                    {movement.user}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <span>
                        Заявка
                        <ExportOutlined
                          style={{
                            marginLeft: 8,
                            color: "#0880ef",
                            cursor: "pointer",
                            fontSize: 16,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/orders/${movement.order}`);
                          }}
                        />
                      </span>
                    }
                  >
                    {""}
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
                  dataSource={movement.products}
                  rowKey="id"
                  pagination={false}
                  bordered
                  size="middle"
                />
              </div>
            </div>
          </>
        )}
      </Spin>

      <Modal
        className="page-modal"
        title="Введите комментарий"
        open={isCommentModalVisible}
        onOk={handleAcceptWithComment}
        onCancel={() => {
          setIsCommentModalVisible(false);
          setComment("");
        }}
        okText="Подтвердить"
        cancelText="Отмена"
        confirmLoading={acceptMovementMutation.isPending}
      >
        <TextArea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Введите комментарий..."
        />
      </Modal>
    </div>
  );
};
