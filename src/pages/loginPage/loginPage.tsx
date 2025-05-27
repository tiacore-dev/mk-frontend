// src/pages/LoginPage.tsx
import React from "react";
import { Button, Form, Input, Typography, Spin, Row, Col, Image } from "antd";
import { useLogin } from "../../hooks/auth/useLogin";
import { ILoginRequest } from "./authTypes";
import logo from "../../logo.png";

export const LoginPage: React.FC = () => {
  const loginMutation = useLogin();

  const onFinish = (values: ILoginRequest) => {
    loginMutation.mutate(values);
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* Логотип в самом верху */}
      <div style={{ textAlign: "center", padding: "0 0 0 0" }}>
        <Image
          src={logo}
          preview={false}
          style={{ maxHeight: 120 }}
          alt="Логотип компании"
        />
      </div>

      {/* Форма входа */}
      <Row justify="center" align="middle" style={{ flex: 1 }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={8}>
          <Form
            layout="vertical"
            onFinish={onFinish}
            style={{
              padding: "40px",
              background: "#fff",
            }}
          >
            <Typography.Title
              level={2}
              style={{ textAlign: "center", marginBottom: 24, marginTop: -48 }}
            >
              Вход в систему
            </Typography.Title>

            <Form.Item
              label="Логин"
              name="username"
              rules={[{ required: true, message: "Логин обязателен" }]}
            >
              <Input
                placeholder="Введите логин"
                disabled={loginMutation.isPending}
              />
            </Form.Item>

            <Form.Item
              label="Пароль"
              name="password"
              rules={[{ required: true, message: "Пароль обязателен" }]}
            >
              <Input.Password
                placeholder="Введите пароль"
                disabled={loginMutation.isPending}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                disabled={loginMutation.isPending}
                block
                size="large"
              >
                {loginMutation.isPending ? (
                  <Spin size="small" className="center-spin" />
                ) : (
                  "Войти"
                )}
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};
