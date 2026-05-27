import axios from "axios";

export const axiosInstance = axios.create({});

const LOGIN_PATH = "/client/login";

let isRedirectingToLogin = false;

const redirectToLoginWithReload = () => {
  if (isRedirectingToLogin) {
    return;
  }

  isRedirectingToLogin = true;
  localStorage.clear();

  if (window.location.pathname === LOGIN_PATH) {
    window.location.reload();
    return;
  }

  window.location.replace(LOGIN_PATH);
};

// Логируем заголовки и параметры запроса перед отправкой
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("[Axios Request]", {
      url: config.url,
      method: config.method,
      headers: config.headers,
      params: config.params,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error("[Axios Request Error]", error);
    return Promise.reject(error);
  }
);

// Обработка ошибок (особенно 401 - Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => {
    // Можно добавить логирование успешных ответов (опционально)
    console.log("[Axios Response]", {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  async (error) => {
    // const originalRequest = error.config;

    // Логирование ошибки
    console.error("[Axios Response Error]", {
      status: error.response?.status,
      message: error.message,
      config: error.config,
    });

    // Обработка 401 ошибки
    if (error.response?.status === 401) {
      redirectToLoginWithReload();
    }

    return Promise.reject(error);
  }
);
