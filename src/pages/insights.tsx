import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  Brain,
  TrendingUp,
  MapPin,
  Globe,
  Zap,
  AlertTriangle,
  Star,
  Target,
  BarChart3,
  RefreshCw,
  Database,
  Flame,
  Thermometer,
  Snowflake,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Search,
  Users,
  Layers,
  MessageSquare,
  Phone,
  Rocket,
  Activity,
  Eye,
  Gauge,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { useToast } from "@/hooks/use-toast";

type Lead = {
  id: string;
  name: string;
  phone: string;
  city: string;
  state: string;
  segment: string;
  website: string;
  rating: number;
  reviews: number;
  nxaScore: number;
  status: string;
  created_at?: string;
  address?: string;
  [key: string]: any;
};

type Recommendation = {
  title: string;
  desc: string;
  color: string;
  icon: React.ReactNode;
  action?: string;
};

function toArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.leads)) return value.leads;
  return [];
}

function scoreOf(lead: any) {
  const raw = Number(
    lead?.nxaScore ??
      lead?.nxa_score ??
      lead?.score ??
      lead?.opportunity_score ??
      lead?.ai_score ??
      0
  );

  if (raw > 0) return Math.max(0, Math.min(100, Math.round(raw)));

  let score = 42;
  const rating = Number(lead?.rating ?? lead?.google_rating ?? 0);
  const reviews = Number(lead?.reviews ?? lead?.user_ratings_total ?? lead?.total_reviews ?? 0);

  if (lead?.phone || lead?.whatsapp || lead?.telefone) score += 16;
  if (lead?.website || lead?.site || lead?.website_url) score += 9;
  if (rating >= 4.7) score += 14;
  else if (rating >= 4.3) score += 9;
  else if (rating >= 3.8) score += 4;
  if (reviews >= 500) score += 12;
  else if (reviews >= 100) score += 8;
  else if (reviews >= 30) score += 4;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function ratingOf(lead: any) {
  return Number(lead?.rating ?? lead?.google_rating ?? 0);
}

function reviewsOf(lead: any) {
  return Number(lead?.reviews ?? lead?.user_ratings_total ?? lead?.total_reviews ?? 0);
}

function money(n: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

function getScoreColor(score: number) {
  if (score >= 81) return "#f87171";
  if (score >= 61) return "#fb923c";
  if (score >= 41) return "#facc15";
  return "#60a5fa";
}

function getScoreIcon(score: number) {
  if (score >= 61) return <Flame className="h-3.5 w-3.5" />;
  if (score >= 41) return <Thermometer className="h-3.5 w-3.5" />;
  return <Snowflake className="h-3.5 w-3.5" />;
}

function normalizeLead(lead: any): Lead {
  const score = scoreOf(lead);
  return {
    ...lead,
    id: lead.id || lead.business_id || lead.place_id || crypto.randomUUID(),
    name: lead.name || lead.title || lead.company || lead.display_name || "Lead sem nome",
    phone: lead.phone || lead.whatsapp || lead.telefone || lead.internationalPhoneNumber || "",
    city: lead.city || lead.cidade || "",
    state: lead.state || lead.uf || "",
    segment:
      lead.segment ||
      lead.category ||
      lead.niche ||
      lead.categoria ||
      lead.tipo ||
      "Outros",
    website: lead.website || lead.site || lead.website_url || lead.websiteUri || "",
    rating: ratingOf(lead),
    reviews: reviewsOf(lead),
    nxaScore: score,
    status: lead.status || lead.stage || "new",
  };
}

function groupBy<T>(items: T[], keyFn: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item) || "Não identificado";
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

function getTopGroups(leads: Lead[], keyFn: (lead: Lead) => string, limit = 5) {
  return Object.entries(groupBy(leads, keyFn))
    .map(([name, rows]) => {
      const avg = rows.length
        ? Math.round(rows.reduce((sum, item) => sum + scoreOf(item), 0) / rows.length)
        : 0;
      const hot = rows.filter((item) => scoreOf(item) >= 61).length;
      const potential = rows.reduce((sum, item) => sum + estimatePotential(item), 0);
      return { name, count: rows.length, avg, hot, potential };
    })
    .sort((a, b) => b.hot - a.hot || b.avg - a.avg || b.count - a.count)
    .slice(0, limit);
}

function estimatePotential(lead: Lead) {
  const baseBySegment: Record<string, number> = {
    Barbearias: 936,
    "Salões de beleza": 1178,
    "Clínicas de estética": 1450,
    Advocacias: 500,
    Academias: 850,
    Imobiliárias: 1200,
    Restaurantes: 780,
    Odontologia: 1300,
  };

  const base =
    baseBySegment[lead.segment] ||
    (lead.segment?.toLowerCase().includes("adv") ? 500 : 850);

  const multiplier = scoreOf(lead) >= 76 ? 1.35 : scoreOf(lead) >= 61 ? 1.1 : 0.82;
  return Math.round(base * multiplier);
}

function buildAiNarrative(leads: Lead[], searchHistory: any[], crmCards: any[]) {
  const total = leads.length;
  const hot = leads.filter((lead) => scoreOf(lead) >= 61).length;
  const topSegments = getTopGroups(leads, (lead) => lead.segment, 3);
  const topCities = getTopGroups(leads, (lead) => lead.city || lead.state || "Sem cidade", 3);
  const bestSegment = topSegments[0]?.name || "sem segmento definido";
  const bestCity = topCities[0]?.name || "sem cidade definida";
  const avg = total ? Math.round(leads.reduce((s, l) => s + scoreOf(l), 0) / total) : 0;
  const noWebsite = leads.filter((lead) => !lead.website).length;
  const noPhone = leads.filter((lead) => !lead.phone).length;
  const crmOpen = crmCards.filter((card) => !["ganho", "perdido", "lost", "won"].includes(String(card.stage || card.status || "").toLowerCase())).length;

  let thesis = "Ainda faltam dados suficientes para gerar uma leitura confiável.";
  if (total > 0) {
    thesis = `A IA analisou ${total} leads, ${searchHistory.length} varreduras e ${crmCards.length} cards de CRM. O melhor foco agora é ${bestSegment}, principalmente em ${bestCity}, priorizando leads com score acima de ${Math.max(61, avg)}.`;
  }

  const risk =
    noPhone > total * 0.35
      ? "Muitos leads ainda precisam de validação de telefone antes da abordagem."
      : noWebsite > total * 0.35
        ? "Existe uma janela forte para vender presença digital, site, landing page e automação."
        : "A base está saudável para iniciar abordagem comercial consultiva.";

  const nextMove =
    hot > 0
      ? "Atacar primeiro os leads quentes, gerar pitch personalizado e criar follow-up no mesmo dia."
      : "Enriquecer os leads mornos com telefone, presença digital e dor provável antes de vender.";

  return {
    thesis,
    risk,
    nextMove,
    confidence: Math.min(96, Math.max(62, 55 + Math.round(total / 4) + Math.round(hot / 2))),
    bestSegment,
    bestCity,
    avg,
    hot,
    noWebsite,
    noPhone,
    crmOpen,
  };
}

function Section({
  title,
  subtitle,
  icon,
  color = "#22d3ee",
  defaultOpen = true,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.015))",
        border: "1px solid rgba(255,255,255,.08)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left"
      >
        <span
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{ color, background: `${color}14`, border: `1px solid ${color}28` }}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black">{title}</span>
          {subtitle && <span className="block text-xs text-muted-foreground mt-0.5">{subtitle}</span>}
        </span>
        <span className="text-muted-foreground">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ label, value, desc, icon, color = "#22d3ee" }: any) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${color}24`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
          <p className="text-2xl font-black mt-2" style={{ color }}>{value}</p>
          {desc && <p className="text-xs text-muted-foreground mt-1">{desc}</p>}
        </div>
        <div
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={{ color, background: `${color}12`, border: `1px solid ${color}24` }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniBar({ label, value, max, color = "#22d3ee", right }: any) {
  const width = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-bold">{label}</span>
        <span className="text-muted-foreground">{right ?? value}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${width}%`, background: color }} />
      </div>
    </div>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  const score = scoreOf(lead);
  const phone = lead.phone ? lead.phone.replace(/\D/g, "") : "";
  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)" }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-black truncate">{lead.name}</p>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black"
            style={{ color: getScoreColor(score), background: `${getScoreColor(score)}14` }}
          >
            {getScoreIcon(score)}
            {score}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {lead.segment} • {lead.city || "sem cidade"} {lead.phone ? `• ${lead.phone}` : "• sem telefone"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {lead.website && (
          <span className="rounded-lg px-2 py-1 text-[10px] font-bold bg-cyan-400/10 text-cyan-200 border border-cyan-400/20">
            site detectado
          </span>
        )}
        {lead.rating > 0 && (
          <span className="rounded-lg px-2 py-1 text-[10px] font-bold bg-white/5 border border-white/10">
            ★ {lead.rating}
          </span>
        )}
        {phone && (
          <a
            href={`https://wa.me/55${phone}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-black bg-cyan-400 text-black"
          >
            <Phone className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

export function Insights() {
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [source, setSource] = React.useState("Carregando...");
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [searchHistory, setSearchHistory] = React.useState<any[]>([]);
  const [crmCards, setCrmCards] = React.useState<any[]>([]);
  const [query, setQuery] = React.useState("");

  async function safeTable(table: string, userId: string, limit: number) {
    const withUser = await supabase
      .from(table)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!withUser.error) return toArray(withUser.data);

    const withoutUser = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!withoutUser.error) return toArray(withoutUser.data);

    console.warn(`NXA Insights: tabela ${table} indisponível`, withUser.error, withoutUser.error);
    return [];
  }

  async function loadEverything() {
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setLeads([]);
        setSearchHistory([]);
        setCrmCards([]);
        setSource("Usuário não autenticado");
        return;
      }

      const [dbLeads, dbSearchHistory, dbCrmCards] = await Promise.all([
        safeTable("leads", user.id, 5000),
        safeTable("search_history", user.id, 1000),
        safeTable("crm_cards", user.id, 1000),
      ]);

      setLeads(dbLeads.map(normalizeLead));
      setSearchHistory(dbSearchHistory);
      setCrmCards(dbCrmCards);
      setSource("Supabase · IA local · dados do usuário logado");
    } catch (error: any) {
      toast({
        title: "Erro ao carregar IA Insights",
        description: error?.message || "Não foi possível buscar os dados.",
        variant: "destructive",
      });

      setLeads([]);
      setSearchHistory([]);
      setCrmCards([]);
      setSource("Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadEverything();
  }, []);

  const filteredLeads = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return leads;
    return leads.filter((lead) =>
      [lead.name, lead.city, lead.state, lead.segment, lead.phone, lead.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [leads, query]);

  const totalLeads = leads.length;
  const avgScore = totalLeads
    ? Math.round(leads.reduce((sum, lead) => sum + scoreOf(lead), 0) / totalLeads)
    : 0;

  const hotLeads = leads.filter((lead) => scoreOf(lead) >= 61);
  const topSegments = getTopGroups(leads, (lead) => lead.segment, 6);
  const cityData = getTopGroups(leads, (lead) => lead.city || lead.state || "Sem cidade", 6);
  const maxSegmentCount = Math.max(1, ...topSegments.map((item) => item.count));
  const maxCityCount = Math.max(1, ...cityData.map((item) => item.count));

  const ai = buildAiNarrative(leads, searchHistory, crmCards);
  const totalPotential = leads.reduce((sum, lead) => sum + estimatePotential(lead), 0);
  const noSite = leads.filter((lead) => !lead.website).length;
  const withPhone = leads.filter((lead) => !!lead.phone).length;
  const lowRating = leads.filter((lead) => lead.rating > 0 && lead.rating < 4).length;

  const trendData = React.useMemo(() => {
    const byDay = new Map<string, number>();
    leads.forEach((lead) => {
      const date = lead.created_at ? new Date(lead.created_at) : new Date();
      const key = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      byDay.set(key, (byDay.get(key) || 0) + 1);
    });

    return Array.from(byDay.entries())
      .slice(-7)
      .map(([name, count]) => ({ name, count }));
  }, [leads]);

  const recommendations: Recommendation[] = [
    {
      title: `Foco comercial: ${ai.bestSegment}`,
      desc: `${ai.bestSegment} concentra a melhor combinação entre volume, score e potencial financeiro.`,
      color: "#22d3ee",
      icon: <Target className="h-4 w-4" />,
      action: "Criar campanha por segmento",
    },
    {
      title: `Praça prioritária: ${ai.bestCity}`,
      desc: `${ai.bestCity} aparece como território com maior densidade comercial para abordagem local.`,
      color: "#34d399",
      icon: <MapPin className="h-4 w-4" />,
      action: "Filtrar região",
    },
    {
      title: `${noSite} empresas sem site`,
      desc: "Boa oportunidade para vender presença digital, landing page, automação e captação.",
      color: "#a78bfa",
      icon: <Globe className="h-4 w-4" />,
      action: "Ofertar presença digital",
    },
    {
      title: `${lowRating} empresas com avaliação sensível`,
      desc: "Abordagem recomendada: reputação, automação de avaliações e melhoria no atendimento.",
      color: "#facc15",
      icon: <AlertTriangle className="h-4 w-4" />,
      action: "Criar pitch de reputação",
    },
  ].filter((rec) => !rec.title.startsWith("0 empresas"));

  const topLeads = filteredLeads
    .slice()
    .sort((a, b) => scoreOf(b) - scoreOf(a))
    .slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 p-4 md:p-6"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-200">
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2 py-1 font-bold">
              <Brain className="h-3.5 w-3.5" />
              NXA Intelligence Center
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
              <Database className="h-3.5 w-3.5" />
              {source}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              análise invisível para o cliente final
            </span>
          </div>

          <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight">
            IA Insights
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Transforme leads, varreduras e CRM em decisões comerciais claras: onde atacar, qual nicho priorizar e o que oferecer primeiro.
          </p>
        </div>

        <button
          type="button"
          onClick={loadEverything}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-black hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar análise
        </button>
      </div>

      <div
        className="rounded-[28px] p-5 md:p-7 overflow-hidden relative"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(34,211,238,.22), transparent 32%), radial-gradient(circle at bottom right, rgba(168,85,247,.18), transparent 34%), linear-gradient(135deg, rgba(6,182,212,.09), rgba(15,15,25,.95))",
          border: "1px solid rgba(34,211,238,.25)",
        }}
      >
        <div className="absolute right-6 top-6 hidden md:block">
          <div className="rounded-2xl border border-cyan-400/20 bg-black/20 p-4 min-w-[220px]">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Confiança da IA</p>
            <p className="mt-1 text-3xl font-black text-cyan-300">{ai.confidence}%</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-300" style={{ width: `${ai.confidence}%` }} />
            </div>
          </div>
        </div>

        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Diagnóstico executivo da IA</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-black leading-tight">
            {totalLeads ? `Seu próximo foco é ${ai.bestSegment}.` : "Importe leads para a IA encontrar o melhor foco."}
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{ai.thesis}</p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-muted-foreground">Próxima decisão</p>
              <p className="mt-1 text-sm font-black text-white">{ai.nextMove}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-muted-foreground">Risco detectado</p>
              <p className="mt-1 text-sm font-black text-white">{ai.risk}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-muted-foreground">Pipeline estimado</p>
              <p className="mt-1 text-xl font-black text-emerald-300">{money(totalPotential)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Leads analisados" value={totalLeads} desc={`${withPhone} com telefone`} icon={<Users className="h-4 w-4" />} />
        <MetricCard label="Leads quentes" value={hotLeads.length} desc="score acima de 61" icon={<Flame className="h-4 w-4" />} color="#fb923c" />
        <MetricCard label="Score médio" value={`${avgScore}/100`} desc="temperatura da carteira" icon={<Gauge className="h-4 w-4" />} color="#facc15" />
        <MetricCard label="Potencial estimado" value={money(totalPotential)} desc="forecast comercial ponderado" icon={<TrendingUp className="h-4 w-4" />} color="#34d399" />
      </div>

      <Section
        title="Recomendações automáticas"
        subtitle="Ações práticas geradas pela IA com base na carteira atual."
        icon={<Rocket className="h-4 w-4" />}
        color="#fb923c"
        defaultOpen
      >
        <div className="grid gap-3 md:grid-cols-2">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="rounded-2xl p-4"
              style={{
                background: `${rec.color}08`,
                border: `1px solid ${rec.color}22`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="grid h-10 w-10 place-items-center rounded-xl"
                  style={{ color: rec.color, background: `${rec.color}12`, border: `1px solid ${rec.color}24` }}
                >
                  {rec.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black" style={{ color: rec.color }}>{rec.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{rec.desc}</p>
                  {rec.action && (
                    <span className="mt-3 inline-flex rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold">
                      {rec.action}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {recommendations.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Ainda não há recomendações. Importe leads para este usuário primeiro.
            </p>
          )}
        </div>
      </Section>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <Section
          title="Mapa de oportunidade comercial"
          subtitle="Segmentos e cidades com maior potencial para ação imediata."
          icon={<MapPin className="h-4 w-4" />}
          color="#22d3ee"
          defaultOpen
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Segmentos promissores</p>
              {topSegments.map((item) => (
                <div key={item.name} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.count} leads • {item.hot} quentes • média {item.avg}
                      </p>
                    </div>
                    <p className="text-sm font-black text-emerald-300">{money(item.potential)}</p>
                  </div>
                  <div className="mt-3">
                    <MiniBar label="Força comercial" value={item.count} max={maxSegmentCount} color="#22d3ee" right={`${item.avg}/100`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Territórios ativos</p>
              {cityData.map((item) => (
                <div key={item.name} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.count} leads • {item.hot} quentes • média {item.avg}
                      </p>
                    </div>
                    <span className="rounded-lg bg-cyan-400/10 px-2 py-1 text-xs font-black text-cyan-200">
                      {item.count}
                    </span>
                  </div>
                  <div className="mt-3">
                    <MiniBar label="Densidade" value={item.count} max={maxCityCount} color="#34d399" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section
          title="Tração e distribuição"
          subtitle="Leitura visual da evolução e temperatura da base."
          icon={<Activity className="h-4 w-4" />}
          color="#34d399"
          defaultOpen
        >
          <div className="space-y-5">
            <div className="h-[220px] rounded-2xl border border-white/8 bg-black/20 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData.length ? trendData : [{ name: "Hoje", count: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{
                      background: "#07070a",
                      border: "1px solid rgba(255,255,255,.12)",
                      borderRadius: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#22d3ee" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <MiniBar label="Alta intenção" value={hotLeads.length} max={Math.max(1, totalLeads)} color="#fb923c" right={hotLeads.length} />
              <MiniBar label="Com telefone" value={withPhone} max={Math.max(1, totalLeads)} color="#22d3ee" right={withPhone} />
              <MiniBar label="Sem site" value={noSite} max={Math.max(1, totalLeads)} color="#a78bfa" right={noSite} />
            </div>
          </div>
        </Section>
      </div>

      <Section
        title="Top oportunidades para atacar agora"
        subtitle="Lista priorizada por score, contato, presença digital e potencial estimado."
        icon={<Star className="h-4 w-4" />}
        color="#f87171"
        defaultOpen
      >
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar lead, segmento, cidade, telefone ou status..."
              className="w-full rounded-xl border border-white/10 bg-black/25 py-3 pl-10 pr-4 text-sm outline-none focus:border-cyan-400/40"
            />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground">
            {filteredLeads.length} oportunidade(s)
          </div>
        </div>

        <div className="grid gap-3">
          {topLeads.map((lead) => (
            <LeadRow key={lead.id} lead={lead} />
          ))}

          {topLeads.length === 0 && (
            <div className="rounded-2xl border border-white/8 bg-black/20 p-8 text-center">
              <Eye className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhum lead encontrado para este usuário ou filtro.
              </p>
            </div>
          )}
        </div>
      </Section>

      <Section
        title="Base analítica"
        subtitle="Visão técnica dos dados usados pela IA. Mantém transparência sem poluir a tela principal."
        icon={<Layers className="h-4 w-4" />}
        color="#a78bfa"
        defaultOpen={false}
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-xs text-muted-foreground">Varreduras analisadas</p>
            <p className="mt-2 text-2xl font-black">{searchHistory.length}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-xs text-muted-foreground">Cards no CRM</p>
            <p className="mt-2 text-2xl font-black">{crmCards.length}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-xs text-muted-foreground">Oportunidades abertas</p>
            <p className="mt-2 text-2xl font-black">{ai.crmOpen}</p>
          </div>
        </div>
      </Section>
    </motion.div>
  );
}

export default Insights;
