import { sql } from "drizzle-orm";
import { pgTable, serial, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), 
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const summaries = pgTable("summaries", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").notNull(),
  summaryText: text("summary_text").notNull(),
  keyPoints: jsonb("key_points").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  question: text("question").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctAnswer: text("correct_answer").notNull(),
});

export const flashcardDecks = pgTable("flashcard_decks", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id").notNull(),
  front: text("front").notNull(),
  back: text("back").notNull(),
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  noteId: integer("note_id"), 
  activityType: text("activity_type").notNull(), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- SCHEMAS ---
export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, userId: true, createdAt: true });
export const insertStudySessionSchema = createInsertSchema(studySessions).omit({ id: true, userId: true, createdAt: true });

// --- TYPES ---
export type Note = typeof notes.$inferSelect;
export type Summary = typeof summaries.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type FlashcardDeck = typeof flashcardDecks.$inferSelect;
export type Flashcard = typeof flashcards.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;

export type QuizWithQuestions = Quiz & { questions: QuizQuestion[] };
export type FlashcardDeckWithCards = FlashcardDeck & { cards: Flashcard[] };
export type NoteDetailsResponse = Note & {
  summary?: Summary;
  quizzes: QuizWithQuestions[];
  flashcardDecks: FlashcardDeckWithCards[];
};