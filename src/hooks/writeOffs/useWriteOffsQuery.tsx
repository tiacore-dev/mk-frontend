import { useQuery } from "@tanstack/react-query";
import { fetchWriteOffs, fetchWriteOffDetails } from "../../api/writeOffsApi";

export interface IWriteOffsQueryParams {
  limit: number;
  offset: number;
}

export const useWriteOffsQuery = (queryParams: IWriteOffsQueryParams) => {
  return useQuery({
    queryKey: ["writeOffs", queryParams],
    queryFn: async () => {
      try {
        return await fetchWriteOffs(queryParams);
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

export const useWriteOffDetailsQuery = (id: string) => {
  return useQuery({
    queryKey: ["writeOffDetails", id],
    queryFn: () => fetchWriteOffDetails(id),
    retry: false,
  });
};
