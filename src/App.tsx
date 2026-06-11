import * as React from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

import { Layout } from "@/components/layout";
import { Dashboard } from "@/pages/dashboard";
import { Busca } from "@/pages/busca";
import { Radar } from "@/pages/radar";
import { Leads } from "@/pages/leads";
import { LeadProfile } from "@/pages/lead-profile";
import { Crm } from "@/pages/crm";
import { Followup } from "@/pages/followup";
import { Creditos } from "@/pages/creditos";
import Afiliados from "@/pages/afiliados";
import { Configuracoes } from "@/pages/configuracoes";
import { Insights } from "@/pages/insights";
import Login from "@/pages/login";

const queryClient = new QueryClient();

function ProtectedApp() {
  const [location, navigate] = useLocation();
  const [loading, setLoading] = React.useState(true);
  const [session, setSession] = React.useState<any>(null);

  React.useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(data.session);
      setLoading(false);

      if (!data.session && location !== "/login") navigate("/login");
      if (data.session && location === "/login") navigate("/");
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      if (!newSession && location !== "/login") navigate("/login");
      if (newSession && location === "/login") navigate("/");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Carregando NXA...
      </div>
    );
  }

  if (!session && location !== "/login") {
    return <Login />;
  }

  if (location === "/login") {
    return <Login />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/busca" component={Busca} />
        <Route path="/radar" component={Radar} />
        <Route path="/ia-insights" component={Insights} />
        <Route path="/insights" component={Insights} />

        <Route path="/leads/:id" component={LeadProfile} />
        <Route path="/leads" component={Leads} />

        <Route path="/crm" component={Crm} />
        <Route path="/followup" component={Followup} />
        <Route path="/follow-up" component={Followup} />
        <Route path="/creditos" component={Creditos} />
        <Route path="/afiliados" component={Afiliados} />
        <Route path="/configuracoes" component={Configuracoes} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProtectedApp />
    </QueryClientProvider>
  );
}