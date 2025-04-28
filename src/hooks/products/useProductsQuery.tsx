import { useQuery } from "@tanstack/react-query";
import { IProductResponse, fetchProducts } from "../../api/productsApi";

// export interface IProductsQueryParams {
//   limit: number;
//   offset: number;
// }

export const useProductsQuery = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        return await fetchProducts();
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "Токен не найден в localStorage"
        ) {
        }
        throw error;
      }
    },
  });
};
