import React, { useState } from "react";
import { Menu, Drawer, Button, ConfigProvider } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";

const menuItems: MenuProps["items"] = [
  { label: "Заявки", key: "/orders" },
  // { label: "Продукты", key: "/products" },
];

export const Navbar: React.FC = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const onMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
    setOpenDrawer(false);
  };

  // Кастомизация для Menu и Button
  // const navbarTheme = {
  //   token: {
  //     colorPrimary: "#2444b5",
  //     colorBgContainer: "#ffffff",
  //   },
  //   components: {
  //     Menu: {
  //       itemSelectedColor: "#2444b5",
  //       itemSelectedBg: "rgba(36, 68, 181, 0.1)",
  //       itemHoverColor: "#1a3490",
  //       itemHoverBg: "rgba(36, 68, 181, 0.05)",
  //     },
  //     Button: {
  //       colorPrimary: "#2444b5",
  //       colorPrimaryHover: "#1a3490",
  //       colorPrimaryActive: "#12276d",
  //     },
  //   },
  // };

  return (
    // <ConfigProvider theme={navbarTheme}>
    <div className="navbar">
      {/* Бургер-меню для мобильных */}
      {/* <div className="navbar-menu-mobile">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setOpenDrawer(true)}
          style={{ fontSize: "16px", color: "#2444b5" }}
        />
      </div> */}

      {/* Логотип - настройки сохранены */}
      {/* <div
          className="logo-container"
          onClick={() => navigate("/home")}
          style={{
            margin: "0 auto",
            textAlign: "center",
            flex: 1,
            maxWidth: "150px",
            cursor: "pointer",
          }}
        >
          <img
            src="https://static.tildacdn.com/tild3136-3639-4366-b261-316331313834/png_2.png"
            alt="Логотип"
            className="logo-image"
            style={{
              maxWidth: "100%",
              height: "auto",
              transition: "opacity 0.3s",
            }}
          />
        </div> */}

      {/* Меню для десктопа */}
      <div className="navbar-menu-desktop">
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={onMenuClick}
          style={{
            borderBottom: "none",
            lineHeight: "46px",
            background: "transparent",
          }}
        />
      </div>

      {/* Drawer для мобильного меню */}
      <Drawer
        title="Меню"
        placement="left"
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
        width={250}
        styles={{
          header: { borderBottom: "1px solid rgba(36, 68, 181, 0.1)" },
          body: { padding: "0" },
        }}
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={onMenuClick}
        />
      </Drawer>
    </div>
    // </ConfigProvider>
  );
};
