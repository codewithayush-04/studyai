import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateNote } from "@/hooks/use-notes";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function CreateNote() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createNote = useCreateNote();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing fields",
        description: "Please provide both a title and content.",
        variant: "destructive"
      });
      return;
    }

    createNote.mutate({ title, content }, {
      onSuccess: (newNote) => {
        toast({ title: "Success", description: "Note created successfully!" });
        setLocation(`/notes/${newNote.id}`);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-secondary">
          <Link href="/notes"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <h1 className="text-3xl font-bold font-display tracking-tight">Create Note</h1>
      </div>

      <div className="bg-card p-6 md:p-8 rounded-3xl border border-border/50 shadow-lg shadow-black/5 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground uppercase tracking-wider ml-1">Title</label>
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g., Biology Chapter 4: Cell Structure"
            className="text-lg py-6 rounded-2xl bg-background border-border focus-visible:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground uppercase tracking-wider ml-1">Content</label>
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your lecture notes, article text, or written material here..."
            className="min-h-[400px] text-base rounded-2xl bg-background border-border resize-y p-6 focus-visible:ring-primary/20"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={createNote.isPending}
            className="rounded-full px-8 py-6 text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {createNote.isPending ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-5 h-5 mr-2" /> Save Note & Setup AI</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
