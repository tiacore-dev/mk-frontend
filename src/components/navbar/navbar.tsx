import React from "react";
import { Menu, Button } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import {
  FileTextOutlined,
  SwapOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

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
];

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const onMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  const handleLogout = () => {
    // Очищаем LocalStorage
    localStorage.clear();
    // Перенаправляем на страницу входа
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
      style={{ display: "flex", justifyContent: "space-between" }}
    >
      <Menu
        mode="horizontal"
        selectedKeys={getSelectedKeys()}
        items={menuItems}
        onClick={onMenuClick}
        style={{
          borderBottom: "none",
          lineHeight: "46px",
          background: "transparent",
          fontSize: 16,
          marginLeft: 16,
          marginTop: 8,
        }}
      />
      <Button
        type="text"
        danger
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        style={{
          marginRight: 16,
          marginTop: 8,
          height: 46,
          fontSize: 16,
        }}
      >
        Выход
      </Button>
    </div>
  );
};
