import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
  createSale,
  ICreateSaleRequest,
  IUpdateSaleRequest,
  updateSale,
} from "../../api/salesApi";
import { formatErrorToastMessage } from "../../utils/errorToast";

export const useCreateSaleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleData: ICreateSaleRequest) => createSale(saleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      toast.success("Реализация успешно создана");
    },
    onError: (error: AxiosError) => {
      toast.error(
        formatErrorToastMessage("Ошибка при создании реализации", error)
      );
    },
  });
};

export const useUpdateSaleMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleData: IUpdateSaleRequest) => updateSale(id, saleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saleDetails", id] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      toast.success("Реализация успешно изменена");
    },
    onError: (error: AxiosError) => {
      toast.error(
        formatErrorToastMessage("Ошибка при изменении реализации", error)
      );
    },
  });
};
