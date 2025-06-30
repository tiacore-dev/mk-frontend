import React, { useState } from "react";
import { Table, Spin, Alert, Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useWriteOffsQuery } from "../../hooks/writeOffs/useWriteOffsQuery";
import { IWriteOff } from "../../api/writeOffsApi";
import { useNavigate } from "react-router-dom";
// import { OrderFormModal } from "./orderFormModal";
import { PlusOutlined } from "@ant-design/icons";
import { WriteOffFormModal } from "./writeOffFormModal";

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
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <h2>Список списаний</h2>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => setIsModalVisible(true)}
          style={{ marginLeft: 24, marginTop: 4 }}
        >
          Добавить списание
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
              onClick: () => navigate(`/write_offs/${record.id}`),
            };
          }}
        />
      </Spin>
      <WriteOffFormModal
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
