import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Summary, QuizWithQuestions, FlashcardDeckWithCards } from "@shared/models/app";

export function useGenerateSummary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: number) => {
      const url = buildUrl(api.ai.generateSummary.path, { id: noteId });
      const res = await fetch(url, {
        method: api.ai.generateSummary.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate summary");
      return (await res.json()) as Summary;
    },
    onSuccess: (_, noteId) => {
      queryClient.invalidateQueries({ queryKey: [api.notes.get.path, noteId] });
    },
  });
}

export function useGenerateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: number) => {
      const url = buildUrl(api.ai.generateQuiz.path, { id: noteId });
      const res = await fetch(url, {
        method: api.ai.generateQuiz.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate quiz");
      return (await res.json()) as QuizWithQuestions;
    },
    onSuccess: (_, noteId) => {
      queryClient.invalidateQueries({ queryKey: [api.notes.get.path, noteId] });
    },
  });
}

export function useGenerateFlashcards() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: number) => {
      const url = buildUrl(api.ai.generateFlashcards.path, { id: noteId });
      const res = await fetch(url, {
        method: api.ai.generateFlashcards.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate flashcards");
      return (await res.json()) as FlashcardDeckWithCards;
    },
    onSuccess: (_, noteId) => {
      queryClient.invalidateQueries({ queryKey: [api.notes.get.path, noteId] });
    },
  });
}
