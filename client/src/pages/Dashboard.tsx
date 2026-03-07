import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, Clock, Plus, Activity, BookMarked, Sparkles } from "lucide-react";
import { useNotes } from "@/hooks/use-notes";
import { useRecentSessions } from "@/hooks/use-study";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: notes, isLoading: notesLoading } = useNotes();
  const { data: sessions, isLoading: sessionsLoading } = useRecentSessions();

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight">
            Welcome back, <span className="text-primary">{user?.firstName || 'Student'}</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Ready to conquer your goals today?</p>
        </div>
        <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
          <Link href="/notes/new">
            <Plus className="w-5 h-5 mr-2" /> Create Note
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-lg shadow-black/5 flex items-center gap-5">
          <div className="p-4 bg-blue-500/10 text-blue-600 rounded-2xl">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Notes</p>
            <p className="text-3xl font-bold font-display mt-1">{notesLoading ? "-" : notes?.length || 0}</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-lg shadow-black/5 flex items-center gap-5">
          <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Study Sessions</p>
            <p className="text-3xl font-bold font-display mt-1">{sessionsLoading ? "-" : sessions?.length || 0}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-primary to-accent p-6 rounded-3xl border border-white/10 shadow-lg shadow-primary/30 flex items-center gap-5 text-white">
          <div className="p-4 bg-white/20 rounded-2xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/80 uppercase tracking-wider">AI Generated</p>
            <p className="text-3xl font-bold font-display mt-1">Ready</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Notes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-display flex items-center gap-2">
              <BookMarked className="w-6 h-6 text-primary" /> Recent Notes
            </h2>
            <Link href="/notes" className="text-primary font-medium hover:underline">View All</Link>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-5">
            {notesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-3xl" />
              ))
            ) : notes?.length === 0 ? (
              <div className="col-span-2 text-center py-16 bg-card border border-dashed rounded-3xl">
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No notes yet</h3>
                <p className="text-muted-foreground">Upload your first note to get started.</p>
              </div>
            ) : (
              notes?.slice(0, 4).map((note) => (
                <Link key={note.id} href={`/notes/${note.id}`}>
                  <div className="group bg-card p-6 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer h-full flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">{note.title}</h3>
                      <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                        {note.content.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-display flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" /> Activity
          </h2>
          <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-6">
            {sessionsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : sessions?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent activity.</p>
            ) : (
              <div className="space-y-6">
                {sessions?.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex gap-4 relative">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground capitalize">
                        {session.activityType.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// missing icon import
import { ArrowRight } from "lucide-react";
