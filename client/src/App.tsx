import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { AppProvider } from "@/context/AppContext";
import { SecurityGate } from "@/components/SecurityGate";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import Invoices from "@/pages/Invoices";
import ViewInvoice from "@/pages/ViewInvoice";
import Customers from "@/pages/Customers";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/invoice/:id" component={ViewInvoice} />
      <Route path="/customers" component={Customers} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <SecurityGate>
          <AppProvider>
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </AppProvider>
        </SecurityGate>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
