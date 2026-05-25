import { useQuery } from "@tanstack/react-query";
import { fetchSaleDetails, fetchSales } from "../../api/salesApi";

export interface ISalesQueryParams {
  limit: number;
  offset: number;
}

export const useSalesQuery = (queryParams: ISalesQueryParams) => {
  return useQuery({
    queryKey: ["sales", queryParams],
    queryFn: async () => {
      try {
        return await fetchSales(queryParams);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "Токен не найден в localStorage"
        ) {
        }
        throw error;
      }
    },
    retry: false,
  });
};

export const useSaleDetailsQuery = (id: string) => {
  return useQuery({
    queryKey: ["saleDetails", id],
    queryFn: () => fetchSaleDetails(id),
    retry: false,
  });
};
