import { useQuery } from "@tanstack/react-query";
import { fetchReport } from "../../api/reportApi";

export const useReportQuery = (date: string) => {
  return useQuery({
    queryKey: ["report", date],
    queryFn: () => fetchReport(date),
    enabled: !!date,
    retry: false,
  });
};
