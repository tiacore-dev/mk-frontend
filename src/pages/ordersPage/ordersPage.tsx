import React, { useState } from "react";
import { Table, Space, Spin, Alert, Button, Typography, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useOrdersQuery } from "../../hooks/orders/useOrderQuery";
import { IOrder } from "../../api/ordersApi";
import { useNavigate } from "react-router-dom";
import { OrderFormModal } from "./orderFormModal";

const { Title } = Typography;

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
      render: (status: string) => <Tag color="blue">{status}</Tag>,
    },
    {
      title: "Дата доставки",
      dataIndex: "delivery_date",
      key: "delivery_date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: " ",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => navigate(`/orders/${record.id}`)}>Подробнее</a>
        </Space>
      ),
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
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Список заявок</h1>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
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
