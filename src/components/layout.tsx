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
  Moon,
  Sun,
  Sparkles,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigationSections = [
  {
    label: "Visão geral",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard, tag: null },
    ],
  },
  {
    label: "Inteligência",
    items: [
      { name: "Busca Inteligente", href: "/busca", icon: Search, tag: "PRO" },
      { name: "Radar", href: "/radar", icon: Radar, tag: null },
      { name: "IA Insights", href: "/insights", icon: Brain, tag: "NEW" },
    ],
  },
  {
    label: "Operação comercial",
    items: [
      { name: "Leads", href: "/leads", icon: Users, tag: null },
      { name: "CRM", href: "/crm", icon: KanbanSquare, tag: null },
      { name: "Follow-up", href: "/followup", icon: CalendarCheck, tag: null },
    ],
  },
  {
    label: "Crescimento",
    items: [
      { name: "Créditos", href: "/creditos", icon: Coins, tag: null },
      { name: "Afiliados", href: "/afiliados", icon: LinkIcon, tag: null },
    ],
  },
  {
    label: "Sistema",
    items: [
      { name: "Configurações", href: "/configuracoes", icon: Settings, tag: null },
    ],
  },
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


type NxaTheme = "neon" | "black" | "white";

const themeConfig: Record<NxaTheme, { label: string; Icon: any; next: NxaTheme }> = {
  neon: { label: "Neon", Icon: Sparkles, next: "black" },
  black: { label: "Black", Icon: Moon, next: "white" },
  white: { label: "White", Icon: Sun, next: "neon" },
};

function getStoredTheme(): NxaTheme {
  if (typeof window === "undefined") return "neon";
  const saved = window.localStorage.getItem("nxa-theme") as NxaTheme | null;
  return saved === "black" || saved === "white" || saved === "neon" ? saved : "neon";
}

function applyNxaTheme(theme: NxaTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-nxa-theme", theme);
  document.documentElement.classList.remove("theme-neon", "theme-black", "theme-white");
  document.documentElement.classList.add(`theme-${theme}`);
  window.localStorage.setItem("nxa-theme", theme);
  window.dispatchEvent(new CustomEvent("nxa-theme-change", { detail: theme }));
}

function useNxaTheme() {
  const [theme, setTheme] = React.useState<NxaTheme>(getStoredTheme);

  React.useEffect(() => {
    applyNxaTheme(theme);

    const syncTheme = () => setTheme(getStoredTheme());
    window.addEventListener("storage", syncTheme);
    window.addEventListener("nxa-theme-change", syncTheme as EventListener);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("nxa-theme-change", syncTheme as EventListener);
    };
  }, [theme]);

  function cycleTheme() {
    setTheme((current) => themeConfig[current].next);
  }

  return { theme, cycleTheme, ...themeConfig[theme] };
}

function SidebarTag({ tag }: { tag: string }) {
  const isNew = tag === "NEW";

  return (
    <span
      className={`ml-2 rounded-full px-1.5 py-0.5 text-[8px] font-black tracking-wide ${
        isNew ? "text-emerald-950" : "text-[color:var(--nxa-primary)]"
      }`}
      style={{
        background: isNew
          ? "linear-gradient(135deg, #34d399, #22d3ee)"
          : "var(--nxa-accent-soft)",
        border: isNew ? "1px solid rgba(52,211,153,0.45)" : "1px solid var(--nxa-accent-border)",
      }}
    >
      {tag}
    </span>
  );
}

