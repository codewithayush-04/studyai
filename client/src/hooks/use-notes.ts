import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Note, insertNoteSchema, NoteDetailsResponse } from "@shared/models/app";
import { z } from "zod";

export function useNotes() {
  return useQuery({
    queryKey: [api.notes.list.path],
    queryFn: async () => {
      const res = await fetch(api.notes.list.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to fetch notes");
      }
      return (await res.json()) as Note[];
    },
  });
}

export function useNote(id: number) {
  return useQuery({
    queryKey: [api.notes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.notes.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch note details");
      return (await res.json()) as NoteDetailsResponse;
    },
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof insertNoteSchema>) => {
      const res = await fetch(api.notes.create.path, {
        method: api.notes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create note");
      }
      return (await res.json()) as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.notes.list.path] });
    },
  });
}
