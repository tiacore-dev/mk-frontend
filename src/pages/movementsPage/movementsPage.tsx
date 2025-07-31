"use client";

import type React from "react";
import { useState } from "react";
import { Table, Spin, Alert, Tag, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { useMovementsQuery } from "../../hooks/movements/useMovementsQuery";
import type { IMovement } from "../../api/movomentsApi";
import { PlusOutlined } from "@ant-design/icons";
import { MovementFormModal } from "./movementFormModal";
import "../../styles/pageStyles.css";

const STATUS_COLORS = {
  Новое: "green",
  "В работе": "cyan",
  Завершено: "geekblue",
  default: "blue",
};

export const MovementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data, isLoading, isError, error } = useMovementsQuery({
    limit: pagination.pageSize,
    offset: (pagination.current - 1) * pagination.pageSize,
  });

  const columns: ColumnsType<IMovement> = [
    {
      title: "Отправитель",
      dataIndex: "sender",
      key: "sender",
    },
    {
      title: "Получатель",
      dataIndex: "recipient",
      key: "recipient",
      render: (recipient: string) => recipient || "-",
    },
    {
      title: "Дата приема",
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
          className="status-tag"
          color={
            STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
            STATUS_COLORS.default
          }
        >
          {status}
        </Tag>
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
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Список перемещений</h2>
        <div className="page-actions">
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => setIsModalVisible(true)}
          >
            Добавить перемещение
          </Button>
        </div>
      </div>

      {isError && (
        <Alert
          message="Ошибка"
          description={
            error instanceof Error ? error.message : "Неизвестная ошибка"
          }
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <div className="page-content">
        <Spin spinning={isLoading}>
          <Table
            className="page-table"
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
                onClick: () => navigate(`/movements/${record.id}`),
              };
            }}
          />
        </Spin>
      </div>

      <MovementFormModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={() => setIsModalVisible(false)}
      />
    </div>
  );
};
