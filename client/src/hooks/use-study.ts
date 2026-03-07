import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { StudySession } from "@shared/models/app";

export function useRecentSessions() {
  return useQuery({
    queryKey: [api.study.recentSessions.path],
    queryFn: async () => {
      const res = await fetch(api.study.recentSessions.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch study sessions");
      return (await res.json()) as StudySession[];
    },
  });
}

export function useLogStudySession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { noteId?: number; activityType: string }) => {
      const res = await fetch(api.study.logSession.path, {
        method: api.study.logSession.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to log study session");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.study.recentSessions.path] });
    },
  });
}
