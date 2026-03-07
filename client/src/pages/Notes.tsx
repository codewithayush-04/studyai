import { Link } from "wouter";
import { Plus, Search, FileText } from "lucide-react";
import { useNotes } from "@/hooks/use-notes";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Notes() {
  const { data: notes, isLoading } = useNotes();
  const [search, setSearch] = useState("");

  const filteredNotes = notes?.filter(note => 
    note.title.toLowerCase().includes(search.toLowerCase()) || 
    note.content.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight">My Notes</h1>
          <p className="text-muted-foreground mt-1">Manage and study your materials</p>
        </div>
        <Button asChild className="rounded-full shadow-md hover:shadow-lg">
          <Link href="/notes/new">
            <Plus className="w-5 h-5 mr-2" /> New Note
          </Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input 
          className="pl-12 rounded-2xl border-border/50 bg-card py-6 text-base shadow-sm focus-visible:ring-primary/20"
          placeholder="Search your notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-3xl" />
          ))
        ) : filteredNotes.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No notes found.</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <div className="group bg-card p-6 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full flex flex-col cursor-pointer">
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2">{note.title}</h3>
                <p className="text-muted-foreground text-sm mt-3 line-clamp-3 flex-1">
                  {note.content}
                </p>
                <div className="mt-6 pt-4 border-t text-xs text-muted-foreground font-medium">
                  {new Date(note.createdAt).toLocaleDateString(undefined, { 
                    month: 'short', day: 'numeric', year: 'numeric' 
                  })}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
