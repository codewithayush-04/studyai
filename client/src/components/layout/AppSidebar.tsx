import { Link, useLocation } from "wouter";
import { BookOpen, LayoutDashboard, FileText, Sparkles, LogOut, BrainCircuit } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const mainNav = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "My Notes", url: "/notes", icon: FileText },
  ];

  const toolsNav = [
    { title: "Create Note", url: "/notes/new", icon: BookOpen },
    { title: "AI Study Plan", url: "#", icon: Sparkles }, // Placeholder for future feature
  ];

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarContent>
        {/* Branding */}
        <div className="p-6 pb-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-primary/10 text-primary p-2 rounded-xl group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Lumina</span>
          </Link>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mt-4">Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-active={isActive}>
                      <Link href={item.url} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mt-2">Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex flex-col gap-4">
          {user && (
            <div className="flex items-center gap-3 px-2">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user.firstName || 'User'} className="w-8 h-8 rounded-full ring-2 ring-primary/20" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-semibold truncate w-32">{user.firstName || 'Student'}</span>
                <span className="text-xs text-muted-foreground truncate w-32">{user.email}</span>
              </div>
            </div>
          )}
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
