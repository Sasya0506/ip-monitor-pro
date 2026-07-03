import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import StatusDashboard from "@/pages/status-dashboard";
import PriorityDashboard from "@/pages/priority-dashboard";
import AddTrademark from "@/pages/add-trademark";
import TrademarkDetail from "@/pages/trademark-detail";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";

const queryClient = new QueryClient();

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#22345e] flex items-center justify-center">
        <div className="text-white text-sm opacity-70">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/status-dashboard" component={StatusDashboard} />
        <Route path="/priority-dashboard" component={PriorityDashboard} />
        <Route path="/add-trademark" component={AddTrademark} />
        <Route path="/trademarks/:id" component={TrademarkDetail} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
