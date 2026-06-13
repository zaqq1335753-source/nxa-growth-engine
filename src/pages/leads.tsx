import * as React from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Database,
  Eye,
  Flame,
  Gauge,
  Globe,
  Grid2X2,
  ListFilter,
  MapPin,
  Phone,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_BUSINESS_ID = "NEXA_PROD_01";
const CACHE_MAX_AGE_DAYS = 15;

type TemperatureFilter = "all" | "hot" | "warm" | "cold";
type SortMode = "score" | "created" | "rating" | "name" | "potential";
type SourceMode = "supabase" | "realtime" | "cache" | "offline";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "Novo", color: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
  contacted: { label: "Contatado", color: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20" },
  proposal: { label: "Proposta", color: "bg-purple-500/10 text-purple-300 border-purple-500/20" },
  negotiating: { label: "Negociando", color: "bg-orange-500/10 text-orange-300 border-orange-500/20" },
  closed: { label: "Fechado", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  lost: { label: "Perdido", color: "bg-red-500/10 text-red-300 border-red-500/20" },
};

function getBusinessId() {
  return localStorage.getItem("nxa_business_id") || DEFAULT_BUSINESS_ID;
}

function toArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
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

function cleanText(value: any) {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}

function normalizeForKey(value: any) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function leadKey(lead: any) {
  return [
    normalizeForKey(lead.business_id || getBusinessId()),
    normalizeForKey(lead.phone),
    normalizeForKey(lead.name),
    normalizeForKey(lead.city),
  ].join("|");
}

function getLeadScore(lead: any) {
  const score = Number(
    lead?.nxaScore ??
      lead?.nxa_score ??
      lead?.ai_score ??
      lead?.score ??
      lead?.fit_score ??
      lead?.ai_fit_score ??
      0
  );
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getRating(lead: any) {
  const rating = Number(lead?.rating ?? lead?.google_rating ?? 0);
  if (!Number.isFinite(rating)) return 0;
  return rating;
}

function getReviews(lead: any) {
  const reviews = Number(lead?.google_reviews_count ?? lead?.reviews_count ?? lead?.user_ratings_total ?? lead?.reviews ?? 0);
  if (!Number.isFinite(reviews)) return 0;
  return Math.max(0, Math.round(reviews));
}

function scoreColor(score: number) {
  if (score >= 82) return "text-red-300";
  if (score >= 70) return "text-orange-300";
  if (score >= 45) return "text-yellow-300";
  return "text-cyan-300";
}

function scoreBorder(score: number) {
  if (score >= 82) return "border-red-500/35 shadow-red-500/10";
  if (score >= 70) return "border-orange-500/35 shadow-orange-500/10";
  if (score >= 45) return "border-yellow-500/25 shadow-yellow-500/10";
  return "border-cyan-500/20 shadow-cyan-500/10";
}

function scoreBadge(score: number) {
  if (score >= 82) return "bg-red-500/10 text-red-300 border-red-500/20";
  if (score >= 70) return "bg-orange-500/10 text-orange-300 border-orange-500/20";
  if (score >= 45) return "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
  return "bg-cyan-500/10 text-cyan-300 border-cyan-500/20";
}

function getTemperature(score: number): TemperatureFilter {
  if (score >= 75) return "hot";
  if (score >= 45) return "warm";
  return "cold";
}

function getTemperatureLabel(score: number) {
  if (score >= 82) return "Urgente";
  if (score >= 75) return "Quente";
  if (score >= 45) return "Morno";
  return "Frio";
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function estimateMonthlyPotential(lead: any) {
  const score = getLeadScore(lead);
  const rating = getRating(lead);
  const reviews = getReviews(lead);
  const hasPhone = Boolean(lead?.phone);
  const hasSite = Boolean(lead?.website);
  const segment = String(lead?.segment || lead?.category || "").toLowerCase();

  let base = 397;
  if (/cl[ií]nica|est[eé]tica|dermato|odont|barbear|sal[aã]o|academia|pet/.test(segment)) base = 597;
  if (/imobili[aá]ria|jur[ií]dico|advoc|solar|construtora|franquia|financeiro/.test(segment)) base = 797;

  const multiplier =
    1 +
    score / 120 +
    (rating >= 4.5 ? 0.18 : 0) +
    (reviews >= 100 ? 0.16 : 0) +
    (hasPhone ? 0.08 : 0) +
    (hasSite ? 0.08 : 0);

  return Math.round(base * multiplier);
}

function getNextAction(lead: any) {
  if (lead?.ai_next_action) return lead.ai_next_action;
  const score = getLeadScore(lead);
  if (score >= 82) return "Abordar hoje com diagnóstico personalizado e prova de retorno financeiro.";
  if (score >= 75) return "Enviar pitch consultivo validando atendimento, follow-up e captação.";
  if (score >= 60) return "Gerar diagnóstico rápido e testar dor comercial antes da oferta.";
  if (score >= 45) return "Nutrir com prova social e abrir conversa leve.";
  return "Manter na base e priorizar apenas após novo sinal comercial.";
}

function getReasonTags(lead: any) {
  const tags: string[] = [];
  const score = getLeadScore(lead);
  const rating = getRating(lead);
  const reviews = getReviews(lead);

  if (score >= 75) tags.push("alta intenção");
  if (rating >= 4.5) tags.push("boa reputação");
  if (reviews >= 100) tags.push("alta demanda");
  if (lead?.phone) tags.push("contato direto");
  if (lead?.website) tags.push("presença digital");
  if (!lead?.website) tags.push("lacuna digital");
  if (!lead?.phone) tags.push("contato ausente");

  return tags.slice(0, 5);
}

function normalizeLead(lead: any) {
  return {
    ...lead,
    id: lead?.id || crypto.randomUUID(),
    user_id: lead?.user_id || null,
    business_id: lead?.business_id || getBusinessId(),
    name: cleanText(lead?.name) || cleanText(lead?.title) || cleanText(lead?.company) || "Lead sem nome",
    phone: cleanText(lead?.phone) || cleanText(lead?.whatsapp) || cleanText(lead?.telefone),
    city: cleanText(lead?.city) || cleanText(lead?.cidade),
    state: cleanText(lead?.state) || cleanText(lead?.uf),
    segment:
      cleanText(lead?.segment) ||
      cleanText(lead?.category) ||
      cleanText(lead?.niche) ||
      cleanText(lead?.categoria) ||
      "Sem segmento",
    category: cleanText(lead?.category) || cleanText(lead?.segment) || cleanText(lead?.niche),
    rating: lead?.rating ?? lead?.google_rating ?? null,
    address: cleanText(lead?.address) || cleanText(lead?.endereco),
    website: cleanText(lead?.website) || cleanText(lead?.site),
    status: cleanText(lead?.status) || "new",
    nxaScore: getLeadScore(lead),
    created_at: lead?.created_at || new Date().toISOString(),
  };
}

function mapLeadToDatabase(lead: any, userId: string) {
  const normalized = normalizeLead(lead);
  return {
    user_id: userId,
    business_id: normalized.business_id || getBusinessId(),
    name: normalized.name,
    phone: normalized.phone,
    city: normalized.city,
    state: normalized.state,
    segment: normalized.segment,
    category: normalized.category,
    rating: normalized.rating,
    address: normalized.address,
    website: normalized.website,
    status: normalized.status || "new",
    nxa_score: getLeadScore(normalized),
    created_at: normalized.created_at || new Date().toISOString(),
  };
}

function uniqueByKey<T extends Record<string, any>>(items: T[]) {
  const map = new Map<string, T>();
  for (const item of items) {
    const normalized = normalizeLead(item);
    const key = leadKey(normalized);
    if (!map.has(key)) map.set(key, normalized as T);
  }
  return Array.from(map.values());
}

function uniqueById<T extends Record<string, any>>(items: T[]) {
  const map = new Map<string, T>();
  for (const item of items) {
    const normalized = normalizeLead(item);
    const key = String(normalized.id || leadKey(normalized));
    map.set(key, normalized as T);
  }
  return Array.from(map.values());
}

function getStoredLastSearch() {
  const keys = [
    "nxa_last_search_results",
    "nxa_last_search",
    "nxa_radar_results",
    "nxa_search_results",
    "last_search_results",
  ];

  for (const key of keys) {
    const parsed = safeJsonParse(localStorage.getItem(key), null);
    const results = toArray(parsed?.results || parsed?.leads || parsed?.data || parsed);
    if (parsed && results.length > 0) return parsed;
  }
  return null;
}

type SearchScope = {
  active: boolean;
  label: string;
  query?: string | null;
  city?: string | null;
  state?: string | null;
  expectedCount: number;
  signature: string;
  keys: Set<string>;
};

function searchSignature(parsed: any) {
  const rawResults = toArray(parsed?.results || parsed?.leads || parsed?.data || parsed);
  const resultKeys = rawResults
    .map((lead: any) =>
      leadKey({
        ...lead,
        business_id: getBusinessId(),
        segment: lead?.segment || lead?.category || parsed?.niche || parsed?.segment || parsed?.query,
        city: lead?.city || parsed?.city || lead?.cidade,
        state: lead?.state || parsed?.state || lead?.uf,
      })
    )
    .sort()
    .join("~");

  return normalizeForKey(
    [
      parsed?.id,
      parsed?.search_id,
      parsed?.created_at,
      parsed?.timestamp,
      parsed?.query,
      parsed?.niche,
      parsed?.segment,
      parsed?.city,
      parsed?.state,
      rawResults.length,
      resultKeys,
    ]
      .filter(Boolean)
      .join("|") || String(Date.now())
  );
}

function getLastSearchScope(): SearchScope {
  const parsed = getStoredLastSearch();
  const rawResults = toArray(parsed?.results || parsed?.leads || parsed?.data || parsed);

  if (!parsed || rawResults.length === 0) {
    return { active: false, label: "Carteira completa", expectedCount: 0, signature: "", keys: new Set() };
  }

  const businessId = getBusinessId();
  const query = cleanText(parsed.query) || cleanText(parsed.niche) || cleanText(parsed.segment);
  const city = cleanText(parsed.city);
  const state = cleanText(parsed.state);
  const normalized = uniqueByKey(
    rawResults.map((lead: any) => ({
      ...lead,
      business_id: businessId,
      segment: lead.segment || lead.category || parsed.niche || parsed.segment || parsed.query || "Sem segmento",
      city: lead.city || parsed.city || lead.cidade,
      state: lead.state || parsed.state || lead.uf,
    }))
  );

  const keys = new Set(normalized.map((lead: any) => leadKey(lead)));
  const labelParts = [query, city, state].filter(Boolean);

  return {
    active: true,
    label: labelParts.length ? labelParts.join(" · ") : "Última busca inteligente",
    query,
    city,
    state,
    expectedCount: normalized.length,
    signature: searchSignature(parsed),
    keys,
  };
}

function isLeadInsideScope(lead: any, scope: SearchScope) {
  if (!scope.active) return true;
  if (scope.keys.has(leadKey(lead))) return true;

  const cityOk = !scope.city || normalizeForKey(lead.city) === normalizeForKey(scope.city);
  const stateOk = !scope.state || normalizeForKey(lead.state) === normalizeForKey(scope.state);
  const query = normalizeForKey(scope.query);
  const segmentText = normalizeForKey(`${lead.segment || ""} ${lead.category || ""} ${lead.name || ""}`);
  const queryOk = !query || segmentText.includes(query) || query.includes(normalizeForKey(lead.segment || lead.category));

  return cityOk && stateOk && queryOk;
}

function daysSince(date: any) {
  const timestamp = new Date(date || 0).getTime();
  if (!timestamp) return 999;
  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
}

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data?.session?.user?.id) throw new Error("Usuário não autenticado. Faça login novamente para carregar seus leads.");
  return data.session.user;
}

async function fetchAllLeadsFromSupabase(businessId: string, userId: string) {
  const pageSize = 1000;
  let from = 0;
  let allRows: any[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("business_id", businessId)
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    const rows = toArray(data);
    allRows = [...allRows, ...rows];
    if (rows.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}

function formatLeadDate(date: any) {
  if (!date) return "sem data";
  try {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "sem data";
  }
}

function whatsappUrl(phone: any) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "#";
  return `https://wa.me/${digits.startsWith("55") ? digits : `55${digits}`}`;
}

function SourcePill({ source, lastSync }: { source: SourceMode; lastSync: string | null }) {
  const label = source === "realtime" ? "Supabase Live" : source === "supabase" ? "Supabase" : source === "cache" ? "Cache seguro" : "Offline";
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
      {label}{lastSync ? ` · ${lastSync}` : ""}
    </div>
  );
}

function MetricTile({ label, value, helper, icon: Icon, tone = "text-primary" }: any) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-background/55 p-4 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-primary/30">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className={`mt-2 text-3xl font-black ${tone}`}>{value}</p>
          {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card/60">
          <Icon className={`h-5 w-5 ${tone}`} />
        </div>
      </div>
    </div>
  );
}

