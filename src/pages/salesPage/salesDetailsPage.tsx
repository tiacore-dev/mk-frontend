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
  Tooltip,
} from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useSaleDetailsQuery } from "../../hooks/sales/useSalesQuery";
import { useProductsQuery } from "../../hooks/products/useProductsQuery";
import { SalesFormModal } from "./salesFormModal";
import dayjs from "dayjs";
import "../../styles/pageStyles.css";

const { Title, Text } = Typography;

export const SalesDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const {
    data: sale,
    isLoading: isSaleLoading,
    isError: isSaleError,
    error: saleError,
  } = useSaleDetailsQuery(id || "");

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
      render: (productId: string) => (
        <Text strong>
          {productsMap[productId] ?? `Неизвестный продукт (ID: ${productId})`}
        </Text>
      ),
    },
    {
      title: "Количество (шт.)",
      dataIndex: "qt",
      key: "quantity",
      render: (value: string) => <Text>{value}</Text>,
    },
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      render: (date: string | null) =>
        date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: "Цена",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Сумма",
      dataIndex: "summ",
      key: "summ",
    },
  ];

  if (isSaleError || isProductsError) {
    const error = saleError || productsError;
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

  const isLoading = isSaleLoading || isProductsLoading;
  const isEditableByDate = Boolean(
    sale &&
      (() => {
        const saleDay = dayjs(sale.date).startOf("day");
        const today = dayjs().startOf("day");
        const yesterday = today.subtract(1, "day");
        return saleDay.isSame(today) || saleDay.isSame(yesterday);
      })()
  );
  const hasFilledParty = Boolean(
    sale?.products?.some((product) => Boolean(product.date))
  );
  const canEdit = isEditableByDate && !hasFilledParty;
  const editBlockReason = !isEditableByDate
    ? "Редактирование доступно только для реализаций за сегодня и вчера."
    : hasFilledParty
    ? "Редактирование возможно только пока ни у одного товара не заполнена партия."
    : "";

  return (
    <div className="page-container">
      <Spin spinning={isLoading}>
        {sale && (
          <>
            {!canEdit && (
              <Alert
                message="Редактирование недоступно"
                description={editBlockReason}
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
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
                    Детали реализации от{" "}
                    {new Date(sale.date).toLocaleDateString()}
                  </Title>
                </div>

                <div className="detail-actions">
                  <Tooltip title={canEdit ? "" : editBlockReason}>
                    <Button
                      icon={<EditOutlined />}
                      type="primary"
                      onClick={() => setIsEditModalVisible(true)}
                      disabled={!canEdit}
                    >
                      Редактировать
                    </Button>
                  </Tooltip>
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
                  <Descriptions.Item label="Дата реализации">
                    {new Date(sale.date).toLocaleDateString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Пользователь">
                    {sale.user}
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
                  dataSource={sale.products}
                  rowKey={(record, index) =>
                    `${record.id}-${record.date || "no-date"}-${index}`
                  }
                  pagination={false}
                  bordered
                />
              </div>
            </div>
            <SalesFormModal
              visible={isEditModalVisible}
              onCancel={() => setIsEditModalVisible(false)}
              onSuccess={() => setIsEditModalVisible(false)}
              sale={sale}
            />
          </>
        )}
      </Spin>
    </div>
  );
};
