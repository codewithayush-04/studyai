import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Loader2, RefreshCw, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useNote } from "@/hooks/use-notes";
import { useGenerateFlashcards } from "@/hooks/use-ai";
import { useLogStudySession } from "@/hooks/use-study";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function Flashcards() {
  const { id } = useParams();
  const noteId = parseInt(id || "0");
  const { data: note, isLoading: noteLoading } = useNote(noteId);
  const generateFlashcards = useGenerateFlashcards();
  const logSession = useLogStudySession();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (note && (!note.flashcardDecks || note.flashcardDecks.length === 0) && !generateFlashcards.isPending && !generateFlashcards.isSuccess) {
      generateFlashcards.mutate(noteId);
    }
  }, [note, noteId]);

  if (noteLoading || generateFlashcards.isPending) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold font-display">Generating Flashcards...</h2>
        <p className="text-muted-foreground max-w-md mx-auto">AI is extracting facts, dates, and concepts to build your spaced repetition deck.</p>
        <div className="max-w-md mx-auto mt-8 h-64 rounded-3xl overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    );
  }

  const deck = note?.flashcardDecks?.[0];
  if (!deck || !deck.cards) {
    return <div className="text-center py-20 text-xl">Could not load flashcards.</div>;
  }

  const cards = deck.cards;
  const currentCard = cards[currentIdx];
  const progress = ((currentIdx) / cards.length) * 100;

  const nextCard = () => {
    setFlipped(false);
    setTimeout(() => {
      if (currentIdx < cards.length - 1) {
        setCurrentIdx(i => i + 1);
      } else {
        finishDeck();
      }
    }, 150); // slight delay to flip back before changing content
  };

  const prevCard = () => {
    if (currentIdx > 0) {
      setFlipped(false);
      setTimeout(() => {
        setCurrentIdx(i => i - 1);
      }, 150);
    }
  };

  const finishDeck = () => {
    setIsFinished(true);
    logSession.mutate({ noteId, activityType: 'flashcards' });
  };

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto pt-20 animate-in zoom-in-95 duration-500 text-center">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
          <Check className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-5xl font-bold font-display mb-4">Deck Complete!</h1>
        <p className="text-xl text-muted-foreground mb-10">
          You've reviewed all {cards.length} cards. Great job!
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => { setIsFinished(false); setCurrentIdx(0); }} size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg">
            Review Again
          </Button>
          <Button asChild size="lg" className="rounded-full h-14 px-8 text-lg shadow-lg hover:shadow-xl transition-all">
            <Link href={`/notes/${noteId}`}>Back to Note</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-secondary">
          <Link href={`/notes/${noteId}`}><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div className="text-sm font-bold text-muted-foreground tracking-widest uppercase">
          Card {currentIdx + 1} of {cards.length}
        </div>
        <div className="w-10" /> 
      </div>

      <Progress value={progress} className="h-2 rounded-full" />

      {/* 3D Flashcard Container */}
      <div className="perspective-1000 w-full h-[400px] mt-10 cursor-pointer group" onClick={() => setFlipped(!flipped)}>
        <motion.div
          className="w-full h-full relative preserve-3d"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-card rounded-[2.5rem] border-2 border-border shadow-xl shadow-black/5 flex flex-col items-center justify-center p-12 text-center group-hover:border-primary/30 transition-colors">
            <span className="absolute top-6 left-8 text-sm font-bold text-primary uppercase tracking-widest">Front</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight">
              {currentCard.front}
            </h2>
            <div className="absolute bottom-6 text-muted-foreground text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Click to flip
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 rounded-[2.5rem] border-2 border-primary/20 shadow-xl shadow-primary/10 flex flex-col items-center justify-center p-12 text-center rotate-y-180">
            <span className="absolute top-6 right-8 text-sm font-bold text-accent uppercase tracking-widest">Back</span>
            <p className="text-2xl md:text-3xl leading-relaxed font-medium">
              {currentCard.back}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between mt-12 px-4">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={prevCard} 
          disabled={currentIdx === 0}
          className="rounded-full h-14 px-6 gap-2"
        >
          <ChevronLeft className="w-5 h-5" /> Previous
        </Button>
        <Button 
          size="lg" 
          onClick={nextCard}
          className="rounded-full h-14 px-8 gap-2 shadow-lg shadow-primary/20"
        >
          {currentIdx === cards.length - 1 ? "Finish Deck" : "Next Card"} <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
