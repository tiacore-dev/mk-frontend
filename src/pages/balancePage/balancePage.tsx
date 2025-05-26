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
} from "antd";
import { useBalanceQuery } from "../../hooks/balance/useBalanceQuery";
import {
  EditOutlined,
  PlusOutlined,
  MinusOutlined,
  UndoOutlined,
  CloseOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useChangeBalanceMutation } from "../../hooks/balance/useBalanseMutation";
import { IBalanceItem } from "../../api/balanceApi";
import { useProductsQuery } from "../../hooks/products/useProductsQuery";
import { useSoldQuery } from "../../hooks/balance/useBalanceQuery";

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

  const {
    data: soldData = [],
    isLoading: isSoldLoading,
    isError: isSoldError,
    error: soldError,
  } = useSoldQuery();

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editableItems, setEditableItems] = useState<IBalanceItem[]>([]);
  const [originalItems, setOriginalItems] = useState<IBalanceItem[]>([]);
  const changeBalanceMutation = useChangeBalanceMutation();

  // Создаем карту для быстрого поиска названия продукта по id
  const productMap = useMemo(() => {
    return new Map(products.map((product) => [product.id, product.name]));
  }, [products]);

  // Создаем карту для быстрого поиска количества проданного товара по id продукта
  const soldMap = useMemo(() => {
    return new Map(soldData.map((item) => [item.product, item.qt]));
  }, [soldData]);

  // Группировка данных с подстановкой названий
  const { groupedData, tableData } = useMemo(() => {
    const grouped = balanceData.reduce(
      (acc: Record<string, { total: number; items: IBalanceItem[] }>, item) => {
        if (!acc[item.product]) acc[item.product] = { total: 0, items: [] };
        acc[item.product].total += item.qt;
        acc[item.product].items.push({ ...item });
        return acc;
      },
      {}
    );

    return {
      groupedData: grouped,
      tableData: Object.keys(grouped).map((productId) => ({
        key: productId,
        productId, // сохраняем id для работы
        product: productMap.get(productId) || productId, // показываем название или id, если название не найдено
        total: grouped[productId].total,
        items: grouped[productId].items,
      })),
    };
  }, [balanceData, productMap]);

  // Получаем изначальное значение "Реализовано" для продукта
  const getInitialSold = (productId: string) => {
    return soldMap.get(productId) || 0;
  };

  // Открытие модального окна
  const openEditModal = (productId: string) => {
    const items = groupedData[productId]?.items || [];
    setSelectedProductId(productId);
    setOriginalItems(items.map((item) => ({ ...item }))); // Сохраняем оригинальные значения
    setEditableItems(items.map((item) => ({ ...item }))); // Глубокая копия
    setIsModalVisible(true);
  };

  // Вычисляем текущее значение "Реализовано" (изначальное минус разница между оригинальным и текущим)
  const getCurrentSold = () => {
    if (!selectedProductId) return 0;
    const originalSold = soldMap.get(selectedProductId) || 0;
    const originalTotal = originalItems.reduce((sum, item) => sum + item.qt, 0);
    const currentTotal = editableItems.reduce((sum, item) => sum + item.qt, 0);
    return Math.max(0, originalSold - (originalTotal - currentTotal));
  };

  // Изменение количества с проверкой на максимальное значение и общее уменьшение
  const updateQuantity = (index: number, newValue: number) => {
    const originalValue = originalItems[index]?.qt || 0;
    const clampedValue = Math.max(0, Math.min(newValue, originalValue));

    setEditableItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], qt: clampedValue };
      return updated;
    });
  };

  // Обработчики кнопок
  const handlePlus = (index: number) =>
    updateQuantity(index, editableItems[index].qt + 1);
  const handleMinus = (index: number) =>
    updateQuantity(index, editableItems[index].qt - 1);
  const handleInputChange = (value: number | null, index: number) =>
    updateQuantity(index, value || 0);

  // Сброс к исходным значениям
  const handleReset = () => {
    setEditableItems(originalItems.map((item) => ({ ...item }))); // Глубокая копия
  };

  // Сохранение изменений
  const handleSave = () => {
    if (!selectedProductId) return;

    const updatedData = balanceData.map((item) => {
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

  // Колонки таблиц
  const columns = {
    main: [
      { title: "Товар", dataIndex: "product", key: "product" },
      { title: "Общее количество", dataIndex: "total", key: "total" },
      {
        title: "",
        key: "actions",
        render: (_: any, record: { productId: string }) => (
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record.productId)}
          />
        ),
      },
    ],
    details: [
      {
        title: "Дата",
        dataIndex: "date",
        key: "date",
        render: (date: string) => new Date(date).toLocaleDateString(),
      },
      {
        title: "Количество",
        dataIndex: "qt",
        key: "qt",
        render: (value: number, _: any, index: number) => {
          const isDisabled = getInitialSold(selectedProductId || "") === 0;
          return (
            <Space>
              <Button
                icon={<MinusOutlined />}
                onClick={() => handleMinus(index)}
                size="small"
                disabled={value <= 0 || isDisabled}
              />
              <InputNumber
                min={0}
                max={originalItems[index]?.qt} // Устанавливаем максимальное значение как оригинальное
                value={value}
                onChange={(val) => !isDisabled && handleInputChange(val, index)}
                style={{ width: 80 }}
                disabled={isDisabled}
              />
              <Button
                icon={<PlusOutlined />}
                onClick={() => handlePlus(index)}
                size="small"
                disabled={value >= originalItems[index]?.qt || isDisabled} // Отключаем кнопку, если достигнут максимум
              />
            </Space>
          );
        },
      },
    ],
  };

  // Обновляем заголовок модального окна для отображения названия
  const modalTitle = selectedProductId
    ? `${productMap.get(selectedProductId) || selectedProductId}`
    : "";

  const isLoading = isBalanceLoading || isProductsLoading || isSoldLoading;
  const isError = isBalanceError || isProductsError || isSoldError;
  const error = balanceError || productsError || soldError;

  // Текущее значение "Реализовано"
  const currentSold = getCurrentSold();
  // Изначальное значение "Реализовано"
  const initialSold = selectedProductId ? getInitialSold(selectedProductId) : 0;

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography.Title level={2}>Остатки</Typography.Title>
        </div>

        {isError && (
          <Alert
            type="error"
            message="Ошибка"
            description={error?.toString()}
            showIcon
          />
        )}

        <Table
          dataSource={tableData}
          columns={columns.main}
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />

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
                <span style={{ fontWeight: 400 }}>{currentSold}</span>
              </div>
              <Space>
                <Tooltip title="Отменить все изменения">
                  <Button
                    key="reset"
                    onClick={handleReset}
                    icon={<UndoOutlined />}
                    disabled={
                      JSON.stringify(editableItems) ===
                        JSON.stringify(originalItems) || initialSold === 0
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
                      JSON.stringify(originalItems) ||
                    currentSold !== 0 ||
                    initialSold === 0
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
          {initialSold === 0 && (
            <Alert
              description="Для данного товара нет реализованных единиц, поэтому редактирование остатков невозможно."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          <Table
            dataSource={editableItems}
            columns={columns.details}
            rowKey="date"
            pagination={false}
            bordered
            size="middle"
          />
        </Modal>
      </Space>
    </div>
  );
};
