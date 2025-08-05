// src/components/print/printMovement.tsx
import type React from "react";
import { Table, Typography } from "antd";
import { IProduct } from "../../api/movomentsApi";

interface PrintMovementProps {
  data: {
    id: string;
    date: string;
    user: string;
    sender: string;
    recipient?: string;
    status: string;
    products: IProduct[];
    order?: string;
  };
  productsMap: Record<string, string>;
  userData?: {
    fullName: string;
    address: string;
  };
}

export const PrintMovement: React.FC<PrintMovementProps> = ({
  data,
  productsMap,
  userData,
}) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();
  const formattedTime = currentDate.toLocaleTimeString();

  const totalQuantity = data.products.reduce(
    (sum, product) => sum + Number.parseInt(product.qt),
    0
  );

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
            <Typography.Text strong>Дата печати: </Typography.Text>
            <Typography.Text>
              {formattedDate} {formattedTime}
            </Typography.Text>
          </div>
          <div>
            <Typography.Text strong>Дата перемещения: </Typography.Text>
            <Typography.Text>
              {new Date(data.date).toLocaleDateString()}
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
        <Typography.Title level={3}>Акт перемещения товаров</Typography.Title>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Typography.Text strong>Отправитель: </Typography.Text>
        <Typography.Text>{data.sender}</Typography.Text>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Typography.Text strong>Получатель: </Typography.Text>
        <Typography.Text>{data.recipient || "-"}</Typography.Text>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Typography.Text strong>Статус: </Typography.Text>
        <Typography.Text>{data.status}</Typography.Text>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Typography.Text strong>Ответственное лицо: </Typography.Text>
        <Typography.Text>{data.user}</Typography.Text>
      </div>

      <Table
        dataSource={data.products}
        columns={[
          {
            title: "№",
            key: "index",
            width: 50,
            render: (_, __, index) => index + 1,
          },
          {
            title: "Наименование товара",
            dataIndex: "id",
            key: "productName",
            render: (productId: string) => (
              <Typography.Text strong>
                {productsMap[productId] || `Продукт ${productId}`}
              </Typography.Text>
            ),
          },
          {
            title: "Количество (шт.)",
            dataIndex: "qt",
            key: "quantity",
            align: "center",
          },
        ]}
        pagination={false}
        rowKey={(record, index) => `${record.id}-${index}`}
        bordered
        size="middle"
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row style={{ backgroundColor: "#fafafa" }}>
              <Table.Summary.Cell index={0} colSpan={2}>
                <Typography.Text strong>ИТОГО:</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="center">
                <Typography.Text strong>{totalQuantity}</Typography.Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />

      <div
        style={{
          marginTop: 48,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ marginBottom: 16 }}>
            <Typography.Text strong>Перемещение оформил: </Typography.Text>
            <Typography.Text>
              {data.user || "____________________________"}
            </Typography.Text>
          </div>
          <div>
            <Typography.Text strong>Подпись: </Typography.Text>
            <Typography.Text>____________________________</Typography.Text>
          </div>
          <div style={{ marginTop: 8 }}>
            <Typography.Text strong>Дата: </Typography.Text>
            <Typography.Text>______________</Typography.Text>
          </div>
        </div>

        <div>
          <div style={{ marginBottom: 16 }}>
            <Typography.Text strong>Получил: </Typography.Text>
            <Typography.Text>____________________________</Typography.Text>
          </div>
          <div>
            <Typography.Text strong>Подпись: </Typography.Text>
            <Typography.Text>____________________________</Typography.Text>
          </div>
          <div style={{ marginTop: 8 }}>
            <Typography.Text strong>Дата: </Typography.Text>
            <Typography.Text>______________</Typography.Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export const printMovementStyles = `
  @media print {
    body {
      margin: 0;
      padding: 20px;
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
      margin: 16px 0;
      page-break-inside: auto;
    }
    
    th, td {
      border: 1px solid #000;
      padding: 8px;
      text-align: left;
    }
    
    th {
      background-color: #f2f2f2 !important;
      font-weight: bold;
    }
    
    h3 {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 16px;
      text-align: center;
    }
    
    .ant-modal {
      display: none !important;
    }
    
    .ant-table-summary {
      background-color: #f2f2f2 !important;
    }
  }
`;
