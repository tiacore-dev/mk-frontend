import { axiosInstance } from "../axiosConfig";

export interface IReportProductData {
  productId: string; // id продукта
  startBalance: number; // остаток на начало дня шт
  order: number; // заказано шт
  received: number; // поступило от производства шт
  internalSended: number; // передано на ПВ шт
  internalReceived: number; // поступило от ПВ шт
  sold: number; // продано шт
  writtenOff: number; // списано шт
  endBalance: number; // остаток на конец дня шт
}

export type IReportResponse = IReportProductData[];

export const fetchReport = async (date_from: string, date_to: string): Promise<IReportResponse> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const response = await axiosInstance.get<IReportResponse>(
    `${url}report/get`,
    {
      params: { date_from, date_to },
      headers: {
        token: token,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
