import { axiosInstance } from "../axiosConfig";

export interface IReportProductData {
  startBalance: number; // остаток на начало дня шт
  order: number; // заказано шт
  received: number; // поступило шт
  sold: number; // продано шт
  writtenOff: number; // списано шт
  endBalance: number; // остаток на конец дня шт
}

export type IReportResponse = Record<string, IReportProductData>;

export const fetchReport = async (date: string): Promise<IReportResponse> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const response = await axiosInstance.get<IReportResponse>(
    `${url}report/get`,
    {
      params: { date },
      headers: {
        token: token,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
