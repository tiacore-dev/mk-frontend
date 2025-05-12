import { useQuery } from "@tanstack/react-query";
import { fetchMovementDetails, fetchMovoments } from "../../api/movomentsApi";

export interface IMovementsQueryParams {
  limit: number;
  offset: number;
}

export const useMovementsQuery = (queryParams: IMovementsQueryParams) => {
  return useQuery({
    queryKey: ["movements", queryParams],
    queryFn: async () => {
      try {
        return await fetchMovoments(queryParams);
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

export const useMovementDetailsQuery = (id: string) => {
  return useQuery({
    queryKey: ["movementDetails", id],
    queryFn: () => fetchMovementDetails(id),
    retry: false,
  });
};
