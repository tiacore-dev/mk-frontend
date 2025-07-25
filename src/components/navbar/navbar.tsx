"use client";

import type React from "react";
import { Menu, Button, Image, Space, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import {
  FileTextOutlined,
  SwapOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  EditOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

import logo from "../../logo.png";

const menuItems: MenuProps["items"] = [
  {
    label: (
      <>
        <FileTextOutlined /> Заявки
      </>
    ),
    key: "/orders",
  },
  {
    label: (
      <>
        <SwapOutlined /> Перемещения
      </>
    ),
    key: "/movements",
  },
  {
    label: (
      <>
        <ShoppingCartOutlined /> Инвентаризация
      </>
    ),
    key: "/balance",
  },
  {
    label: (
      <>
        <EditOutlined /> Списания
      </>
    ),
    key: "/write_offs",
  },
  {
    label: (
      <>
        <BarChartOutlined /> Отчеты
      </>
    ),
    key: "/reports",
  },
];

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Получаем данные пользователя из localStorage
  const userData = localStorage.getItem("userData");
  const fullName = userData ? JSON.parse(userData).fullName : "";
  const address = userData ? JSON.parse(userData).address : "";

  const onMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getSelectedKeys = () => {
    const currentPath = location.pathname;
    const selectedItem = menuItems.find(
      (item) => item?.key && currentPath.startsWith(item.key as string)
    );
    return selectedItem ? [selectedItem.key as string] : [];
  };

  return (
    <div
      className="navbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "72px",
        padding: "0 24px",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        borderBottom: "2px solid #f1f5f9",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          minWidth: 0,
        }}
      >
        <Image
          src={logo || "/placeholder.svg"}
          preview={false}
          style={{
            height: "90px",
            marginRight: "32px",
            objectFit: "contain",
            flexShrink: 0,
            filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
          }}
        />
        <Menu
          mode="horizontal"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={onMenuClick}
          style={{
            borderBottom: "none",
            lineHeight: "72px",
            background: "transparent",
            fontSize: 16,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            whiteSpace: "nowrap",
            fontWeight: 500,
          }}
        />
      </div>

      <Space align="center" size="large">
        <div
          style={{
            textAlign: "right",
            padding: "8px 16px",
            background: "linear-gradient(135deg, #f8fafc 0%, #f8fafc 100%)",
            borderRadius: "12px",
            // border: "1px solid #e2e8f0",
            // boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          }}
        >
          <Typography.Text
            strong
            style={{
              color: "#1e293b",
              fontFamily: "system-ui",
              fontSize: "14px",
              display: "block",
              lineHeight: "1.4",
            }}
          >
            {fullName}
          </Typography.Text>
          <Typography.Text
            style={{
              color: "#64748b",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            {address}
          </Typography.Text>
        </div>

        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            height: "40px",
            borderRadius: "8px",
            fontWeight: 500,
            transition: "all 0.3s ease",
            border: "1px solid #fecaca",
            background: "linear-gradient(135deg, #ffffff 0%,  #fef2f2 100%)",
          }}
        >
          Выход
        </Button>
      </Space>
    </div>
  );
};
