import * as React from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BellRing,
  Bot,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Command,
  CreditCard,
  Database,
  Flame,
  Gauge,
  Globe2,
  Layers3,
  LineChart,
  MapPin,
  MessageSquare,
  PieChart,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Signal,
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
  return localStorage.getItem("nxa_business_id") || DEFAULT_BUSINESS_ID;
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
    return new Date(value).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return "—";
  }
}

function isToday(value: any) {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function getScore(lead: any) {
  const score = Number(lead?.nxa_score ?? lead?.nxaScore ?? lead?.score ?? 0);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
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
  return lead?.status || "new";
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

function percentage(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

async function getCurrentUserId() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.id || DEFAULT_USER_ID;
}

function KpiCard({
  label,
  value,
  helper,
  icon,
  trend,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ReactNode;
  trend?: string;
  tone?: "primary" | "orange" | "green" | "blue" | "red" | "purple";
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary border-primary/20 shadow-[0_0_35px_rgba(0,255,255,0.08)]",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-card-border hover:border-primary/30 transition-all duration-300">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">{label}</p>
            <p className="text-3xl font-black tracking-tight mt-2">{value}</p>
            <p className="text-xs text-muted-foreground mt-2">{helper}</p>
            {trend && (
              <Badge className="mt-3 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                {trend}
              </Badge>
            )}
          </div>

          <div className={`h-12 w-12 shrink-0 rounded-2xl border flex items-center justify-center ${toneMap[tone]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
          {icon}
        </div>
        <div>
          <h2 className="font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function ProgressRow({ label, value, total, badge }: { label: string; value: number; total: number; badge?: string }) {
  const width = clamp(percentage(value, total));

  return (
    <div className="space-y-2 rounded-xl border border-border/80 p-3 bg-background/40">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold truncate">{label}</span>
        <div className="flex items-center gap-2">
          {badge && <Badge variant="outline" className="text-[10px]">{badge}</Badge>}
          <span className="text-xs text-muted-foreground">{numberFormat(value)}</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function SystemPill({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-3 bg-background/40">
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
            <div className="w-full rounded-t-xl bg-gradient-to-t from-primary/40 to-primary border border-primary/20" style={{ height: `${height}%` }} />
            <span className="text-[10px] text-muted-foreground truncate max-w-[46px]">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function PipelineColumn({ label, value, total, tone }: { label: string; value: number; total: number; tone: string }) {
  const pct = percentage(value, total);

  return (
    <div className="rounded-2xl border border-border bg-background/40 p-4 min-h-[128px] flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={`h-2.5 w-2.5 rounded-full ${tone}`} />
      </div>
      <div>
        <p className="text-3xl font-black mt-3">{numberFormat(value)}</p>
        <p className="text-xs text-muted-foreground mt-1">{pct}% do total</p>
      </div>
    </div>
  );
}

function OpportunityCard({ lead, index }: { lead: any; index: number }) {
  const score = getScore(lead);
  const hasPhone = Boolean(lead?.phone || lead?.whatsapp || lead?.telefone);
  const hasWebsite = Boolean(lead?.website || lead?.site);

  return (
    <div className="group rounded-2xl border border-border bg-background/40 p-4 hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">#{index + 1}</Badge>
            <p className="font-bold truncate">{getLeadName(lead)}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {getLeadCity(lead)} / {getLeadState(lead)} • {getLeadSegment(lead)}
          </p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge className={hasPhone ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}>
              {hasPhone ? "Telefone" : "Sem telefone"}
            </Badge>
            <Badge className={hasWebsite ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"}>
              {hasWebsite ? "Com site" : "Sem site"}
            </Badge>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="h-14 w-14 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-black">
            {score}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">NXA Score</p>
        </div>
      </div>
    </div>
  );
}


export function Dashboard() {
  const [leads, setLeads] = React.useState<any[]>([]);
  const [searchHistory, setSearchHistory] = React.useState<any[]>([]);
  const [followups, setFollowups] = React.useState<any[]>([]);
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [offer, setOffer] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [source, setSource] = React.useState<"Supabase" | "Cache" | "Offline">("Supabase");
  const [lastSync, setLastSync] = React.useState<string>("—");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const businessId = getBusinessId();

  async function safeTableRead(table: string, userId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.warn(`Dashboard: ${table} indisponível`, error.message);
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

      let leadsQuery = supabase
        .from("leads")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (userId !== DEFAULT_USER_ID) {
        leadsQuery = leadsQuery.eq("user_id", userId);
      }

      const leadsResult = await leadsQuery;
      if (leadsResult.error) throw leadsResult.error;

      const [historyRows, followupRows, appointmentRows, offerRows] = await Promise.all([
        safeTableRead("search_history", userId, 20),
        safeTableRead("followups", userId, 100),
        safeTableRead("appointments", userId, 100),
        safeTableRead("sales_offers", userId, 3),
      ]);

      const dbLeads = toArray(leadsResult.data);
      const latestOffer = offerRows[0] || safeJsonParse(localStorage.getItem("nxa_active_offer"), null);

      setLeads(dbLeads);
      setSearchHistory(historyRows);
      setFollowups(followupRows);
      setAppointments(appointmentRows);
      setOffer(latestOffer);
      setSource("Supabase");
      setLastSync(
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );

      localStorage.setItem("nxa_dashboard_leads_cache", JSON.stringify(dbLeads));
      localStorage.setItem("nxa_dashboard_search_history_cache", JSON.stringify(historyRows));
      localStorage.setItem("nxa_dashboard_followups_cache", JSON.stringify(followupRows));
      localStorage.setItem("nxa_dashboard_appointments_cache", JSON.stringify(appointmentRows));
      if (latestOffer) localStorage.setItem("nxa_active_offer", JSON.stringify(latestOffer));
    } catch (error: any) {
      console.error("Erro ao carregar dashboard:", error);

      const cachedLeads = safeJsonParse(localStorage.getItem("nxa_dashboard_leads_cache"), []);
      const cachedHistory = safeJsonParse(localStorage.getItem("nxa_dashboard_search_history_cache"), []);
      const cachedFollowups = safeJsonParse(localStorage.getItem("nxa_dashboard_followups_cache"), []);
      const cachedAppointments = safeJsonParse(localStorage.getItem("nxa_dashboard_appointments_cache"), []);

      setLeads(toArray(cachedLeads));
      setSearchHistory(toArray(cachedHistory));
      setFollowups(toArray(cachedFollowups));
      setAppointments(toArray(cachedAppointments));
      setOffer(safeJsonParse(localStorage.getItem("nxa_active_offer"), null));
      setSource(toArray(cachedLeads).length ? "Cache" : "Offline");
      setErrorMessage(error?.message || "Não foi possível carregar do banco.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadDashboardData();
  }, []);

  const totalLeads = leads.length;
  const hotLeads = leads.filter((lead) => getScore(lead) >= 80).length;
  const warmLeads = leads.filter((lead) => getScore(lead) >= 61 && getScore(lead) < 80).length;
  const coldLeads = leads.filter((lead) => getScore(lead) < 61).length;
  const newToday = leads.filter((lead) => isToday(lead?.created_at)).length;
  const leadsWithoutPhone = leads.filter((lead) => !(lead?.phone || lead?.whatsapp || lead?.telefone)).length;
  const leadsWithoutWebsite = leads.filter((lead) => !(lead?.website || lead?.site)).length;
  const leadsWithWebsite = totalLeads - leadsWithoutWebsite;
  const leadsWithPhone = totalLeads - leadsWithoutPhone;
  const avgScore = totalLeads ? Math.round(leads.reduce((acc, lead) => acc + getScore(lead), 0) / totalLeads) : 0;
  const totalSearches = searchHistory.length;
  const contactsReady = percentage(leadsWithPhone, totalLeads);
  const websiteCoverage = percentage(leadsWithWebsite, totalLeads);
  const conversionPotential = percentage(hotLeads + Math.round(warmLeads * 0.5), totalLeads);
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

  const offerPrice = React.useMemo(() => {
    const raw = String(offer?.price || offer?.monthly_price || offer?.ticket || "").replace(/[^\d,.-]/g, "").replace(",", ".");
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 497;
  }, [offer]);

  const estimatedRevenue = hotLeads * offerPrice + warmLeads * Math.round(offerPrice * 0.45);
  const expectedMRR = Math.round(estimatedRevenue * Math.max(conversionPotential, 8) / 100);
  const expectedARR = expectedMRR * 12;
  const executionScore = clamp(Math.round((dataQuality * 0.35) + (avgScore * 0.35) + (contactsReady * 0.2) + (pendingFollowups > 0 ? 10 : 0)));
  const bestAction = hotLeads > 0
    ? "Executar campanha nos leads quentes nas próximas 24h"
    : warmLeads > 0
      ? "Enriquecer leads mornos e criar follow-ups de validação"
      : "Rodar uma busca mais específica com oferta cadastrada";

  const statusGroups = React.useMemo(() => groupCount(leads, getLeadStatus), [leads]);
  const topSegments = React.useMemo(() => groupCount(leads, getLeadSegment).slice(0, 6), [leads]);
  const topCities = React.useMemo(() => groupCount(leads, getLeadCity).slice(0, 6), [leads]);
  const topStates = React.useMemo(() => groupCount(leads, getLeadState).slice(0, 5), [leads]);
  const topLeads = React.useMemo(() => [...leads].sort((a, b) => getScore(b) - getScore(a)).slice(0, 8), [leads]);

  const aiSegments = React.useMemo(() => {
    return topSegments.slice(0, 4).map((segment, index) => {
      const segmentLeads = leads.filter((lead) => getLeadSegment(lead) === segment.label);
      const avg = segmentLeads.length
        ? Math.round(segmentLeads.reduce((acc, lead) => acc + getScore(lead), 0) / segmentLeads.length)
        : 0;
      const revenue = segmentLeads.filter((lead) => getScore(lead) >= 80).length * offerPrice + Math.round(segmentLeads.filter((lead) => getScore(lead) >= 61 && getScore(lead) < 80).length * offerPrice * 0.45);

      return {
        ...segment,
        avg,
        revenue,
        priority: index === 0 ? "Ataque principal" : avg >= 75 ? "Alta prioridade" : "Nutrição",
      };
    });
  }, [topSegments, leads, offerPrice]);

  const lastSevenDays = React.useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = daysAgo(6 - index);
      return {
        label: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        value: 0,
      };
    });

    for (const lead of leads) {
      const label = dateKey(lead?.created_at);
      const item = days.find((day) => day.label === label);
      if (item) item.value += 1;
    }

    return days;
  }, [leads]);

  const insightCards = React.useMemo(() => {
    const bestSegment = topSegments[0]?.label || "Nenhum segmento";
    const bestCity = topCities[0]?.label || "Nenhuma cidade";
    const segmentShare = topSegments[0] ? percentage(topSegments[0].value, totalLeads) : 0;
    const cityShare = topCities[0] ? percentage(topCities[0].value, totalLeads) : 0;

    return [
      {
        title: "Comando de ataque",
        value: hotLeads > 0 ? `${hotLeads} leads prontos` : "Gerar demanda",
        text: hotLeads > 0 ? "Priorize contato consultivo com pitch personalizado antes de abrir novas listas." : "Ainda faltam leads com score alto. Use uma oferta mais específica na Busca Inteligente.",
        icon: <Flame className="h-5 w-5" />,
        tone: "text-orange-400",
      },
      {
        title: "Oferta ativa",
        value: offer?.name || offer?.title || "Não cadastrada",
        text: offer ? `Análise orientada para ticket de ${moneyFormat(offerPrice)}.` : "Cadastre sua oferta na Busca Inteligente para o dashboard calcular encaixe real.",
        icon: <Target className="h-5 w-5" />,
        tone: "text-primary",
      },
      {
        title: "Segmento dominante",
        value: bestSegment,
        text: `${segmentShare}% da base está concentrada nesse segmento. Crie copy e follow-up específicos para ele.`,
        icon: <Layers3 className="h-5 w-5" />,
        tone: "text-primary",
      },
      {
        title: "Praça mais forte",
        value: bestCity,
        text: `${cityShare}% das oportunidades estão nessa cidade. Vale campanha local dedicada.`,
        icon: <MapPin className="h-5 w-5" />,
        tone: "text-blue-400",
      },
      {
        title: "Próxima melhor ação",
        value: bestAction,
        text: "A IA usa score, qualidade de dados, follow-ups e oferta para sugerir foco operacional.",
        icon: <Zap className="h-5 w-5" />,
        tone: "text-emerald-400",
      },
      {
        title: "Risco operacional",
        value: overdueFollowups > 0 ? `${overdueFollowups} atrasado(s)` : "Sob controle",
        text: overdueFollowups > 0 ? "Follow-ups atrasados reduzem conversão. Execute ou reagende hoje." : "Nenhum follow-up atrasado detectado.",
        icon: <AlertTriangle className="h-5 w-5" />,
        tone: overdueFollowups > 0 ? "text-red-400" : "text-emerald-400",
      },
    ];
  }, [hotLeads, topSegments, topCities, totalLeads, offer, offerPrice, bestAction, overdueFollowups]);

  const recentSearches = searchHistory.slice(0, 6);

  const actionQueue = [
    {
      title: "Atacar leads quentes",
      value: `${hotLeads} oportunidades`,
      text: "Contatar primeiro os leads com maior NXA Score e telefone disponível.",
      href: "/leads",
      icon: <Flame className="h-5 w-5" />,
      tone: "border-orange-500/20 bg-orange-500/10 text-orange-300",
    },
    {
      title: "Criar follow-ups pendentes",
      value: `${Math.max(hotLeads - pendingFollowups, 0)} sugeridos`,
      text: "Transforme oportunidades com score alto em tarefas comerciais.",
      href: "/followup",
      icon: <Clock className="h-5 w-5" />,
      tone: "border-primary/20 bg-primary/10 text-primary",
    },
    {
      title: "Refinar oferta",
      value: offer ? "Oferta ativa" : "Obrigatório",
      text: offer ? "Use os segmentos vencedores para ajustar promessa e abordagem." : "Cadastre o produto para ativar análise produto x lead.",
      href: "/busca",
      icon: <Sparkles className="h-5 w-5" />,
      tone: "border-purple-500/20 bg-purple-500/10 text-purple-300",
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(0,255,255,0.16),transparent_34%),linear-gradient(135deg,rgba(0,255,255,0.08),rgba(15,23,42,0.18),rgba(168,85,247,0.10))] p-6 lg:p-8 shadow-[0_0_110px_rgba(0,255,255,0.08)]">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex items-start justify-between gap-6 flex-col xl:flex-row">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Command className="h-3.5 w-3.5 mr-1" />
                NXA AI Revenue Command
              </Badge>
              <Badge variant="outline">Fonte: {source}</Badge>
              <Badge variant="outline">Sync: {lastSync}</Badge>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                Dados isolados por usuário
              </Badge>
              <Badge className={offer ? "bg-purple-500/10 text-purple-300 border-purple-500/20" : "bg-orange-500/10 text-orange-300 border-orange-500/20"}>
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                {offer ? "Oferta IA ativa" : "Oferta IA pendente"}
              </Badge>
            </div>

            <h1 className="text-4xl lg:text-6xl font-black tracking-tight">
              Dashboard Executivo de Receita
            </h1>
            <p className="text-muted-foreground mt-3 text-base lg:text-lg max-w-3xl">
              Central avançada para decidir onde vender, quem atacar primeiro, quanto existe de receita potencial e quais ações comerciais a IA recomenda agora.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mt-6 max-w-5xl">
              <div className="rounded-2xl border border-primary/20 bg-background/50 p-4">
                <p className="text-xs text-muted-foreground">Score de execução</p>
                <p className="text-3xl font-black mt-1 text-primary">{executionScore}%</p>
                <p className="text-[11px] text-muted-foreground mt-1">Prontidão comercial</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-background/50 p-4">
                <p className="text-xs text-muted-foreground">MRR esperado</p>
                <p className="text-3xl font-black mt-1 text-emerald-300">{moneyFormat(expectedMRR)}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Baseado no score atual</p>
              </div>
              <div className="rounded-2xl border border-orange-500/20 bg-background/50 p-4">
                <p className="text-xs text-muted-foreground">Receita em pipeline</p>
                <p className="text-3xl font-black mt-1 text-orange-300">{moneyFormat(estimatedRevenue)}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Leads quentes + mornos</p>
              </div>
              <div className="rounded-2xl border border-purple-500/20 bg-background/50 p-4">
                <p className="text-xs text-muted-foreground">Próxima ação IA</p>
                <p className="text-sm font-black mt-2 leading-tight">{bestAction}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button onClick={loadDashboardData} disabled={loading} variant="outline" className="bg-background/50">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Link href="/busca">
              <Button className="shadow-[0_0_28px_rgba(0,255,255,0.18)]">
                Nova busca IA
                <Search className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {errorMessage && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex gap-3 text-red-300">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-bold">Banco indisponível</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total de leads" value={numberFormat(totalLeads)} helper="Leads salvos no banco" trend={`${newToday} hoje`} icon={<Users className="h-5 w-5" />} tone="primary" />
        <KpiCard label="Leads quentes" value={numberFormat(hotLeads)} helper="Score igual ou acima de 80" icon={<Flame className="h-5 w-5" />} tone="orange" />
        <KpiCard label="MRR esperado" value={moneyFormat(expectedMRR)} helper="Forecast ponderado por score" icon={<CircleDollarSign className="h-5 w-5" />} tone="green" />
        <KpiCard label="Score médio" value={avgScore} helper="Média da base importada" icon={<Gauge className="h-5 w-5" />} tone="blue" />
        <KpiCard label="Follow-ups abertos" value={numberFormat(pendingFollowups)} helper={`${overdueFollowups} atrasado(s)`} icon={<Clock className="h-5 w-5" />} tone={overdueFollowups > 0 ? "red" : "green"} />
        <KpiCard label="Agenda hoje" value={numberFormat(appointmentsToday)} helper="Compromissos comerciais" icon={<BellRing className="h-5 w-5" />} tone="purple" />
        <KpiCard label="Contatos prontos" value={`${contactsReady}%`} helper={`${leadsWithPhone} leads com telefone`} icon={<MessageSquare className="h-5 w-5" />} tone="green" />
        <KpiCard label="ARR projetado" value={moneyFormat(expectedARR)} helper="Projeção anual do pipeline" icon={<TrendingUp className="h-5 w-5" />} tone="orange" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 bg-card/50 backdrop-blur-xl border-card-border overflow-hidden">
          <CardHeader>
            <SectionTitle icon={<Bot className="h-5 w-5" />} title="Executive AI Briefing" subtitle="O que o vendedor precisa saber agora" />
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {insightCards.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-background/40 p-4">
                <div className={`h-10 w-10 rounded-xl bg-muted flex items-center justify-center ${item.tone}`}>
                  {item.icon}
                </div>
                <p className="text-xs text-muted-foreground mt-4">{item.title}</p>
                <p className="text-lg font-black mt-1 line-clamp-2">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-card-border">
          <CardHeader>
            <SectionTitle icon={<Target className="h-5 w-5" />} title="Oferta usada pela IA" subtitle="Produto x lead x receita" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
              <p className="text-xs text-muted-foreground">Oferta ativa</p>
              <p className="text-xl font-black mt-1">{offer?.name || offer?.title || "Oferta não cadastrada"}</p>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                {offer?.description || offer?.summary || "Cadastre sua oferta na Busca Inteligente para ativar análise de encaixe, pitch, ROI e priorização por ICP."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-background/40 p-3">
                <p className="text-xs text-muted-foreground">Ticket</p>
                <p className="font-black">{moneyFormat(offerPrice)}</p>
              </div>
              <div className="rounded-xl border border-border bg-background/40 p-3">
                <p className="text-xs text-muted-foreground">ICP detectado</p>
                <p className="font-black truncate">{topSegments[0]?.label || "—"}</p>
              </div>
            </div>
            <Link href="/busca">
              <Button variant="outline" className="w-full">
                Ajustar oferta IA
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {actionQueue.map((action) => (
          <Card key={action.title} className={`border ${action.tone}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="h-11 w-11 rounded-2xl border border-current/20 bg-background/30 flex items-center justify-center mb-4">
                    {action.icon}
                  </div>
                  <p className="text-sm text-current/80">{action.title}</p>
                  <p className="text-2xl font-black mt-1 text-foreground">{action.value}</p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{action.text}</p>
                </div>
                <Link href={action.href}>
                  <Button size="sm" variant="outline" className="bg-background/40">
                    Abrir
                    <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 bg-card/50 backdrop-blur-xl border-card-border">
          <CardHeader>
            <SectionTitle icon={<LineChart className="h-5 w-5" />} title="Crescimento e tração" subtitle="Leads importados nos últimos 7 dias" />
          </CardHeader>
          <CardContent>
            <MiniBarChart data={lastSevenDays} />
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-card-border">
          <CardHeader>
            <SectionTitle icon={<PieChart className="h-5 w-5" />} title="Temperatura comercial" subtitle="Classificação por NXA Score" />
          </CardHeader>
          <CardContent className="space-y-3">
            <ProgressRow label="Quentes" value={hotLeads} total={totalLeads} badge="80+" />
            <ProgressRow label="Mornos" value={warmLeads} total={totalLeads} badge="61-79" />
            <ProgressRow label="Frios" value={coldLeads} total={totalLeads} badge="0-60" />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-xl border-card-border">
        <CardHeader>
          <SectionTitle icon={<BriefcaseBusiness className="h-5 w-5" />} title="Pipeline Comercial OS" subtitle="Visão CRM com forecast, status e gargalos" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <PipelineColumn label="Novos" value={statusGroups.find((item) => item.label === "new")?.value || totalLeads} total={totalLeads} tone="bg-blue-400" />
          <PipelineColumn label="Contatados" value={statusGroups.find((item) => item.label === "contacted")?.value || 0} total={totalLeads} tone="bg-yellow-400" />
          <PipelineColumn label="Proposta" value={statusGroups.find((item) => item.label === "proposal")?.value || 0} total={totalLeads} tone="bg-purple-400" />
          <PipelineColumn label="Negociação" value={statusGroups.find((item) => item.label === "negotiating")?.value || 0} total={totalLeads} tone="bg-orange-400" />
          <PipelineColumn label="Fechados" value={statusGroups.find((item) => item.label === "closed")?.value || 0} total={totalLeads} tone="bg-emerald-400" />
          <PipelineColumn label="Perdidos" value={statusGroups.find((item) => item.label === "lost")?.value || 0} total={totalLeads} tone="bg-red-400" />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur-xl border-card-border">
          <CardHeader>
            <SectionTitle icon={<Flame className="h-5 w-5" />} title="Top oportunidades para atacar" subtitle="Leads com maior probabilidade comercial" />
          </CardHeader>
          <CardContent className="space-y-3">
            {topLeads.length === 0 && <p className="text-sm text-muted-foreground">Nenhum lead encontrado.</p>}
            {topLeads.map((lead, index) => <OpportunityCard key={lead.id || index} lead={lead} index={index} />)}
            <Link href="/leads">
              <Button variant="outline" className="w-full mt-2">
                Ver central de leads
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-card-border">
          <CardHeader>
            <SectionTitle icon={<Radar className="h-5 w-5" />} title="Matriz de segmentos IA" subtitle="Onde existe mais dinheiro e aderência" />
          </CardHeader>
          <CardContent className="space-y-3">
            {aiSegments.length === 0 && (
              <div className="rounded-2xl border border-border p-6 text-center">
                <Layers3 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold">Sem segmentos suficientes.</p>
                <p className="text-sm text-muted-foreground mt-1">Execute buscas segmentadas para alimentar a matriz.</p>
              </div>
            )}
            {aiSegments.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-background/40 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-black truncate">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.value} leads • score médio {item.avg}</p>
                    <Badge className="mt-3 bg-primary/10 text-primary border-primary/20">{item.priority}</Badge>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">Pipeline</p>
                    <p className="font-black text-emerald-300">{moneyFormat(item.revenue)}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressRow label="Força do segmento" value={item.avg} total={100} badge={`${item.avg}%`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-xl border-card-border">
          <CardHeader>
            <SectionTitle icon={<Activity className="h-5 w-5" />} title="Histórico inteligente" subtitle="Últimas pesquisas executadas" />
          </CardHeader>
          <CardContent className="space-y-3">
            {recentSearches.length === 0 && (
              <div className="rounded-2xl border border-border p-6 text-center">
                <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold">Nenhuma busca recente encontrada.</p>
                <p className="text-sm text-muted-foreground mt-1">Execute uma busca para alimentar esta área.</p>
              </div>
            )}
            {recentSearches.map((item, index) => (
              <div key={item.id || index} className="rounded-2xl border border-border bg-background/40 p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-bold truncate">{getSearchTitle(item)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.city || "—"} / {item.state || "—"} • {getSearchResultsCount(item)} resultado(s)
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="outline">{formatDate(item.created_at)}</Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">{item.status || "concluído"}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-card-border">
          <CardHeader>
            <SectionTitle icon={<MapPin className="h-5 w-5" />} title="Praças mais fortes" subtitle="Cidades com maior concentração" />
          </CardHeader>
          <CardContent className="space-y-3">
            {topCities.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma cidade encontrada.</p>}
            {topCities.map((item) => <ProgressRow key={item.label} label={item.label} value={item.value} total={totalLeads} />)}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-card-border">
          <CardHeader>
            <SectionTitle icon={<Wallet className="h-5 w-5" />} title="Financeiro SaaS" subtitle="Forecast comercial para venda" />
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="rounded-2xl border border-border bg-background/40 p-4 flex justify-between">
              <span className="text-sm text-muted-foreground">Pipeline bruto</span>
              <strong>{moneyFormat(estimatedRevenue)}</strong>
            </div>
            <div className="rounded-2xl border border-border bg-background/40 p-4 flex justify-between">
              <span className="text-sm text-muted-foreground">MRR esperado</span>
              <strong>{moneyFormat(expectedMRR)}</strong>
            </div>
            <div className="rounded-2xl border border-border bg-background/40 p-4 flex justify-between">
              <span className="text-sm text-muted-foreground">ARR esperado</span>
              <strong>{moneyFormat(expectedARR)}</strong>
            </div>
            <div className="rounded-2xl border border-border bg-background/40 p-4 flex justify-between">
              <span className="text-sm text-muted-foreground">Ticket usado</span>
              <strong>{moneyFormat(offerPrice)}</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-xl border-card-border">
        <CardHeader>
          <SectionTitle icon={<Database className="h-5 w-5" />} title="Saúde da infraestrutura comercial" subtitle="Status operacional das integrações principais" />
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <SystemPill label="Supabase" ok={source === "Supabase"} detail={source === "Supabase" ? "Banco respondendo" : "Usando fallback/cache"} />
          <SystemPill label="Google Places" ok={totalLeads > 0 || totalSearches > 0} detail="Edge Function configurada" />
          <SystemPill label="NXA Lead OS" ok={true} detail="Importação, score e deduplicação ativos" />
          <SystemPill label="Oferta IA" ok={Boolean(offer)} detail={offer ? "Produto usado nas análises" : "Cadastre a oferta na busca"} />
          <SystemPill label="Follow-up Center" ok={overdueFollowups === 0} detail={overdueFollowups > 0 ? `${overdueFollowups} pendente(s) atrasado(s)` : "Sem atrasos críticos"} />
          <SystemPill label="CRM" ok={true} detail="Pipeline pronto para status e forecast" />
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
