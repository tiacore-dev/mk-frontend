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

  // Обработчик принятия без комментария
  const handleAccept = async () => {
    if (!id) return;

    try {
      await acceptMovementMutation.mutateAsync({ id });
      refetchMovementDetails();
    } catch (error) {}
  };

  // Обработчик принятия с комментарием
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
    <div style={{ padding: "16px" }}>
      <Spin spinning={isLoading}>
        {movement && (
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
                      border: 0,
                      fontSize: 18,
                      boxShadow: "none",
                    }}
                    icon={<ArrowLeftOutlined />}
                  ></Button>
                  <Title level={4}>
                    Детали перемещения от{" "}
                    {new Date(movement.date).toLocaleDateString()}
                  </Title>
                </div>
              }
            >
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Производитель">
                  <Text strong>{movement.sender}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Статус">
                  {movement.status === "Новое" ? (
                    <Tag color="green" style={{ fontSize: 14 }}>
                      {movement.status}
                    </Tag>
                  ) : movement.status === "В работе" ? (
                    <Tag color="cyan" style={{ fontSize: 14 }}>
                      {movement.status}
                    </Tag>
                  ) : movement.status === "Завершено" ? (
                    <Tag color="geekblue" style={{ fontSize: 14 }}>
                      {movement.status}
                    </Tag>
                  ) : (
                    <Tag color="blue" style={{ fontSize: 14 }}>
                      {movement.status}
                    </Tag>
                  )}
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

              {canConfirm && (
                <>
                  <Button
                    icon={<CheckOutlined />}
                    type="primary"
                    onClick={handleAccept}
                    style={{ marginTop: 16 }}
                    loading={acceptMovementMutation.isPending}
                  >
                    Принять
                  </Button>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => setIsCommentModalVisible(true)}
                    style={{ marginLeft: 8 }}
                    loading={acceptMovementMutation.isPending}
                  >
                    Принять с корректировкой
                  </Button>
                </>
              )}

              <Title
                level={4}
                style={{ marginTop: "16px", marginBottom: "16px" }}
              >
                Продукты:
              </Title>

              <Table
                columns={productColumns}
                dataSource={movement.products}
                rowKey="id"
                pagination={false}
                bordered
                size="middle"
              />
            </Card>
          </>
        )}
      </Spin>

      {/* Модальное окно для комментария */}
      <Modal
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
