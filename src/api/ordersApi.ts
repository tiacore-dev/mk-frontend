import { axiosInstance } from "../axiosConfig";

export interface IOrderResponse {
  total: number;
  data: IOrder[];
}
export interface IOrder {
  production: string;
  date: string; //ts
  user: string;
  status: string;
  delivery_date: string; //ts
  id: string;
}

export interface IOrderDetails {
  production: string;
  date: string;
  user: string;
  status: string;
  delivery_date: string;
  id: string;
  products: IProduct[];
}

export interface IProduct {
  id: string;
  qt: string;
}

export const fetchOrders = async (params: {
  limit: number;
  offset: number;
}): Promise<IOrderResponse> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const response = await axiosInstance.get(`${url}orders/all`, {
    params,
    headers: {
      token: token,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const fetchOrderDetails = async (id: string): Promise<IOrderDetails> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");
  const response = await axiosInstance.get(`${url}order/${id}`, {
    headers: {
      token: token,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
export interface ICreateOrderRequest {
  date: string; // Формат: "YYYY-MM-DDTHH:mm:ss"
  products: Array<{
    id: string;
    qt: number;
  }>;
}

export const createOrder = async (
  orderData: ICreateOrderRequest
): Promise<{ success: boolean }> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const response = await axiosInstance.post(`${url}order/add`, orderData, {
    headers: {
      token: token,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

export interface IOrderUpdateRequest {
  products: Array<{
    id: string;
    qt: number;
  }>;
}
export const updateOrder = async (
  id: string,
  orderData: IOrderUpdateRequest
): Promise<{ success: boolean }> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");
  // const token = localStorage.getItem("token");

  try {
    const response = await axiosInstance.patch(
      `${url}order/${id}/edit`,
      orderData,
      {
        headers: {
          token: token,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
