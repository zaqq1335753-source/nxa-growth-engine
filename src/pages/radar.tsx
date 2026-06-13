import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import {
  Activity,
  ArrowUpRight,
  Building2,
  ChevronRight,
  Crosshair,
  Filter,
  Flame,
  Globe,
  Layers3,
  MapPin,
  Phone,
  Radar as RadarIcon,
  RefreshCw,
  Search,
  Signal,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function toArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.leads)) return value.leads;
  return [];
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
    Number.isFinite(value) ? value : 0,
  );
}

function getScore(lead: any) {
  const raw = Number(
    lead?.nxaScore ??
      lead?.nxa_score ??
      lead?.ai_fit_score ??
      lead?.ai_score ??
      lead?.score ??
      lead?.ai_purchase_probability ??
      0,
  );

  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function getLeadId(lead: any, index = 0) {
  return String(
    lead?.id ??
      lead?.place_id ??
      lead?.google_place_id ??
      lead?.phone ??
      `${lead?.name || "lead"}-${lead?.city || "city"}-${index}`,
  );
}

function getNxaColor(score: number) {
  if (score >= 81) return "#fb7185";
  if (score >= 61) return "#fb923c";
  if (score >= 41) return "#facc15";
  return "#60a5fa";
}

function getNxaLabel(score: number) {
  if (score >= 81) return "Prioridade máxima";
  if (score >= 61) return "Alta intenção";
  if (score >= 41) return "Potencial médio";
  return "Baixa prioridade";
}

function getSegment(lead: any) {
  return lead?.segment || lead?.category || lead?.niche || lead?.types?.[0] || "Sem segmento";
}

function getCity(lead: any) {
  const address = lead?.address || lead?.formattedAddress || lead?.formatted_address || lead?.vicinity || "";
  return lead?.city || lead?.locality || (address ? String(address).split(",")[0] : "Localização não informada");
}

function getState(lead: any) {
  return lead?.state || lead?.uf || "";
}

function getPhone(lead: any) {
  return lead?.phone || lead?.formatted_phone_number || lead?.internationalPhoneNumber || lead?.international_phone_number || "";
}

function getWebsite(lead: any) {
  return lead?.website || lead?.url || lead?.websiteUri || "";
}

function getRating(lead: any) {
  const rating = Number(lead?.rating ?? lead?.google_rating ?? 0);
  return Number.isFinite(rating) ? rating : 0;
}

function getReviews(lead: any) {
  const reviews = Number(lead?.reviews ?? lead?.user_ratings_total ?? lead?.rating_count ?? 0);
  return Number.isFinite(reviews) ? reviews : 0;
}

function estimatePotential(lead: any) {
  const score = getScore(lead) || 60;
  const reviews = Math.min(getReviews(lead), 1500);
  const hasPhone = Boolean(getPhone(lead));
  const hasSite = Boolean(getWebsite(lead));
  const base = 380 + score * 18 + Math.floor(reviews * 0.9) + (hasPhone ? 180 : 0) + (hasSite ? 120 : 0);
  return Math.round(base / 50) * 50;
}

function getCommercialPain(lead: any) {
  const hasSite = Boolean(getWebsite(lead));
  const hasPhone = Boolean(getPhone(lead));
  const reviews = getReviews(lead);
  if (!hasPhone) return "Contato incompleto: validar telefone antes da abordagem.";
  if (!hasSite) return "Lacuna digital: oportunidade clara para presença online e automação.";
  if (reviews > 300) return "Alta demanda local: pode estar perdendo contatos por falta de automação.";
  return "Lead validado: abordagem consultiva com diagnóstico rápido.";
}

function getNextAction(lead: any) {
  if (!getPhone(lead)) return "Enriquecer contato";
  if (!getWebsite(lead)) return "Pitch de presença digital";
  if (getScore(lead) >= 70) return "Abordar via WhatsApp";
  return "Validar fit comercial";
}

function extractLeadsFromSearchRecord(record: any): any[] {
  const direct = toArray(record?.results).length ? toArray(record?.results) : toArray(record?.leads);
  if (direct.length) return direct;

  const payloadResults = toArray(record?.payload?.results).length
    ? toArray(record?.payload?.results)
    : toArray(record?.payload?.leads);

  return payloadResults;
}

function readLastSearchLeadsFromStorage(): any[] {
  try {
    const raw = localStorage.getItem("nxa_last_search_results");
    if (!raw) return [];
    return extractLeadsFromSearchRecord(JSON.parse(raw));
  } catch {
    return [];
  }
}

function normalizeLeadForRadar(lead: any, source = "radar") {
  const score = getScore(lead);
  const name = lead?.name || lead?.title || lead?.displayName?.text || lead?.displayName || "Lead sem nome";

  return {
    ...lead,
    id: String(lead?.id ?? lead?.place_id ?? lead?.google_place_id ?? lead?.phone ?? `${source}-${name}`),
    name,
    segment: getSegment(lead),
    city: getCity(lead),
    state: getState(lead),
    phone: getPhone(lead),
    website: getWebsite(lead),
    rating: getRating(lead),
    reviews: getReviews(lead),
    nxa_score: score || 76,
    _radar_source: source,
  };
}

function mergeUniqueLeads(...groups: any[][]) {
  const map = new Map<string, any>();

  groups.flat().filter(Boolean).forEach((lead, index) => {
    const normalized = normalizeLeadForRadar(lead, `radar-${index}`);
    const key = String(
      normalized.id || normalized.place_id || normalized.phone || `${normalized.name}-${normalized.city}`,
    ).toLowerCase();

    map.set(key, { ...(map.get(key) || {}), ...normalized });
  });

  return Array.from(map.values());
}

type Territory = {
  name: string;
  count: number;
  average: number;
  hot: number;
  potential: number;
  leads: any[];
  segments: string[];
};

function buildTerritories(leads: any[]): Territory[] {
  const grouped = new Map<string, any[]>();

  leads.forEach((lead) => {
    const city = getCity(lead);
    const key = city || "Localização não informada";
    grouped.set(key, [...(grouped.get(key) || []), lead]);
  });

  return Array.from(grouped.entries())
    .map(([name, items]) => {
      const average = items.length ? Math.round(items.reduce((acc, lead) => acc + getScore(lead), 0) / items.length) : 0;
      const hot = items.filter((lead) => getScore(lead) >= 61).length;
      const potential = items.reduce((acc, lead) => acc + estimatePotential(lead), 0);
      const segments = Array.from(new Set(items.map(getSegment))).slice(0, 4);

      return { name, count: items.length, average, hot, potential, leads: items, segments };
    })
    .sort((a, b) => b.hot * 2 + b.average + b.count - (a.hot * 2 + a.average + a.count));
}

function buildSegments(leads: any[]) {
  const grouped = new Map<string, any[]>();
  leads.forEach((lead) => {
    const segment = getSegment(lead);
    grouped.set(segment, [...(grouped.get(segment) || []), lead]);
  });

  return Array.from(grouped.entries())
    .map(([name, items]) => ({
      name,
      count: items.length,
      hot: items.filter((lead) => getScore(lead) >= 61).length,
      average: items.length ? Math.round(items.reduce((acc, lead) => acc + getScore(lead), 0) / items.length) : 0,
      potential: items.reduce((acc, lead) => acc + estimatePotential(lead), 0),
    }))
    .sort((a, b) => b.hot * 3 + b.average - (a.hot * 3 + a.average));
}

function saveOpportunity(lead: any) {
  try {
    localStorage.setItem("nxa_selected_opportunity", JSON.stringify(lead));
    localStorage.setItem("nxa_selected_lead", JSON.stringify(lead));
  } catch {
    // ignore localStorage errors
  }
}

function StatCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string | number; hint: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d12] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.25)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
          {icon}
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
          Live
        </span>
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-white/45">{label}</p>
      <p className="mt-2 text-4xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs text-white/45">{hint}</p>
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  return (
    <span
      className="rounded-full px-2.5 py-1 text-xs font-black"
      style={{ background: `${getNxaColor(score)}22`, color: getNxaColor(score) }}
    >
      {score}
    </span>
  );
}

