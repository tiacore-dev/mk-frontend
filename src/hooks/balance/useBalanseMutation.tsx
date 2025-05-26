import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { changeBalance, IBalanceItem } from "../../api/balanceApi";
import { useQueryClient } from "@tanstack/react-query";

export const useChangeBalanceMutation = (): UseMutationResult<
  IBalanceItem[],
  Error,
  IBalanceItem[],
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (balanceData: IBalanceItem[]) => changeBalance(balanceData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      console.log("Баланс успешно обновлен:", data);
    },
    onError: (error: Error) => {
      console.error("Ошибка при обновлении баланса:", error.message);
    },
  });
};
