import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { useNote } from "@/hooks/use-notes";
import { useGenerateQuiz } from "@/hooks/use-ai";
import { useLogStudySession } from "@/hooks/use-study";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";

export default function Quiz() {
  const { id } = useParams();
  const noteId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  const { data: note, isLoading: noteLoading } = useNote(noteId);
  const generateQuiz = useGenerateQuiz();
  const logSession = useLogStudySession();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Auto-generate if no quiz exists
  useEffect(() => {
    if (note && (!note.quizzes || note.quizzes.length === 0) && !generateQuiz.isPending && !generateQuiz.isSuccess) {
      generateQuiz.mutate(noteId);
    }
  }, [note, noteId]);

  if (noteLoading || generateQuiz.isPending) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <h2 className="text-2xl font-bold font-display">Crafting your quiz...</h2>
        <p className="text-muted-foreground max-w-md mx-auto">AI is analyzing your note to create challenging questions to test your knowledge.</p>
        <div className="max-w-sm mx-auto mt-8">
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
        </div>
      </div>
    );
  }

  const quiz = note?.quizzes?.[0];
  if (!quiz || !quiz.questions) {
    return <div className="text-center py-20 text-xl">Could not load quiz.</div>;
  }

  const questions = quiz.questions;
  const currentQ = questions[currentIdx];
  const progress = ((currentIdx) / questions.length) * 100;

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
  };

  const checkAnswer = () => {
    if (!selectedAnswer) return;
    setIsAnswered(true);
    if (selectedAnswer === currentQ.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsFinished(true);
    logSession.mutate({ noteId, activityType: 'quiz' });
    
    // Confetti if score > 80%
    const finalScore = (score + (selectedAnswer === currentQ.correctAnswer ? 1 : 0)) / questions.length;
    if (finalScore >= 0.8) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4ade80', '#3b82f6', '#8b5cf6']
      });
    }
  };

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto pt-20 animate-in zoom-in-95 duration-500 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/30">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-bold font-display mb-4">Quiz Complete!</h1>
        <p className="text-2xl text-muted-foreground mb-10">
          You scored <span className="font-bold text-foreground">{score}</span> out of {questions.length}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => window.location.reload()} size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg">
            Retake Quiz
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
          Question {currentIdx + 1} of {questions.length}
        </div>
        <div className="w-10" /> {/* spacer for alignment */}
      </div>

      <Progress value={progress} className="h-2 rounded-full" />

      <div className="bg-card p-8 md:p-12 rounded-3xl border border-border/50 shadow-xl shadow-black/5 animate-in slide-in-from-right-8 duration-300" key={currentIdx}>
        <h2 className="text-2xl md:text-3xl font-bold font-display leading-relaxed mb-10">
          {currentQ.question}
        </h2>

        <div className="space-y-4">
          {currentQ.options.map((option: string, i: number) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = isAnswered && option === currentQ.correctAnswer;
            const isWrongSelected = isAnswered && isSelected && option !== currentQ.correctAnswer;
            
            let bgClass = "bg-secondary/50 hover:bg-secondary border-transparent";
            let textClass = "text-foreground";
            let icon = null;

            if (isAnswered) {
              if (isCorrect) {
                bgClass = "bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20 dark:border-emerald-500/50";
                textClass = "text-emerald-700 dark:text-emerald-400 font-medium";
                icon = <CheckCircle2 className="w-6 h-6 text-emerald-500 ml-auto" />;
              } else if (isWrongSelected) {
                bgClass = "bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-500/50";
                textClass = "text-red-700 dark:text-red-400 font-medium";
                icon = <XCircle className="w-6 h-6 text-red-500 ml-auto" />;
              } else {
                bgClass = "opacity-50 border-transparent bg-secondary/50";
              }
            } else if (isSelected) {
              bgClass = "bg-primary/10 border-primary shadow-sm";
              textClass = "text-primary font-medium";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(option)}
                disabled={isAnswered}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${bgClass}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold border ${isSelected || isCorrect ? 'border-current bg-background' : 'border-muted-foreground/30'}`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className={`text-lg ${textClass}`}>{option}</span>
                {icon}
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex justify-end">
          {!isAnswered ? (
            <Button 
              size="lg" 
              onClick={checkAnswer} 
              disabled={!selectedAnswer}
              className="rounded-full px-10 h-14 text-lg shadow-md"
            >
              Check Answer
            </Button>
          ) : (
            <Button 
              size="lg" 
              onClick={nextQuestion}
              className="rounded-full px-10 h-14 text-lg shadow-md bg-accent hover:bg-accent/90"
            >
              {currentIdx < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
