import { useQuery } from "@tanstack/react-query";
import { fetchRecipients } from "../../api/recipientsApi";

export const useRecipientsQuery = () => {
  return useQuery({
    queryKey: ["recipients"],
    queryFn: fetchRecipients,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};
