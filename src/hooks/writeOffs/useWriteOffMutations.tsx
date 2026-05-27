import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
  createWriteOff,
  ICreateWriteOffsRequest,
  IWriteOffUpdateRequest,
  updateWriteOff,
} from "../../api/writeOffsApi";
import { formatErrorToastMessage } from "../../utils/errorToast";

export const useCreateWriteOffMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: ICreateWriteOffsRequest) =>
      createWriteOff(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["writeOffs"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      toast.success("Списание успешно создано");
    },
    onError: (error: AxiosError) => {
      toast.error(
        formatErrorToastMessage("Ошибка при создании списания", error)
      );
    },
  });
};

export const useUpdateWriteOffMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: IWriteOffUpdateRequest) =>
      updateWriteOff(id, orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["writeOffDetails", id] });
      queryClient.invalidateQueries({ queryKey: ["writeOffs"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      toast.success("Списание успешно изменено");
    },
    onError: (error: AxiosError) => {
      toast.error(
        formatErrorToastMessage("Ошибка при изменении списания", error)
      );
    },
  });
};
