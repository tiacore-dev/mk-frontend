import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  ICreateOrderRequest,
  updateOrder,
  IOrderUpdateRequest,
} from "../../api/ordersApi";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: ICreateOrderRequest) => createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Заявка успешно создана");
    },
    onError: (error: AxiosError) => {
      toast.error("Ошибка при создании заявки");
    },
  });
};

export const useUpdateOrderMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: IOrderUpdateRequest) => updateOrder(id, orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderDetails", id] });
      toast.success("Заявка успешно обновлена");
    },
    onError: (error: AxiosError) => {
      toast.error("Ошибка при обновлении заявки");
    },
  });
};
