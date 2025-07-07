"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  DatePicker,
  Spin,
  Alert,
  Typography,
  Button,
  Modal,
  Space,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useReportQuery } from "../../hooks/reports/useReportQuery";
import { useProductsQuery } from "../../hooks/products/useProductsQuery";
import dayjs, { type Dayjs } from "dayjs";
import { PrinterOutlined } from "@ant-design/icons";
import { PrintReport, printReportStyles } from "./printReport";

const { Title, Text } = Typography;

export interface IReportTableData {
  key: string;
  productId: string;
  productName: string;
  startBalance: number;
  order: number;
  received: number;
  sold: number;
  writtenOff: number;
  endBalance: number;
  turnoverRate: number;
}

export const ReportPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  const {
    data: reportData,
    isLoading: isReportLoading,
    isError: isReportError,
    error: reportError,
  } = useReportQuery(selectedDate.format("YYYY-MM-DD"));

  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
  } = useProductsQuery();

  const productsMap = useMemo(() => {
    const result: Record<string, string> = {};
    productsData?.forEach((product) => {
      result[product.id] = product.name;
    });
    return result;
  }, [productsData]);

  const tableData = useMemo(() => {
    if (!reportData || !productsData) return [];

    return Object.entries(reportData)
      .map(([productId, data]) => {
        const turnoverRate =
          data.startBalance > 0 ? (data.sold / data.startBalance) * 100 : 0;

        return {
          key: productId,
          productId,
          productName: productsMap[productId] || `Продукт ${productId}`,
          startBalance: data.startBalance,
          order: data.order,
          received: data.received,
          sold: data.sold,
          writtenOff: data.writtenOff,
          endBalance: data.endBalance,
          turnoverRate: Math.round(turnoverRate * 100) / 100,
        };
      })
      .sort((a, b) => a.productName.localeCompare(b.productName));
  }, [reportData, productsMap, productsData]);

  const columns: ColumnsType<IReportTableData> = [
    {
      title: "Наименование товара",
      dataIndex: "productName",
      key: "productName",
      fixed: "left",
      width: 200,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Остаток на начало дня",
      dataIndex: "startBalance",
      key: "startBalance",
      width: 120,
      align: "center",
      render: (value: number) => (
        <div
          style={{
            backgroundColor: value > 0 ? "#fff7e6" : "#f6f6f6",
            padding: "4px 8px",
            borderRadius: "4px",
            fontWeight: "500",
          }}
        >
          {value}
        </div>
      ),
    },
    {
      title: "Заказано",
      dataIndex: "order",
      key: "order",
      width: 100,
      align: "center",
      render: (value: number) => (
        <div
          style={{
            backgroundColor: value > 0 ? "#e6f7ff" : "#f6f6f6",
            padding: "4px 8px",
            borderRadius: "4px",
            fontWeight: "500",
          }}
        >
          {value}
        </div>
      ),
    },
    {
      title: "Поступило",
      dataIndex: "received",
      key: "received",
      width: 100,
      align: "center",
      render: (value: number) => (
        <div
          style={{
            backgroundColor: value > 0 ? "#f6ffed" : "#f6f6f6",
            padding: "4px 8px",
            borderRadius: "4px",
            fontWeight: "500",
          }}
        >
          {value}
        </div>
      ),
    },
    {
      title: "Продано",
      dataIndex: "sold",
      key: "sold",
      width: 100,
      align: "center",
      render: (value: number) => (
        <div
          style={{
            backgroundColor: value > 0 ? "#fff1f0" : "#f6f6f6",
            padding: "4px 8px",
            borderRadius: "4px",
            fontWeight: "500",
          }}
        >
          {value}
        </div>
      ),
    },
    {
      title: "Списано",
      dataIndex: "writtenOff",
      key: "writtenOff",
      width: 100,
      align: "center",
      render: (value: number) => (
        <div
          style={{
            backgroundColor: value > 0 ? "#fef1f0" : "#f6f6f6",
            padding: "4px 8px",
            borderRadius: "4px",
            fontWeight: "500",
          }}
        >
          {value}
        </div>
      ),
    },
    {
      title: "Остаток на конец дня",
      dataIndex: "endBalance",
      key: "endBalance",
      width: 120,
      align: "center",
      render: (value: number) => (
        <div
          style={{
            backgroundColor: value > 0 ? "#fff7e6" : "#f6f6f6",
            padding: "4px 8px",
            borderRadius: "4px",
            fontWeight: "500",
          }}
        >
          {value}
        </div>
      ),
    },
    {
      title: "% оборачиваемости",
      dataIndex: "turnoverRate",
      key: "turnoverRate",
      width: 120,
      align: "center",
      render: (value: number) => {
        let color = "#000";
        let backgroundColor = "#fff";

        if (value <= 25) {
          color = "#52c41a";
          backgroundColor = "#f6ffed";
        } else if (value <= 50) {
          color = "#faad14";
          backgroundColor = "#fffbe6";
        } else if (value <= 75) {
          color = "#fa8c16";
          backgroundColor = "#fff7e6";
        } else {
          color = "#f5222d";
          backgroundColor = "#fff1f0";
        }

        return (
          <div
            style={{
              color,
              backgroundColor,
              fontWeight: "500",
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            {value}%
          </div>
        );
      },
    },
  ];

  const totals = useMemo(() => {
    if (!tableData.length) return null;

    return tableData.reduce(
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
  }, [tableData]);

  const isLoading = isReportLoading || isProductsLoading;
  const isError = isReportError || isProductsError;
  const error = reportError || productsError;

  const openPrintModal = () => {
    setIsPrintModalVisible(true);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("print-content");
    if (!printContent) return;

    const styles = printReportStyles;
    const printWindow = document.createElement("iframe");

    printWindow.style.position = "absolute";
    printWindow.style.width = "0";
    printWindow.style.height = "0";
    printWindow.style.border = "none";
    printWindow.style.left = "-9999px";

    document.body.appendChild(printWindow);

    const doc = printWindow.contentDocument;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Печать отчета</title>
            <style>${styles}</style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.frameElement.parentNode.removeChild(window.frameElement);
                }, 100);
              }, 100);
            </script>
          </body>
        </html>
      `);
      doc.close();
    } else {
      document.body.removeChild(printWindow);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2>
          Отчет по движению товаров на {selectedDate.format("DD.MM.YYYY")}
        </h2>
        <Space>
          <DatePicker
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            format="DD.MM.YYYY"
            placeholder="Выберите дату"
            allowClear={false}
          />
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={openPrintModal}
            disabled={!tableData.length}
          >
            Печать
          </Button>
        </Space>
      </div>

      {isError && (
        <Alert
          message="Ошибка"
          description={
            error instanceof Error ? error.message : "Неизвестная ошибка"
          }
          type="error"
          showIcon
          style={{ marginBottom: "16px" }}
        />
      )}

      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          scroll={{ x: 1000 }}
          bordered
          size="small"
          summary={() =>
            totals && (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ backgroundColor: "#fafafa" }}>
                  <Table.Summary.Cell index={0}>
                    <Text strong>ИТОГО:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="center">
                    <Text strong>{totals.startBalance}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="center">
                    <Text strong>{totals.order}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="center">
                    <Text strong>{totals.received}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="center">
                    <Text strong>{totals.sold}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="center">
                    <Text strong>{totals.writtenOff}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="center">
                    <Text strong>{totals.endBalance}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} align="center">
                    <Text strong>-</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )
          }
        />
      </Spin>

      {tableData.length === 0 && !isLoading && !isError && (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#999",
          }}
        >
          <Text>Нет данных за выбранную дату</Text>
        </div>
      )}

      <Modal
        open={isPrintModalVisible}
        onCancel={() => setIsPrintModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setIsPrintModalVisible(false)}>
            Отменить
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            Печать
          </Button>,
        ]}
      >
        <PrintReport
          data={tableData}
          userData={userData}
          date={selectedDate.format("DD.MM.YYYY")}
        />
      </Modal>
    </div>
  );
};
