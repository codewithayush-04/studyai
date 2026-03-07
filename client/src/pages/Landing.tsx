import { Sparkles, Brain, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-6 lg:px-12 fixed top-0 w-full z-50 glass-panel border-b border-border/40">
        <div className="flex items-center gap-2 text-primary">
          <Brain className="w-8 h-8" />
          <span className="font-display font-bold text-2xl tracking-tight text-foreground">Lumina</span>
        </div>
        <Button onClick={handleLogin} className="rounded-full px-6 shadow-md hover:shadow-lg transition-all">
          Sign In
        </Button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="w-4 h-4" />
          <span>The next generation of learning</span>
        </div>
        
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter max-w-4xl leading-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Turn your notes into <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">active knowledge</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Upload your study materials and let AI generate perfect summaries, interactive quizzes, and spaced-repetition flashcards instantly.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <Button onClick={handleLogin} size="lg" className="rounded-full px-8 h-14 text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all">
            Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-3 gap-8 max-w-5xl mt-32 w-full">
          {[
            {
              icon: FileText,
              title: "Smart Summaries",
              desc: "Extract the core concepts from pages of dense material in seconds."
            },
            {
              icon: Target,
              title: "Auto-Quizzes",
              desc: "Test your knowledge immediately with AI-generated multiple choice questions."
            },
            {
              icon: Brain,
              title: "Flashcards",
              desc: "Memorize facts efficiently with generated double-sided study cards."
            }
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center p-8 rounded-3xl bg-card border border-border/50 shadow-lg shadow-black/5 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold font-display mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

// Just for icon mapping above
import { FileText } from "lucide-react";
