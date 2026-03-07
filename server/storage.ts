import { db } from "./db";
import {
  notes,
  summaries,
  quizzes,
  quizQuestions,
  flashcardDecks,
  flashcards,
  studySessions,
  type InsertNote,
} from "@shared/models/app";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Notes
  getNotesByUserId(userId: string): Promise<any[]>;
  getNoteDetails(id: number, userId: string): Promise<any>;
  createNote(note: InsertNote): Promise<any>;
  
  // AI Generated Content
  createSummary(noteId: number, summaryText: string, keyPoints: string[]): Promise<any>;
  createQuiz(noteId: number, title: string, questions: any[]): Promise<any>;
  createFlashcards(noteId: number, title: string, cards: any[]): Promise<any>;
  
  // Study Sessions
  getRecentStudySessions(userId: string): Promise<any[]>;
  logStudySession(userId: string, activityType: string, noteId?: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getNotesByUserId(userId: string): Promise<any[]> {
    return await db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.createdAt));
  }

  async getNoteDetails(id: number, userId: string): Promise<any> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    
    if (!note || note.userId !== userId) {
      return undefined;
    }
    
    const [summary] = await db.select().from(summaries).where(eq(summaries.noteId, id));
    
    const dbQuizzes = await db.select().from(quizzes).where(eq(quizzes.noteId, id));
    const quizzesWithQuestions = await Promise.all(
      dbQuizzes.map(async (q) => {
        const questions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, q.id));
        return { ...q, questions };
      })
    );
    
    const dbDecks = await db.select().from(flashcardDecks).where(eq(flashcardDecks.noteId, id));
    const decksWithCards = await Promise.all(
      dbDecks.map(async (d) => {
        const cards = await db.select().from(flashcards).where(eq(flashcards.deckId, d.id));
        return { ...d, cards };
      })
    );
    
    return {
      ...note,
      summary,
      quizzes: quizzesWithQuestions,
      flashcardDecks: decksWithCards
    };
  }

  async createNote(note: InsertNote): Promise<any> {
    const [created] = await db.insert(notes).values(note).returning();
    return created;
  }

  async createSummary(noteId: number, summaryText: string, keyPoints: string[]): Promise<any> {
    const [summary] = await db.insert(summaries).values({
      noteId,
      summaryText,
      keyPoints
    }).returning();
    return summary;
  }

  async createQuiz(noteId: number, title: string, questions: any[]): Promise<any> {
    return await db.transaction(async (tx) => {
      const [quiz] = await tx.insert(quizzes).values({ noteId, title }).returning();
      
      const questionsToInsert = questions.map(q => ({
        quizId: quiz.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      }));
      
      await tx.insert(quizQuestions).values(questionsToInsert);
      
      return quiz;
    });
  }

  async createFlashcards(noteId: number, title: string, cards: any[]): Promise<any> {
    return await db.transaction(async (tx) => {
      const [deck] = await tx.insert(flashcardDecks).values({ noteId, title }).returning();
      
      const cardsToInsert = cards.map(c => ({
        deckId: deck.id,
        front: c.front,
        back: c.back
      }));
      
      await tx.insert(flashcards).values(cardsToInsert);
      
      return deck;
    });
  }

  async getRecentStudySessions(userId: string): Promise<any[]> {
    return await db.select()
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.createdAt))
      .limit(10);
  }

  async logStudySession(userId: string, activityType: string, noteId?: number): Promise<any> {
    const [session] = await db.insert(studySessions).values({
      userId,
      activityType,
      noteId
    }).returning();
    return session;
  }
}

export const storage = new DatabaseStorage();
