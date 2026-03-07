import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { ai } from "./replit_integrations/image"; // reuse client setup or write a new one
import { GoogleGenAI } from "@google/genai";

const aiClient = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await setupAuth(app);
  registerAuthRoutes(app);

  // Notes API
  app.get(api.notes.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const notes = await storage.getNotesByUserId(req.user.claims.sub);
      res.json(notes);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get(api.notes.get.path, isAuthenticated, async (req: any, res) => {
    try {
      const note = await storage.getNoteDetails(parseInt(req.params.id), req.user.claims.sub);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  app.post(api.notes.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.notes.create.input.parse(req.body);
      const note = await storage.createNote({
        ...input,
        userId: req.user.claims.sub,
      });
      await storage.logStudySession(req.user.claims.sub, "Uploaded Notes", note.id);
      res.status(201).json(note);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  // AI features
  app.post(api.ai.generateSummary.path, isAuthenticated, async (req: any, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const note = await storage.getNoteDetails(noteId, req.user.claims.sub);
      
      if (!note) return res.status(404).json({ message: "Note not found" });

      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a concise summary and 3-5 key points for the following notes:\n\n${note.content}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              summaryText: { type: "STRING" },
              keyPoints: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ["summaryText", "keyPoints"]
          } as any
        }
      });
      
      const result = JSON.parse(response.text || "{}");
      const summary = await storage.createSummary(noteId, result.summaryText, result.keyPoints);
      await storage.logStudySession(req.user.claims.sub, "Generated Summary", noteId);
      
      res.status(201).json(summary);
    } catch (e) {
      console.error("Summary gen error:", e);
      res.status(500).json({ message: "Failed to generate summary" });
    }
  });

  app.post(api.ai.generateQuiz.path, isAuthenticated, async (req: any, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const note = await storage.getNoteDetails(noteId, req.user.claims.sub);
      if (!note) return res.status(404).json({ message: "Note not found" });

      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Create a 5-question multiple choice quiz based on these notes:\n\n${note.content}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              questions: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    question: { type: "STRING" },
                    options: { type: "ARRAY", items: { type: "STRING" } },
                    correctAnswer: { type: "STRING" }
                  },
                  required: ["question", "options", "correctAnswer"]
                }
              }
            },
            required: ["title", "questions"]
          } as any
        }
      });
      
      const result = JSON.parse(response.text || "{}");
      const quiz = await storage.createQuiz(noteId, result.title || "AI Generated Quiz", result.questions || []);
      await storage.logStudySession(req.user.claims.sub, "Generated Quiz", noteId);
      
      res.status(201).json(quiz);
    } catch (e) {
      console.error("Quiz gen error:", e);
      res.status(500).json({ message: "Failed to generate quiz" });
    }
  });

  app.post(api.ai.generateFlashcards.path, isAuthenticated, async (req: any, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const note = await storage.getNoteDetails(noteId, req.user.claims.sub);
      if (!note) return res.status(404).json({ message: "Note not found" });

      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Create 5-10 flashcards based on these notes. Return question on front, answer on back:\n\n${note.content}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              cards: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    front: { type: "STRING" },
                    back: { type: "STRING" }
                  },
                  required: ["front", "back"]
                }
              }
            },
            required: ["title", "cards"]
          } as any
        }
      });
      
      const result = JSON.parse(response.text || "{}");
      const deck = await storage.createFlashcards(noteId, result.title || "AI Flashcards", result.cards || []);
      await storage.logStudySession(req.user.claims.sub, "Generated Flashcards", noteId);
      
      res.status(201).json(deck);
    } catch (e) {
      res.status(500).json({ message: "Failed to generate flashcards" });
    }
  });

  // Study Sessions
  app.get(api.study.recentSessions.path, isAuthenticated, async (req: any, res) => {
    try {
      const sessions = await storage.getRecentStudySessions(req.user.claims.sub);
      res.json(sessions);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch study sessions" });
    }
  });

  app.post(api.study.logSession.path, isAuthenticated, async (req: any, res) => {
    try {
      const { noteId, activityType } = api.study.logSession.input.parse(req.body);
      const session = await storage.logStudySession(req.user.claims.sub, activityType, noteId);
      res.status(201).json(session);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  return httpServer;
}