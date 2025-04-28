// src/pages/LoginPage.tsx
import React from "react";
// import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Typography, Spin, Row, Col } from "antd";
import { useLogin } from "../../hooks/auth/useLogin";
import { ILoginRequest } from "./authTypes";

export const LoginPage: React.FC = () => {
  const loginMutation = useLogin();

  const onFinish = (values: ILoginRequest) => {
    loginMutation.mutate(values);
  };

  return (
    <Row justify="center" align="middle" style={{ overflow: "hidden" }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={8}>
        <Form
          layout="vertical"
          onFinish={onFinish}
          style={{ padding: "40px", background: "#fff", borderRadius: "8px" }}
        >
          <Typography.Title level={2} style={{ textAlign: "center" }}>
            Вход
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
  );
};
