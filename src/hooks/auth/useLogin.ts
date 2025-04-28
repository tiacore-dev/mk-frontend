// src/hooks/auth/useLogin.ts
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { ApiError } from "../../pages/loginPage/authTypes";

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userData", JSON.stringify(data));
      navigate("/orders");
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error.response?.data.message || "Ошибка при авторизации";
      notification.error({
        message: "Ошибка",
        description: errorMessage,
        placement: "topRight",
      });
    },
  });
};
