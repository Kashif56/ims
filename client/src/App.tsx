import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { AppProvider } from "@/context/AppContext";
import { SecurityGate } from "@/components/SecurityGate";
import ErrorBoundary from "@/components/ErrorBoundary";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import Bills from "@/pages/Bills";
import ViewBill from "@/pages/ViewBill";
import Customers from "@/pages/Customers";
import CustomerPurchaseHistory from "@/pages/CustomerPurchaseHistory";
import ProfitAnalysis from "@/pages/ProfitAnalysis";
import PaymentHistory from "@/pages/PaymentHistory";
import Returns from "@/pages/Returns";
import ViewReturn from "@/pages/ViewReturn";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/bills" component={Bills} />
      <Route path="/bill/:id" component={ViewBill} />
      <Route path="/customers" component={Customers} />
      <Route path="/customer/:id/purchases" component={CustomerPurchaseHistory} />
      <Route path="/profit-analysis" component={ProfitAnalysis} />
      <Route path="/payment-history" component={PaymentHistory} />
      <Route path="/returns" component={Returns} />
      <Route path="/return/:id" component={ViewReturn} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
