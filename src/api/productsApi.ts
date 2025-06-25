import { axiosInstance } from "../axiosConfig";

export interface IProductResponse {
  id: string;
  name: string;
}

export const fetchProducts = async (): Promise<IProductResponse[]> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");
  const response = await axiosInstance.get(`${url}products/all`, {
    headers: {
      token: token,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
