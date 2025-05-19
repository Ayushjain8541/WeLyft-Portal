import { Switch, Route, Router } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Drivers from "@/pages/drivers";
import Orders from "@/pages/orders";
import Reports from "@/pages/reports";
import DriverOrders from "@/pages/driver-orders";
import DriverHistory from "@/pages/driver-history";
import DriverProfile from "@/pages/driver-profile";
import Login from "@/pages/login";
import Home from "@/pages/home";
import { ThemeProvider } from "@/components/ui/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="logidash-theme">
      <TooltipProvider>
        <Router>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/drivers" component={Drivers} />
            <Route path="/orders" component={Orders} />
            <Route path="/reports" component={Reports} />
            <Route path="/driver/orders" component={DriverOrders} />
            <Route path="/driver/history" component={DriverHistory} />
            <Route path="/driver/profile" component={DriverProfile} />
            <Route component={NotFound} />
          </Switch>
        </Router>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
