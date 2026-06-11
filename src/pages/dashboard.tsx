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
  const [loading, setLoading] = React.useState(true);
  const [source, setSource] = React.useState<"Supabase" | "Cache" | "Offline">("Supabase");
  const [lastSync, setLastSync] = React.useState<string>("—");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const businessId = getBusinessId();

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

      const historyResult = await supabase
        .from("search_history")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(20);

      const dbLeads = toArray(leadsResult.data);
      const dbHistory = historyResult.error ? [] : toArray(historyResult.data);

      setLeads(dbLeads);
      setSearchHistory(dbHistory);
      setSource("Supabase");
      setLastSync(
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );

      localStorage.setItem("nxa_dashboard_leads_cache", JSON.stringify(dbLeads));
      localStorage.setItem("nxa_dashboard_search_history_cache", JSON.stringify(dbHistory));
    } catch (error: any) {
      console.error("Erro ao carregar dashboard:", error);

      const cachedLeads = safeJsonParse(localStorage.getItem("nxa_dashboard_leads_cache"), []);
      const cachedHistory = safeJsonParse(localStorage.getItem("nxa_dashboard_search_history_cache"), []);

      setLeads(toArray(cachedLeads));
      setSearchHistory(toArray(cachedHistory));
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
  const avgScore = totalLeads ? Math.round(leads.reduce((acc, lead) => acc + getScore(lead), 0) / totalLeads) : 0;
  const totalSearches = searchHistory.length;
  const estimatedRevenue = hotLeads * 399 + warmLeads * 199;
  const conversionPotential = percentage(hotLeads + Math.round(warmLeads * 0.5), totalLeads);
  const websiteCoverage = percentage(leadsWithWebsite, totalLeads);
  const dataQuality = clamp(Math.round((percentage(totalLeads - leadsWithoutPhone, totalLeads) + websiteCoverage + avgScore) / 3));

  const statusGroups = React.useMemo(() => groupCount(leads, getLeadStatus), [leads]);
  const topSegments = React.useMemo(() => groupCount(leads, getLeadSegment).slice(0, 6), [leads]);
  const topCities = React.useMemo(() => groupCount(leads, getLeadCity).slice(0, 6), [leads]);
  const topStates = React.useMemo(() => groupCount(leads, getLeadState).slice(0, 5), [leads]);
  const topLeads = React.useMemo(() => [...leads].sort((a, b) => getScore(b) - getScore(a)).slice(0, 8), [leads]);

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
        title: "Prioridade comercial",
        value: `${hotLeads} leads quentes`,
        text: hotLeads > 0 ? "Comece pelos leads acima de 80 de score antes de abrir novas buscas." : "Ainda não existem leads quentes suficientes. Rode uma nova busca mais segmentada.",
        icon: <Flame className="h-5 w-5" />,
        tone: "text-orange-400",
      },
      {
        title: "Segmento dominante",
        value: bestSegment,
        text: `${segmentShare}% da base está concentrada nesse segmento. Crie uma oferta específica para ele.`,
        icon: <Layers3 className="h-5 w-5" />,
        tone: "text-primary",
      },
      {
        title: "Praça mais forte",
        value: bestCity,
        text: `${cityShare}% das oportunidades estão nessa cidade. Vale uma campanha local dedicada.`,
        icon: <MapPin className="h-5 w-5" />,
        tone: "text-blue-400",
      },
      {
        title: "Qualidade da base",
        value: `${dataQuality}%`,
        text: leadsWithoutPhone > 0 ? `${leadsWithoutPhone} leads ainda estão sem telefone. Priorize enriquecimento.` : "Base com boa cobertura de contato para prospecção.",
        icon: <ShieldCheck className="h-5 w-5" />,
        tone: "text-emerald-400",
      },
    ];
  }, [hotLeads, topSegments, topCities, totalLeads, dataQuality, leadsWithoutPhone]);

  const recentSearches = searchHistory.slice(0, 6);

  return (
    <div className="space-y-6 pb-10">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6 lg:p-8 shadow-[0_0_80px_rgba(0,255,255,0.06)]">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex items-start justify-between gap-6 flex-col xl:flex-row">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Command className="h-3.5 w-3.5 mr-1" />
                NXA Command Center
              </Badge>
              <Badge variant="outline">Fonte: {source}</Badge>
              <Badge variant="outline">Sync: {lastSync}</Badge>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <Signal className="h-3.5 w-3.5 mr-1" />
                Lead OS Ativo
              </Badge>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
              Dashboard Executivo NXA
            </h1>
            <p className="text-muted-foreground mt-3 text-base lg:text-lg max-w-2xl">
              Central premium de inteligência comercial com leads, buscas, score, oportunidades, CRM, dados por cidade, segmentos e saúde da operação.
            </p>

            <div className="grid gap-3 sm:grid-cols-3 mt-6 max-w-3xl">
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <p className="text-xs text-muted-foreground">Receita potencial</p>
                <p className="text-2xl font-black mt-1">{moneyFormat(estimatedRevenue)}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <p className="text-xs text-muted-foreground">Potencial de conversão</p>
                <p className="text-2xl font-black mt-1">{conversionPotential}%</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <p className="text-xs text-muted-foreground">Qualidade da base</p>
                <p className="text-2xl font-black mt-1">{dataQuality}%</p>
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
                Nova busca
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
        <KpiCard label="Score médio" value={avgScore} helper="Média da base importada" icon={<Gauge className="h-5 w-5" />} tone="green" />
        <KpiCard label="Buscas recentes" value={numberFormat(totalSearches)} helper="Histórico salvo no banco" icon={<Search className="h-5 w-5" />} tone="blue" />
        <KpiCard label="Sem telefone" value={numberFormat(leadsWithoutPhone)} helper="Exigem enriquecimento" icon={<MessageSquare className="h-5 w-5" />} tone="red" />
        <KpiCard label="Sem website" value={numberFormat(leadsWithoutWebsite)} helper="Alta chance de venda de presença digital" icon={<Globe2 className="h-5 w-5" />} tone="purple" />
        <KpiCard label="Cobertura de site" value={`${websiteCoverage}%`} helper="Empresas com website detectado" icon={<BarChart3 className="h-5 w-5" />} tone="green" />
        <KpiCard label="Receita potencial" value={moneyFormat(estimatedRevenue)} helper="Estimativa por score comercial" icon={<CircleDollarSign className="h-5 w-5" />} tone="orange" />
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <Card className="xl:col-span-3 bg-card/50 backdrop-blur-xl border-card-border overflow-hidden">
          <CardHeader>
            <SectionTitle icon={<Bot className="h-5 w-5" />} title="NXA Intelligence Briefing" subtitle="Insights automáticos para vender mais rápido" />
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {insightCards.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-background/40 p-4">
                <div className={`h-10 w-10 rounded-xl bg-muted flex items-center justify-center ${item.tone}`}>
                  {item.icon}
                </div>
                <p className="text-xs text-muted-foreground mt-4">{item.title}</p>
                <p className="text-lg font-black mt-1 truncate">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-red-500/5 border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-300">
              <BellRing className="h-5 w-5" />
              Requires Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-sm font-bold text-red-200">{leadsWithoutPhone} leads sem telefone</p>
              <p className="text-xs text-red-200/70 mt-1">Priorize enriquecimento antes da prospecção.</p>
            </div>
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-3">
              <p className="text-sm font-bold text-orange-200">{leadsWithoutWebsite} leads sem site</p>
              <p className="text-xs text-orange-200/70 mt-1">Oportunidade para oferta de automação e presença digital.</p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-3">
              <p className="text-sm font-bold text-primary">{hotLeads} leads acima de 80</p>
              <p className="text-xs text-muted-foreground mt-1">Execute contato em até 24h.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 bg-card/50 backdrop-blur-xl border-card-border">
          <CardHeader>
            <SectionTitle icon={<LineChart className="h-5 w-5" />} title="Crescimento de leads" subtitle="Leads importados nos últimos 7 dias" />
          </CardHeader>
          <CardContent>
            <MiniBarChart data={lastSevenDays} />
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-card-border">
          <CardHeader>
            <SectionTitle icon={<PieChart className="h-5 w-5" />} title="Distribuição por temperatura" subtitle="Classificação por NXA Score" />
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
          <SectionTitle icon={<BriefcaseBusiness className="h-5 w-5" />} title="Pipeline Comercial" subtitle="Visão CRM por status dos leads" />
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
            <SectionTitle icon={<Flame className="h-5 w-5" />} title="Top oportunidades" subtitle="Leads com maior probabilidade comercial" />
          </CardHeader>
          <CardContent className="space-y-3">
            {topLeads.length === 0 && <p className="text-sm text-muted-foreground">Nenhum lead encontrado.</p>}
            {topLeads.map((lead, index) => <OpportunityCard key={lead.id || index} lead={lead} index={index} />)}
            <Link href="/leads">
              <Button variant="outline" className="w-full mt-2">
                Ver todos os leads
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-card-border">
          <CardHeader>
            <SectionTitle icon={<Activity className="h-5 w-5" />} title="Histórico inteligente de buscas" subtitle="Últimas pesquisas executadas" />
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
            <Link href="/busca">
              <Button variant="outline" className="w-full mt-2">
                Nova busca inteligente
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-xl border-card-border">
          <CardHeader>
            <SectionTitle icon={<Layers3 className="h-5 w-5" />} title="Segmentos mais fortes" subtitle="Onde o banco tem mais volume" />
          </CardHeader>
          <CardContent className="space-y-3">
            {topSegments.length === 0 && <p className="text-sm text-muted-foreground">Nenhum segmento encontrado.</p>}
            {topSegments.map((item) => <ProgressRow key={item.label} label={item.label} value={item.value} total={totalLeads} />)}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-card-border">
          <CardHeader>
            <SectionTitle icon={<MapPin className="h-5 w-5" />} title="Cidades com mais leads" subtitle="Praças com maior concentração" />
          </CardHeader>
          <CardContent className="space-y-3">
            {topCities.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma cidade encontrada.</p>}
            {topCities.map((item) => <ProgressRow key={item.label} label={item.label} value={item.value} total={totalLeads} />)}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-card-border">
          <CardHeader>
            <SectionTitle icon={<Building2 className="h-5 w-5" />} title="Estados monitorados" subtitle="Distribuição geográfica" />
          </CardHeader>
          <CardContent className="space-y-3">
            {topStates.length === 0 && <p className="text-sm text-muted-foreground">Nenhum estado encontrado.</p>}
            {topStates.map((item) => <ProgressRow key={item.label} label={item.label} value={item.value} total={totalLeads} />)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-xl border-card-border">
          <CardHeader>
            <SectionTitle icon={<Wallet className="h-5 w-5" />} title="Financeiro SaaS" subtitle="Pronto para visão de venda" />
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="rounded-2xl border border-border bg-background/40 p-4 flex justify-between">
              <span className="text-sm text-muted-foreground">MRR estimado</span>
              <strong>{moneyFormat(Math.round(estimatedRevenue * 0.12))}</strong>
            </div>
            <div className="rounded-2xl border border-border bg-background/40 p-4 flex justify-between">
              <span className="text-sm text-muted-foreground">ARR estimado</span>
              <strong>{moneyFormat(Math.round(estimatedRevenue * 0.12 * 12))}</strong>
            </div>
            <div className="rounded-2xl border border-border bg-background/40 p-4 flex justify-between">
              <span className="text-sm text-muted-foreground">Ticket sugerido</span>
              <strong>R$ 299–999</strong>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 bg-card/50 backdrop-blur-xl border-card-border">
          <CardHeader>
            <SectionTitle icon={<Database className="h-5 w-5" />} title="Saúde da infraestrutura" subtitle="Status comercial das integrações principais" />
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <SystemPill label="Supabase" ok={source === "Supabase"} detail={source === "Supabase" ? "Banco respondendo" : "Usando fallback/cache"} />
            <SystemPill label="Google Places" ok={totalLeads > 0 || totalSearches > 0} detail="Edge Function configurada" />
            <SystemPill label="NXA Lead OS" ok={true} detail="Importação e deduplicação ativas" />
            <SystemPill label="Créditos" ok={true} detail="Controle preparado para cobrança" />
            <SystemPill label="CRM" ok={true} detail="Pipeline pronto para status" />
            <SystemPill label="IA Insights" ok={true} detail="Regras comerciais ativas" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
