import { useParams, Link } from "wouter";
import { ArrowLeft, FileText, Brain, Target, Sparkles, Loader2, ChevronRight } from "lucide-react";
import { useNote } from "@/hooks/use-notes";
import { useGenerateSummary } from "@/hooks/use-ai";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NoteDetails() {
  const { id } = useParams();
  const noteId = parseInt(id || "0");
  const { data: note, isLoading } = useNote(noteId);
  const generateSummary = useGenerateSummary();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    );
  }

  if (!note) {
    return <div className="text-center py-20 text-xl font-bold">Note not found</div>;
  }

  const handleGenerateSummary = () => {
    generateSummary.mutate(noteId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-secondary">
          <Link href="/notes"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Link href="/notes" className="hover:text-primary transition-colors">Notes</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground truncate max-w-[200px] sm:max-w-md">{note.title}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight leading-tight max-w-3xl">
          {note.title}
        </h1>
      </div>

      <Tabs defaultValue="study" className="w-full mt-8">
        <TabsList className="bg-secondary p-1 rounded-full w-full justify-start h-auto overflow-x-auto">
          <TabsTrigger value="study" className="rounded-full px-6 py-3 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium">
            <Sparkles className="w-4 h-4 mr-2" /> Study Hub
          </TabsTrigger>
          <TabsTrigger value="original" className="rounded-full px-6 py-3 data-[state=active]:bg-card data-[state=active]:shadow-sm font-medium">
            <FileText className="w-4 h-4 mr-2" /> Original Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="study" className="mt-8 space-y-8">
          {/* Summary Section */}
          <div className="bg-card rounded-3xl border border-border/50 shadow-lg shadow-black/5 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 md:p-8 border-b border-border/50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold font-display flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-500" /> AI Summary
                </h2>
                <p className="text-muted-foreground mt-1">Distilled key points from your note.</p>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              {note.summary ? (
                <div className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none text-lg">
                    {note.summary.summaryText}
                  </div>
                  {note.summary.keyPoints && note.summary.keyPoints.length > 0 && (
                    <div className="mt-8 bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                      <h3 className="font-bold text-lg mb-4 text-blue-900 dark:text-blue-100">Key Takeaways</h3>
                      <ul className="space-y-3">
                        {note.summary.keyPoints.map((kp: string, i: number) => (
                          <li key={i} className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">{i+1}</div>
                            <span className="text-muted-foreground leading-relaxed">{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Summary Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-8">Generate a concise summary and key takeaways to quickly review this material.</p>
                  <Button 
                    onClick={handleGenerateSummary} 
                    disabled={generateSummary.isPending}
                    className="rounded-full px-8 h-12 shadow-lg hover:shadow-xl transition-all"
                  >
                    {generateSummary.isPending ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Text...</>
                    ) : "Generate Summary"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Tools Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Quiz Card */}
            <div className="bg-card rounded-3xl border border-border/50 shadow-lg shadow-black/5 p-8 flex flex-col justify-between hover:border-emerald-500/30 transition-colors group">
              <div>
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold font-display mb-2">Practice Quiz</h3>
                <p className="text-muted-foreground mb-8">Test your comprehension with an AI-generated multiple choice quiz.</p>
              </div>
              
              <Button asChild className="w-full rounded-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Link href={`/notes/${note.id}/quiz`}>
                  {note.quizzes?.length > 0 ? "Retake Quiz" : "Generate & Start Quiz"}
                </Link>
              </Button>
            </div>

            {/* Flashcards Card */}
            <div className="bg-card rounded-3xl border border-border/50 shadow-lg shadow-black/5 p-8 flex flex-col justify-between hover:border-purple-500/30 transition-colors group">
              <div>
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold font-display mb-2">Spaced Repetition</h3>
                <p className="text-muted-foreground mb-8">Memorize facts effortlessly with interactive flashcards.</p>
              </div>
              
              <Button asChild className="w-full rounded-full h-12 bg-purple-600 hover:bg-purple-700 text-white">
                <Link href={`/notes/${note.id}/flashcards`}>
                  {note.flashcardDecks?.length > 0 ? "Review Flashcards" : "Generate Flashcards"}
                </Link>
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="original" className="mt-8">
          <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-lg shadow-black/5">
            <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed whitespace-pre-wrap">
              {note.content}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
