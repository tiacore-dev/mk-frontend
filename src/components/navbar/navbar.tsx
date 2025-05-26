import React from "react";
import { Menu, Button, Image } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import {
  FileTextOutlined,
  SwapOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
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
];

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
        alignItems: "center", // Выравниваем элементы по центру по вертикали
        height: "64px", // Фиксированная высота навбара
        padding: "0 16px", // Отступы слева и справа
        backgroundColor: "#fff", // Фон навбара
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Логотип */}
        <Image
          src={logo}
          preview={false}
          style={{
            height: "84px", // Фиксированная высота логотипа
            marginRight: "24px", // Отступ от меню
            objectFit: "contain", // Сохраняем пропорции
          }}
        />

        <Menu
          mode="horizontal"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={onMenuClick}
          style={{
            borderBottom: "none",
            lineHeight: "64px", // Совпадает с высотой навбара
            background: "transparent",
            fontSize: 16,
          }}
        />
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
        }}
      >
        Выход
      </Button>
    </div>
  );
};
