import { useLocation } from "wouter";
import { FileText, LayoutDashboard, List, AlertTriangle, PlusCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Status Tracking", href: "/status-dashboard", icon: List },
    { name: "Priority Queue", href: "/priority-dashboard", icon: AlertTriangle },
    { name: "Add Application", href: "/add-trademark", icon: PlusCircle },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      {/* Sidebar */}
      <div className="hidden w-64 border-r bg-sidebar md:flex md:flex-col">
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border/50">
          <div className="flex items-center gap-2 font-bold text-sidebar-foreground">
            <FileText className="h-5 w-5 text-sidebar-primary-foreground" />
            <span>IP Monitor Pro</span>
          </div>
        </div>
        <div className="px-4 py-6 space-y-1 flex-1">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
                onClick={() => setLocation(item.href)}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            );
          })}
        </div>
        <div className="px-4 pb-6 border-t border-sidebar-border/50 pt-4">
          <div className="flex items-center justify-between px-2 mb-3">
            <div>
              <p className="text-xs font-medium text-sidebar-foreground/80">{user?.username}</p>
              <p className="text-xs text-sidebar-foreground/40">Administrator</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-red-50 hover:text-red-600"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:hidden">
          <div className="flex items-center gap-2 font-bold">
            <FileText className="h-5 w-5 text-primary" />
            <span>IP Monitor</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-red-600"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
