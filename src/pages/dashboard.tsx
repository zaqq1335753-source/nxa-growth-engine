import * as React from "react";
import { Link, useLocation } from "wouter";
import { supabase } from "../lib/supabase";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleDollarSign,
  Clock,
  Command,
  Database,
  Flame,
  Gauge,
  Globe2,
  Layers3,
  LineChart,
  MapPin,
  MessageSquare,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DEFAULT_BUSINESS_ID = "NEXA_PROD_01";
const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";

function getBusinessId() {
  try {
    return localStorage.getItem("nxa_business_id") || DEFAULT_BUSINESS_ID;
  } catch {
    return DEFAULT_BUSINESS_ID;
  }
}


type DashboardVisualTheme = "neon" | "mono-dark" | "mono-light";

const DASHBOARD_THEMES: Record<DashboardVisualTheme, React.CSSProperties> = {
  neon: {
    "--background": "222 47% 4%",
    "--foreground": "210 40% 98%",
    "--card": "222 47% 7%",
    "--card-foreground": "210 40% 98%",
    "--popover": "222 47% 6%",
    "--popover-foreground": "210 40% 98%",
    "--primary": "180 100% 50%",
    "--primary-foreground": "222 47% 4%",
    "--secondary": "217 33% 12%",
    "--secondary-foreground": "210 40% 98%",
    "--muted": "217 33% 13%",
    "--muted-foreground": "215 20% 68%",
    "--accent": "180 100% 50%",
    "--accent-foreground": "222 47% 4%",
    "--border": "184 70% 18%",
    "--input": "184 70% 18%",
    "--ring": "180 100% 50%",
    "--card-border": "184 70% 18%",
  } as React.CSSProperties,
  "mono-dark": {
    "--background": "0 0% 3%",
    "--foreground": "0 0% 98%",
    "--card": "0 0% 7%",
    "--card-foreground": "0 0% 98%",
    "--popover": "0 0% 6%",
    "--popover-foreground": "0 0% 98%",
    "--primary": "0 0% 100%",
    "--primary-foreground": "0 0% 4%",
    "--secondary": "0 0% 11%",
    "--secondary-foreground": "0 0% 98%",
    "--muted": "0 0% 12%",
    "--muted-foreground": "0 0% 64%",
    "--accent": "0 0% 100%",
    "--accent-foreground": "0 0% 4%",
    "--border": "0 0% 18%",
    "--input": "0 0% 18%",
    "--ring": "0 0% 100%",
    "--card-border": "0 0% 18%",
  } as React.CSSProperties,
  "mono-light": {
    "--background": "210 28% 91%",
    "--foreground": "222 47% 7%",
    "--card": "210 32% 96%",
    "--card-foreground": "222 47% 7%",
    "--popover": "210 32% 97%",
    "--popover-foreground": "222 47% 7%",
    "--primary": "190 92% 34%",
    "--primary-foreground": "210 40% 98%",
    "--secondary": "212 24% 88%",
    "--secondary-foreground": "222 47% 10%",
    "--muted": "213 22% 87%",
    "--muted-foreground": "216 18% 34%",
    "--accent": "263 76% 54%",
    "--accent-foreground": "210 40% 98%",
    "--border": "214 20% 76%",
    "--input": "214 20% 76%",
    "--ring": "190 92% 34%",
    "--card-border": "214 20% 76%",
  } as React.CSSProperties,
};

function normalizeTheme(value: string | null): DashboardVisualTheme | null {
  if (!value) return null;
  const theme = value.toLowerCase();
  if (["neon", "cyber", "default"].includes(theme)) return "neon";
  if (["black", "dark", "mono-dark", "preto"].includes(theme)) return "mono-dark";
  if (["white", "light", "mono-light", "branco"].includes(theme)) return "mono-light";
  return null;
}

function getStoredDashboardTheme(): DashboardVisualTheme {
  try {
    return (
      normalizeTheme(localStorage.getItem("nxa-theme")) ||
      normalizeTheme(localStorage.getItem("nxa_app_theme")) ||
      normalizeTheme(localStorage.getItem("nxa_theme")) ||
      normalizeTheme(localStorage.getItem("nxa_visual_theme")) ||
      normalizeTheme(localStorage.getItem("nxa_dashboard_visual_theme")) ||
      "neon"
    );
  } catch {
    return "neon";
  }
}

function DashboardThemeStyle() {
  return (
    <style>{`
      .nxa-dashboard-shell {
        position: relative;
        min-height: calc(100vh - 2rem);
        border-radius: 1.25rem;
        padding: 1rem;
        color: hsl(var(--foreground));
        transition: background 260ms ease, color 220ms ease, border-color 220ms ease;
      }

      .nxa-theme-neon {
        background:
          radial-gradient(circle at 10% 0%, rgba(6,182,212,0.12), transparent 30%),
          radial-gradient(circle at 90% 0%, rgba(124,58,237,0.12), transparent 32%),
          linear-gradient(180deg, #06111f 0%, #071421 48%, #08101c 100%);
      }

      .nxa-theme-mono-dark {
        background:
          radial-gradient(circle at 15% 0%, rgba(6,182,212,0.08), transparent 28%),
          linear-gradient(180deg, #080b10 0%, #0b0f17 100%);
      }

      .nxa-theme-mono-light {
        background:
          radial-gradient(circle at 10% 0%, rgba(6,182,212,0.16), transparent 32%),
          radial-gradient(circle at 88% 0%, rgba(124,58,237,0.10), transparent 34%),
          linear-gradient(180deg, #eef5f8 0%, #e8f1f5 55%, #edf4f7 100%);
      }

      .nxa-dashboard-shell .nxa-soft-card,
      .nxa-dashboard-shell .nxa-hero-panel,
      .nxa-dashboard-shell .nxa-intelligence-card {
        border: 1px solid hsl(var(--border) / 0.9);
        background: hsl(var(--card) / 0.66);
        backdrop-filter: blur(18px);
        box-shadow: 0 12px 34px rgba(2, 6, 23, 0.10);
      }

      .nxa-theme-mono-light .nxa-soft-card,
      .nxa-theme-mono-light .nxa-hero-panel,
      .nxa-theme-mono-light .nxa-intelligence-card,
      .nxa-theme-mono-light .bg-card\\/55 {
        background: rgba(248, 252, 253, 0.78) !important;
        border-color: rgba(15, 23, 42, 0.10) !important;
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
      }

      .nxa-theme-mono-light .bg-background\\/40,
      .nxa-theme-mono-light .bg-background\\/45,
      .nxa-theme-mono-light .bg-background\\/50,
      .nxa-theme-mono-light .bg-background\\/60 {
        background: rgba(255, 255, 255, 0.56) !important;
        border-color: rgba(15, 23, 42, 0.10) !important;
      }

      .nxa-theme-mono-light .text-white,
      .nxa-theme-mono-light .text-slate-50 {
        color: #07111f !important;
      }

      .nxa-theme-mono-light .text-muted-foreground {
        color: #526374 !important;
      }

      .nxa-theme-mono-light .text-cyan-300,
      .nxa-theme-mono-light .text-cyan-400 { color: #0891b2 !important; }
      .nxa-theme-mono-light .text-emerald-300 { color: #059669 !important; }
      .nxa-theme-mono-light .text-blue-300 { color: #2563eb !important; }
      .nxa-theme-mono-light .text-orange-300 { color: #d97706 !important; }
      .nxa-theme-mono-light .text-red-300 { color: #dc2626 !important; }
      .nxa-theme-mono-light .text-purple-300 { color: #7c3aed !important; }

      .nxa-dashboard-shell .border-card-border,
      .nxa-dashboard-shell .rounded-3xl,
      .nxa-dashboard-shell .rounded-2xl {
        transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
      }

      .nxa-dashboard-shell .border-card-border:hover,
      .nxa-dashboard-shell .nxa-hover:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 36px hsl(var(--primary) / 0.10);
      }

      .nxa-dashboard-shell button,
      .nxa-dashboard-shell a button {
        transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
      }

      .nxa-dashboard-shell button:hover,
      .nxa-dashboard-shell a button:hover {
        transform: translateY(-1px);
      }

      .nxa-dashboard-shell .nxa-hardware-line {
        height: 1px;
        background: linear-gradient(90deg, transparent, hsl(var(--primary) / 0.38), transparent);
      }
    `}</style>
  );
}

function toArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.leads)) return value.leads;
  return [];
}

function safeJsonParse(value: string | null, fallback: any = null) {
  try {
    if (!value) return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function numberFormat(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value || 0);
}

function moneyFormat(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value: any) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function dateKey(value: any) {
  try {
    return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  } catch {
    return "—";
  }
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function isToday(value: any) {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function percentage(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function getScore(lead: any) {
  const score = Number(lead?.nxa_score ?? lead?.ai_score ?? lead?.score ?? lead?.fit_score ?? 0);
  if (!Number.isFinite(score) || score <= 0) {
    let calculated = 48;
    if (lead?.phone || lead?.whatsapp || lead?.telefone) calculated += 16;
    if (lead?.website || lead?.site) calculated += 8;
    if (Number(lead?.rating) >= 4.4) calculated += 12;
    if (Number(lead?.reviews || lead?.user_ratings_total || lead?.total_reviews) >= 50) calculated += 10;
    return clamp(calculated);
  }
  return clamp(Math.round(score));
}

function getLeadName(lead: any) {
  return lead?.name || lead?.company || lead?.title || "Lead sem nome";
}

function getLeadSegment(lead: any) {
  return lead?.segment || lead?.category || lead?.niche || "Sem segmento";
}

function getLeadCity(lead: any) {
  return lead?.city || lead?.cidade || "—";
}

function getLeadState(lead: any) {
  return lead?.state || lead?.uf || "—";
}

function getLeadStatus(lead: any) {
  return String(lead?.status || "new").toLowerCase();
}

function getLeadPhone(lead: any) {
  return lead?.phone || lead?.whatsapp || lead?.telefone || "";
}

function getLeadWebsite(lead: any) {
  return lead?.website || lead?.site || "";
}

function getSearchTitle(item: any) {
  return item?.query || item?.niche || item?.segment || item?.search_term || "Busca sem nome";
}

function getSearchResultsCount(item: any) {
  return Number(item?.results_count ?? item?.total_results ?? item?.total ?? item?.lead_count ?? 0) || 0;
}

function groupCount(items: any[], getter: (item: any) => string) {
  const map: Record<string, number> = {};
  for (const item of items) {
    const key = getter(item) || "—";
    if (key === "—" || key === "") continue;
    map[key] = (map[key] || 0) + 1;
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));
}

async function getCurrentUserId() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.id || DEFAULT_USER_ID;
}

function SectionTitle({ icon, title, subtitle, action }: { icon: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-[0_0_22px_rgba(0,255,255,0.10)]">
          {icon}
        </div>
        <div>
          <h2 className="font-black tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function KpiCard({ label, value, helper, icon, tone = "primary" }: { label: string; value: string | number; helper: string; icon: React.ReactNode; tone?: "primary" | "orange" | "green" | "blue" | "red" | "purple" }) {
  const toneMap = {
    primary: "bg-primary/10 text-primary border-primary/20",
    orange: "bg-orange-500/10 text-orange-300 border-orange-500/20",
    green: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    red: "bg-red-500/10 text-red-300 border-red-500/20",
    purple: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  };

  return (
    <Card className="relative overflow-hidden bg-card/55 backdrop-blur-xl border-card-border hover:border-primary/30 transition-all duration-300">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">{label}</p>
            <p className="text-3xl font-black tracking-tight mt-2">{value}</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{helper}</p>
          </div>
          <div className={`h-12 w-12 shrink-0 rounded-2xl border flex items-center justify-center ${toneMap[tone]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressRow({ label, value, total, badge }: { label: string; value: number; total: number; badge?: string }) {
  const width = clamp(percentage(value, total));
  return (
    <div className="space-y-2 rounded-2xl border border-border/80 p-3 bg-background/40">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold truncate">{label}</span>
        <div className="flex items-center gap-2">
          {badge && <Badge variant="outline" className="text-[10px]">{badge}</Badge>}
          <span className="text-xs text-muted-foreground">{numberFormat(value)}</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function SystemPill({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border p-3 bg-background/40">
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${ok ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" : "bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.8)]"}`} />
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
      {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-red-400" />}
    </div>
  );
}

function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="flex items-end gap-2 h-40 pt-4">
      {data.map((item) => {
        const height = Math.max(8, Math.round((item.value / max) * 100));
        return (
          <div key={item.label} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
            <div className="w-full rounded-t-2xl bg-gradient-to-t from-primary/30 via-primary/70 to-emerald-300 border border-primary/20" style={{ height: `${height}%` }} />
            <span className="text-[10px] text-muted-foreground truncate max-w-[48px]">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function MissionItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-3">
      <div className={`h-7 w-7 rounded-full flex items-center justify-center border ${done ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-muted/40 border-border text-muted-foreground"}`}>
        {done ? <CheckCircle2 className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </div>
      <span className={`text-sm font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
}

function CollapsiblePanel({
  id,
  title,
  subtitle,
  icon,
  open,
  onToggle,
  children,
  action,
  preview,
}: {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  action?: React.ReactNode;
  preview?: React.ReactNode;
}) {
  return (
    <Card id={`dashboard-${id}`} className="bg-card/55 backdrop-blur-xl border-card-border overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={() => onToggle(id)} className="flex items-start gap-3 text-left min-w-0 flex-1 group">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {icon}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-black flex items-center gap-2">
                {title}
                {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </CardTitle>
              {subtitle && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{subtitle}</p>}
            </div>
          </button>
          <div className="flex items-center gap-2 shrink-0">
            {action}
            <Button size="sm" variant="outline" onClick={() => onToggle(id)} className="bg-background/50">
              {open ? "Recolher" : "Expandir"}
            </Button>
          </div>
        </div>
        {!open && preview && <div className="pt-4">{preview}</div>}
      </CardHeader>
      {open && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}

function generateLocalCopilotInsight(ctx: any) {
  const bestLeadName = ctx.bestLead ? getLeadName(ctx.bestLead) : "a melhor oportunidade da sua carteira";
  const hasPhone = ctx.bestLead ? Boolean(getLeadPhone(ctx.bestLead)) : false;
  const hasWebsite = ctx.bestLead ? Boolean(getLeadWebsite(ctx.bestLead)) : false;
  const bestScore = ctx.bestLead ? getScore(ctx.bestLead) : 0;

  let executive = "Sua operação ainda precisa de uma primeira busca para o Copilot priorizar oportunidades com precisão.";
  let action = "Criar uma busca inteligente agora";
  let reason = "Sem base suficiente, a plataforma ainda não consegue calcular prioridade, praça e potencial comercial com segurança.";
  let confidence = 58;

  if (ctx.totalLeads > 0) {
    executive = `A base possui ${ctx.totalLeads} oportunidades. O melhor caminho agora é concentrar energia nos leads com contato validado e score acima da média.`;
    action = hasPhone
      ? `Abordar ${bestLeadName} pelo WhatsApp com pitch consultivo`
      : `Enriquecer o contato de ${bestLeadName} antes da abordagem`;
    reason = `${bestLeadName} combina score ${bestScore || "comercial"}, segmento ${ctx.bestSegment || "prioritário"}, presença digital ${hasWebsite ? "detectada" : "com lacuna"} e potencial de receita estimado.`;
    confidence = clamp(Math.round(ctx.dataQuality * 0.4 + ctx.contactsReady * 0.3 + ctx.avgScore * 0.3));
  }

  if (ctx.hotLeads === 0 && ctx.warmLeads > 0) {
    executive = "A carteira está com muitos leads mornos. O foco deve ser qualificar e enriquecer antes de vender agressivamente.";
    action = "Filtrar leads mornos com telefone e gerar abordagem de diagnóstico";
    reason = "Ainda não há score acima de 80, mas existe base suficiente para transformar leads medianos em oportunidades reais.";
  }

  if (ctx.overdueFollowups > 0) {
    executive = `Existem ${ctx.overdueFollowups} follow-up(s) atrasado(s). O maior risco agora é perder timing comercial.`;
    action = "Resolver follow-ups críticos antes de buscar novos leads";
    reason = "Leads já capturados normalmente convertem melhor quando recebem continuidade rápida.";
    confidence = Math.max(confidence, 76);
  }

  return {
    executive,
    action,
    reason,
    confidence,
    playbook: [
      ctx.hotLeads > 0 ? "Começar pelos leads quentes com WhatsApp pronto." : "Criar ou enriquecer oportunidades até formar ao menos 3 leads quentes.",
      ctx.overdueFollowups > 0 ? "Regularizar follow-ups atrasados hoje." : "Manter follow-ups no mesmo dia da descoberta.",
      ctx.bestSegment ? `Priorizar o nicho ${ctx.bestSegment}, pois ele concentra melhor sinal comercial.` : "Escolher um nicho e manter foco por praça.",
    ],
  };
}

function CopilotIntelligenceCard({ insight, loading, bestLead }: { insight: any; loading: boolean; bestLead: any }) {
  return (
    <Card className="nxa-intelligence-card bg-[radial-gradient(circle_at_top_right,rgba(0,255,255,0.12),transparent_35%),linear-gradient(135deg,rgba(2,6,23,0.72),rgba(15,23,42,0.58))] border-primary/20 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-black">Análise IA do Dashboard</p>
                <Badge className="bg-primary/10 text-primary border-primary/20">{loading ? "calculando" : `${insight?.confidence || 0}% confiança`}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{insight?.executive}</p>
            </div>
          </div>
          <Button
            size="sm"
            className="shrink-0"
            onClick={() => {
              try {
                if (bestLead) {
                  localStorage.setItem("nxa_dashboard_selected_lead", JSON.stringify(bestLead));
                  localStorage.setItem("nxa_copilot_next_action", JSON.stringify({
                    source: "dashboard",
                    action: insight?.action || "Abrir próxima oportunidade",
                    lead: bestLead,
                    created_at: new Date().toISOString(),
                  }));
                }
              } catch {}
              const el = document.getElementById("dashboard-opportunities");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            Executar ação<ArrowUpRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1.25fr]">
          <div className="rounded-2xl border border-border bg-background/40 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Próxima decisão</p>
            <p className="font-black mt-2 leading-snug">{insight?.action}</p>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{insight?.reason}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/40 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">Playbook sugerido</p>
            <div className="grid gap-2">
              {(insight?.playbook || []).map((item: string, index: number) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OpportunityCard({ lead, index }: { lead: any; index: number }) {
  const score = getScore(lead);
  const hasPhone = Boolean(getLeadPhone(lead));
  const hasWebsite = Boolean(getLeadWebsite(lead));
  const reviews = Number(lead?.reviews || lead?.user_ratings_total || lead?.total_reviews || 0);
  const rating = Number(lead?.rating || 0);
  const leadId = lead?.id || lead?.business_id || lead?.place_id;
  const profileHref = leadId ? `/lead-profile/${leadId}` : "/leads";

  return (
    <div className="group rounded-3xl border border-border bg-background/40 p-4 hover:border-primary/30 hover:bg-background/60 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-primary/20">#{index + 1}</Badge>
            <p className="font-black truncate">{getLeadName(lead)}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {getLeadCity(lead)} / {getLeadState(lead)} • {getLeadSegment(lead)}
          </p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge className={hasPhone ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-red-500/10 text-red-300 border-red-500/20"}>{hasPhone ? "WhatsApp pronto" : "Contato fraco"}</Badge>
            <Badge className={hasWebsite ? "bg-blue-500/10 text-blue-300 border-blue-500/20" : "bg-orange-500/10 text-orange-300 border-orange-500/20"}>{hasWebsite ? "Site detectado" : "Sem site"}</Badge>
            {rating > 0 && <Badge variant="outline"><Star className="h-3 w-3 mr-1" />{rating.toFixed(1)} {reviews ? `• ${reviews}` : ""}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Próxima ação: {hasPhone ? "abordagem consultiva via WhatsApp" : "enriquecer contato antes do pitch"}.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="h-16 w-16 rounded-2xl bg-orange-500/10 text-orange-300 border border-orange-500/20 flex items-center justify-center font-black text-xl">
            {score}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Opportunity</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2 flex-wrap">
        <Link href={profileHref}><Button size="sm" variant="outline" className="bg-background/50">Ver oportunidade</Button></Link>
        {hasPhone && <a href={`https://wa.me/${String(getLeadPhone(lead)).replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><Button size="sm">WhatsApp</Button></a>}
      </div>
    </div>
  );
}

function CopilotPanel({ bestLead, hotLeads, overdueFollowups, expectedMRR, bestSegment, bestCity, bestAction }: { bestLead: any; hotLeads: number; overdueFollowups: number; expectedMRR: number; bestSegment: string; bestCity: string; bestAction: string }) {
  const bestLeadId = bestLead?.id || bestLead?.business_id || bestLead?.place_id;
  const bestLeadHref = bestLeadId ? `/lead-profile/${bestLeadId}` : "/leads";

  return (
    <Card className="nxa-hero-panel overflow-hidden rounded-3xl">
      <CardContent className="p-5 lg:p-6">
        <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr] items-stretch">
          <div className="space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20">
                <Bot className="h-3.5 w-3.5 mr-1" /> NXA Copilot
              </Badge>
              <Badge variant="outline">Command Center</Badge>
              <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Operação guiada
              </Badge>
            </div>

            <div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                Sua próxima venda <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">começa aqui.</span>
              </h1>
              <p className="text-muted-foreground mt-3 text-sm lg:text-base max-w-3xl leading-relaxed">
                O Copilot organiza sua carteira, prioriza oportunidades e mostra onde existe maior chance de gerar receita hoje.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="nxa-hover rounded-2xl border border-orange-500/20 bg-background/45 p-4">
                <p className="text-xs text-muted-foreground">Oportunidades quentes</p>
                <p className="text-2xl font-black text-orange-300 mt-1">{hotLeads}</p>
              </div>
              <div className="nxa-hover rounded-2xl border border-emerald-500/20 bg-background/45 p-4">
                <p className="text-xs text-muted-foreground">MRR esperado</p>
                <p className="text-2xl font-black text-emerald-300 mt-1">{moneyFormat(expectedMRR)}</p>
              </div>
              <div className="nxa-hover rounded-2xl border border-cyan-500/20 bg-background/45 p-4">
                <p className="text-xs text-muted-foreground">Nicho mais forte</p>
                <p className="text-base font-black text-cyan-300 mt-2 truncate">{bestSegment}</p>
              </div>
              <div className="nxa-hover rounded-2xl border border-blue-500/20 bg-background/45 p-4">
                <p className="text-xs text-muted-foreground">Praça prioritária</p>
                <p className="text-base font-black text-blue-300 mt-2 truncate">{bestCity}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-background/45 p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.20em] text-muted-foreground">Próxima melhor ação</p>
                  <p className="font-black text-base lg:text-lg mt-1">{bestAction}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {bestLead ? `${getLeadName(bestLead)} aparece como melhor oportunidade por score, dados de contato e sinal comercial.` : "Execute uma busca inteligente para o Copilot escolher o melhor lead automaticamente."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/50 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Lead recomendado agora</p>
                  <p className="font-black text-lg mt-1 truncate">{bestLead ? getLeadName(bestLead) : "Sem lead ainda"}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 flex items-center justify-center font-black">
                  {bestLead ? getScore(bestLead) : "—"}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="rounded-xl border border-border bg-background/40 p-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Local</span>
                  <strong className="text-sm">{bestLead ? `${getLeadCity(bestLead)} / ${getLeadState(bestLead)}` : "—"}</strong>
                </div>
                <div className="rounded-xl border border-border bg-background/40 p-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Segmento</span>
                  <strong className="text-sm truncate max-w-[150px]">{bestLead ? getLeadSegment(bestLead) : "—"}</strong>
                </div>
                <div className="rounded-xl border border-border bg-background/40 p-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Follow-ups críticos</span>
                  <strong className={overdueFollowups > 0 ? "text-red-300" : "text-emerald-300"}>{overdueFollowups}</strong>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <Link href={bestLead ? bestLeadHref : "/busca"}>
                <Button
                  className="w-full h-9 bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm"
                  onClick={() => {
                    try {
                      if (bestLead) localStorage.setItem("nxa_dashboard_selected_lead", JSON.stringify(bestLead));
                    } catch {}
                  }}
                >
                  {bestLead ? "Abrir oportunidade" : "Criar primeira busca"}
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/leads">
                <Button variant="outline" className="w-full h-9 bg-background/50">Central de oportunidades</Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


export function Dashboard() {
  const [, navigate] = useLocation();
  const [leads, setLeads] = React.useState<any[]>([]);
  const [searchHistory, setSearchHistory] = React.useState<any[]>([]);
  const [followups, setFollowups] = React.useState<any[]>([]);
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [offer, setOffer] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [source, setSource] = React.useState<"Supabase" | "Cache" | "Offline">("Supabase");
  const [lastSync, setLastSync] = React.useState<string>("—");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [expandedPanels, setExpandedPanels] = React.useState<Record<string, boolean>>({
    opportunities: true,
    mission: true,
    market: false,
    traction: false,
    operations: false,
    reports: false,
  });
  const [aiInsight, setAiInsight] = React.useState<any>(() => generateLocalCopilotInsight({ totalLeads: 0 }));
  const [aiLoading, setAiLoading] = React.useState(false);
  const [visualTheme, setVisualTheme] = React.useState<DashboardVisualTheme>(() => getStoredDashboardTheme());

  React.useEffect(() => {
    const syncTheme = () => setVisualTheme(getStoredDashboardTheme());
    syncTheme();
    window.addEventListener("storage", syncTheme);
    window.addEventListener("nxa-theme-change", syncTheme as EventListener);
    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("nxa-theme-change", syncTheme as EventListener);
    };
  }, []);

  const togglePanel = React.useCallback((id: string) => {
    setExpandedPanels((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  const businessId = getBusinessId();

  async function safeTableRead(table: string, userId: string, limit = 80) {
    try {
      const readWithoutUserFilter = async () => {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit);
        if (error) return [];
        return toArray(data);
      };

      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        const message = String(error.message || "");
        if (message.includes("user_id") || message.includes("does not exist") || message.includes("schema cache")) {
          return await readWithoutUserFilter();
        }
        console.warn(`Dashboard: ${table} indisponível`, message);
        return [];
      }

      return toArray(data);
    } catch (error) {
      console.warn(`Dashboard: falha ao consultar ${table}`, error);
      return [];
    }
  }

  async function loadDashboardData() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const userId = await getCurrentUserId();

      const readLeads = async () => {
        const baseSelect = "*";

        const queries: Array<() => Promise<any>> = [];

        // 1) formato ideal: business_id + user_id
        if (userId !== DEFAULT_USER_ID) {
          queries.push(() => supabase
            .from("leads")
            .select(baseSelect)
            .eq("business_id", businessId)
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1000));
        }

        // 2) fallback para bancos antigos sem isolamento por usuário
        queries.push(() => supabase
          .from("leads")
          .select(baseSelect)
          .eq("business_id", businessId)
          .order("created_at", { ascending: false })
          .limit(1000));

        // 3) fallback para bancos onde business_id não está padronizado
        queries.push(() => supabase
          .from("leads")
          .select(baseSelect)
          .order("created_at", { ascending: false })
          .limit(1000));

        for (const query of queries) {
          const { data, error } = await query();
          if (!error) return toArray(data);

          const message = String(error.message || "");
          const expectedSchemaMismatch = message.includes("user_id") || message.includes("business_id") || message.includes("schema cache") || message.includes("does not exist");
          if (!expectedSchemaMismatch) console.warn("Dashboard leads fallback:", message);
        }

        return [];
      };

      const [dbLeads, historyRows, followupRows] = await Promise.all([
        readLeads(),
        safeTableRead("search_history", userId, 30),
        safeTableRead("followups", userId, 150),
      ]);

      const latestOffer = safeJsonParse(localStorage.getItem("nxa_active_offer"), null);

      setLeads(dbLeads);
      setSearchHistory(historyRows);
      setFollowups(followupRows);
      setAppointments([]);
      setOffer(latestOffer);
      setSource("Supabase");
      setLastSync(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));

      localStorage.setItem("nxa_dashboard_leads_cache", JSON.stringify(dbLeads));
      localStorage.setItem("nxa_dashboard_search_history_cache", JSON.stringify(historyRows));
      localStorage.setItem("nxa_dashboard_followups_cache", JSON.stringify(followupRows));
      localStorage.setItem("nxa_dashboard_appointments_cache", JSON.stringify([]));
      if (latestOffer) localStorage.setItem("nxa_active_offer", JSON.stringify(latestOffer));
    } catch (error: any) {
      console.error("Erro ao carregar dashboard:", error);
      const cachedLeads = safeJsonParse(localStorage.getItem("nxa_dashboard_leads_cache"), []);
      const cachedHistory = safeJsonParse(localStorage.getItem("nxa_dashboard_search_history_cache"), []);
      const cachedFollowups = safeJsonParse(localStorage.getItem("nxa_dashboard_followups_cache"), []);
      setLeads(toArray(cachedLeads));
      setSearchHistory(toArray(cachedHistory));
      setFollowups(toArray(cachedFollowups));
      setAppointments([]);
      setOffer(safeJsonParse(localStorage.getItem("nxa_active_offer"), null));
      setSource(toArray(cachedLeads).length ? "Cache" : "Offline");
      setErrorMessage(error?.message || "Não foi possível carregar o dashboard pelo banco.");
    } finally {
      setLoading(false);
    }
  }

  const openLead = React.useCallback((lead?: any) => {
    if (!lead) {
      navigate("/busca");
      return;
    }
    try {
      localStorage.setItem("nxa_dashboard_selected_lead", JSON.stringify(lead));
      localStorage.setItem("nxa_selected_lead", JSON.stringify(lead));
    } catch {}
    navigate("/leads");
  }, [navigate]);

  const openWhatsApp = React.useCallback((lead?: any) => {
    const phone = getLeadPhone(lead || {});
    const clean = String(phone || "").replace(/\D/g, "");
    if (!clean) {
      navigate("/leads");
      return;
    }
    const name = getLeadName(lead || {});
    const text = encodeURIComponent(`Olá, ${name}. Analisei a presença digital da empresa e vi algumas oportunidades para aumentar contatos pelo WhatsApp. Posso te mostrar em 5 minutos?`);
    window.open(`https://wa.me/55${clean.length > 11 ? clean.slice(-11) : clean}?text=${text}`, "_blank", "noopener,noreferrer");
  }, [navigate]);

  React.useEffect(() => {
    loadDashboardData();

    const interval = window.setInterval(loadDashboardData, 15000);
    const channel = supabase
      .channel(`dashboard-command-center-${businessId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => loadDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "followups" }, () => loadDashboardData())
      .subscribe();

    const onFocus = () => loadDashboardData();
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      supabase.removeChannel(channel);
    };
  }, []);

  const totalLeads = leads.length;
  const hotLeads = leads.filter((lead) => getScore(lead) >= 80).length;
  const warmLeads = leads.filter((lead) => getScore(lead) >= 61 && getScore(lead) < 80).length;
  const coldLeads = leads.filter((lead) => getScore(lead) < 61).length;
  const newToday = leads.filter((lead) => isToday(lead?.created_at)).length;
  const leadsWithPhone = leads.filter((lead) => Boolean(getLeadPhone(lead))).length;
  const leadsWithWebsite = leads.filter((lead) => Boolean(getLeadWebsite(lead))).length;
  const avgScore = totalLeads ? Math.round(leads.reduce((acc, lead) => acc + getScore(lead), 0) / totalLeads) : 0;
  const contactsReady = percentage(leadsWithPhone, totalLeads);
  const websiteCoverage = percentage(leadsWithWebsite, totalLeads);
  const dataQuality = clamp(Math.round((contactsReady + websiteCoverage + avgScore) / 3));

  const pendingFollowups = followups.filter((item) => !["done", "completed", "concluido", "closed"].includes(String(item?.status || "").toLowerCase())).length;
  const overdueFollowups = followups.filter((item) => {
    const rawDate = item?.due_date || item?.scheduled_date || item?.date;
    if (!rawDate) return false;
    const due = new Date(rawDate);
    const today = new Date();
    due.setHours(23, 59, 59, 999);
    return due < today && !["done", "completed", "concluido", "closed"].includes(String(item?.status || "").toLowerCase());
  }).length;

  const appointmentsToday = appointments.filter((item) => isToday(item?.scheduled_date || item?.start_time || item?.date)).length;
  const totalSearches = searchHistory.length;

  const offerPrice = React.useMemo(() => {
    const raw = String(offer?.price || offer?.monthly_price || offer?.ticket || "").replace(/[^\d,.-]/g, "").replace(",", ".");
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 497;
  }, [offer]);

  const estimatedRevenue = hotLeads * offerPrice + warmLeads * Math.round(offerPrice * 0.45);
  const conversionPotential = percentage(hotLeads + Math.round(warmLeads * 0.5), totalLeads);
  const expectedMRR = Math.round(estimatedRevenue * Math.max(conversionPotential, 8) / 100);
  const expectedARR = expectedMRR * 12;
  const executionScore = clamp(Math.round(dataQuality * 0.35 + avgScore * 0.35 + contactsReady * 0.2 + (hotLeads > 0 ? 10 : 0)));

  const topSegments = React.useMemo(() => groupCount(leads, getLeadSegment).slice(0, 6), [leads]);
  const topCities = React.useMemo(() => groupCount(leads, getLeadCity).slice(0, 6), [leads]);
  const statusGroups = React.useMemo(() => groupCount(leads, getLeadStatus), [leads]);
  const topLeads = React.useMemo(() => [...leads].sort((a, b) => getScore(b) - getScore(a)).slice(0, 6), [leads]);
  const bestLead = topLeads[0];
  const bestSegment = topSegments[0]?.label || "Sem segmento";
  const bestCity = topCities[0]?.label || "Sem cidade";
  const bestAction = bestLead
    ? `Abordar ${getLeadName(bestLead)} hoje com pitch direto pelo WhatsApp`
    : totalLeads > 0
      ? "Selecionar a melhor oportunidade e gerar abordagem"
      : "Rodar uma busca inteligente para criar a primeira carteira";

  const lastSevenDays = React.useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = daysAgo(6 - index);
      return { label: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), value: 0 };
    });
    for (const lead of leads) {
      const label = dateKey(lead?.created_at);
      const item = days.find((day) => day.label === label);
      if (item) item.value += 1;
    }
    return days;
  }, [leads]);

  const marketSignals = React.useMemo(() => topSegments.slice(0, 5).map((segment, index) => {
    const segmentLeads = leads.filter((lead) => getLeadSegment(lead) === segment.label);
    const avg = segmentLeads.length ? Math.round(segmentLeads.reduce((acc, lead) => acc + getScore(lead), 0) / segmentLeads.length) : 0;
    const hot = segmentLeads.filter((lead) => getScore(lead) >= 80).length;
    const revenue = hot * offerPrice + Math.round(segmentLeads.filter((lead) => getScore(lead) >= 61 && getScore(lead) < 80).length * offerPrice * 0.45);
    return {
      ...segment,
      avg,
      hot,
      revenue,
      label: segment.label,
      priority: index === 0 ? "Ataque principal" : avg >= 75 ? "Alta prioridade" : "Nutrição",
    };
  }), [topSegments, leads, offerPrice]);

  const mission = [
    { label: "Fazer primeira busca inteligente", done: totalSearches > 0 || totalLeads > 0 },
    { label: "Abrir 3 oportunidades quentes", done: hotLeads >= 3 },
    { label: "Ter contatos prontos para WhatsApp", done: contactsReady >= 70 },
    { label: "Criar follow-ups comerciais", done: pendingFollowups > 0 },
    { label: "Executar rotina de venda do dia", done: overdueFollowups === 0 && totalLeads > 0 },
  ];
  const missionDone = mission.filter((item) => item.done).length;
  const missionProgress = percentage(missionDone, mission.length);

  const recentSearches = searchHistory.slice(0, 5);

  const copilotContext = React.useMemo(() => ({
    totalLeads,
    hotLeads,
    warmLeads,
    coldLeads,
    avgScore,
    contactsReady,
    dataQuality,
    overdueFollowups,
    pendingFollowups,
    expectedMRR,
    bestSegment,
    bestCity,
    bestLead,
    topSegments: topSegments.slice(0, 4),
    topCities: topCities.slice(0, 4),
  }), [totalLeads, hotLeads, warmLeads, coldLeads, avgScore, contactsReady, dataQuality, overdueFollowups, pendingFollowups, expectedMRR, bestSegment, bestCity, bestLead, topSegments, topCities]);

  React.useEffect(() => {
    let alive = true;
    const localInsight = generateLocalCopilotInsight(copilotContext);

    const signature = JSON.stringify({
      totalLeads,
      hotLeads,
      warmLeads,
      overdueFollowups,
      bestLead: bestLead?.id || bestLead?.business_id || bestLead?.place_id || null,
      expectedMRR,
    });

    const runAi = async () => {
      const previousSignature = localStorage.getItem("nxa_dashboard_ai_signature");
      const cached = safeJsonParse(localStorage.getItem("nxa_dashboard_ai_insight"), null);
      if (previousSignature === signature && cached) {
        setAiInsight(cached);
        return;
      }

      setAiLoading(true);
      try {
        if (!alive) return;
        setAiInsight(localInsight);
        localStorage.setItem("nxa_dashboard_ai_signature", signature);
        localStorage.setItem("nxa_dashboard_ai_insight", JSON.stringify(localInsight));
      } catch (error) {
        if (alive) {
          setAiInsight(localInsight);
          localStorage.setItem("nxa_dashboard_ai_signature", signature);
          localStorage.setItem("nxa_dashboard_ai_insight", JSON.stringify(localInsight));
        }
      } finally {
        if (alive) setAiLoading(false);
      }
    };

    const timer = window.setTimeout(runAi, 300);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [copilotContext, totalLeads, hotLeads, warmLeads, overdueFollowups, expectedMRR, bestLead]);

  const compactKpis = [
    { label: "Carteira total", value: numberFormat(totalLeads), helper: `${newToday} novos hoje`, icon: <Users className="h-5 w-5" />, tone: "primary" as const },
    { label: "MRR esperado", value: moneyFormat(expectedMRR), helper: "Forecast ponderado por score", icon: <CircleDollarSign className="h-5 w-5" />, tone: "green" as const },
    { label: "Contatos prontos", value: `${contactsReady}%`, helper: `${leadsWithPhone} leads com WhatsApp`, icon: <MessageSquare className="h-5 w-5" />, tone: "green" as const },
    { label: "Score de execução", value: `${executionScore}%`, helper: "Prontidão da operação", icon: <Gauge className="h-5 w-5" />, tone: "blue" as const },
  ];

  return (
    <div className={`nxa-dashboard-shell nxa-theme-${visualTheme} space-y-6 pb-10`} style={DASHBOARD_THEMES[visualTheme]}>
      <DashboardThemeStyle />
      <div className="nxa-hardware-line" />
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm text-muted-foreground">NXA Growth Engine</p>
          <h1 className="text-2xl font-black tracking-tight">Command Center Comercial</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">Fonte: {source}</Badge>
          <Badge variant="outline">Sync: {lastSync}</Badge>
          <Button onClick={loadDashboardData} disabled={loading} variant="outline" className="bg-background/50">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
          <Link href="/busca"><Button className="bg-gradient-to-r from-cyan-600 to-violet-600 text-white shadow-[0_14px_34px_rgba(8,145,178,0.24)] hover:scale-[1.02] transition-transform">Nova busca IA<Search className="h-4 w-4 ml-2" /></Button></Link>
        </div>
      </div>

      <CopilotPanel
        bestLead={bestLead}
        hotLeads={hotLeads}
        overdueFollowups={overdueFollowups}
        expectedMRR={expectedMRR}
        bestSegment={bestSegment}
        bestCity={bestCity}
        bestAction={bestAction}
      />

      {errorMessage && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex gap-3 text-red-300">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <div><p className="font-bold">Banco indisponível</p><p className="text-sm">{errorMessage}</p></div>
          </CardContent>
        </Card>
      )}

      <CopilotIntelligenceCard insight={aiInsight} loading={aiLoading} bestLead={bestLead} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {compactKpis.map((item) => (
          <KpiCard key={item.label} label={item.label} value={item.value} helper={item.helper} icon={item.icon} tone={item.tone} />
        ))}
      </div>

      <CollapsiblePanel
        id="operations"
        title="Detalhes da operação"
        subtitle="Indicadores secundários recolhidos para manter o dashboard limpo"
        icon={<Layers3 className="h-5 w-5" />}
        open={expandedPanels.operations}
        onToggle={togglePanel}
        preview={<div className="grid gap-3 md:grid-cols-4"><ProgressRow label="Leads quentes" value={hotLeads} total={totalLeads} badge="80+" /><ProgressRow label="Qualidade" value={dataQuality} total={100} badge={`${dataQuality}%`} /><ProgressRow label="Follow-ups" value={pendingFollowups} total={Math.max(pendingFollowups + 1, 1)} badge={`${pendingFollowups}`} /><ProgressRow label="Agenda hoje" value={appointmentsToday} total={Math.max(appointmentsToday + 1, 1)} badge={`${appointmentsToday}`} /></div>}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Leads quentes" value={numberFormat(hotLeads)} helper="Score comercial acima de 80" icon={<Flame className="h-5 w-5" />} tone="orange" />
          <KpiCard label="Qualidade de dados" value={`${dataQuality}%`} helper="Score + contato + presença digital" icon={<Database className="h-5 w-5" />} tone="purple" />
          <KpiCard label="Follow-ups abertos" value={numberFormat(pendingFollowups)} helper={`${overdueFollowups} atrasado(s)`} icon={<Clock className="h-5 w-5" />} tone={overdueFollowups > 0 ? "red" : "primary"} />
          <KpiCard label="Agenda de hoje" value={numberFormat(appointmentsToday)} helper="Compromissos identificados" icon={<Activity className="h-5 w-5" />} tone="blue" />
        </div>
      </CollapsiblePanel>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <CollapsiblePanel
          id="opportunities"
          title="Oportunidades que o Copilot recomenda atacar"
          subtitle="Priorização por score, contato, presença digital e fit comercial"
          icon={<Flame className="h-5 w-5" />}
          open={expandedPanels.opportunities}
          onToggle={togglePanel}
          action={<Link href="/leads"><Button size="sm" variant="outline">Ver todas</Button></Link>}
          preview={bestLead ? <div className="rounded-2xl border border-primary/20 bg-background/40 p-4 flex items-center justify-between gap-3"><div><p className="text-xs text-muted-foreground">Melhor oportunidade agora</p><p className="font-black truncate">{getLeadName(bestLead)}</p></div><Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20">Score {getScore(bestLead)}</Badge></div> : undefined}
        >
          <div className="space-y-3">
            {topLeads.length === 0 && (
              <div className="rounded-3xl border border-border p-8 text-center bg-background/40">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-black">Nenhuma oportunidade ainda.</p>
                <p className="text-sm text-muted-foreground mt-1">Execute uma busca inteligente para alimentar o Copilot.</p>
                <Link href="/busca"><Button className="mt-4">Criar busca agora</Button></Link>
              </div>
            )}
            {topLeads.slice(0, expandedPanels.opportunities ? 5 : 1).map((lead, index) => <OpportunityCard key={lead.id || lead.business_id || index} lead={lead} index={index} />)}
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          id="mission"
          title="Missão do dia"
          subtitle="Onboarding prático para o cliente saber exatamente o que fazer"
          icon={<Sparkles className="h-5 w-5" />}
          open={expandedPanels.mission}
          onToggle={togglePanel}
          preview={<div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between"><span className="font-black">Progresso {missionProgress}%</span><Badge>{missionDone}/{mission.length}</Badge></div>}
        >
          <div className="space-y-4">
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Progresso comercial</p>
                  <p className="text-3xl font-black mt-1">{missionProgress}%</p>
                </div>
                <div className="h-16 w-16 rounded-2xl border border-primary/20 bg-primary/10 text-primary flex items-center justify-center font-black">{missionDone}/{mission.length}</div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden mt-4"><div className="h-full bg-gradient-to-r from-primary to-emerald-400" style={{ width: `${missionProgress}%` }} /></div>
            </div>
            {mission.map((item) => <MissionItem key={item.label} done={item.done} label={item.label} />)}
            <Button variant="outline" className="w-full bg-background/50" onClick={() => { const el = document.getElementById("dashboard-opportunities"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); else navigate("/leads"); }}>Começar pelo próximo passo<ChevronRight className="h-4 w-4 ml-2" /></Button>
          </div>
        </CollapsiblePanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CollapsiblePanel
            id="market"
            title="Mercado em tempo real"
            subtitle="Nicho, força comercial e potencial financeiro da sua base"
            icon={<Radar className="h-5 w-5" />}
            open={expandedPanels.market}
            onToggle={togglePanel}
            preview={<div className="grid gap-3 md:grid-cols-3">{marketSignals.slice(0, 3).map((item) => <ProgressRow key={item.label} label={item.label} value={item.avg} total={100} badge={`${item.avg}%`} />)}</div>}
          >
            <div className="space-y-3">
              {marketSignals.length === 0 && <p className="text-sm text-muted-foreground">Sem segmentos suficientes para análise.</p>}
              {marketSignals.map((item) => (
                <div key={item.label} className="rounded-3xl border border-border bg-background/40 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-black truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.value} leads • {item.hot} quentes • score médio {item.avg}</p>
                      <Badge className="mt-3 bg-primary/10 text-primary border-primary/20">{item.priority}</Badge>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">Pipeline</p>
                      <p className="font-black text-emerald-300">{moneyFormat(item.revenue)}</p>
                    </div>
                  </div>
                  <div className="mt-3"><ProgressRow label="Força do segmento" value={item.avg} total={100} badge={`${item.avg}%`} /></div>
                </div>
              ))}
            </div>
          </CollapsiblePanel>
        </div>

        <CollapsiblePanel
          id="traction"
          title="Tração 7 dias"
          subtitle="Leads capturados recentemente"
          icon={<LineChart className="h-5 w-5" />}
          open={expandedPanels.traction}
          onToggle={togglePanel}
          preview={<div className="grid gap-3"><ProgressRow label="Novos 7 dias" value={lastSevenDays.reduce((acc, item) => acc + item.value, 0)} total={Math.max(totalLeads, 1)} badge="7d" /><ProgressRow label="Mornos" value={warmLeads} total={totalLeads} badge="61-79" /></div>}
        >
          <MiniBarChart data={lastSevenDays} />
          <div className="mt-5 space-y-3">
            <ProgressRow label="Quentes" value={hotLeads} total={totalLeads} badge="80+" />
            <ProgressRow label="Mornos" value={warmLeads} total={totalLeads} badge="61-79" />
            <ProgressRow label="Frios" value={coldLeads} total={totalLeads} badge="0-60" />
          </div>
        </CollapsiblePanel>
      </div>

      <CollapsiblePanel
        id="reports"
        title="Relatórios secundários"
        subtitle="Histórico, praças, forecast e saúde da operação ficam recolhidos para não poluir a primeira visão"
        icon={<BarChart3 className="h-5 w-5" />}
        open={expandedPanels.reports}
        onToggle={togglePanel}
        preview={<div className="grid gap-3 md:grid-cols-3"><ProgressRow label="Buscas recentes" value={recentSearches.length} total={Math.max(totalSearches, 1)} badge={`${recentSearches.length}`} /><ProgressRow label="Praças" value={topCities.length} total={Math.max(topCities.length, 1)} badge={`${topCities.length}`} /><ProgressRow label="Forecast" value={expectedMRR} total={Math.max(estimatedRevenue, 1)} badge={moneyFormat(expectedMRR)} /></div>}
      >
      <div className="grid gap-4 xl:grid-cols-3">
                <Card className="bg-card/55 backdrop-blur-xl border-card-border">
                  <CardHeader><SectionTitle icon={<Search className="h-5 w-5" />} title="Central de varreduras" subtitle="Últimas buscas operacionais" /></CardHeader>
                  <CardContent className="space-y-3">
                    {recentSearches.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma busca recente encontrada.</p>}
                    {recentSearches.map((item, index) => (
                      <div key={item.id || index} className="rounded-2xl border border-border bg-background/40 p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-bold truncate">{getSearchTitle(item)}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.city || "—"} / {item.state || "—"} • {getSearchResultsCount(item)} resultado(s)</p>
                        </div>
                        <Badge variant="outline">{formatDate(item.created_at)}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
        
                <Card className="bg-card/55 backdrop-blur-xl border-card-border">
                  <CardHeader><SectionTitle icon={<MapPin className="h-5 w-5" />} title="Praças prioritárias" subtitle="Onde concentrar prospecção" /></CardHeader>
                  <CardContent className="space-y-3">
                    {topCities.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma cidade encontrada.</p>}
                    {topCities.map((item) => <ProgressRow key={item.label} label={item.label} value={item.value} total={totalLeads} />)}
                  </CardContent>
                </Card>
        
                <Card className="bg-card/55 backdrop-blur-xl border-card-border">
                  <CardHeader><SectionTitle icon={<Wallet className="h-5 w-5" />} title="Forecast SaaS" subtitle="Valor potencial para venda" /></CardHeader>
                  <CardContent className="grid gap-3">
                    <div className="rounded-2xl border border-border bg-background/40 p-4 flex justify-between"><span className="text-sm text-muted-foreground">Pipeline bruto</span><strong>{moneyFormat(estimatedRevenue)}</strong></div>
                    <div className="rounded-2xl border border-border bg-background/40 p-4 flex justify-between"><span className="text-sm text-muted-foreground">MRR esperado</span><strong>{moneyFormat(expectedMRR)}</strong></div>
                    <div className="rounded-2xl border border-border bg-background/40 p-4 flex justify-between"><span className="text-sm text-muted-foreground">ARR esperado</span><strong>{moneyFormat(expectedARR)}</strong></div>
                    <div className="rounded-2xl border border-border bg-background/40 p-4 flex justify-between"><span className="text-sm text-muted-foreground">Ticket usado</span><strong>{moneyFormat(offerPrice)}</strong></div>
                  </CardContent>
                </Card>
              </div>
        
              <Card className="bg-card/55 backdrop-blur-xl border-card-border">
                <CardHeader><SectionTitle icon={<Database className="h-5 w-5" />} title="Saúde da operação" subtitle="Status das engrenagens comerciais da NXA" /></CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <SystemPill label="Supabase" ok={source === "Supabase"} detail={source === "Supabase" ? "Banco respondendo em tempo real" : "Usando fallback/cache"} />
                  <SystemPill label="Opportunity Engine" ok={totalLeads > 0} detail={totalLeads > 0 ? "Base analisada e priorizada" : "Aguardando primeira busca"} />
                  <SystemPill label="Oferta IA" ok={Boolean(offer)} detail={offer ? "Oferta usada no forecast" : "Usando ticket padrão"} />
                  <SystemPill label="Follow-up Center" ok={overdueFollowups === 0} detail={overdueFollowups > 0 ? `${overdueFollowups} atrasado(s)` : "Sem atrasos críticos"} />
                  <SystemPill label="CRM" ok={true} detail="Pipeline pronto para conversão" />
                  <SystemPill label="Presença digital" ok={websiteCoverage >= 50} detail={`${websiteCoverage}% da base com site detectado`} />
                </CardContent>
              </Card>
        
      </CollapsiblePanel>

      <div className="fixed bottom-5 right-5 z-40 hidden lg:block">
        <div className="rounded-2xl border border-primary/20 bg-background/90 backdrop-blur-xl shadow-[0_0_60px_rgba(0,255,255,0.14)] p-3 max-w-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center"><Bot className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-black">NXA Copilot</p>
              <p className="text-xs text-muted-foreground">{bestLead ? `Comece por ${getLeadName(bestLead)}` : "Pronto para guiar sua venda"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
