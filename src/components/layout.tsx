import * as React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Search,
  Radar,
  Users,
  KanbanSquare,
  CalendarCheck,
  Coins,
  Link as LinkIcon,
  Settings,
  Bell,
  Menu,
  Brain,
  Zap,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, tag: null },
  { name: "Busca Inteligente", href: "/busca", icon: Search, tag: "PRO" },
  { name: "Radar", href: "/radar", icon: Radar, tag: null },
  { name: "IA Insights", href: "/insights", icon: Brain, tag: "NEW" },
  { name: "Leads", href: "/leads", icon: Users, tag: null },
  { name: "CRM", href: "/crm", icon: KanbanSquare, tag: null },
  { name: "Follow-up", href: "/followup", icon: CalendarCheck, tag: null },
  { name: "Créditos", href: "/creditos", icon: Coins, tag: null },
  { name: "Afiliados", href: "/afiliados", icon: LinkIcon, tag: null },
  { name: "Configurações", href: "/configuracoes", icon: Settings, tag: null },
];

function useCurrentUser() {
  const [user, setUser] = React.useState<any>(null);
  const [credits, setCredits] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  async function loadUser() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user || null);

    if (user) {
      const { data } = await supabase
        .from("wallets")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle();

      setCredits(Number(data?.credits || 0));
    }

    setLoading(false);
  }

  React.useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, credits, loading, reload: loadUser };
}

function getInitials(email?: string) {
  if (!email) return "NX";
  return email.slice(0, 2).toUpperCase();
}

export function Sidebar({ className }: { className?: string }) {
  const [location] = useLocation();
  const { user } = useCurrentUser();

  return (
    <div
      className={`flex h-full flex-col ${className}`}
      style={{
        background: "hsl(240 10% 2.5%)",
        borderRight: "1px solid hsl(240 10% 10%)",
      }}
    >
      <div
        className="flex h-16 items-center px-5 gap-3"
        style={{ borderBottom: "1px solid hsl(240 10% 9%)" }}
      >
        <div
          className="relative flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,255,255,0.2), rgba(0,255,255,0.05))",
            border: "1px solid rgba(0,255,255,0.3)",
          }}
        >
          <Zap className="h-4 w-4 text-primary" />
        </div>

        <div>
          <span className="text-sm font-black tracking-widest text-primary">
            NXA
          </span>
          <span className="ml-1.5 text-xs text-muted-foreground font-medium">
            Growth Engine
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-0.5 px-2">
          {navigation.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`relative flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 group ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={
                    isActive
                      ? {
                          background:
                            "linear-gradient(90deg, rgba(0,255,255,0.08), rgba(0,255,255,0.02))",
                          border: "1px solid rgba(0,255,255,0.12)",
                        }
                      : {
                          background: "transparent",
                          border: "1px solid transparent",
                        }
                  }
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary"
                      style={{
                        boxShadow: "0 0 8px rgba(0,255,255,0.6)",
                      }}
                    />
                  )}

                  <item.icon className="mr-3 h-4 w-4 shrink-0" />

                  <span className="flex-1 text-xs font-semibold tracking-wide">
                    {item.name}
                  </span>

                  {item.tag && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.tag === "NEW"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-primary/20 text-primary"
                      }`}
                    >
                      {item.tag}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className="p-3"
        style={{ borderTop: "1px solid hsl(240 10% 9%)" }}
      >
        <div
          className="flex items-center gap-3 px-2 py-2 rounded-lg"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src="" />
            <AvatarFallback
              className="text-xs font-bold"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,255,255,0.2), rgba(0,255,255,0.05))",
                color: "#00ffff",
              }}
            >
              {getInitials(user?.email)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">
              {user?.email || "Usuário NXA"}
            </p>
            <p className="text-[10px] text-primary truncate">
              NXA PRO · Ativo
            </p>
          </div>

          <div
            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
            style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }}
          />
        </div>
      </div>
    </div>
  );
}

export function Topbar() {
  const [, navigate] = useLocation();
  const { user, credits } = useCurrentUser();
  const [menuOpen, setMenuOpen] = React.useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate("/login");
  }

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-4 px-6"
      style={{
        borderBottom: "1px solid hsl(240 10% 9%)",
        background: "hsl(240 10% 3%)",
      }}
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="p-0 w-72">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex items-center gap-3">
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />

          <input
            type="search"
            placeholder="Buscar leads, empresas, insights..."
            className="h-8 w-72 rounded-lg pl-9 pr-3 text-xs transition-all focus:w-96"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "inherit",
              outline: "none",
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/creditos">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,255,255,0.12), rgba(0,255,255,0.04))",
              border: "1px solid rgba(0,255,255,0.2)",
            }}
          >
            <Coins className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-black text-primary">{credits}</span>
            <span className="text-[10px] text-muted-foreground">créditos</span>
          </div>
        </Link>

        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/5"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span
            className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary"
            style={{ boxShadow: "0 0 6px rgba(0,255,255,0.8)" }}
          />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="hidden md:flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-white/5"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src="" />
              <AvatarFallback
                className="text-xs font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,255,255,0.2), rgba(0,255,255,0.05))",
                  color: "#00ffff",
                }}
              >
                {getInitials(user?.email)}
              </AvatarFallback>
            </Avatar>

            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-11 z-50 w-72 rounded-xl p-2 shadow-2xl"
              style={{
                background: "hsl(240 10% 5%)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="px-3 py-3 border-b border-white/10">
                <p className="text-sm font-bold">Conta NXA</p>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {user?.email || "Usuário não identificado"}
                </p>
                <p className="text-xs text-primary mt-2 font-bold">
                  {credits} créditos disponíveis
                </p>
              </div>

              <Link href="/configuracoes">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 text-left"
                >
                  <User className="h-4 w-4" />
                  Minha conta
                </button>
              </Link>

              <Link href="/creditos">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 text-left"
                >
                  <Coins className="h-4 w-4" />
                  Créditos
                </button>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg hover:bg-red-500/10 text-red-400 text-left"
              >
                <LogOut className="h-4 w-4" />
                Sair da conta
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "hsl(240 10% 3.5%)" }}
    >
      <Sidebar className="hidden md:flex w-64 shrink-0" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,255,255,0.04) 0%, transparent 60%)",
            }}
          />

          <div className="relative z-10 p-5 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}