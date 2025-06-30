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
} from "antd";
import { useWriteOffDetailsQuery } from "../../hooks/writeOffs/useWriteOffsQuery";
import { useProductsQuery } from "../../hooks/products/useProductsQuery";
import { WriteOffFormModal } from "./writeOffFormModal";
import { EditOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const WriteOffDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const {
    data: writeOff,
    isLoading: isWriteOffLoading,
    isError: isWriteOffError,
    error: writeOffError,
  } = useWriteOffDetailsQuery(id || "");

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
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  if (isWriteOffError || isProductsError) {
    const error = writeOffError || productsError;
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

  const isLoading = isWriteOffLoading || isProductsLoading;

  return (
    <div style={{ padding: "16px" }}>
      <Spin spinning={isLoading}>
        {writeOff && (
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
                    Детали списания от{" "}
                    {new Date(writeOff.date).toLocaleDateString()}
                  </Title>
                </div>
              }
            >
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Дата списания">
                  {new Date(writeOff.date).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Пользователь">
                  {writeOff.user}
                </Descriptions.Item>
                <Descriptions.Item label="Описание">
                  {writeOff.description || "-"}
                </Descriptions.Item>
              </Descriptions>

              <Button
                icon={<EditOutlined />}
                type="primary"
                onClick={() => setIsEditModalVisible(true)}
                style={{ marginTop: 16 }}
              >
                Редактировать
              </Button>

              <Title
                level={4}
                style={{ marginTop: "24px", marginBottom: "16px" }}
              >
                Продукты:
              </Title>

              <Table
                columns={productColumns}
                dataSource={writeOff.products}
                rowKey="id"
                pagination={false}
                bordered
                size="middle"
              />
            </Card>

            <WriteOffFormModal
              visible={isEditModalVisible}
              onCancel={() => setIsEditModalVisible(false)}
              onSuccess={() => {
                setIsEditModalVisible(false);
                // Можно добавить обновление данных после успешного редактирования
              }}
              write_off={writeOff}
            />
          </>
        )}
      </Spin>
    </div>
  );
};
