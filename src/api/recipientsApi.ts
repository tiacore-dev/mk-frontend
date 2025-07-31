import { axiosInstance } from "../axiosConfig";

export interface IRecipient {
  id: string;
  name: string;
}

// http://192.168.0.40/api/hs/api/recipients/all
export const fetchRecipients = async (): Promise<IRecipient[]> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const response = await axiosInstance.get(`${url}recipients/all`, {
    headers: {
      token: token,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
