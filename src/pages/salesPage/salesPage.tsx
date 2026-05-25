"use client";

import React from "react";
import { Table, Spin, Alert, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSalesQuery } from "../../hooks/sales/useSalesQuery";
import type { ISale } from "../../api/salesApi";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import { SalesFormModal } from "./salesFormModal";
import "../../styles/pageStyles.css";

export const SalesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  const { data, isLoading, isError, error } = useSalesQuery({
    limit: pagination.pageSize,
    offset: (pagination.current - 1) * pagination.pageSize,
  });

  const columns: ColumnsType<ISale> = [
    {
      title: "Дата реализации",
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
      title: "Сумма",
      dataIndex: "summ",
      key: "summ",
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
        <h2 className="page-title">Список реализаций</h2>
        <div className="page-actions">
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => setIsModalVisible(true)}
          >
            Добавить реализацию
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
                onClick: () => navigate(`/sales/${record.id}`),
              };
            }}
          />
        </Spin>
      </div>

      <SalesFormModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={() => setIsModalVisible(false)}
      />
    </div>
  );
};
