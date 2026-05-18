"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
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
  PrinterOutlined,
} from "@ant-design/icons";
import { PrintMovement, printMovementStyles } from "./printMovement";
import "../../styles/pageStyles.css";

const { Title, Text } = Typography;
const { TextArea } = Input;

export const MovementDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);

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

  const openPrintModal = () => {
    setIsPrintModalVisible(true);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("print-content");
    if (!printContent) return;

    const styles = printMovementStyles;
    const printWindow = document.createElement("iframe");

    printWindow.style.position = "absolute";
    printWindow.style.width = "0";
    printWindow.style.height = "0";
    printWindow.style.border = "none";
    printWindow.style.left = "-9999px";

    document.body.appendChild(printWindow);

    const doc = printWindow.contentDocument;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Печать перемещения</title>
            <style>${styles}</style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.frameElement.parentNode.removeChild(window.frameElement);
                }, 100);
              }, 100);
            </script>
          </body>
        </html>
      `);
      doc.close();
    } else {
      document.body.removeChild(printWindow);
    }
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
      title: "Партия",
      dataIndex: "batch",
      key: "batch",
      render: (text: string) => <Text>{text}</Text>,
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

  // Получаем данные текущего пользователя
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const currentUserId = userData.address;

  // Проверяем, может ли текущий пользователь принять перемещение
  // Принимать может только получатель и только если статус "В работе"
  const canConfirm =
    movement?.status === "В работе" && movement?.recipient === currentUserId;
  const canPrint = movement?.sender === currentUserId;
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
                  {canPrint && (
                    <Button
                      type="primary"
                      icon={<PrinterOutlined />}
                      onClick={openPrintModal}
                    >
                      Печать
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
                  <Descriptions.Item label="Отправитель">
                    <Text strong>{movement.sender}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Получатель">
                    <Text strong>{movement.recipient || "-"}</Text>
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

                  {movement.order != "00000000-0000-0000-0000-000000000000" && (
                    <Descriptions.Item
                      label={
                        <span
                          style={{
                            color: "#016fc4ff",
                            cursor: "pointer",
                            fontSize: 16,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/orders/${movement.order}`);
                          }}
                        >
                          Заявка
                          <ExportOutlined
                            style={{
                              marginLeft: 8,
                              color: "#016fc4ff",
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
                  )}
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
                />
              </div>
            </div>
          </>
        )}
      </Spin>

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

      <Modal
        className="page-modal"
        open={isPrintModalVisible}
        onCancel={() => setIsPrintModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setIsPrintModalVisible(false)}>
            Отменить
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            Печать
          </Button>,
        ]}
      >
        {movement && (
          <PrintMovement
            data={{
              id: movement.id,
              date: movement.date,
              user: movement.user,
              sender: movement.sender,
              recipient: movement.recipient,
              status: movement.status,
              products: movement.products,
              order: movement.order,
            }}
            productsMap={productsMap}
            userData={userData}
          />
        )}
      </Modal>
    </div>
  );
};
