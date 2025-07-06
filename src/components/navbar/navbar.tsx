import React from "react";
import { Menu, Button, Image, Space, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import {
  FileTextOutlined,
  SwapOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  EditOutlined,
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
        height: "64px",
        padding: "0 16px",
        backgroundColor: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Логотип */}
        <Image
          src={logo}
          preview={false}
          style={{
            height: "84px",
            marginRight: "24px",
            objectFit: "contain",
          }}
        />

        <Menu
          mode="horizontal"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={onMenuClick}
          style={{
            borderBottom: "none",
            lineHeight: "64px",
            background: "transparent",
            fontSize: 16,
          }}
        />
      </div>

      <Space align="center" size="middle">
        {/* Отображаем полное имя пользователя */}
        <Typography.Text
          strong
          style={{ color: "#005696", fontFamily: "system-ui" }}
        >
          {`${fullName} | ${address}`} 
        </Typography.Text>

        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{
            fontSize: 16,
            display: "flex",
            alignItems: "center",
          }}
        >
          Выход
        </Button>
      </Space>
    </div>
  );
};
