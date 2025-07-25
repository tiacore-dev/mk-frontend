"use client";

import React, { useState } from "react";
import { Table, Spin, Alert, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useWriteOffsQuery } from "../../hooks/writeOffs/useWriteOffsQuery";
import type { IWriteOff } from "../../api/writeOffsApi";
import { useNavigate } from "react-router-dom";
// import { OrderFormModal } from "./orderFormModal";
import { PlusOutlined } from "@ant-design/icons";
import { WriteOffFormModal } from "./writeOffFormModal";
import "../../styles/pageStyles.css";

export const WriteOffsPage: React.FC = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data, isLoading, isError, error } = useWriteOffsQuery({
    limit: pagination.pageSize,
    offset: (pagination.current - 1) * pagination.pageSize,
  });

  const columns: ColumnsType<IWriteOff> = [
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
      title: "Описание",
      dataIndex: "description",
      key: "description",
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
        <h2 className="page-title">Список списаний</h2>
        <div className="page-actions">
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => setIsModalVisible(true)}
          >
            Добавить списание
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
                onClick: () => navigate(`/write_offs/${record.id}`),
              };
            }}
          />
        </Spin>
      </div>

      <WriteOffFormModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={() => setIsModalVisible(false)}
      />
    </div>
  );
};
