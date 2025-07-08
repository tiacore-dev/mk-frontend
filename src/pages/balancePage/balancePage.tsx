// src/pages/BalancePage.tsx
import React, { useState, useMemo } from "react";
import {
  Table,
  Alert,
  Button,
  Space,
  Typography,
  Modal,
  InputNumber,
  Tooltip,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useBalanceQuery } from "../../hooks/balance/useBalanceQuery";
import {
  EditOutlined,
  PrinterOutlined,
  PlusOutlined,
  MinusOutlined,
  UndoOutlined,
  CloseOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useChangeBalanceMutation } from "../../hooks/balance/useBalanseMutation";
import { IBalanceItem } from "../../api/balanceApi";
import { useProductsQuery } from "../../hooks/products/useProductsQuery";
import { PrintInventory, printInventoryStyles } from "./printBalance";

interface TableDataItem {
  key: string;
  productId: string;
  product: string;
  total: number;
  items: IBalanceItem[];
  hasBalance: boolean;
  initialSold: number;
}

export const BalancePage: React.FC = () => {
  const {
    data: balanceData = [],
    isLoading: isBalanceLoading,
    isError: isBalanceError,
    error: balanceError,
    refetch,
  } = useBalanceQuery();

  const {
    data: products = [],
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
  } = useProductsQuery();

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editableItems, setEditableItems] = useState<IBalanceItem[]>([]);
  const [originalItems, setOriginalItems] = useState<IBalanceItem[]>([]);
  const [initialSold, setInitialSold] = useState(0);
  const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);
  const [printData, setPrintData] = useState<TableDataItem[]>([]);

  const changeBalanceMutation = useChangeBalanceMutation();
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  const productMap = useMemo(() => {
    return new Map(products.map((product) => [product.id, product.name]));
  }, [products]);

  const { groupedData, tableData } = useMemo(() => {
    const grouped = balanceData.reduce(
      (
        acc: Record<
          string,
          { total: number; items: IBalanceItem[]; initialSold: number }
        >,
        item
      ) => {
        if (!acc[item.product])
          acc[item.product] = { total: 0, items: [], initialSold: 0 };

        if (item.date === null) {
          acc[item.product].initialSold = Math.abs(item.qt);
          acc[item.product].total += item.qt;
        } else {
          acc[item.product].total += item.qt;
          acc[item.product].items.push({ ...item });
        }
        return acc;
      },
      {}
    );

    const allProductsData = products.map((product) => {
      const productId = product.id;
      const balanceInfo = grouped[productId] || {
        total: 0,
        items: [],
        initialSold: 0,
      };

      return {
        key: productId,
        productId,
        product: product.name,
        total: balanceInfo.total,
        items: balanceInfo.items,
        initialSold: balanceInfo.initialSold,
        hasBalance: balanceInfo.items.length > 0 || balanceInfo.initialSold > 0,
      };
    });

    allProductsData.sort((a, b) => {
      const aEditable = a.initialSold > 0 ? 1 : 0;
      const bEditable = b.initialSold > 0 ? 1 : 0;
      return bEditable - aEditable;
    });

    return {
      groupedData: grouped,
      tableData: allProductsData,
    };
  }, [balanceData, products]);

  const openEditModal = (productId: string) => {
    const items = groupedData[productId]?.items || [];
    const sold = groupedData[productId]?.initialSold || 0;

    // Сортируем элементы по дате (от новых к старым)
    const sortedItems = [...items].sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    setSelectedProductId(productId);
    setOriginalItems(sortedItems.map((item) => ({ ...item })));
    setEditableItems(sortedItems.map((item) => ({ ...item })));
    setInitialSold(sold);
    setIsModalVisible(true);
  };

  const openPrintModal = () => {
    setPrintData(tableData.filter((item) => item.hasBalance));
    setIsPrintModalVisible(true);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("print-content");
    if (!printContent) return;

    const styles = printInventoryStyles;
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
          <title>Печать инвентаризации</title>
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

  const getTotalReduction = () => {
    if (!selectedProductId) return 0;
    const originalTotal = originalItems.reduce((sum, item) => sum + item.qt, 0);
    const currentTotal = editableItems.reduce((sum, item) => sum + item.qt, 0);
    return originalTotal - currentTotal;
  };

  const updateQuantity = (index: number, newValue: number) => {
    const originalValue = originalItems[index]?.qt || 0;
    const clampedValue = Math.max(0, Math.min(newValue, originalValue));
    setEditableItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], qt: clampedValue };
      return updated;
    });
  };

  const handlePlus = (index: number) =>
    updateQuantity(index, editableItems[index].qt + 1);
  const handleMinus = (index: number) =>
    updateQuantity(index, editableItems[index].qt - 1);
  const handleInputChange = (value: number | null, index: number) =>
    updateQuantity(index, value || 0);

  const handleReset = () => {
    setEditableItems(originalItems.map((item) => ({ ...item })));
  };

  const handleSave = () => {
    if (!selectedProductId) return;

    const updatedData = balanceData
      .filter((item) => item.product === selectedProductId && item.date)
      .map((item) => {
        const edited = editableItems.find(
          (e) => e.product === item.product && e.date === item.date
        );
        return edited ? { ...edited } : item;
      });

    changeBalanceMutation.mutate(updatedData, {
      onSuccess: () => {
        setIsModalVisible(false);
        refetch();
      },
    });
  };

  const mainColumns: ColumnsType<TableDataItem> = [
    { title: "Товар", dataIndex: "product", key: "product" },
    {
      title: "Общее количество",
      dataIndex: "total",
      key: "total",
      render: (total: number, record: TableDataItem) => (
        <span style={{ color: record.hasBalance ? undefined : "#999" }}>
          {total || "0"}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 48,
      render: (_, record: TableDataItem) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => openEditModal(record.productId)}
          disabled={record.initialSold <= 0}
        />
      ),
    },
  ];

  const detailsColumns: ColumnsType<IBalanceItem> = [
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      width: 250,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Количество",
      dataIndex: "qt",
      key: "qt",
      render: (value: number, record: any, index: number) => {
        const originalValue = originalItems[index]?.qt || 0;
        const difference = originalValue - value;

        return (
          <Space>
            <Button
              icon={<MinusOutlined />}
              onClick={() => handleMinus(index)}
              size="small"
              disabled={value <= 0}
            />
            <InputNumber
              min={0}
              max={originalValue}
              value={value}
              onChange={(val) => handleInputChange(val, index)}
              style={{ width: 80 }}
            />
            <Button
              icon={<PlusOutlined />}
              onClick={() => handlePlus(index)}
              size="small"
              disabled={value >= originalValue}
            />
            {difference !== 0 && (
              <>
                {difference > 0 ? `-${difference}` : `+${Math.abs(difference)}`}
              </>
            )}
          </Space>
        );
      },
    },
  ];

  const modalTitle = selectedProductId
    ? `${productMap.get(selectedProductId) || selectedProductId}`
    : "";

  const isLoading = isBalanceLoading || isProductsLoading;
  const isError = isBalanceError || isProductsError;
  const error = balanceError || productsError;
  const totalReduction = getTotalReduction();
  const isSaveDisabled = initialSold > 0 && totalReduction !== initialSold;

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2>Остатки</h2>
        <Button
          type="primary"
          icon={<PrinterOutlined />}
          onClick={openPrintModal}
        >
          Печать
        </Button>
      </div>

      {isError && (
        <Alert
          type="error"
          message="Ошибка"
          description={error?.toString()}
          showIcon
        />
      )}
      <Spin spinning={isLoading}>
        <Table
          dataSource={tableData}
          columns={mainColumns}
          pagination={false}
        />
      </Spin>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <EditOutlined />
            <span>{modalTitle}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ color: "#000000", fontSize: 16 }}>
              Реализовано:{" "}
              <span
                style={{
                  fontWeight: 400,
                  color: totalReduction > initialSold ? "#ff4d4f" : "inherit",
                }}
              >
                {" "}
                {totalReduction} из {initialSold}
              </span>
            </div>
            <Space>
              <Tooltip title="Отменить все изменения">
                <Button
                  key="reset"
                  onClick={handleReset}
                  icon={<UndoOutlined />}
                  disabled={
                    JSON.stringify(editableItems) ===
                    JSON.stringify(originalItems)
                  }
                >
                  Сбросить
                </Button>
              </Tooltip>
              <Button
                key="save"
                type="primary"
                loading={changeBalanceMutation.isPending}
                onClick={handleSave}
                icon={<SaveOutlined />}
                disabled={
                  JSON.stringify(editableItems) ===
                    JSON.stringify(originalItems) || isSaveDisabled
                }
              >
                Сохранить
              </Button>
              <Button
                key="cancel"
                onClick={() => setIsModalVisible(false)}
                icon={<CloseOutlined />}
              >
                Отменить
              </Button>
            </Space>
          </div>
        }
        bodyStyle={{ padding: "8px 0px" }}
      >
        <Table
          dataSource={editableItems}
          columns={detailsColumns}
          rowKey="date"
          pagination={false}
          bordered
          size="middle"
        />
      </Modal>

      <Modal
        // title="Печать инвентаризации"
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
        <PrintInventory data={printData} userData={userData} />
      </Modal>
    </div>
  );
};
