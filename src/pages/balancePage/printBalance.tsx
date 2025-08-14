// src/components/print/printInventory.tsx
import React from "react";
import { Table, Typography } from "antd";
import { IBalanceItem } from "../../api/balanceApi";

interface PrintInventoryProps {
  data: {
    key: string;
    productId: string;
    product: string;
    total: number;
    items: IBalanceItem[];
  }[];
  userData?: {
    fullName: string;
    address: string;
  };
}

export const PrintInventory: React.FC<PrintInventoryProps> = ({
  data,
  userData,
}) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();
  const formattedTime = currentDate.toLocaleTimeString();

  return (
    <div id="print-content">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div style={{ flex: 1 }}></div>
        <div style={{ textAlign: "left" }}>
          <div>
            <Typography.Text strong>Дата: </Typography.Text>
            <Typography.Text>
              {formattedDate} {formattedTime}
            </Typography.Text>
          </div>
          {userData?.address && (
            <div>
              <Typography.Text strong>Пункт: </Typography.Text>
              <Typography.Text>{userData.address}</Typography.Text>
            </div>
          )}
          {userData?.fullName && (
            <div>
              <Typography.Text strong>Ответственный: </Typography.Text>
              <Typography.Text>{userData.fullName}</Typography.Text>
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Typography.Title level={3}>Акт инвентаризации</Typography.Title>
      </div>

      <Table
        dataSource={data}
        columns={[
          { title: "Товар", dataIndex: "product", key: "product" },
          { title: "Общее количество", dataIndex: "total", key: "total" },
          {
            title: "Партии",
            key: "batches",
            render: (_, record) => (
              <div>
                {record.items.map((item, idx) => (
                  <div key={idx}>
                    {item.date
                      ? new Date(item.date).toLocaleDateString()
                      : "Без даты"}
                    : {item.qt}
                  </div>
                ))}
              </div>
            ),
          },
        ]}
        pagination={false}
        rowKey="productId"
      />

      <div
        style={{
          marginTop: 48,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div>
            <Typography.Text strong>Принял: </Typography.Text>
            <Typography.Text>_____________________________</Typography.Text>
          </div>
          <div>
            <Typography.Text strong>Подпись: </Typography.Text>
            <Typography.Text>____________________________</Typography.Text>
            <div>
              <Typography.Text strong>Дата: </Typography.Text>
              <Typography.Text>______________</Typography.Text>
            </div>
          </div>
        </div>

        <div>
          <Typography.Text strong>Передал: </Typography.Text>
          <Typography.Text>
            {userData?.fullName || "____________________________"}
          </Typography.Text>
          <div>
            <Typography.Text strong>Подпись: </Typography.Text>
            <Typography.Text>____________________________</Typography.Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export const printInventoryStyles = `
  @media print {
    body {
      margin: 0;
      padding: 10px !important; // Уменьшен отступ
      font-family: Arial, sans-serif;
      -webkit-print-color-adjust: exact;
    }
    
    #print-content {
      width: 100%;
      margin: 0;
      padding: 0;
    }
    
    .no-print {
      display: none !important;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 !important;
      page-break-inside: auto;
      font-size: 14px !important; // Уменьшен размер шрифта
    }
    
    th, td {
      border: 1px solid #000;
      padding: 6px !important; // Уменьшен padding
      text-align: left;
    }
    
    th {
      background-color: #f2f2f2 !important;
      font-weight: bold;
    }
    
    h3 {
      font-size: 16px !important; // Уменьшен размер заголовка
      font-weight: bold;
      margin-bottom: 12px !important;
      text-align: center;
    }
    
    .ant-modal {
      display: none !important;
    }
    
    .ant-table {
      font-size: 12px !important;
    }
    
    .ant-table-thead > tr > th {
      padding: 8px !important;
    }
    
    .ant-table-tbody > tr > td {
      padding: 6px !important;
    }
    
    @page {
      margin: 10mm !important; // Уменьшены отступы страницы
    }
  }
`;
