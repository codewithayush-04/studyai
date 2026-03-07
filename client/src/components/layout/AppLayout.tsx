import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import Landing from "@/pages/Landing";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex min-h-screen w-full bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 flex items-center gap-4 px-6 border-b border-border/40 glass-panel sticky top-0 z-30">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
