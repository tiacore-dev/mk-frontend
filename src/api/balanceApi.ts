// src/api/balanceApi.ts
import { axiosInstance } from "../axiosConfig";

export interface IBalanceItem {
  product: string;
  date: string | null;
  qt: number;
}

export const fetchBalance = async (): Promise<IBalanceItem[]> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");
  const response = await axiosInstance.get<IBalanceItem[]>(
    `${url}balances/view`,
    {
      headers: {
        token: token,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const changeBalance = async (
  balanceData: IBalanceItem[]
): Promise<IBalanceItem[]> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");
  const response = await axiosInstance.patch<IBalanceItem[]>(
    `${url}balances/update`, // Обычно для обновления используется другой endpoint
    balanceData, // Отправляем массив данных в теле запроса
    {
      headers: {
        token: token,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
// export const changeBalance = async (
//   balanceData: IBalanceItem[]
// ): Promise<IBalanceItem[]> => {
//   console.log("!!!!!!!!!!!!!!", balanceData);

//   return balanceData;
// };
