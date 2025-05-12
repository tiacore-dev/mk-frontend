import React from "react";
import { Table, Spin, Alert, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { useMovementsQuery } from "../../hooks/movements/useMovementsQuery";
import { IMovement } from "../../api/movomentsApi";

const STATUS_COLORS = {
  Новое: "green",
  "В работе": "cyan",
  Завершено: "geekblue",
  default: "blue",
};

export const MovementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  const { data, isLoading, isError, error } = useMovementsQuery({
    limit: pagination.pageSize,
    offset: (pagination.current - 1) * pagination.pageSize,
  });

  const columns: ColumnsType<IMovement> = [
    {
      title: "Производитель",
      dataIndex: "sender",
      key: "sender",
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
        <h2>Список перемещений</h2>
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
              onClick: () => navigate(`/movements/${record.id}`),
            };
          }}
        />
      </Spin>

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
