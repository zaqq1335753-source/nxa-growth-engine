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

function NxaThemeStyles() {
  React.useEffect(() => {
    const saved = window.localStorage.getItem("nxa-theme") || "neon";
    document.documentElement.setAttribute("data-nxa-theme", saved);
    document.documentElement.classList.add(`theme-${saved}`);
  }, []);

  return (
    <style>{`
      :root, .theme-neon, [data-nxa-theme="neon"] {
        color-scheme: dark;
        --background: 222 47% 4%;
        --foreground: 210 40% 98%;
        --card: 222 47% 6%;
        --card-foreground: 210 40% 98%;
        --muted: 217 33% 17%;
        --muted-foreground: 215 20% 65%;
        --primary: 180 100% 50%;
        --primary-foreground: 222 47% 4%;
        --border: 180 100% 50% / 0.16;
        --input: 217 33% 17%;
        --ring: 180 100% 50%;
        --nxa-bg: #030712;
        --nxa-sidebar: rgba(2, 6, 23, 0.96);
        --nxa-topbar: rgba(2, 6, 23, 0.92);
        --nxa-text: #f8fafc;
        --nxa-muted: #94a3b8;
        --nxa-border: rgba(34, 211, 238, 0.16);
        --nxa-card-soft: rgba(255, 255, 255, 0.035);
        --nxa-input: rgba(255, 255, 255, 0.045);
        --nxa-button: rgba(255, 255, 255, 0.035);
        --nxa-popover: rgba(3, 7, 18, 0.98);
        --nxa-primary: #00f5ff;
        --nxa-accent-soft: linear-gradient(135deg, rgba(0,245,255,0.16), rgba(124,58,237,0.08));
        --nxa-accent-border: rgba(0,245,255,0.28);
        --nxa-active: linear-gradient(90deg, rgba(0,245,255,0.11), rgba(124,58,237,0.035));
        --nxa-glow: 0 0 10px rgba(0,245,255,0.75);
        --nxa-glow-soft: 0 0 20px rgba(0,245,255,0.12);
        --nxa-main-glow: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,245,255,0.06) 0%, transparent 60%);
      }

      .theme-black, [data-nxa-theme="black"] {
        color-scheme: dark;
        --background: 0 0% 3%;
        --foreground: 0 0% 98%;
        --card: 0 0% 6%;
        --card-foreground: 0 0% 98%;
        --muted: 0 0% 14%;
        --muted-foreground: 0 0% 64%;
        --primary: 0 0% 100%;
        --primary-foreground: 0 0% 4%;
        --border: 0 0% 100% / 0.12;
        --input: 0 0% 12%;
        --ring: 0 0% 100%;
        --nxa-bg: #050505;
        --nxa-sidebar: #070707;
        --nxa-topbar: rgba(5, 5, 5, 0.96);
        --nxa-text: #ffffff;
        --nxa-muted: #a3a3a3;
        --nxa-border: rgba(255, 255, 255, 0.12);
        --nxa-card-soft: rgba(255, 255, 255, 0.04);
        --nxa-input: rgba(255, 255, 255, 0.055);
        --nxa-button: rgba(255, 255, 255, 0.04);
        --nxa-popover: #0b0b0b;
        --nxa-primary: #ffffff;
        --nxa-accent-soft: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.035));
        --nxa-accent-border: rgba(255,255,255,0.2);
        --nxa-active: linear-gradient(90deg, rgba(255,255,255,0.11), rgba(255,255,255,0.025));
        --nxa-glow: 0 0 10px rgba(255,255,255,0.34);
        --nxa-glow-soft: none;
        --nxa-main-glow: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,255,255,0.035) 0%, transparent 60%);
      }

      .theme-white, [data-nxa-theme="white"] {
        color-scheme: light;
        --background: 0 0% 100%;
        --foreground: 222 47% 6%;
        --card: 0 0% 100%;
        --card-foreground: 222 47% 6%;
        --muted: 210 40% 96%;
        --muted-foreground: 215 16% 42%;
        --primary: 222 47% 6%;
        --primary-foreground: 0 0% 100%;
        --border: 222 47% 6% / 0.12;
        --input: 214 32% 91%;
        --ring: 222 47% 6%;
        --nxa-bg: #fafafa;
        --nxa-sidebar: #ffffff;
        --nxa-topbar: rgba(255,255,255,0.96);
        --nxa-text: #050505;
        --nxa-muted: #64748b;
        --nxa-border: rgba(15, 23, 42, 0.12);
        --nxa-card-soft: rgba(15, 23, 42, 0.035);
        --nxa-input: rgba(15, 23, 42, 0.035);
        --nxa-button: #ffffff;
        --nxa-popover: #ffffff;
        --nxa-primary: #050505;
        --nxa-accent-soft: linear-gradient(135deg, rgba(15,23,42,0.08), rgba(15,23,42,0.025));
        --nxa-accent-border: rgba(15,23,42,0.16);
        --nxa-active: linear-gradient(90deg, rgba(15,23,42,0.08), rgba(15,23,42,0.02));
        --nxa-glow: none;
        --nxa-glow-soft: none;
        --nxa-main-glow: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(15,23,42,0.035) 0%, transparent 60%);
      }

      body { background: var(--nxa-bg); color: var(--nxa-text); }
      * { transition-property: background-color, border-color, color, box-shadow; transition-duration: 180ms; }
    `}</style>
  );
}


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
      <NxaThemeStyles />
      <ProtectedApp />
    </QueryClientProvider>
  );
}