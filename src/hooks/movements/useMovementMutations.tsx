import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  acceptMovement,
  createMovement,
  type ICreateMovementRequest,
} from "../../api/movomentsApi";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";

export const useAcceptMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      acceptMovement(id, comment),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["movementDetails", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      toast.success("Успешно принято");
    },
    onError: (error: AxiosError) => {
      toast.error("Ошибка при принятии");
    },
  });
};

export const useCreateMovementMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (movementData: ICreateMovementRequest) =>
      createMovement(movementData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      toast.success("Перемещение успешно создано");
    },
    onError: (error: AxiosError) => {
      toast.error("Ошибка при создании перемещения");
    },
  });
};
