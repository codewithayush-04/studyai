import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { AppLayout } from "./components/layout/AppLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import CreateNote from "./pages/CreateNote";
import NoteDetails from "./pages/NoteDetails";
import Quiz from "./pages/Quiz";
import Flashcards from "./pages/Flashcards";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/notes" component={Notes} />
        <Route path="/notes/new" component={CreateNote} />
        <Route path="/notes/:id" component={NoteDetails} />
        <Route path="/notes/:id/quiz" component={Quiz} />
        <Route path="/notes/:id/flashcards" component={Flashcards} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/landing" component={Landing} />
          {/* Main App Routes */}
          <Route path="*">
            <Router />
          </Route>
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
