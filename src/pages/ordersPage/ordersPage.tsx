import React, { useState } from "react";
import { Table, Spin, Alert, Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useOrdersQuery } from "../../hooks/orders/useOrderQuery";
import { IOrder } from "../../api/ordersApi";
import { useNavigate } from "react-router-dom";
import { OrderFormModal } from "./orderFormModal";
import { PlusOutlined } from "@ant-design/icons";

// Константа для цветов статусов
const STATUS_COLORS = {
  Новая: "green",
  Перемещение: "cyan",
  Принята: "geekblue",
  default: "blue",
};

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data, isLoading, isError, error } = useOrdersQuery({
    limit: pagination.pageSize,
    offset: (pagination.current - 1) * pagination.pageSize,
  });

  const columns: ColumnsType<IOrder> = [
    {
      title: "Производство",
      dataIndex: "production",
      key: "production",
    },
    {
      title: "Дата заявки",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Пользователь",
      dataIndex: "user",
      key: "user",
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
            STATUS_COLORS.default
          }
          style={{ fontSize: 14 }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Дата перемещения",
      dataIndex: "delivery_date",
      key: "delivery_date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const handleTableChange = (pagination: any) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <h2>Список заявок</h2>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => setIsModalVisible(true)}
          style={{ marginLeft: 24, marginTop: 4 }}
        >
          Добавить заявку
        </Button>
      </div>

      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={data?.data}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
          }}
          onChange={handleTableChange}
          onRow={(record) => {
            return {
              onClick: () => navigate(`/orders/${record.id}`),
            };
          }}
        />
      </Spin>

      <OrderFormModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={() => setIsModalVisible(false)}
      />

      {isError && (
        <Alert
          message="Ошибка"
          description={
            error instanceof Error ? error.message : "Неизвестная ошибка"
          }
          type="error"
          showIcon
        />
      )}
    </div>
  );
};
