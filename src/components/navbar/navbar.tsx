import React from "react";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import { FileTextOutlined, SwapOutlined } from "@ant-design/icons";

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

  return (
    <div className="navbar">
      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
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
    </div>
  );
};
