// src/components/print/printReport.tsx
import React from "react";
import { Table, Typography } from "antd";
import { IReportTableData } from "./reportPage";

interface PrintReportProps {
  data: IReportTableData[];
  userData?: {
    fullName: string;
    address: string;
  };
  period: string;
}

export const PrintReport: React.FC<PrintReportProps> = ({
  data,
  userData,
  period,
}) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();
  const formattedTime = currentDate.toLocaleTimeString();

  const totals = data.reduce(
    (acc, item) => ({
      startBalance: acc.startBalance + item.startBalance,
      order: acc.order + item.order,
      received: acc.received + item.received,
      sold: acc.sold + item.sold,
      writtenOff: acc.writtenOff + item.writtenOff,
      endBalance: acc.endBalance + item.endBalance,
    }),
    {
      startBalance: 0,
      order: 0,
      received: 0,
      sold: 0,
      writtenOff: 0,
      endBalance: 0,
    }
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
            <Typography.Text strong>Отчет за период: </Typography.Text>
            <Typography.Text>{period}</Typography.Text>
          </div>
          {userData?.address && (
            <div>
              <Typography.Text strong>Пункт: </Typography.Text>
              <Typography.Text>{userData.address}</Typography.Text>
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Typography.Title level={3}>Отчет по движению товаров</Typography.Title>
      </div>

      <Table
        dataSource={data}
        columns={[
          {
            title: "Наименование товара",
            dataIndex: "productName",
            key: "productName",
            width: 250, // Увеличена ширина первого столбца
            render: (text: string) => (
              <Typography.Text strong>{text}</Typography.Text>
            ),
          },
          {
            title: "Начальный остаток",
            dataIndex: "startBalance",
            key: "startBalance",
            align: "center",
            width: 80,
          },
          {
            title: "Заказано",
            dataIndex: "order",
            key: "order",
            align: "center",
            width: 70,
          },
          {
            title: "Поступило",
            dataIndex: "received",
            key: "received",
            align: "center",
            width: 70,
          },
          {
            title: "Продано",
            dataIndex: "sold",
            key: "sold",
            align: "center",
            width: 70,
          },
          {
            title: "Списано",
            dataIndex: "writtenOff",
            key: "writtenOff",
            align: "center",
            width: 70,
          },
          {
            title: "Конечный остаток",
            dataIndex: "endBalance",
            key: "endBalance",
            align: "center",
            width: 80,
          },
          {
            title: "% остатка",
            dataIndex: "balanceRate",
            key: "balanceRate",
            align: "center",
            width: 70,
            render: (value: number) => `${value}%`,
          },
        ]}
        pagination={false}
        rowKey="productId"
        bordered
        size="middle"
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row style={{ backgroundColor: "#fafafa" }}>
              <Table.Summary.Cell index={0}>
                <Typography.Text strong>ИТОГО:</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="center">
                <Typography.Text strong>{totals.startBalance}</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="center">
                <Typography.Text strong>{totals.order}</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="center">
                <Typography.Text strong>{totals.received}</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="center">
                <Typography.Text strong>{totals.sold}</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="center">
                <Typography.Text strong>{totals.writtenOff}</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="center">
                <Typography.Text strong>{totals.endBalance}</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="center">
                <Typography.Text strong>-</Typography.Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />

      <div
        style={{
          marginTop: 24, // Уменьшен отступ сверху
          display: "flex",
          justifyContent: "space-between",
          pageBreakInside: "avoid", // Запрет переноса на следующую страницу
        }}
      >
        <div>
          <Typography.Text strong>Распечатал: </Typography.Text>
          <Typography.Text>
            {userData?.fullName || "____________________________"}
          </Typography.Text>
          <div>
            <Typography.Text strong>Дата: </Typography.Text>
            <Typography.Text>______________</Typography.Text>
          </div>
          <div>
            <Typography.Text strong>Подпись: </Typography.Text>
            <Typography.Text>____________________________</Typography.Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export const printReportStyles = `
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