function SectionCard({
  title,
  subtitle,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b0d12] shadow-[0_20px_80px_rgba(0,0,0,0.32)]">
      <button onClick={() => setOpen((current) => !current)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
            {icon}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{title}</h2>
            <p className="mt-1 text-xs text-white/45">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-white/55">
          {open ? "Recolher" : "Expandir"}
          <ChevronRight className={`h-4 w-4 transition ${open ? "rotate-90" : ""}`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Radar() {
  const [, navigate] = useLocation();
  const [allLeads, setAllLeads] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<any>(null);
  const [selectedTerritory, setSelectedTerritory] = React.useState<string>("all");
  const [filterScore, setFilterScore] = React.useState("all");
  const [filterNicho, setFilterNicho] = React.useState("all");
  const [compactMode, setCompactMode] = React.useState(true);
  const [showAllRows, setShowAllRows] = React.useState(false);
  const [lastSync, setLastSync] = React.useState<string>("--:--");

  const loadRadarData = React.useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setAllLeads([]);
        return;
      }

      const [{ data: savedLeads, error: leadsError }, { data: searches, error: searchesError }] = await Promise.all([
        supabase
          .from("leads")
          .select("*")
          .or(`user_id.eq.${user.id},user_id.is.null`)
          .order("created_at", { ascending: false })
          .limit(800),
        supabase
          .from("search_history")
          .select("id, results, payload, leads, created_at, user_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(12),
      ]);

      if (leadsError) throw leadsError;
      if (searchesError) console.warn("[Radar] search_history indisponível:", searchesError);

      const historyLeads = toArray(searches).flatMap(extractLeadsFromSearchRecord);
      const localLastSearchLeads = readLastSearchLeadsFromStorage();
      setAllLeads(mergeUniqueLeads(toArray(savedLeads), historyLeads, localLastSearchLeads));
      setLastSync(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    } catch (error) {
      console.error("[Radar] Erro ao sincronizar radar:", error);
      setAllLeads(mergeUniqueLeads(readLastSearchLeadsFromStorage()));
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadRadarData();

    const onFocus = () => loadRadarData(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === "nxa_last_search_results" || event.key === "nxa_search_history") loadRadarData(true);
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);

    const interval = window.setInterval(() => loadRadarData(true), 12000);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.clearInterval(interval);
    };
  }, [loadRadarData]);

  React.useEffect(() => {
    let channel: any;

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      channel = supabase
        .channel(`radar-live-${data.user.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => loadRadarData(true))
        .subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [loadRadarData]);

  const allLeadsArray = React.useMemo(() => toArray(allLeads), [allLeads]);
  const territories = React.useMemo(() => buildTerritories(allLeadsArray), [allLeadsArray]);
  const segmentStats = React.useMemo(() => buildSegments(allLeadsArray), [allLeadsArray]);

  const segments = React.useMemo(() => {
    const set = new Set(allLeadsArray.map(getSegment).filter(Boolean));
    return Array.from(set);
  }, [allLeadsArray]);

  const leads = React.useMemo(() => {
    let result = [...allLeadsArray];

    if (selectedTerritory !== "all") result = result.filter((lead) => getCity(lead) === selectedTerritory);

    if (filterScore !== "all") {
      if (filterScore === "vhot") result = result.filter((lead) => getScore(lead) >= 81);
      if (filterScore === "hot") result = result.filter((lead) => getScore(lead) >= 61 && getScore(lead) < 81);
      if (filterScore === "warm") result = result.filter((lead) => getScore(lead) >= 41 && getScore(lead) < 61);
      if (filterScore === "cold") result = result.filter((lead) => getScore(lead) < 41);
    }

    if (filterNicho !== "all") result = result.filter((lead) => getSegment(lead) === filterNicho);

    return result.sort((a, b) => getScore(b) - getScore(a) || estimatePotential(b) - estimatePotential(a));
  }, [allLeadsArray, selectedTerritory, filterScore, filterNicho]);

  const visibleLeads = showAllRows ? leads : leads.slice(0, compactMode ? 8 : 18);
  const veryHot = allLeadsArray.filter((lead) => getScore(lead) >= 81).length;
  const hot = allLeadsArray.filter((lead) => getScore(lead) >= 61 && getScore(lead) < 81).length;
  const warm = allLeadsArray.filter((lead) => getScore(lead) >= 41 && getScore(lead) < 61).length;
  const cold = allLeadsArray.filter((lead) => getScore(lead) < 41).length;
  const average = allLeadsArray.length ? Math.round(allLeadsArray.reduce((acc, lead) => acc + getScore(lead), 0) / allLeadsArray.length) : 0;
  const totalPotential = allLeadsArray.reduce((acc, lead) => acc + estimatePotential(lead), 0);
  const contactReady = allLeadsArray.filter((lead) => Boolean(getPhone(lead))).length;
  const websiteReady = allLeadsArray.filter((lead) => Boolean(getWebsite(lead))).length;
  const activeTerritory = selectedTerritory === "all" ? territories[0] : territories.find((t) => t.name === selectedTerritory);
  const bestLead = leads[0] || allLeadsArray.sort((a, b) => getScore(b) - getScore(a))[0];

  const aiDiagnosis = React.useMemo(() => {
    const confidence = allLeadsArray.length ? Math.min(94, Math.max(62, Math.round(55 + average * 0.35 + (hot + veryHot) * 0.5))) : 0;
    const bestRegion = activeTerritory?.name || territories[0]?.name || "aguardando varredura";
    const bestSegment = segmentStats[0]?.name || "segmento ainda indefinido";
    const action = bestLead ? getNextAction(bestLead) : "Realizar nova busca inteligente";
    const precision = allLeadsArray.length ? Math.round(((contactReady + websiteReady) / Math.max(allLeadsArray.length * 2, 1)) * 100) : 0;

    return {
      confidence,
      bestRegion,
      bestSegment,
      action,
      precision,
      sentence: bestLead
        ? `${bestLead.name} aparece como melhor ponto de ataque: score ${getScore(bestLead)}, ${getPhone(bestLead) ? "contato pronto" : "contato pendente"} e ${getWebsite(bestLead) ? "presença digital detectada" : "lacuna digital clara"}.`
        : "Faça uma nova busca para alimentar o radar com oportunidades priorizadas.",
    };
  }, [activeTerritory?.name, allLeadsArray.length, average, bestLead, contactReady, hot, segmentStats, territories, veryHot, websiteReady]);

  const handleOpenOpportunity = (lead: any) => {
    saveOpportunity(lead);
    navigate("/leads");
  };

  const handleSendToCrm = (lead: any) => {
    saveOpportunity(lead);
    navigate("/crm");
  };

  const handleWhatsApp = (lead: any) => {
    const digits = String(getPhone(lead)).replace(/\D/g, "");
    if (!digits) return setSelected(lead);
    window.open(`https://wa.me/55${digits.startsWith("55") ? digits.slice(2) : digits}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="relative overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(251,146,60,0.12),transparent_34%),#07090f] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] md:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr] xl:items-center">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-300">
                <RadarIcon className="h-3.5 w-3.5" />
                NXA Radar Intelligence
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-white/55">Sync {lastSync}</span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">IA local ativa</span>
            </div>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
              Controle comercial em tempo real, sem virar planilha.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/58 md:text-base">
              O Radar cruza território, score, contato, presença digital e potencial financeiro para apontar onde atacar primeiro.
              A visão detalhada fica recolhida para manter a operação simples.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs text-white/45">Leitura IA</p>
                <p className="mt-1 text-2xl font-black text-cyan-300">{aiDiagnosis.confidence}%</p>
                <p className="text-xs text-white/35">confiança operacional</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs text-white/45">Melhor região</p>
                <p className="mt-1 truncate text-lg font-black text-white">{aiDiagnosis.bestRegion}</p>
                <p className="text-xs text-white/35">território prioritário</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs text-white/45">Potencial mapeado</p>
                <p className="mt-1 text-lg font-black text-emerald-300">{money(totalPotential)}</p>
                <p className="text-xs text-white/35">estimativa ponderada</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs text-white/45">Dados prontos</p>
                <p className="mt-1 text-lg font-black text-white">{aiDiagnosis.precision}%</p>
                <p className="text-xs text-white/35">contato + site</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Próximo melhor movimento</p>
            <h2 className="mt-3 text-2xl font-black text-white">{bestLead?.name || "Alimente o radar"}</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">{aiDiagnosis.sentence}</p>
            <div className="mt-5 grid gap-3">
              <button onClick={() => bestLead && handleWhatsApp(bestLead)} className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-black text-black transition hover:bg-cyan-300 disabled:opacity-50" disabled={!bestLead}>
                Executar ação sugerida
              </button>
              <button onClick={() => bestLead && handleOpenOpportunity(bestLead)} className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-black text-white transition hover:bg-white/10" disabled={!bestLead}>
                Abrir Central de Oportunidades
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Select value={filterScore} onValueChange={setFilterScore}>
            <SelectTrigger className="w-full border-white/10 bg-[#0c0d12] text-white sm:w-48">
              <SelectValue placeholder="Temperatura" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#0c0d12] text-white">
              <SelectItem value="all">Todas temperaturas</SelectItem>
              <SelectItem value="vhot">Prioridade máxima</SelectItem>
              <SelectItem value="hot">Alta intenção</SelectItem>
              <SelectItem value="warm">Potencial médio</SelectItem>
              <SelectItem value="cold">Baixa prioridade</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterNicho} onValueChange={setFilterNicho}>
            <SelectTrigger className="w-full border-white/10 bg-[#0c0d12] text-white sm:w-56">
              <SelectValue placeholder="Segmento" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#0c0d12] text-white">
              <SelectItem value="all">Todos segmentos</SelectItem>
              {segments.map((segment) => (
                <SelectItem key={segment} value={segment}>{segment}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button variant="outline" onClick={() => setCompactMode((value) => !value)} className="border-white/10 bg-[#0c0d12] text-white hover:bg-white/10">
            {compactMode ? "Modo detalhado" : "Modo compacto"}
          </Button>
          <Button variant="outline" onClick={() => loadRadarData()} className="border-white/10 bg-[#0c0d12] text-white hover:bg-white/10">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Link href="/busca">
            <Button className="w-full bg-cyan-400 text-black hover:bg-cyan-300 sm:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Nova busca
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Target className="h-5 w-5" />} label="Leads" value={allLeadsArray.length} hint="base sincronizada" />
        <StatCard icon={<Flame className="h-5 w-5" />} label="Quentes" value={veryHot + hot} hint="acima de 61 pontos" />
        <StatCard icon={<Signal className="h-5 w-5" />} label="Média NXA" value={average} hint="temperatura geral" />
        <StatCard icon={<Layers3 className="h-5 w-5" />} label="Territórios" value={territories.length} hint="cidades detectadas" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.35fr]">
        <SectionCard title="Territórios comerciais" subtitle="Mapa comercial por cidade, região e concentração de oportunidades." icon={<MapPin className="h-5 w-5" />} defaultOpen>
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
            <div>
              <p className="text-sm font-black text-white">IA territorial</p>
              <p className="mt-1 text-xs text-white/45">Priorize {aiDiagnosis.bestRegion} antes de expandir para regiões frias.</p>
            </div>
            <button onClick={() => setSelectedTerritory("all")} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-white/60 hover:text-white">
              Ver todos
            </button>
          </div>

          <div className="grid gap-3">
            {(compactMode ? territories.slice(0, 5) : territories.slice(0, 12)).map((territory, index) => {
              const isActive = selectedTerritory === territory.name || (selectedTerritory === "all" && index === 0);
              const width = territories[0]?.count ? Math.max(12, (territory.count / territories[0].count) * 100) : 0;

              return (
                <button
                  key={territory.name}
                  onClick={() => setSelectedTerritory(territory.name)}
                  className={`w-full overflow-hidden rounded-2xl border p-4 text-left transition ${
                    isActive ? "border-cyan-400/45 bg-cyan-400/10" : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black text-white">{territory.name}</p>
                      <p className="mt-1 text-xs text-white/45">
                        {territory.count} leads · {territory.hot} quentes · {money(territory.potential)} pipeline
                      </p>
                    </div>
                    <ScorePill score={territory.average} />
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-orange-400 to-rose-400" style={{ width: `${width}%` }} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {territory.segments.map((segment) => (
                      <span key={segment} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-white/50">
                        {segment}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}

            {!territories.length && !isLoading && (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
                <MapPin className="mx-auto mb-3 h-8 w-8 text-white/30" />
                <p className="font-bold text-white">Nenhum território detectado</p>
                <p className="mt-1 text-sm text-white/45">Faça uma busca inteligente para alimentar o radar.</p>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Painel de oportunidades" subtitle="Lista priorizada por score, contato pronto, site e potencial financeiro." icon={<Sparkles className="h-5 w-5" />} defaultOpen>
          <div className="mb-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Território ativo</p>
              <p className="mt-2 truncate text-lg font-black text-white">{selectedTerritory === "all" ? "Todos" : selectedTerritory}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Maior chance</p>
              <p className="mt-2 text-lg font-black text-white">{leads[0] ? getScore(leads[0]) : 0}/100</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Ação sugerida</p>
              <p className="mt-2 truncate text-lg font-black text-cyan-300">{bestLead ? getNextAction(bestLead) : "Nova busca"}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="hidden grid-cols-[1.25fr_0.65fr_0.65fr_0.55fr_0.5fr] gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white/40 lg:grid">
              <span>Lead</span>
              <span>Território</span>
              <span>Diagnóstico IA</span>
              <span>Potencial</span>
              <span className="text-right">Score</span>
            </div>

            <div className="max-h-[640px] overflow-auto">
              {isLoading && (
                <div className="flex items-center justify-center gap-3 p-10 text-cyan-300">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-bold">Sincronizando radar...</span>
                </div>
              )}

              {!isLoading && visibleLeads.map((lead, index) => {
                const score = getScore(lead);
                return (
                  <div key={getLeadId(lead, index)} className="grid gap-3 border-b border-white/10 px-4 py-4 last:border-b-0 hover:bg-cyan-400/[0.04] lg:grid-cols-[1.25fr_0.65fr_0.65fr_0.55fr_0.5fr] lg:items-center">
                    <button onClick={() => setSelected(lead)} className="min-w-0 text-left">
                      <p className="truncate font-black text-white">{lead?.name || "Lead sem nome"}</p>
                      <p className="mt-1 truncate text-xs text-white/45">{getSegment(lead)} · {getPhone(lead) || "sem telefone"}</p>
                      {!compactMode && <p className="mt-2 text-xs text-cyan-100/60">{getCommercialPain(lead)}</p>}
                    </button>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <MapPin className="h-4 w-4 text-cyan-300" />
                      <span className="truncate">{getCity(lead)}</span>
                    </div>
                    <div className="text-sm font-bold" style={{ color: getNxaColor(score) }}>{getNextAction(lead)}</div>
                    <div className="text-sm font-black text-emerald-300">{money(estimatePotential(lead))}</div>
                    <div className="flex items-center justify-between gap-2 lg:justify-end">
                      <ScorePill score={score} />
                      <button onClick={() => setSelected(lead)} className="rounded-full border border-white/10 p-1.5 text-white/50 hover:text-white lg:hidden">
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {!isLoading && !leads.length && (
                <div className="p-10 text-center">
                  <Crosshair className="mx-auto mb-4 h-12 w-12 text-white/25" />
                  <h3 className="text-lg font-black text-white">Nenhum lead para os filtros atuais</h3>
                  <p className="mt-2 text-sm text-white/45">Altere os filtros ou faça uma nova busca inteligente.</p>
                  <Link href="/busca">
                    <Button className="mt-5 bg-cyan-400 text-black hover:bg-cyan-300">
                      <Search className="mr-2 h-4 w-4" />
                      Fazer busca
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {leads.length > visibleLeads.length && (
            <button onClick={() => setShowAllRows(true)} className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white hover:bg-white/10">
              Expandir mais {leads.length - visibleLeads.length} oportunidades
            </button>
          )}
          {showAllRows && leads.length > 8 && (
            <button onClick={() => setShowAllRows(false)} className="mt-3 w-full rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-300 hover:bg-cyan-400/15">
              Recolher painel
            </button>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Leitura estratégica IA" subtitle="Resumo comercial sem precisar interpretar todas as tabelas." icon={<TrendingUp className="h-5 w-5" />} defaultOpen={false}>
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-black text-white">Melhor região</p>
              <p className="mt-1 text-sm text-white/45">{aiDiagnosis.bestRegion}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-black text-white">Segmento mais promissor</p>
              <p className="mt-1 text-sm text-white/45">{aiDiagnosis.bestSegment}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-black text-white">Próxima ação</p>
              <p className="mt-1 text-sm text-white/45">{aiDiagnosis.action}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Distribuição" subtitle="Temperatura dos leads e qualidade da carteira." icon={<Filter className="h-5 w-5" />} defaultOpen={false}>
          {[
            ["Prioridade máxima", veryHot, "#fb7185"],
            ["Alta intenção", hot, "#fb923c"],
            ["Potencial médio", warm, "#facc15"],
            ["Baixa prioridade", cold, "#60a5fa"],
          ].map(([label, value, color]) => (
            <div key={String(label)} className="mb-4">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-white/45">{String(label)}</span>
                <span className="font-black text-white">{String(value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{ width: allLeadsArray.length ? `${(Number(value) / allLeadsArray.length) * 100}%` : "0%", background: String(color) }}
                />
              </div>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Segmentos quentes" subtitle="Nichos com maior concentração de intenção comercial." icon={<Building2 className="h-5 w-5" />} defaultOpen={false}>
          <div className="space-y-3">
            {segmentStats.slice(0, 6).map((segment) => (
              <div key={segment.name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-white">{segment.name}</p>
                    <p className="mt-1 text-xs text-white/45">{segment.count} leads · {segment.hot} quentes</p>
                  </div>
                  <ScorePill score={segment.average} />
                </div>
                <p className="mt-3 text-sm font-black text-emerald-300">{money(segment.potential)}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0c0d12] p-6 shadow-2xl"
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 20 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Oportunidade detectada</p>
                  <h3 className="mt-2 text-2xl font-black text-white">{selected?.name || "Lead sem nome"}</h3>
                  <p className="mt-1 text-sm text-white/45">{getSegment(selected)} · {getCity(selected)}</p>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/5 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-white/45">Score NXA</p>
                  <p className="mt-1 text-4xl font-black" style={{ color: getNxaColor(getScore(selected)) }}>{getScore(selected)}</p>
                  <p className="text-xs text-white/45">{getNxaLabel(getScore(selected))}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-white/45">Potencial</p>
                  <p className="mt-2 text-xl font-black text-emerald-300">{money(estimatePotential(selected))}</p>
                  <p className="mt-1 text-xs text-white/45">estimativa mensal</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-white/45">Sinais</p>
                  <p className="mt-2 text-sm font-bold text-white">{getPhone(selected) ? "Contato pronto" : "Sem telefone"}</p>
                  <p className="mt-1 truncate text-xs text-white/45">{getWebsite(selected) ? "Site detectado" : "Lacuna digital"}</p>
                </div>
              </div>

              <div className="mb-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Diagnóstico IA</p>
                <p className="mt-2 text-sm leading-6 text-white/65">{getCommercialPain(selected)}</p>
                <p className="mt-3 text-sm font-black text-white">Próxima ação: <span className="text-cyan-300">{getNextAction(selected)}</span></p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button onClick={() => handleWhatsApp(selected)} className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-300">
                  <Phone className="h-4 w-4" />
                  WhatsApp / telefone
                </button>
                {getWebsite(selected) ? (
                  <a href={getWebsite(selected)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white">
                    <Globe className="h-4 w-4" />
                    Abrir site
                  </a>
                ) : (
                  <button onClick={() => handleOpenOpportunity(selected)} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white">
                    <Search className="h-4 w-4" />
                    Enriquecer lead
                  </button>
                )}
                <Button onClick={() => handleOpenOpportunity(selected)} className="w-full bg-cyan-400 text-black hover:bg-cyan-300">
                  <Star className="mr-2 h-4 w-4" />
                  Abrir oportunidade
                </Button>
                <Button onClick={() => handleSendToCrm(selected)} variant="outline" className="w-full border-white/10 bg-white/[0.04] text-white hover:bg-white/10">
                  <Users className="mr-2 h-4 w-4" />
                  Enviar para CRM
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Radar;
