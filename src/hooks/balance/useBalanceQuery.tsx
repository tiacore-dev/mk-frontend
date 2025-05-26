import { useQuery } from "@tanstack/react-query";
import { fetchBalance, fetchSold } from "../../api/balanceApi";

export const useBalanceQuery = () => {
  return useQuery({
    queryKey: ["balance"],
    queryFn: async () => {
      try {
        return await fetchBalance();
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

export const useSoldQuery = () => {
  return useQuery({
    queryKey: ["sold"],
    queryFn: async () => {
      try {
        return await fetchSold();
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