function SidebarNavItem({ item, active }: { item: any; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link href={item.href}>
      <div
        className={`group relative flex cursor-pointer items-center rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
          active ? "translate-x-0" : "hover:translate-x-1"
        }`}
        style={{
          background: active
            ? "linear-gradient(135deg, var(--nxa-active), rgba(34,211,238,0.08))"
            : "transparent",
          border: active ? "1px solid var(--nxa-accent-border)" : "1px solid transparent",
          boxShadow: active ? "var(--nxa-glow-soft)" : "none",
          color: active ? "var(--nxa-primary)" : "var(--nxa-muted, var(--muted-foreground))",
        }}
      >
        {active && (
          <>
            <div
              className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full"
              style={{ background: "var(--nxa-primary)", boxShadow: "var(--nxa-glow)" }}
            />
            <div
              className="absolute inset-0 rounded-xl opacity-40"
              style={{
                background:
                  "radial-gradient(circle at 0% 50%, rgba(34,211,238,0.18), transparent 42%)",
              }}
            />
          </>
        )}

        <div
          className="relative z-10 mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-105"
          style={{
            background: active ? "var(--nxa-accent-soft)" : "rgba(148,163,184,0.06)",
            border: active ? "1px solid var(--nxa-accent-border)" : "1px solid rgba(148,163,184,0.10)",
          }}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>

        <span className="relative z-10 flex-1 truncate text-xs font-bold tracking-wide">
          {item.name}
        </span>

        {item.tag && <SidebarTag tag={item.tag} />}
      </div>
    </Link>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const [location] = useLocation();
  const { user } = useCurrentUser();

  return (
    <div
      className={`flex h-full flex-col ${className}`}
      style={{
        background: "var(--nxa-sidebar)",
        borderRight: "1px solid var(--nxa-border)",
        color: "var(--nxa-text)",
      }}
    >
      <div
        className="flex h-16 items-center gap-3 px-4"
        style={{ borderBottom: "1px solid var(--nxa-border)" }}
      >
        <div
          className="relative flex h-9 w-9 items-center justify-center rounded-xl shadow-sm"
          style={{
            background: "linear-gradient(135deg, var(--nxa-accent-soft), rgba(59,130,246,0.10))",
            border: "1px solid var(--nxa-accent-border)",
            boxShadow: "var(--nxa-glow-soft)",
          }}
        >
          <Zap className="h-4 w-4" style={{ color: "var(--nxa-primary)" }} />
        </div>

        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black tracking-widest" style={{ color: "var(--nxa-primary)" }}>
              NXA
            </span>
            <span className="truncate text-xs font-semibold">Growth Engine</span>
          </div>
          <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground">Commercial OS</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-5 px-2.5">
          {navigationSections.map((section) => (
            <div key={section.label} className="space-y-1.5">
              <div className="px-2.5 text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/80">
                {section.label}
              </div>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    location === item.href ||
                    (item.href !== "/" && location.startsWith(item.href));

                  return <SidebarNavItem key={item.name} item={item} active={isActive} />;
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div
        className="p-3"
        style={{ borderTop: "1px solid var(--nxa-border)" }}
      >
        <div
          className="relative overflow-hidden rounded-2xl px-3 py-3"
          style={{
            background: "linear-gradient(135deg, var(--nxa-card-soft), rgba(34,211,238,0.06))",
            border: "1px solid var(--nxa-border)",
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, var(--nxa-primary), transparent)" }}
          />

          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src="" />
              <AvatarFallback
                className="text-xs font-bold"
                style={{
                  background: "var(--nxa-accent-soft)",
                  color: "var(--nxa-primary)",
                }}
              >
                {getInitials(user?.email)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">
                {user?.email || "Usuário NXA"}
              </p>
              <p className="text-[10px] truncate" style={{ color: "var(--nxa-primary)" }}>
                NXA PRO · Ativo
              </p>
            </div>

            <div
              className="h-2 w-2 rounded-full bg-emerald-400"
              style={{ boxShadow: "0 0 10px rgba(52,211,153,0.9)" }}
            />
          </div>

          <div
            className="mt-3 flex items-center justify-between rounded-xl px-2.5 py-2 text-[10px] font-bold"
            style={{
              background: "rgba(148,163,184,0.06)",
              border: "1px solid rgba(148,163,184,0.10)",
            }}
          >
            <span className="text-muted-foreground">Status</span>
            <span style={{ color: "var(--nxa-primary)" }}>Online · PRO</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Topbar() {
  const [, navigate] = useLocation();
  const { user, credits } = useCurrentUser();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { theme, label: themeLabel, Icon: ThemeIcon, cycleTheme } = useNxaTheme();

  async function handleLogout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate("/login");
  }

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-4 px-6"
      style={{
        borderBottom: "1px solid var(--nxa-border)",
        background: "var(--nxa-topbar)",
        color: "var(--nxa-text)",
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
              background: "var(--nxa-input)",
              border: "1px solid var(--nxa-border)",
              color: "var(--nxa-text)",
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
              background: "var(--nxa-accent-soft)",
              border: "1px solid var(--nxa-accent-border)",
            }}
          >
            <Coins className="h-3.5 w-3.5" style={{ color: "var(--nxa-primary)" }} />
            <span className="text-xs font-black" style={{ color: "var(--nxa-primary)" }}>{credits}</span>
            <span className="text-[10px] text-muted-foreground">créditos</span>
          </div>
        </Link>

        <button
          type="button"
          onClick={cycleTheme}
          title={`Tema atual: ${themeLabel}`}
          aria-label={`Alterar tema. Tema atual: ${themeLabel}`}
          className="group flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-bold transition-all hover:-translate-y-0.5"
          style={{
            background: "var(--nxa-button)",
            border: "1px solid var(--nxa-border)",
            color: "var(--nxa-text)",
            boxShadow: theme === "neon" ? "var(--nxa-glow-soft)" : "none",
          }}
        >
          <ThemeIcon className="h-3.5 w-3.5" style={{ color: "var(--nxa-primary)" }} />
          <span className="hidden lg:inline">{themeLabel}</span>
        </button>

        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/5"
          style={{ border: "1px solid var(--nxa-border)", background: "var(--nxa-button)" }}
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span
            className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--nxa-primary)", boxShadow: "var(--nxa-glow)" }}
          />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="hidden md:flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-white/5"
            style={{ border: "1px solid var(--nxa-border)", background: "var(--nxa-button)" }}
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src="" />
              <AvatarFallback
                className="text-xs font-bold"
                style={{
                    background: "var(--nxa-accent-soft)",
                  color: "var(--nxa-primary)",
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
                background: "var(--nxa-popover)",
                border: "1px solid var(--nxa-border)",
              }}
            >
              <div className="px-3 py-3 border-b border-white/10">
                <p className="text-sm font-bold">Conta NXA</p>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {user?.email || "Usuário não identificado"}
                </p>
                <p className="text-xs mt-2 font-bold" style={{ color: "var(--nxa-primary)" }}>
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
      style={{ background: "var(--nxa-bg)", color: "var(--nxa-text)" }}
    >
      <Sidebar className="hidden md:flex w-64 shrink-0" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "var(--nxa-main-glow)",
            }}
          />

          <div className="relative z-10 p-5 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}