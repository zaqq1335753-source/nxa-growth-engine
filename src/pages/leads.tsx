import * as React from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowDownUp,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Database,
  Flame,
  Globe,
  Grid2X2,
  List,
  Phone,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Star,
  Target,
  Thermometer,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "Novo", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  contacted: { label: "Contatado", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  proposal: { label: "Proposta", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  negotiating: { label: "Negociando", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  closed: { label: "Fechado", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  lost: { label: "Perdido", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

type ViewMode = "table" | "cards";
type SortMode = "score" | "created" | "rating" | "name";
type TemperatureFilter = "all" | "hot" | "warm" | "cold";

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
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
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

function getNxaColor(score: number) {
  if (score >= 81) return "text-red-400";
  if (score >= 61) return "text-orange-400";
  if (score >= 41) return "text-yellow-400";
  return "text-blue-400";
}

function getScoreBadge(score: number) {
  if (score >= 81) return "bg-red-500/10 text-red-300 border-red-500/20";
  if (score >= 61) return "bg-orange-500/10 text-orange-300 border-orange-500/20";
  if (score >= 41) return "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
  return "bg-blue-500/10 text-blue-300 border-blue-500/20";
}

function getNxaIcon(score: number) {
  if (score >= 61) return <Flame className="h-3.5 w-3.5" />;
  if (score >= 41) return <Thermometer className="h-3.5 w-3.5" />;
  return <Snowflake className="h-3.5 w-3.5" />;
}

function getTemperature(score: number): TemperatureFilter {
  if (score >= 75) return "hot";
  if (score >= 45) return "warm";
  return "cold";
}

function getTemperatureLabel(score: number) {
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
  const hasPhone = Boolean(lead?.phone);
  const hasSite = Boolean(lead?.website);
  const segment = String(lead?.segment || lead?.category || "").toLowerCase();

  let base = 297;
  if (/cl[ií]nica|est[eé]tica|dermato|odont|barbear|sal[aã]o|medic/.test(segment)) base = 497;
  if (/imobili[aá]ria|jur[ií]dico|advoc|solar|construtora|franquia/.test(segment)) base = 697;

  const multiplier = 1 + score / 140 + (rating >= 4.5 ? 0.18 : 0) + (hasPhone ? 0.08 : 0) + (hasSite ? 0.08 : 0);
  return Math.round(base * multiplier);
}

function getNextAction(lead: any) {
  const score = getLeadScore(lead);
  if (score >= 80) return "Abordar hoje com pitch consultivo";
  if (score >= 60) return "Enviar diagnóstico e validar dor";
  if (score >= 40) return "Nutrir com prova social";
  return "Baixa prioridade por enquanto";
}

function getReasonTags(lead: any) {
  const tags: string[] = [];
  const score = getLeadScore(lead);
  const rating = getRating(lead);

  if (score >= 75) tags.push("Alta prioridade");
  if (rating >= 4.5) tags.push("Boa reputação");
  if (lead?.phone) tags.push("Contato direto");
  if (lead?.website) tags.push("Presença digital");
  if (!lead?.website) tags.push("Sem site detectado");
  if (!lead?.phone) tags.push("Contato ausente");

  return tags.slice(0, 4);
}

function normalizeLead(lead: any) {
  return {
    ...lead,
    id: lead?.id || crypto.randomUUID(),
    user_id: lead?.user_id || null,
    business_id: lead?.business_id || getBusinessId(),
    name:
      cleanText(lead?.name) ||
      cleanText(lead?.title) ||
      cleanText(lead?.company) ||
      "Lead sem nome",
    phone:
      cleanText(lead?.phone) ||
      cleanText(lead?.whatsapp) ||
      cleanText(lead?.telefone),
    city: cleanText(lead?.city) || cleanText(lead?.cidade),
    state: cleanText(lead?.state) || cleanText(lead?.uf),
    segment:
      cleanText(lead?.segment) ||
      cleanText(lead?.category) ||
      cleanText(lead?.niche) ||
      cleanText(lead?.categoria) ||
      "Sem segmento",
    category:
      cleanText(lead?.category) ||
      cleanText(lead?.segment) ||
      cleanText(lead?.niche),
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

async function getCurrentUser() {
  const { data } = await supabase.auth.getSession();
  if (data?.session?.user?.id) return data.session.user;
  return { id: "00000000-0000-0000-0000-000000000000" };
}

async function fetchAllLeadsFromSupabase(businessId: string, userId: string) {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("business_id", businessId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

function MetricCard({ label, value, helper, icon, accent = "text-primary" }: any) {
  return (
    <Card className="bg-card/50 backdrop-blur border-card-border overflow-hidden relative">
      <CardContent className="p-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${accent}`}>{value}</p>
            {helper && <p className="text-xs text-muted-foreground mt-1">{helper}</p>}
          </div>
          <div className="h-11 w-11 rounded-xl border border-border bg-muted/40 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LeadCard({ lead, onDelete, onCopyPitch }: any) {
  const score = getLeadScore(lead);
  const rating = getRating(lead);
  const potential = estimateMonthlyPotential(lead);
  const status = STATUS_LABELS[lead.status] || STATUS_LABELS.new;

  return (
    <Card className="bg-card/50 backdrop-blur border-card-border hover:border-primary/35 transition-all group overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getScoreBadge(score)}>
                {getNxaIcon(score)}
                <span className="ml-1">{score} · {getTemperatureLabel(score)}</span>
              </Badge>
              <Badge className={status.color}>{status.label}</Badge>
            </div>
            <h3 className="font-bold text-base mt-3 leading-tight truncate">{lead.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {lead.segment || lead.category || "Sem segmento"} · {lead.city || "Cidade não informada"}
            </p>
          </div>
          <Link href={`/leads/${lead.id}`}>
            <Button size="icon" variant="outline" className="h-9 w-9 shrink-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border bg-background/40 p-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Rating</p>
            <p className="font-bold mt-1 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
              {rating || "—"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background/40 p-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Potencial</p>
            <p className="font-bold mt-1">{money(potential)}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/40 p-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Ação</p>
            <p className="font-bold mt-1 text-xs text-primary">{score >= 75 ? "Hoje" : score >= 45 ? "Nutrir" : "Baixa"}</p>
          </div>
        </div>

        <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
          <p className="text-xs font-semibold flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Próxima melhor ação
          </p>
          <p className="text-xs text-muted-foreground mt-1">{getNextAction(lead)}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {getReasonTags(lead).map((tag) => (
            <span key={tag} className="text-[11px] rounded-full border border-border bg-muted/30 px-2 py-1 text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          {lead.phone && (
            <Button asChild variant="outline" size="sm" className="flex-1">
              <a href={`https://wa.me/${String(lead.phone).replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                <Phone className="h-3.5 w-3.5 mr-2" /> WhatsApp
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onCopyPitch(lead)}>
            <Clipboard className="h-3.5 w-3.5 mr-2" /> Pitch
          </Button>
          <Button variant="ghost" size="icon" className="text-red-400" onClick={() => onDelete(lead.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function Leads() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [temperatureFilter, setTemperatureFilter] = React.useState<TemperatureFilter>("all");
  const [sortMode, setSortMode] = React.useState<SortMode>("score");
  const [viewMode, setViewMode] = React.useState<ViewMode>("table");
  const [leads, setLeads] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isImporting, setIsImporting] = React.useState(false);
  const [source, setSource] = React.useState<"supabase" | "cache" | "offline">("supabase");
  const [lastSync, setLastSync] = React.useState<string | null>(null);

  const { toast } = useToast();

  const loadLeadsFromSupabase = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      const businessId = getBusinessId();
      const data = await fetchAllLeadsFromSupabase(businessId, user.id);
      const normalized = toArray(data).map(normalizeLead);

      setLeads(normalized);
      setSource("supabase");
      setLastSync(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      localStorage.setItem("nxa_leads_cache", JSON.stringify(normalized));
    } catch (error: any) {
      console.error("Erro ao buscar leads no Supabase:", error);
      const cached = safeJsonParse(localStorage.getItem("nxa_leads_cache"), []);
      const normalizedCache = toArray(cached).map(normalizeLead);
      setLeads(normalizedCache);
      setSource(normalizedCache.length ? "cache" : "offline");
      toast({
        title: "Banco indisponível.",
        description: error?.message || "Não foi possível carregar do Supabase. Mostrando cache local.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadLeadsFromSupabase();
  }, [loadLeadsFromSupabase]);

  async function insertPayloadSafely(payload: any[]) {
    if (payload.length === 0) return { inserted: 0, duplicated: 0 };

    const { error } = await supabase.from("leads").insert(payload);
    if (!error) return { inserted: payload.length, duplicated: 0 };
    if (error.code !== "23505") throw error;

    let inserted = 0;
    let duplicated = 0;

    for (const row of payload) {
      const single = await supabase.from("leads").insert(row);
      if (!single.error) {
        inserted += 1;
        continue;
      }
      if (single.error.code === "23505") {
        duplicated += 1;
        continue;
      }
      throw single.error;
    }

    return { inserted, duplicated };
  }

  const importLastSearchToLeads = async () => {
    if (isImporting) return;
    setIsImporting(true);

    try {
      const user = await getCurrentUser();
      const parsed = safeJsonParse(localStorage.getItem("nxa_last_search_results"), null);

      if (!parsed) {
        toast({ title: "Nenhuma busca encontrada.", description: "Faça uma busca nova antes de importar leads." });
        return;
      }

      const rawResults = toArray(parsed.results || parsed.leads || parsed.data);
      if (rawResults.length === 0) {
        toast({ title: "Busca sem leads.", description: "A última busca não possui leads para importar." });
        return;
      }

      const businessId = getBusinessId();
      const normalizedResults = uniqueByKey(
        rawResults.map((lead: any) => ({
          ...lead,
          user_id: user.id,
          business_id: businessId,
          segment: lead.segment || lead.category || parsed.niche || parsed.segment || parsed.query || "Sem segmento",
          city: lead.city || parsed.city || lead.cidade,
          state: lead.state || parsed.state || lead.uf,
        }))
      );

      const currentDbLeads = await fetchAllLeadsFromSupabase(businessId, user.id);
      const existingKeys = new Set(currentDbLeads.map((lead: any) => leadKey({ ...lead, user_id: user.id, business_id: businessId })));
      const payload = normalizedResults.map((lead: any) => mapLeadToDatabase(lead, user.id)).filter((lead: any) => !existingKeys.has(leadKey(lead)));

      if (payload.length === 0) {
        toast({ title: "Nada novo para importar.", description: "Todos os leads dessa busca já estão salvos no banco." });
        await loadLeadsFromSupabase();
        return;
      }

      const result = await insertPayloadSafely(payload);
      const history = safeJsonParse(localStorage.getItem("nxa_leads_import_history"), []);
      localStorage.setItem(
        "nxa_leads_import_history",
        JSON.stringify([
          {
            id: crypto.randomUUID(),
            user_id: user.id,
            business_id: businessId,
            total_received: rawResults.length,
            total_unique_in_search: normalizedResults.length,
            total_inserted: result.inserted,
            total_duplicated: result.duplicated,
            source: "last_search",
            query: parsed.query || parsed.niche || parsed.segment || null,
            city: parsed.city || null,
            state: parsed.state || null,
            created_at: new Date().toISOString(),
          },
          ...toArray(history),
        ])
      );

      toast({ title: "Importação concluída.", description: `${result.inserted} novo(s) lead(s) salvo(s). ${result.duplicated} duplicado(s) ignorado(s).` });
      await loadLeadsFromSupabase();
    } catch (error: any) {
      console.error("Erro ao importar leads:", error);
      toast({
        title: "Erro ao salvar no banco.",
        description: error?.code === "23505" ? "Lead duplicado bloqueado pelo banco. Atualize a lista." : error?.message || "Não foi possível importar os leads.",
        variant: "destructive",
      });
      await loadLeadsFromSupabase();
    } finally {
      setIsImporting(false);
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      const user = await getCurrentUser();
      const { error } = await supabase.from("leads").delete().eq("id", leadId).eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Lead removido." });
      await loadLeadsFromSupabase();
    } catch (error: any) {
      console.error("Erro ao remover lead:", error);
      toast({ title: "Erro ao remover lead.", description: error?.message || "Não foi possível remover este lead.", variant: "destructive" });
    }
  };

  const copyPitch = async (lead: any) => {
    const pitch = `Olá! Vi que a ${lead.name} atua em ${lead.segment || lead.category || "seu segmento"} em ${lead.city || "sua cidade"}. Acredito que existe uma oportunidade de melhorar atendimento, captação e follow-up comercial com automação e IA. Posso te mostrar um diagnóstico rápido?`;
    await navigator.clipboard.writeText(pitch);
    toast({ title: "Pitch copiado.", description: "Mensagem pronta para WhatsApp ou CRM." });
  };

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    const result = leads.filter((lead: any) => {
      const statusOk = statusFilter === "all" || lead.status === statusFilter;
      const tempOk = temperatureFilter === "all" || getTemperature(getLeadScore(lead)) === temperatureFilter;
      if (!statusOk || !tempOk) return false;
      if (!q) return true;

      const searchable = [lead.name, lead.city, lead.state, lead.segment, lead.category, lead.phone, lead.status, lead.website, lead.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(q);
    });

    return result.sort((a: any, b: any) => {
      if (sortMode === "score") return getLeadScore(b) - getLeadScore(a);
      if (sortMode === "rating") return getRating(b) - getRating(a);
      if (sortMode === "name") return String(a.name || "").localeCompare(String(b.name || ""));
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [leads, search, statusFilter, temperatureFilter, sortMode]);

  const metrics = React.useMemo(() => {
    const hot = filtered.filter((lead: any) => getLeadScore(lead) >= 75).length;
    const warm = filtered.filter((lead: any) => getLeadScore(lead) >= 45 && getLeadScore(lead) < 75).length;
    const avgScore = filtered.length ? Math.round(filtered.reduce((acc: number, lead: any) => acc + getLeadScore(lead), 0) / filtered.length) : 0;
    const potential = filtered.reduce((acc: number, lead: any) => acc + estimateMonthlyPotential(lead), 0);
    const contactable = filtered.filter((lead: any) => Boolean(lead.phone)).length;
    return { hot, warm, avgScore, potential, contactable };
  }, [filtered]);

  const sourceLabel = source === "supabase" ? "Supabase" : source === "cache" ? "Cache local" : "Offline";

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/70 to-background p-6">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4 flex-col lg:flex-row">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3.5 w-3.5 mr-1" /> NXA Lead Command Center
              </Badge>
              <Badge variant="outline" className="text-xs">Fonte: {sourceLabel}</Badge>
              {lastSync && <Badge variant="outline" className="text-xs">Sync: {lastSync}</Badge>}
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Dados isolados por usuário
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight">Leads Inteligentes</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl">
              Central avançada para priorizar oportunidades, estimar receita potencial, copiar pitch e transformar buscas em pipeline comercial real.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={loadLeadsFromSupabase} disabled={isLoading || isImporting}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Atualizar
            </Button>
            <Button onClick={importLastSearchToLeads} disabled={isLoading || isImporting}>
              <Database className={`h-4 w-4 mr-2 ${isImporting ? "animate-pulse" : ""}`} />
              {isImporting ? "Importando..." : "Importar última busca"}
            </Button>
          </div>
        </div>
      </div>

      {source === "offline" && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex gap-3 text-red-300">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-bold">Banco indisponível</p>
              <p className="text-sm">Verifique login e políticas RLS da tabela leads.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Leads filtrados" value={filtered.length} helper={`${leads.length} no banco`} icon={<Radar className="h-6 w-6 text-primary" />} />
        <MetricCard label="Alta prioridade" value={metrics.hot} helper="Score acima de 75" icon={<Flame className="h-6 w-6 text-orange-400" />} accent="text-orange-400" />
        <MetricCard label="Score médio" value={metrics.avgScore} helper="Qualidade da carteira" icon={<Thermometer className="h-6 w-6 text-yellow-400" />} accent={getNxaColor(metrics.avgScore)} />
        <MetricCard label="Receita potencial" value={money(metrics.potential)} helper="Estimativa mensal" icon={<TrendingUp className="h-6 w-6 text-emerald-400" />} accent="text-emerald-400" />
        <MetricCard label="Contatáveis" value={metrics.contactable} helper="Com telefone/WhatsApp" icon={<Phone className="h-6 w-6 text-cyan-400" />} accent="text-cyan-400" />
      </div>

      <Card className="bg-card/50 backdrop-blur border-card-border">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-3 flex-col xl:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por empresa, cidade, segmento, telefone, endereço ou status..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
            </div>

            <Select value={temperatureFilter} onValueChange={(value: TemperatureFilter) => setTemperatureFilter(value)}>
              <SelectTrigger className="w-full xl:w-48"><SelectValue placeholder="Temperatura" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os scores</SelectItem>
                <SelectItem value="hot">Quentes</SelectItem>
                <SelectItem value="warm">Mornos</SelectItem>
                <SelectItem value="cold">Frios</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full xl:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(STATUS_LABELS).map(([key, value]) => <SelectItem key={key} value={key}>{value.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={sortMode} onValueChange={(value: SortMode) => setSortMode(value)}>
              <SelectTrigger className="w-full xl:w-52"><SelectValue placeholder="Ordenar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Maior NXA Score</SelectItem>
                <SelectItem value="rating">Maior rating</SelectItem>
                <SelectItem value="created">Mais recentes</SelectItem>
                <SelectItem value="name">Nome A-Z</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex rounded-md border border-border overflow-hidden">
              <Button type="button" variant={viewMode === "table" ? "default" : "ghost"} className="rounded-none" onClick={() => setViewMode("table")}>
                <List className="h-4 w-4" />
              </Button>
              <Button type="button" variant={viewMode === "cards" ? "default" : "ghost"} className="rounded-none" onClick={() => setViewMode("cards")}>
                <Grid2X2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-background/40 p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-2"><Target className="h-3.5 w-3.5" /> Melhor prioridade</p>
              <p className="font-bold mt-1 truncate">{filtered[0]?.name || "Nenhum lead"}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-2"><BarChart3 className="h-3.5 w-3.5" /> Carteira</p>
              <p className="font-bold mt-1">{metrics.hot} quentes · {metrics.warm} mornos</p>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5" /> Ação recomendada</p>
              <p className="font-bold mt-1">Começar pelos scores acima de 75</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading && <Card className="bg-card/50 border-card-border md:col-span-2 xl:col-span-3"><CardContent className="py-12 text-center text-muted-foreground">Carregando leads...</CardContent></Card>}
          {!isLoading && filtered.length === 0 && <Card className="bg-card/50 border-card-border md:col-span-2 xl:col-span-3"><CardContent className="py-12 text-center text-muted-foreground">Nenhum lead encontrado.</CardContent></Card>}
          {!isLoading && filtered.map((lead: any) => <LeadCard key={lead.id} lead={lead} onDelete={deleteLead} onCopyPitch={copyPitch} />)}
        </div>
      ) : (
        <Card className="bg-card/50 backdrop-blur border-card-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Empresa</TableHead>
                <TableHead>Inteligência</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-center">Potencial</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Carregando leads...</TableCell></TableRow>}
              {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Nenhum lead encontrado.</TableCell></TableRow>}

              {!isLoading && filtered.map((lead: any, index: number) => {
                const score = getLeadScore(lead);
                const rating = getRating(lead);
                const status = STATUS_LABELS[lead.status] || STATUS_LABELS.new;

                return (
                  <TableRow key={lead.id || index} className="border-border group hover:bg-muted/30">
                    <TableCell>
                      <div className="font-medium text-sm flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate max-w-[280px]">{lead.name || "Lead sem nome"}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {lead.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.phone}</span>}
                        {lead.website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> site</span>}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold ${getScoreBadge(score)}`}>
                        {getNxaIcon(score)} {score} · {getTemperatureLabel(score)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[220px] truncate">{getNextAction(lead)}</p>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">{lead.city || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{lead.segment || lead.category || "—"}</TableCell>

                    <TableCell className="text-center">
                      {rating ? <div className="flex items-center justify-center gap-1 text-sm"><Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" /><span>{rating}</span></div> : "—"}
                    </TableCell>

                    <TableCell className="text-center font-bold text-emerald-400">{money(estimateMonthlyPotential(lead))}</TableCell>

                    <TableCell><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>{status.label}</span></TableCell>

                    <TableCell>
                      <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyPitch(lead)} title="Copiar pitch">
                          <Clipboard className="h-4 w-4" />
                        </Button>
                        <Link href={`/leads/${lead.id}`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Abrir perfil">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => deleteLead(lead.id)} title="Excluir lead">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

export default Leads;
