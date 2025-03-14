import { useQuery } from "@tanstack/react-query";
import { APIConfig } from "core/config";

export function useHeartBeatQuery() {
  return useQuery({
    queryKey: ["heartbeat"],
    queryFn: async () => {
      try {
        const req = await fetch(`${APIConfig.apiUrl}/heartbeat`, {
          signal: AbortSignal.timeout(5000),
        });
        return req.ok;
      } catch {
        return false;
      }
    },
    retry: false,
    refetchInterval: 5000,
  });
}
