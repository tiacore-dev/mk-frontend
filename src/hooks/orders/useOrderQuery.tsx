import { useQuery } from "@tanstack/react-query";
import { fetchOrderDetails, fetchOrders } from "../../api/ordersApi";

export interface IOrdersQueryParams {
  limit: number;
  offset: number;
}

export const useOrdersQuery = (queryParams: IOrdersQueryParams) => {
  return useQuery({
    queryKey: ["orders", queryParams],
    queryFn: async () => {
      try {
        return await fetchOrders(queryParams);
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

export const useOrderDetailsQuery = (id: string) => {
  return useQuery({
    queryKey: ["orderDetails", id],
    queryFn: () => fetchOrderDetails(id),
    retry: false,
  });
};