function LeadMissionCard({ lead, index, onDelete, onCopyPitch, onUpdateStatus }: any) {
  const score = getLeadScore(lead);
  const rating = getRating(lead);
  const reviews = getReviews(lead);
  const potential = estimateMonthlyPotential(lead);
  const status = STATUS_LABELS[lead.status] || STATUS_LABELS.new;
  const age = daysSince(lead.created_at);
  const freshness = age <= CACHE_MAX_AGE_DAYS ? "base recente" : "revalidar";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.2) }}
      className={`group relative overflow-hidden rounded-3xl border bg-background/55 p-4 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-background/75 ${scoreBorder(score)}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-orange-400 opacity-75" />
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-black text-foreground">{lead.name}</h3>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{lead.segment || lead.category || "Sem segmento"}</p>
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className={`flex items-center justify-end gap-1 text-lg font-black ${scoreColor(score)}`}>
            <Flame className="h-4 w-4" /> {score}
          </div>
          <div className={`text-[9px] font-black uppercase tracking-wider ${scoreColor(score)}`}>{getTemperatureLabel(score)}</div>
        </div>
      </div>

      <div className="relative mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-center justify-between gap-2 text-xs font-bold">
          <span className="flex items-center gap-2 text-primary">
            <BrainCircuit className="h-3.5 w-3.5" /> Diagnóstico comercial
          </span>
          <span className="rounded-full bg-background/70 px-2 py-0.5 text-[10px] text-primary">{freshness}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{getNextAction(lead)}</p>
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-border bg-card/60 p-3">
          <div className="flex items-center gap-1 text-sm font-black text-yellow-300">
            <Star className="h-3.5 w-3.5 fill-yellow-300" /> {rating || "—"}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">rating</div>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-3">
          <div className="text-sm font-black text-emerald-300">{money(potential)}</div>
          <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">potencial</div>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-3">
          <div className="text-sm font-black text-cyan-300">{reviews || "—"}</div>
          <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">reviews</div>
        </div>
      </div>

      <div className="relative mt-4 space-y-2 text-xs text-muted-foreground">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">{lead.address || `${lead.city || "Cidade não informada"}${lead.state ? ` / ${lead.state}` : ""}`}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>{lead.phone || "Telefone não informado"}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <Globe className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">{lead.website || "Sem website detectado"}</span>
        </div>
      </div>

      <div className="relative mt-3 flex flex-wrap gap-1.5">
        <Badge className={scoreBadge(score)}>{score} fit</Badge>
        <Badge className={status.color}>{status.label}</Badge>
        {getReasonTags(lead).map((tag: string) => (
          <span key={tag} className="rounded-full border border-border bg-background/70 px-2 py-1 text-[10px] font-medium text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3">
        <Button asChild size="sm" className="h-9 gap-1.5 rounded-xl font-black">
          <Link href={`/leads/${lead.id}`}>
            <Eye className="h-3.5 w-3.5" /> Abrir
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl font-bold" onClick={() => onCopyPitch(lead)}>
          <Clipboard className="h-3.5 w-3.5" /> Pitch
        </Button>
        <Button asChild variant="secondary" size="sm" className="h-9 gap-1.5 rounded-xl font-bold">
          <a href={whatsappUrl(lead.phone)} target="_blank" rel="noreferrer">
            <Phone className="h-3.5 w-3.5" /> WhatsApp
          </a>
        </Button>
        <Select value={lead.status || "new"} onValueChange={(value) => onUpdateStatus(lead, value)}>
          <SelectTrigger className="h-9 rounded-xl text-xs font-bold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            {Object.entries(STATUS_LABELS).map(([key, value]) => (
              <SelectItem key={key} value={key}>{value.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" className="col-span-2 h-8 gap-1.5 rounded-xl text-xs text-red-300 hover:text-red-200" onClick={() => onDelete(lead.id)}>
          <Trash2 className="h-3.5 w-3.5" /> Remover da central
        </Button>
      </div>
    </motion.div>
  );
}

export function Leads() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [temperatureFilter, setTemperatureFilter] = React.useState<TemperatureFilter>("all");
  const [sortMode, setSortMode] = React.useState<SortMode>("score");
  const [leads, setLeads] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isImporting, setIsImporting] = React.useState(false);
  const [source, setSource] = React.useState<SourceMode>("supabase");
  const [lastSync, setLastSync] = React.useState<string | null>(null);
  const [lastSearchScope, setLastSearchScope] = React.useState<SearchScope>(() => getLastSearchScope());
  const [showFullWallet, setShowFullWallet] = React.useState(false);
  const [denseMode, setDenseMode] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [showHeatmap, setShowHeatmap] = React.useState(false);
  const [showStrategicPanel, setShowStrategicPanel] = React.useState(true);
  const [showAllOpportunities, setShowAllOpportunities] = React.useState(false);
  const lastAutoImportRef = React.useRef<string | null>(null);
  const realtimeChannelRef = React.useRef<any>(null);
  const { toast } = useToast();

  const refreshSearchScope = React.useCallback(() => {
    const scope = getLastSearchScope();
    setLastSearchScope(scope);
    return scope;
  }, []);

  const insertPayloadSafely = React.useCallback(async (payload: any[]) => {
    if (payload.length === 0) return { inserted: 0, duplicated: 0 };

    const { data, error } = await supabase
      .from("leads")
      .upsert(payload, {
        onConflict: "business_id,phone,name,city",
        ignoreDuplicates: true,
      })
      .select("id");

    if (!error) return { inserted: toArray(data).length, duplicated: Math.max(0, payload.length - toArray(data).length) };

    console.warn("Upsert em lote falhou, tentando linha a linha:", error);

    let inserted = 0;
    let duplicated = 0;

    for (const row of payload) {
      const single = await supabase
        .from("leads")
        .upsert(row, {
          onConflict: "business_id,phone,name,city",
          ignoreDuplicates: true,
        })
        .select("id");

      if (!single.error) {
        inserted += toArray(single.data).length;
        if (toArray(single.data).length === 0) duplicated += 1;
        continue;
      }

      const code = single.error?.code || String(single.error?.status || "");
      if (code === "23505" || code === "409") {
        duplicated += 1;
        continue;
      }

      throw single.error;
    }

    return { inserted, duplicated };
  }, []);

  const loadLeadsFromSupabase = React.useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const user = await getCurrentUser();
      const businessId = getBusinessId();
      const dbLeads = toArray(await fetchAllLeadsFromSupabase(businessId, user.id)).map((lead: any) =>
        normalizeLead({ ...lead, _source: "leads" })
      );

      setLeads(uniqueById(dbLeads));
      setSource("supabase");
      setLastSync(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      localStorage.setItem("nxa_leads_cache", JSON.stringify(dbLeads));
    } catch (error: any) {
      console.error("Erro ao buscar leads no Supabase:", error);
      const cached = safeJsonParse(localStorage.getItem("nxa_leads_cache"), []);
      const normalizedCache = toArray(cached).map((lead: any) => normalizeLead({ ...lead, _source: lead?._source || "cache" }));
      setLeads(normalizedCache);
      setSource(normalizedCache.length ? "cache" : "offline");
      toast({
        title: "Banco indisponível.",
        description: error?.message || "Não foi possível carregar do Supabase. Mostrando cache local somente como emergência.",
        variant: "destructive",
      });
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [toast]);

  const syncLastSearchToSupabase = React.useCallback(async (silent = true) => {
    if (isImporting) return;

    const scope = refreshSearchScope();
    if (!scope.active || !scope.signature) return;
    if (lastAutoImportRef.current === scope.signature) return;
    lastAutoImportRef.current = scope.signature;

    try {
      if (!silent) setIsImporting(true);
      const user = await getCurrentUser();
      const parsed = getStoredLastSearch();
      const rawResults = toArray(parsed?.results || parsed?.leads || parsed?.data || parsed);
      const businessId = getBusinessId();

      const normalizedResults = uniqueByKey(
        rawResults.map((lead: any) => ({
          ...lead,
          user_id: user.id,
          business_id: businessId,
          segment: lead.segment || lead.category || parsed?.niche || parsed?.segment || parsed?.query || "Sem segmento",
          city: lead.city || parsed?.city || lead.cidade,
          state: lead.state || parsed?.state || lead.uf,
        }))
      );

      const currentDbLeads = await fetchAllLeadsFromSupabase(businessId, user.id);
      const existingKeys = new Set(currentDbLeads.map((lead: any) => leadKey({ ...lead, user_id: user.id, business_id: businessId })));
      const payload = normalizedResults
        .map((lead: any) => mapLeadToDatabase(lead, user.id))
        .filter((lead: any) => !existingKeys.has(leadKey(lead)));

      if (payload.length > 0) await insertPayloadSafely(payload);
      await loadLeadsFromSupabase(true);
    } catch (error: any) {
      console.error("Erro ao sincronizar última busca com Supabase:", error);
      lastAutoImportRef.current = null;
      if (!silent) {
        toast({
          title: "Erro ao sincronizar a busca.",
          description: error?.message || "Não foi possível salvar automaticamente a última busca no banco.",
          variant: "destructive",
        });
      }
    } finally {
      if (!silent) setIsImporting(false);
    }
  }, [insertPayloadSafely, isImporting, loadLeadsFromSupabase, refreshSearchScope, toast]);

  React.useEffect(() => {
    let isMounted = true;

    async function bootRealtime() {
      try {
        const user = await getCurrentUser();
        const businessId = getBusinessId();

        await loadLeadsFromSupabase();
        await syncLastSearchToSupabase(true);
        if (!isMounted) return;

        if (realtimeChannelRef.current) {
          supabase.removeChannel(realtimeChannelRef.current);
          realtimeChannelRef.current = null;
        }

        const channel = supabase
          .channel(`nxa-opportunities-realtime-${businessId}-${user.id}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "leads", filter: `business_id=eq.${businessId}` },
            (payload: any) => {
              const nextRow = normalizeLead({ ...(payload.new || {}), _source: "leads" });
              const oldRow = payload.old || {};
              const rowBusinessId = nextRow?.business_id || oldRow?.business_id;
              if (rowBusinessId && rowBusinessId !== businessId) return;
              const rowUserId = nextRow?.user_id || oldRow?.user_id;
              if (rowUserId && rowUserId !== user.id) return;

              setSource("realtime");
              setLastSync(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));

              if (payload.eventType === "DELETE") {
                setLeads((current) => current.filter((lead: any) => String(lead.id) !== String(oldRow.id)));
                return;
              }

              if (!nextRow?.id) {
                loadLeadsFromSupabase(true);
                return;
              }

              setLeads((current) => {
                const exists = current.some((lead: any) => String(lead.id) === String(nextRow.id));
                const updated = exists
                  ? current.map((lead: any) => (String(lead.id) === String(nextRow.id) ? nextRow : lead))
                  : [nextRow, ...current];
                return uniqueById(updated).sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
              });
            }
          )
          .subscribe((status: string) => {
            if (status === "SUBSCRIBED") setSource("realtime");
          });

        realtimeChannelRef.current = channel;
      } catch {
        await loadLeadsFromSupabase();
      }
    }

    bootRealtime();

    const syncEverything = () => {
      refreshSearchScope();
      syncLastSearchToSupabase(true);
      loadLeadsFromSupabase(true);
    };
    const onFocus = () => syncEverything();
    const onStorage = () => syncEverything();
    const onVisibility = () => { if (!document.hidden) syncEverything(); };
    const poll = window.setInterval(syncEverything, 10000);

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      isMounted = false;
      window.clearInterval(poll);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, [loadLeadsFromSupabase, refreshSearchScope, syncLastSearchToSupabase]);

  const importLastSearchToLeads = async () => {
    lastAutoImportRef.current = null;
    await syncLastSearchToSupabase(false);
    toast({ title: "Central atualizada.", description: "A última varredura foi sincronizada com a carteira de oportunidades." });
  };

  const deleteLead = async (id: string) => {
    try {
      const user = await getCurrentUser();
      const { error } = await supabase.from("leads").delete().eq("id", id).or(`user_id.eq.${user.id},user_id.is.null`);
      if (error) throw error;
      setLeads((current) => current.filter((lead: any) => String(lead.id) !== String(id)));
      toast({ title: "Oportunidade removida." });
    } catch (error: any) {
      console.error("Erro ao remover lead:", error);
      toast({ title: "Erro ao remover lead.", description: error?.message || "Não foi possível remover este lead.", variant: "destructive" });
    }
  };

  const updateLeadStatus = async (lead: any, status: string) => {
    const previous = leads;
    setLeads((current) => current.map((item: any) => String(item.id) === String(lead.id) ? { ...item, status } : item));
    try {
      const { error } = await supabase.from("leads").update({ status }).eq("id", lead.id);
      if (error) throw error;
    } catch (error: any) {
      setLeads(previous);
      toast({ title: "Erro ao atualizar status.", description: error?.message || "Não foi possível salvar o status.", variant: "destructive" });
    }
  };

  const copyPitch = async (lead: any) => {
    const pitch = `Olá! Analisei a ${lead.name} em ${lead.city || "sua região"} e vi uma oportunidade clara para melhorar captação, atendimento e follow-up com automação e IA. Pelo perfil da empresa, acredito que dá para reduzir perda de contatos e aumentar conversões sem aumentar equipe. Posso te mostrar um diagnóstico rápido de 5 minutos?`;
    await navigator.clipboard.writeText(pitch);
    toast({ title: "Pitch copiado.", description: "Mensagem consultiva pronta para abordagem." });
  };

  const scopedLeads = React.useMemo(() => {
    return showFullWallet ? leads : leads.filter((lead: any) => isLeadInsideScope(lead, lastSearchScope));
  }, [leads, showFullWallet, lastSearchScope]);

  const filtered = React.useMemo(() => {
    const q = normalizeForKey(search);

    const result = scopedLeads.filter((lead: any) => {
      const statusOk = statusFilter === "all" || lead.status === statusFilter;
      const tempOk = temperatureFilter === "all" || getTemperature(getLeadScore(lead)) === temperatureFilter;
      if (!statusOk || !tempOk) return false;
      if (!q) return true;

      const searchable = normalizeForKey([lead.name, lead.city, lead.state, lead.segment, lead.category, lead.phone, lead.status, lead.website, lead.address].filter(Boolean).join(" "));
      return searchable.includes(q);
    });

    return result.sort((a: any, b: any) => {
      if (sortMode === "score") return getLeadScore(b) - getLeadScore(a);
      if (sortMode === "potential") return estimateMonthlyPotential(b) - estimateMonthlyPotential(a);
      if (sortMode === "rating") return getRating(b) - getRating(a);
      if (sortMode === "name") return String(a.name || "").localeCompare(String(b.name || ""));
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [scopedLeads, search, statusFilter, temperatureFilter, sortMode]);

  const metrics = React.useMemo(() => {
    const hot = filtered.filter((lead: any) => getLeadScore(lead) >= 75).length;
    const urgent = filtered.filter((lead: any) => getLeadScore(lead) >= 82).length;
    const avgScore = filtered.length ? Math.round(filtered.reduce((acc: number, lead: any) => acc + getLeadScore(lead), 0) / filtered.length) : 0;
    const potential = filtered.reduce((acc: number, lead: any) => acc + estimateMonthlyPotential(lead), 0);
    const contactable = filtered.filter((lead: any) => Boolean(lead.phone)).length;
    const stale = filtered.filter((lead: any) => daysSince(lead.created_at) > CACHE_MAX_AGE_DAYS).length;
    return { hot, urgent, avgScore, potential, contactable, stale };
  }, [filtered]);

  const segmentLeaders = React.useMemo(() => {
    const map = new Map<string, { name: string; count: number; score: number }>();
    for (const lead of filtered) {
      const name = lead.segment || lead.category || "Sem segmento";
      const current = map.get(name) || { name, count: 0, score: 0 };
      current.count += 1;
      current.score += getLeadScore(lead);
      map.set(name, current);
    }
    return Array.from(map.values())
      .map((item) => ({ ...item, avg: item.count ? Math.round(item.score / item.count) : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [filtered]);

  const cityLeaders = React.useMemo(() => {
    const map = new Map<string, { name: string; count: number; score: number }>();
    for (const lead of filtered) {
      const name = [lead.city, lead.state].filter(Boolean).join(" / ") || "Sem localização";
      const current = map.get(name) || { name, count: 0, score: 0 };
      current.count += 1;
      current.score += getLeadScore(lead);
      map.set(name, current);
    }
    return Array.from(map.values())
      .map((item) => ({ ...item, avg: item.count ? Math.round(item.score / item.count) : 0 }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 4);
  }, [filtered]);

  const bestLead = filtered[0];
  const displayedLeads = showAllOpportunities ? filtered : filtered.slice(0, 9);
  const hiddenLeadsCount = Math.max(0, filtered.length - displayedLeads.length);
  const aiConfidence = filtered.length ? Math.min(96, Math.max(68, metrics.avgScore + 14)) : 0;
  const aiReading = metrics.hot > 0
    ? `Existem ${metrics.hot} oportunidades com alta intenção. Comece pelos leads com telefone, site detectado e score acima da média.`
    : filtered.length
      ? `A carteira está mais morna. Priorize diagnóstico, enriquecimento e abordagem consultiva antes de vender direto.`
      : "Ainda não há base suficiente para uma recomendação precisa.";
  const nextAction = bestLead
    ? `Abordar ${bestLead.name} com pitch consultivo e validar dor principal.`
    : "Gerar uma nova varredura na Busca Inteligente.";

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/15 via-background/85 to-background p-5 shadow-2xl shadow-primary/5 md:p-6">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-stretch xl:justify-between">
          <div className="max-w-4xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">
                <Sparkles className="mr-1 h-3.5 w-3.5" /> NXA Opportunity Intelligence
              </Badge>
              <SourcePill source={source} lastSync={lastSync} />
              <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" /> carteira em tempo real
              </Badge>
              {lastSearchScope.active && (
                <Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                  última varredura · {lastSearchScope.expectedCount}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-black tracking-tight md:text-5xl">Central de Oportunidades</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Visão executiva dos leads encontrados, com IA comercial priorizando quem abordar, onde existe mais potencial e qual ação gera mais chance de resposta.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-primary/15 bg-background/45 p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Oportunidades</p>
                <p className="mt-1 text-2xl font-black text-primary">{filtered.length}</p>
                <p className="text-xs text-muted-foreground">{showFullWallet ? "carteira completa" : "foco atual"}</p>
              </div>
              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Alta prioridade</p>
                <p className="mt-1 text-2xl font-black text-orange-300">{metrics.hot}</p>
                <p className="text-xs text-muted-foreground">{metrics.urgent} urgentes</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Potencial mensal</p>
                <p className="mt-1 text-2xl font-black text-emerald-300">{money(metrics.potential)}</p>
                <p className="text-xs text-muted-foreground">estimativa por score</p>
              </div>
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Dados prontos</p>
                <p className="mt-1 text-2xl font-black text-cyan-300">{metrics.contactable}</p>
                <p className="text-xs text-muted-foreground">com telefone/WhatsApp</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.7rem] border border-primary/20 bg-background/60 p-4 xl:w-[360px]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Copilot comercial</p>
                <h2 className="mt-1 text-lg font-black">{bestLead?.name || "Aguardando oportunidades"}</h2>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-center">
                <p className="text-2xl font-black text-primary">{bestLead ? getLeadScore(bestLead) : 0}</p>
                <p className="text-[9px] uppercase text-muted-foreground">score</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="rounded-2xl border border-border bg-card/55 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Próxima melhor ação</p>
                <p className="mt-1 text-sm font-black">{nextAction}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card/55 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Confiança da IA</p>
                <p className="mt-1 text-sm font-black text-primary">{aiConfidence}%</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setShowStrategicPanel((value) => !value)}>
                <BrainCircuit className="mr-2 h-4 w-4" /> IA
              </Button>
              <Button className="rounded-xl font-black" onClick={() => bestLead && copyPitch(bestLead)} disabled={!bestLead}>
                <Clipboard className="mr-2 h-4 w-4" /> Pitch
              </Button>
            </div>
          </div>
        </div>
      </div>

      {source === "offline" && (
        <Card className="border-red-500/20 bg-red-500/10">
          <CardContent className="flex gap-3 p-4 text-red-300">
            <AlertTriangle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-bold">Banco indisponível</p>
              <p className="text-sm">Verifique login, Supabase e políticas RLS da tabela leads.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricTile label="Score médio" value={metrics.avgScore} helper="qualidade comercial" icon={Gauge} tone={scoreColor(metrics.avgScore)} />
        <MetricTile label="Contatáveis" value={metrics.contactable} helper={`${metrics.stale} precisam revalidar`} icon={Phone} tone="text-cyan-300" />
        <MetricTile label="Prioridade alta" value={metrics.hot} helper={`${metrics.urgent} urgentes hoje`} icon={Flame} tone="text-orange-300" />
        <MetricTile label="Potencial" value={money(metrics.potential)} helper="estimativa mensal" icon={TrendingUp} tone="text-emerald-300" />
        <MetricTile label="Base total" value={leads.length} helper={`${filtered.length} no filtro atual`} icon={Database} />
      </div>

      {showStrategicPanel && (
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card/65 to-background backdrop-blur">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <Badge className="border-primary/20 bg-primary/10 text-primary">
                  <BrainCircuit className="mr-1 h-3.5 w-3.5" /> Análise IA da carteira
                </Badge>
                <h2 className="mt-3 text-xl font-black">Leitura comercial do momento</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{aiReading}</p>
              </div>
              <Button variant="outline" className="rounded-xl" onClick={() => setShowStrategicPanel(false)}>
                Recolher
              </Button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background/45 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Melhor alvo</p>
                <p className="mt-1 truncate text-sm font-black">{bestLead?.name || "Nenhum lead"}</p>
                <p className="mt-2 text-xs text-muted-foreground">{bestLead ? getNextAction(bestLead) : "Faça uma nova busca para alimentar a carteira."}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/45 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Território dominante</p>
                <p className="mt-1 truncate text-sm font-black">{cityLeaders[0]?.name || "Sem território"}</p>
                <p className="mt-2 text-xs text-muted-foreground">{cityLeaders[0]?.count || 0} oportunidade(s) concentradas.</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/45 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Segmento dominante</p>
                <p className="mt-1 truncate text-sm font-black">{segmentLeaders[0]?.name || "Sem segmento"}</p>
                <p className="mt-2 text-xs text-muted-foreground">Comece onde existe maior volume e melhor score.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-card-border bg-card/50 backdrop-blur">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => loadLeadsFromSupabase()} disabled={isLoading || isImporting} className="rounded-xl">
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Atualizar
              </Button>
              <Button variant="outline" onClick={() => setShowFullWallet((value) => !value)} disabled={isLoading || isImporting} className="rounded-xl">
                {showFullWallet ? "Focar última varredura" : "Ver carteira completa"}
              </Button>
              <Button onClick={importLastSearchToLeads} disabled={isLoading || isImporting} className="rounded-xl font-black">
                <Database className={`mr-2 h-4 w-4 ${isImporting ? "animate-pulse" : ""}`} />
                {isImporting ? "Sincronizando..." : "Sincronizar varredura"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setShowFilters((value) => !value)}>
                <Search className="mr-2 h-4 w-4" /> {showFilters ? "Ocultar filtros" : "Filtrar oportunidades"}
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => setDenseMode((value) => !value)}>
                <Grid2X2 className="mr-2 h-4 w-4" /> {denseMode ? "Cards premium" : "Modo compacto"}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid gap-3 rounded-3xl border border-border bg-background/45 p-3 xl:grid-cols-[1fr_180px_180px_210px]">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por empresa, cidade, segmento, telefone, endereço ou status..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
              </div>

              <Select value={temperatureFilter} onValueChange={(value: TemperatureFilter) => setTemperatureFilter(value)}>
                <SelectTrigger><SelectValue placeholder="Temperatura" /></SelectTrigger>
                <SelectContent className="border-border bg-background">
                  <SelectItem value="all">Todos os scores</SelectItem>
                  <SelectItem value="hot">Quentes</SelectItem>
                  <SelectItem value="warm">Mornos</SelectItem>
                  <SelectItem value="cold">Frios</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent className="border-border bg-background">
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([key, value]) => <SelectItem key={key} value={key}>{value.label}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={sortMode} onValueChange={(value: SortMode) => setSortMode(value)}>
                <SelectTrigger><SelectValue placeholder="Ordenar" /></SelectTrigger>
                <SelectContent className="border-border bg-background">
                  <SelectItem value="score">Maior NXA Score</SelectItem>
                  <SelectItem value="potential">Maior potencial</SelectItem>
                  <SelectItem value="rating">Maior rating</SelectItem>
                  <SelectItem value="created">Mais recentes</SelectItem>
                  <SelectItem value="name">Nome A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/45 p-3">
              <p className="flex items-center gap-2 text-xs text-muted-foreground"><Target className="h-3.5 w-3.5" /> Prioridade operacional</p>
              <p className="mt-1 truncate font-black">{bestLead?.name || "Nenhum lead"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/45 p-3">
              <p className="flex items-center gap-2 text-xs text-muted-foreground"><BarChart3 className="h-3.5 w-3.5" /> Carteira</p>
              <p className="mt-1 font-black">{metrics.hot} quentes · {filtered.length - metrics.hot} em nutrição</p>
            </div>
            <button type="button" onClick={() => setShowHeatmap((value) => !value)} className="rounded-2xl border border-border bg-background/45 p-3 text-left transition hover:border-primary/40">
              <p className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> Inteligência territorial</p>
              <p className="mt-1 font-black">{showHeatmap ? "Recolher heatmap" : "Expandir heatmap"}</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {showHeatmap && (
        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <Card className="border-primary/20 bg-card/45 backdrop-blur">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                    <MapPin className="mr-1 h-3.5 w-3.5" /> Heatmap comercial
                  </Badge>
                  <h3 className="mt-3 text-lg font-black">Concentração da base</h3>
                </div>
                <ListFilter className="h-5 w-5 text-primary" />
              </div>

              <div className="space-y-3">
                {cityLeaders.length === 0 && <p className="text-sm text-muted-foreground">Sem dados suficientes.</p>}
                {cityLeaders.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-border bg-background/45 p-3">
                    <div className="flex items-center justify-between gap-2 text-xs font-bold">
                      <span className="truncate">{item.name}</span>
                      <span className="text-primary">{item.avg}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, item.avg)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/45 backdrop-blur">
            <CardContent className="p-5">
              <Badge className="border-primary/20 bg-primary/10 text-primary">
                <Target className="mr-1 h-3.5 w-3.5" /> Segmentos mais fortes
              </Badge>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {segmentLeaders.length === 0 && <p className="text-sm text-muted-foreground">Sem dados suficientes.</p>}
                {segmentLeaders.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-border bg-background/45 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-black">{item.name}</span>
                      <Badge variant="outline">{item.count} leads</Badge>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, item.avg)}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Score médio {item.avg}/100</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {lastSearchScope.active && !showFullWallet && (
        <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black text-cyan-200">Foco na última varredura</p>
              <p className="mt-1 text-sm text-muted-foreground">{lastSearchScope.label} · esperado: {lastSearchScope.expectedCount} lead(s). A carteira completa continua salva no Supabase.</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowFullWallet(true)}>Mostrar banco completo</Button>
          </div>
        </div>
      )}

      <div>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black">Oportunidades priorizadas</h2>
            <p className="text-sm text-muted-foreground">
              Mostrando {displayedLeads.length} de {filtered.length}. A IA mantém a lista menor para facilitar a ação comercial.
            </p>
          </div>
          {hiddenLeadsCount > 0 && (
            <Button variant="outline" className="rounded-xl" onClick={() => setShowAllOpportunities((value) => !value)}>
              {showAllOpportunities ? "Ver menos" : `Expandir ${hiddenLeadsCount} oportunidades`}
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showAllOpportunities ? "rotate-180" : ""}`} />
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-96 animate-pulse rounded-3xl border border-border bg-muted/20" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-background/40 text-center">
            <Radar className="mb-3 h-12 w-12 text-primary/50" />
            <div className="text-lg font-black">Nenhuma oportunidade encontrada</div>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">Ajuste filtros, sincronize a última varredura ou volte para a Busca Inteligente para gerar novas oportunidades.</p>
          </div>
        ) : denseMode ? (
          <div className="space-y-3">
            {displayedLeads.map((lead: any, index: number) => {
              const score = getLeadScore(lead);
              return (
                <motion.div
                  key={lead.id || index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.015, 0.12) }}
                  className="group grid gap-3 rounded-2xl border border-border bg-background/55 p-3 transition-all hover:border-primary/30 md:grid-cols-[1fr_130px_130px_150px] md:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0 text-primary" />
                      <div className="truncate font-black">{lead.name}</div>
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">{lead.segment || lead.category} · {lead.city || "sem cidade"}</div>
                  </div>
                  <Badge className={`${scoreBadge(score)} justify-center`}>{score} · {getTemperatureLabel(score)}</Badge>
                  <div className="text-sm font-black text-emerald-300">{money(estimateMonthlyPotential(lead))}</div>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyPitch(lead)}><Clipboard className="h-4 w-4" /></Button>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8"><Link href={`/leads/${lead.id}`}><ChevronRight className="h-4 w-4" /></Link></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-300" onClick={() => deleteLead(lead.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {displayedLeads.map((lead: any, index: number) => (
              <LeadMissionCard
                key={lead.id || index}
                lead={lead}
                index={index}
                onDelete={deleteLead}
                onCopyPitch={copyPitch}
                onUpdateStatus={updateLeadStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Leads;
