import { z } from 'zod';
import { insertNoteSchema, notes, summaries, quizzes, flashcardDecks } from './models/app';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  })
};

export const api = {
  notes: {
    list: {
      method: 'GET' as const,
      path: '/api/notes' as const,
      responses: {
        200: z.array(z.custom<typeof notes.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/notes/:id' as const,
      responses: {
        200: z.custom<any>(), 
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/notes' as const,
      input: insertNoteSchema,
      responses: {
        201: z.custom<typeof notes.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  ai: {
    generateSummary: {
      method: 'POST' as const,
      path: '/api/notes/:id/summary' as const,
      responses: {
        201: z.custom<typeof summaries.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      }
    },
    generateQuiz: {
      method: 'POST' as const,
      path: '/api/notes/:id/quiz' as const,
      responses: {
        201: z.custom<any>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      }
    },
    generateFlashcards: {
      method: 'POST' as const,
      path: '/api/notes/:id/flashcards' as const,
      responses: {
        201: z.custom<any>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      }
    }
  },
  study: {
    recentSessions: {
      method: 'GET' as const,
      path: '/api/study-sessions/recent' as const,
      responses: {
        200: z.array(z.custom<any>()),
        401: errorSchemas.unauthorized,
      }
    },
    logSession: {
      method: 'POST' as const,
      path: '/api/study-sessions' as const,
      input: z.object({
        noteId: z.number().optional(),
        activityType: z.string()
      }),
      responses: {
        201: z.custom<any>(),
        401: errorSchemas.unauthorized,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
