import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptMovement } from "../../api/movomentsApi";
import { AxiosError } from "axios";
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
      toast.success("Успешно принято");
    },
    onError: (error: AxiosError) => {
      toast.error("Ошибка при принятии");
    },
  });
};
