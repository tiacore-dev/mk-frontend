import { useQuery } from "@tanstack/react-query";
import { fetchReport } from "../../api/reportApi";

export const useReportQuery = (dateFrom: string, dateTo: string) => {
  return useQuery({
    queryKey: ["report", dateFrom, dateTo],
    queryFn: () => fetchReport(dateFrom, dateTo),
    enabled: !!dateFrom && !!dateTo,
    retry: false,
  });
};
