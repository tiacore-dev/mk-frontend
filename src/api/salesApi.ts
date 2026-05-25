import { axiosInstance } from "../axiosConfig";

export interface ISaleResponse {
  total: number;
  data: ISale[];
}

export interface ISale {
  date: string;
  user: string;
  id: string;
  summ: number;
}

export interface ISaleProduct {
  id: string;
  qt: string;
  date: string | null;
  price: number;
  summ: number;
}

export interface ISaleDetails {
  date: string;
  user: string;
  id: string;
  summ: number;
  products: ISaleProduct[];
}

export const fetchSales = async (params: {
  limit: number;
  offset: number;
}): Promise<ISaleResponse> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const response = await axiosInstance.get(`${url}sales/all`, {
    params,
    headers: {
      token: token,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const fetchSaleDetails = async (id: string): Promise<ISaleDetails> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");
  const response = await axiosInstance.get(`${url}sale/${id}/view`, {
    headers: {
      token: token,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export interface ICreateSaleRequest {
  date: string;
  products: Array<{
    id: string;
    qt: number;
    summ: number;
  }>;
}

export interface IUpdateSaleRequest {
  products: Array<{
    id: string;
    qt: number;
    summ: number;
  }>;
}

export const createSale = async (
  saleData: ICreateSaleRequest
): Promise<{ success: boolean }> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const response = await axiosInstance.post(`${url}sale/add`, saleData, {
    headers: {
      token: token,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const updateSale = async (
  id: string,
  saleData: IUpdateSaleRequest
): Promise<{ success: boolean }> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const response = await axiosInstance.patch(`${url}sale/${id}/edit`, saleData, {
    headers: {
      token: token,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
