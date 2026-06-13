import * as React from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Copy,
  Flame,
  LayoutGrid,
  ListChecks,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Users,
  Wand2,
  Zap,
} from "lucide-react";

const DEFAULT_BUSINESS_ID = "NEXA_PROD_01";

type StageId =
  | "prospecting"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

type ViewMode = "command" | "kanban" | "list";

type Priority = "low" | "normal" | "high" | "urgent";

const STAGES: Array<{
  id: StageId;
  label: string;
  short: string;
  probability: number;
  description: string;
}> = [
  {
    id: "prospecting",
    label: "Prospecção",
    short: "Prospectar",
    probability: 10,
    description: "Primeiro contato e validação de dor.",
  },
  {
    id: "qualified",
    label: "Qualificado",
    short: "Qualificar",
    probability: 30,
    description: "Lead com sinal comercial e dados mínimos.",
  },
  {
    id: "proposal",
    label: "Proposta",
    short: "Proposta",
    probability: 55,
    description: "Oferta apresentada ou diagnóstico enviado.",
  },
  {
    id: "negotiation",
    label: "Negociação",
    short: "Negociar",
    probability: 75,
    description: "Ajuste final de preço, prazo ou escopo.",
  },
  {
    id: "won",
    label: "Ganho",
    short: "Ganho",
    probability: 100,
    description: "Cliente fechado.",
  },
  {
    id: "lost",
    label: "Perdido",
    short: "Perdido",
    probability: 0,
    description: "Sem avanço comercial por agora.",
  },
];

const PRIORITIES: Record<Priority, string> = {
  low: "Baixa",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
};

const LS_SELECTED_DEAL = "nxa_selected_crm_deal";
const LS_CRM_LAST_ACTION = "nxa_crm_last_action";

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

function cleanText(value: any) {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}

function onlyDigits(value: any) {
  return String(value || "").replace(/\D/g, "");
}

function formatCurrency(value: any) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDateTime(value: any) {
  if (!value) return "Sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem data";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getScore(item: any) {
  const raw = Number(
    item?.nxa_score ??
      item?.nxaScore ??
      item?.score ??
      item?.ai_score ??
      item?.opportunity_score ??
      0
  );

  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function inferDealScore(item: any) {
  const direct = getScore(item);
  if (direct > 0) return direct;

  const probability = Number(item?.probability || 0);
  const priority = String(item?.priority || "normal");
  const hasPhone = Boolean(item?.phone);
  const hasValue = Number(item?.value || 0) > 0;

  let score = probability;
  if (priority === "urgent") score += 22;
  if (priority === "high") score += 14;
  if (hasPhone) score += 12;
  if (hasValue) score += 8;
  if (item?.stage === "proposal") score += 15;
  if (item?.stage === "negotiation") score += 24;
  if (item?.stage === "won") score = 100;
  if (item?.stage === "lost") score = 0;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getStage(stage: any) {
  return STAGES.find((item) => item.id === stage) || STAGES[0];
}

function getPriority(score: number): Priority {
  if (score >= 90) return "urgent";
  if (score >= 75) return "high";
  if (score < 45) return "low";
  return "normal";
}

function getPriorityClass(priority: string) {
  if (priority === "urgent") return "bg-red-500/10 text-red-300 border-red-500/25";
  if (priority === "high") return "bg-orange-500/10 text-orange-300 border-orange-500/25";
  if (priority === "low") return "bg-blue-500/10 text-blue-300 border-blue-500/25";
  return "bg-cyan-500/10 text-cyan-300 border-cyan-500/20";
}

function leadKey(value: any) {
  return [
    onlyDigits(value?.phone),
    String(value?.title || value?.company_name || value?.name || "")
      .trim()
      .toLowerCase(),
    String(value?.city || "").trim().toLowerCase(),
  ].join("|");
}

function estimateValueFromLead(lead: any) {
  const score = getScore(lead);
  const reviews = Number(lead?.reviews ?? lead?.user_ratings_total ?? lead?.review_count ?? 0);
  const rating = Number(lead?.rating || 0);

  let value = 297;
  if (score >= 80) value = 997;
  else if (score >= 65) value = 697;
  else if (score >= 50) value = 497;

  if (reviews >= 500) value += 400;
  else if (reviews >= 150) value += 200;
  if (rating >= 4.7) value += 100;

  return value;
}

function makeDealFromLead(lead: any, businessId: string, userId: string) {
  const score = getScore(lead);
  const value = estimateValueFromLead(lead);
  const priority = getPriority(score);

  return {
    user_id: userId,
    business_id: businessId,
    lead_id: lead.id || null,
    title: cleanText(lead.name) || "Lead sem nome",
    company_name: cleanText(lead.name) || "Lead sem nome",
    phone: cleanText(lead.phone || lead.whatsapp),
    city: cleanText(lead.city),
    state: cleanText(lead.state),
    segment: cleanText(lead.segment) || cleanText(lead.category) || "Sem segmento",
    stage: score >= 78 ? "qualified" : "prospecting",
    value,
    probability: score >= 85 ? 42 : score >= 70 ? 28 : 14,
    priority,
    source: "lead_import",
    notes: `Importado da Central de Oportunidades. Score NXA: ${score}.`,
    next_action:
      score >= 80
        ? "Enviar diagnóstico comercial e convite para demonstração rápida"
        : "Validar dor principal e confirmar responsável pelo atendimento",
    next_action_date: null,
    updated_at: new Date().toISOString(),
  };
}

function makePitch(card: any) {
  const company = card?.company_name || card?.title || "sua empresa";
  const segment = card?.segment || "seu segmento";
  const city = card?.city ? ` em ${card.city}` : "";

  return `Olá! Tudo bem? Analisei a presença comercial da ${company}${city} e vi uma oportunidade clara de melhorar captação e atendimento no WhatsApp.\n\nHoje muitas empresas de ${segment} perdem contatos por demora na resposta, falta de follow-up e ausência de automação.\n\nPosso te mostrar em 5 minutos um diagnóstico simples de como aumentar conversão usando IA e automação?`;
}

function whatsappLink(card: any) {
  const phone = onlyDigits(card?.phone);
  if (!phone) return null;
  const normalized = phone.startsWith("55") ? phone : `55${phone}`;
  const text = encodeURIComponent(makePitch(card));
  return `https://wa.me/${normalized}?text=${text}`;
}

function getStageAdvice(stageId: string) {
  if (stageId === "prospecting") return "Abrir conversa consultiva e validar dor.";
  if (stageId === "qualified") return "Enviar diagnóstico e conduzir para proposta.";
  if (stageId === "proposal") return "Reforçar ROI e remover objeção de preço.";
  if (stageId === "negotiation") return "Criar urgência e fechar próximo passo.";
  if (stageId === "won") return "Iniciar onboarding e pedir indicação.";
  if (stageId === "lost") return "Registrar motivo e criar reativação futura.";
  return "Definir próxima ação comercial.";
}

function MetricCard({ title, value, description, icon, active }: any) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        active
          ? "border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_32px_rgba(34,211,238,0.08)]"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-2xl font-black mt-1">{value}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-300 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-cyan-400 to-emerald-300 transition-all"
        style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function ExpandHeader({ title, subtitle, open, onClick, icon }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 text-left"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </div>
    </button>
  );
}

function DealCard({ card, onMove, onDelete, onCopyPitch, onCreateFollowup, onSelect }: any) {
  const score = inferDealScore(card);
  const priority = String(card.priority || getPriority(score));
  const stage = getStage(card.stage);
  const wa = whatsappLink(card);

  return (
    <div className="group rounded-2xl border border-white/10 bg-black/25 p-4 hover:border-cyan-400/30 hover:bg-cyan-500/[0.035] transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-4 w-4 text-cyan-300 shrink-0" />
            <p className="font-black truncate">{card.title || card.company_name || "Negócio sem nome"}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {card.city || "Cidade não informada"} {card.state ? `/ ${card.state}` : ""} • {card.segment || "Sem segmento"}
          </p>
        </div>

        <div className="shrink-0 rounded-2xl border border-orange-400/20 bg-orange-500/10 px-3 py-2 text-center">
          <p className="text-lg font-black text-orange-300">{score}</p>
          <p className="text-[10px] text-muted-foreground">NXA</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
          <p className="text-[10px] text-muted-foreground">Valor</p>
          <p className="text-sm font-black">{formatCurrency(card.value)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
          <p className="text-[10px] text-muted-foreground">Etapa</p>
          <p className="text-sm font-black truncate">{stage.short}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
          <p className="text-[10px] text-muted-foreground">Chance</p>
          <p className="text-sm font-black">{Number(card.probability || stage.probability)}%</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge className={getPriorityClass(priority)}>
          {PRIORITIES[priority as Priority] || "Normal"}
        </Badge>
        {card.phone && (
          <Badge variant="outline" className="border-emerald-500/20 text-emerald-300">
            WhatsApp pronto
          </Badge>
        )}
        <Badge variant="outline">{card.source || "CRM"}</Badge>
      </div>

      <div className="mt-4 rounded-xl border border-cyan-500/15 bg-cyan-500/[0.04] p-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">Próxima ação IA</p>
        <p className="text-xs mt-1 text-muted-foreground">
          {card.next_action || getStageAdvice(card.stage)}
        </p>
      </div>

      <div className="mt-4">
        <Select value={card.stage || "prospecting"} onValueChange={(value) => onMove(card.id, value as StageId)}>
          <SelectTrigger className="h-9 text-xs bg-black/30 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button size="sm" onClick={() => onCopyPitch(card)} className="h-9">
          <Copy className="h-3.5 w-3.5 mr-1" />
          Pitch
        </Button>
        {wa ? (
          <a href={wa} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="h-9 w-full">
              <MessageCircle className="h-3.5 w-3.5 mr-1" />
              WhatsApp
            </Button>
          </a>
        ) : (
          <Button size="sm" variant="outline" disabled className="h-9">
            <Phone className="h-3.5 w-3.5 mr-1" />
            Sem fone
          </Button>
        )}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" onClick={() => onCreateFollowup(card)} className="h-9">
          <CalendarCheck className="h-3.5 w-3.5 mr-1" />
          Follow-up
        </Button>
        <Button size="sm" variant="outline" onClick={() => onSelect(card)} className="h-9">
          <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
          Abrir
        </Button>
      </div>

      <button
        type="button"
        onClick={() => onDelete(card.id)}
        className="mt-3 text-[11px] text-muted-foreground hover:text-red-300 transition-colors flex items-center gap-1"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Remover oportunidade
      </button>
    </div>
  );
}

export function Crm() {
  const [cards, setCards] = React.useState<any[]>([]);
  const [leads, setLeads] = React.useState<any[]>([]);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [source, setSource] = React.useState<"Supabase" | "Offline">("Supabase");
  const [lastSync, setLastSync] = React.useState("—");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>("command");
  const [expanded, setExpanded] = React.useState({
    pipeline: true,
    intelligence: true,
    kanban: false,
    list: false,
  });
  const [selectedStage, setSelectedStage] = React.useState<StageId | "all">("all");

  const { toast } = useToast();
  const businessId = getBusinessId();

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setUserId(null);
        setCards([]);
        setLeads([]);
        setSource("Supabase");
        return;
      }

      setUserId(user.id);

      const [cardsResult, leadsResult] = await Promise.all([
        supabase
          .from("crm_cards")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("leads")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(700),
      ]);

      if (cardsResult.error) throw cardsResult.error;
      if (leadsResult.error) throw leadsResult.error;

      setCards(toArray(cardsResult.data));
      setLeads(toArray(leadsResult.data));
      setSource("Supabase");
      setLastSync(
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (error: any) {
      console.error("Erro ao carregar CRM:", error);
      setCards([]);
      setLeads([]);
      setSource("Offline");
      setErrorMessage(error?.message || "Não foi possível carregar o CRM.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`nxa-crm-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "crm_cards",
          filter: `user_id=eq.${userId}`,
        },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadData]);

  async function moveDeal(id: string, stageId: StageId) {
    if (!userId) return;

    const stage = getStage(stageId);
    const current = cards.find((card) => card.id === id);
    const nextAction = getStageAdvice(stageId);

    setCards((prev) =>
      prev.map((card) =>
        card.id === id
          ? {
              ...card,
              stage: stageId,
              probability: stage.probability,
              next_action: card.next_action || nextAction,
              updated_at: new Date().toISOString(),
            }
          : card
      )
    );

    const { error } = await supabase
      .from("crm_cards")
      .update({
        stage: stageId,
        probability: stage.probability,
        next_action: current?.next_action || nextAction,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Erro ao mover card",
        description: error.message,
        variant: "destructive",
      });
      await loadData();
      return;
    }

    toast({
      title: `Movido para ${stage.label}`,
      description: nextAction,
    });
  }

  async function deleteDeal(id: string) {
    if (!userId) return;

    const backup = cards;
    setCards((prev) => prev.filter((card) => card.id !== id));

    const { error } = await supabase
      .from("crm_cards")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      setCards(backup);
      toast({
        title: "Erro ao remover card",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Oportunidade removida" });
  }

  async function importHotLeads() {
    if (!userId) {
      toast({
        title: "Usuário não autenticado",
        description: "Entre novamente para importar leads.",
        variant: "destructive",
      });
      return;
    }

    const existing = new Set(cards.map(leadKey));

    const payload = leads
      .filter((lead) => getScore(lead) >= 65)
      .sort((a, b) => getScore(b) - getScore(a))
      .map((lead) => makeDealFromLead(lead, businessId, userId))
      .filter((deal) => !existing.has(leadKey(deal)))
      .slice(0, 40);

    if (!payload.length) {
      toast({
        title: "Carteira atualizada",
        description: "Não encontrei novos leads quentes fora do CRM.",
      });
      return;
    }

    const { error } = await supabase.from("crm_cards").insert(payload);

    if (error) {
      toast({
        title: "Erro ao importar leads",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Oportunidades importadas",
      description: `${payload.length} lead(s) viraram oportunidades no CRM.`,
    });

    await loadData();
  }

  async function createQuickDeal() {
    if (!userId) {
      toast({
        title: "Usuário não autenticado",
        description: "Entre novamente para criar um negócio.",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("crm_cards")
      .insert({
        user_id: userId,
        business_id: businessId,
        title: "Nova oportunidade",
        company_name: "Nova oportunidade",
        stage: "prospecting",
        value: 497,
        probability: 10,
        priority: "normal",
        source: "manual",
        next_action: "Realizar primeiro contato e validar dor principal",
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      toast({
        title: "Erro ao criar negócio",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setCards((prev) => [data, ...prev].filter(Boolean));
    toast({ title: "Nova oportunidade criada" });
  }

  async function createFollowup(card: any) {
    if (!userId) return;

    const scheduled = new Date();
    scheduled.setDate(scheduled.getDate() + 1);
    scheduled.setHours(10, 0, 0, 0);

    const payload = {
      user_id: userId,
      lead_id: card.lead_id || null,
      channel: "WhatsApp",
      date: scheduled.toISOString(),
      priority: card.priority || "normal",
      status: "pending",
      notes: `Follow-up CRM: ${card.title || card.company_name}. Próxima ação: ${card.next_action || getStageAdvice(card.stage)}.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("followups").insert(payload);

    if (error) {
      toast({
        title: "Não consegui criar follow-up",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Follow-up criado",
      description: "Agendado para amanhã às 10:00.",
    });
  }

  async function copyPitch(card: any) {
    const pitch = makePitch(card);
    await navigator.clipboard.writeText(pitch);
    localStorage.setItem(LS_CRM_LAST_ACTION, JSON.stringify({ type: "pitch", card, pitch, at: new Date().toISOString() }));
    toast({
      title: "Pitch copiado",
      description: "A abordagem comercial foi copiada para envio.",
    });
  }

  function selectDeal(card: any) {
    localStorage.setItem(LS_SELECTED_DEAL, JSON.stringify(card));
    toast({
      title: "Oportunidade selecionada",
      description: "Use o pitch, WhatsApp ou mova a etapa no pipeline.",
    });
  }

  const filteredCards = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const byStage = selectedStage === "all" ? cards : cards.filter((card) => (card.stage || "prospecting") === selectedStage);

    if (!q) return byStage;

    return byStage.filter((card) =>
      [
        card.title,
        card.company_name,
        card.phone,
        card.city,
        card.state,
        card.segment,
        card.stage,
        card.next_action,
        card.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [cards, search, selectedStage]);

  const activeCards = cards.filter((card) => !["won", "lost"].includes(card.stage));
  const totalPipeline = activeCards.reduce((acc, card) => acc + Number(card.value || 0), 0);
  const weightedPipeline = activeCards.reduce((acc, card) => {
    const stage = getStage(card.stage);
    const probability = Number(card.probability || stage.probability || 0) / 100;
    return acc + Number(card.value || 0) * probability;
  }, 0);
  const wonRevenue = cards.filter((card) => card.stage === "won").reduce((acc, card) => acc + Number(card.value || 0), 0);
  const openDeals = activeCards.length;
  const urgentDeals = cards.filter((card) => ["urgent", "high"].includes(String(card.priority))).length;
  const conversion = cards.length ? Math.round((cards.filter((card) => card.stage === "won").length / cards.length) * 100) : 0;
  const hotLeads = leads.filter((lead) => getScore(lead) >= 75).length;
  const missingFromCrm = leads.filter((lead) => getScore(lead) >= 65 && !new Set(cards.map(leadKey)).has(leadKey(makeDealFromLead(lead, businessId, userId || "")))).length;

  const bestDeal = React.useMemo(() => {
    return [...activeCards].sort((a, b) => inferDealScore(b) - inferDealScore(a))[0] || null;
  }, [activeCards]);

  const aiDiagnosis = React.useMemo(() => {
    if (!cards.length && hotLeads > 0) {
      return {
        title: "Importar oportunidades agora",
        confidence: 88,
        text: `${hotLeads} lead(s) com bom score estão fora do CRM. O melhor próximo passo é transformar esses leads em pipeline comercial.`,
        action: "Importar leads quentes",
      };
    }

    if (urgentDeals > 0) {
      return {
        title: "Atacar oportunidades críticas",
        confidence: 84,
        text: `${urgentDeals} oportunidade(s) estão com prioridade alta. O CRM deve focar em contato imediato e follow-up curto.`,
        action: "Ver oportunidades urgentes",
      };
    }

    if (openDeals > 0 && conversion === 0) {
      return {
        title: "Mover pipeline para proposta",
        confidence: 76,
        text: "Existem oportunidades abertas, mas nenhuma receita ganha registrada. Priorize qualificar e levar os melhores leads para proposta.",
        action: "Executar rotina comercial",
      };
    }

    return {
      title: "CRM pronto para operação",
      confidence: 72,
      text: "A operação está limpa. Mantenha rotina diária de busca, importação de leads quentes e follow-up no mesmo dia.",
      action: "Nova busca inteligente",
    };
  }, [cards.length, hotLeads, urgentDeals, openDeals, conversion]);

  const stageStats = STAGES.map((stage) => {
    const stageCards = cards.filter((card) => (card.stage || "prospecting") === stage.id);
    const value = stageCards.reduce((acc, card) => acc + Number(card.value || 0), 0);
    return { ...stage, cards: stageCards, value };
  });

  const stageOptions = [
    { id: "all", label: "Todas as etapas" },
    ...STAGES.map((stage) => ({ id: stage.id, label: stage.label })),
  ];

  return (
    <div className="space-y-5 pb-10">
      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/12 via-slate-950 to-violet-500/10 p-6 overflow-hidden relative">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-20 bottom-0 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20">
                <Brain className="h-3.5 w-3.5 mr-1" />
                CRM Inteligente NXA
              </Badge>
              <Badge variant="outline">Fonte: {source}</Badge>
              <Badge variant="outline">Sync: {lastSync}</Badge>
              <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                Dados isolados por usuário
              </Badge>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight">
              CRM que mostra o próximo movimento comercial.
            </h1>

            <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
              Pipeline, priorização, abordagem, follow-up e inteligência operacional em uma tela limpa para transformar leads em receita.
            </p>

            <div className="grid gap-3 sm:grid-cols-4 mt-6">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                <p className="text-[11px] text-muted-foreground">Pipeline aberto</p>
                <p className="text-xl font-black">{formatCurrency(totalPipeline)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                <p className="text-[11px] text-muted-foreground">Forecast IA</p>
                <p className="text-xl font-black text-emerald-300">{formatCurrency(weightedPipeline)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                <p className="text-[11px] text-muted-foreground">Ativos</p>
                <p className="text-xl font-black">{openDeals}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                <p className="text-[11px] text-muted-foreground">Conversão</p>
                <p className="text-xl font-black">{conversion}%</p>
              </div>
            </div>
          </div>

          <div className="w-full xl:w-[360px] rounded-3xl border border-white/10 bg-black/35 p-5 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-cyan-300" />
              <div>
                <p className="font-black">Inteligência NXA</p>
                <p className="text-xs text-muted-foreground">{aiDiagnosis.confidence}% confiança</p>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-300">Decisão recomendada</p>
              <h3 className="font-black mt-2">{aiDiagnosis.title}</h3>
              <p className="text-xs text-muted-foreground mt-2">{aiDiagnosis.text}</p>
            </div>

            {bestDeal && (
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] text-muted-foreground">Melhor oportunidade agora</p>
                <p className="font-black mt-1 truncate">{bestDeal.title || bestDeal.company_name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Score {inferDealScore(bestDeal)} • {formatCurrency(bestDeal.value)}
                </p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button onClick={importHotLeads} disabled={!userId || loading}>
                <Wand2 className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <Button variant="outline" onClick={createQuickDeal} disabled={!userId}>
                <Plus className="h-4 w-4 mr-2" />
                Criar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex gap-3 text-red-300">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-bold">CRM indisponível</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard title="Pipeline aberto" value={formatCurrency(totalPipeline)} description="Valor em negociação" icon={<CircleDollarSign className="h-5 w-5" />} active />
        <MetricCard title="Forecast IA" value={formatCurrency(weightedPipeline)} description="Ponderado por etapa" icon={<Brain className="h-5 w-5" />} />
        <MetricCard title="Negócios ativos" value={openDeals} description="Oportunidades abertas" icon={<Target className="h-5 w-5" />} />
        <MetricCard title="Receita ganha" value={formatCurrency(wonRevenue)} description="Fechamentos realizados" icon={<CheckCircle2 className="h-5 w-5" />} />
        <MetricCard title="Leads quentes" value={hotLeads} description="Prontos para importar" icon={<Flame className="h-5 w-5" />} />
        <MetricCard title="Faltam no CRM" value={missingFromCrm} description="Leads bons fora do funil" icon={<Users className="h-5 w-5" />} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <ExpandHeader
          title="Pipeline executivo"
          subtitle="Resumo por etapa com valor, volume e probabilidade."
          open={expanded.pipeline}
          onClick={() => setExpanded((prev) => ({ ...prev, pipeline: !prev.pipeline }))}
          icon={<BarChart3 className="h-5 w-5" />}
        />

        {expanded.pipeline && (
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6 mt-4">
            {stageStats.map((stage) => (
              <button
                key={stage.id}
                type="button"
                onClick={() => setSelectedStage(stage.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  selectedStage === stage.id
                    ? "border-cyan-400/35 bg-cyan-500/10"
                    : "border-white/10 bg-black/20 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm">{stage.label}</p>
                  <Badge variant="outline">{stage.cards.length}</Badge>
                </div>
                <p className="text-xl font-black mt-3">{formatCurrency(stage.value)}</p>
                <div className="mt-3">
                  <ProgressBar value={stage.probability} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">{stage.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
              <div>
                <h2 className="font-black">Central de oportunidades do CRM</h2>
                <p className="text-xs text-muted-foreground">Cards inteligentes com próxima ação, pitch e follow-up.</p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant={viewMode === "command" ? "default" : "outline"} size="sm" onClick={() => setViewMode("command")}>
                  <Sparkles className="h-4 w-4 mr-1" />
                  IA
                </Button>
                <Button variant={viewMode === "kanban" ? "default" : "outline"} size="sm" onClick={() => setViewMode("kanban")}>
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  Kanban
                </Button>
                <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
                  <ListChecks className="h-4 w-4 mr-1" />
                  Lista
                </Button>
              </div>
            </div>

            <div className="grid gap-2 xl:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar empresa, telefone, cidade, segmento, etapa ou próxima ação..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9 bg-black/20"
                />
              </div>
              <Select value={selectedStage} onValueChange={(value) => setSelectedStage(value as StageId | "all")}>
                <SelectTrigger className="bg-black/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stageOptions.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredCards.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              {loading ? "Carregando oportunidades..." : "Nenhuma oportunidade encontrada. Importe leads quentes ou crie um novo negócio."}
              {!loading && (
                <div className="mt-4 flex justify-center gap-2">
                  <Button onClick={importHotLeads} disabled={!userId}>Importar leads</Button>
                  <Button variant="outline" onClick={createQuickDeal} disabled={!userId}>Criar manual</Button>
                </div>
              )}
            </div>
          ) : viewMode === "kanban" ? (
            <div className="p-4 overflow-x-auto">
              <div className="grid gap-3 xl:grid-cols-6 min-w-[1100px]">
                {STAGES.map((stage) => {
                  const stageCards = filteredCards.filter((card) => (card.stage || "prospecting") === stage.id);
                  return (
                    <div key={stage.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div>
                          <p className="font-black text-sm">{stage.label}</p>
                          <p className="text-[10px] text-muted-foreground">{stageCards.length} card(s)</p>
                        </div>
                        <Badge variant="outline">{stage.probability}%</Badge>
                      </div>
                      <div className="space-y-3">
                        {stageCards.slice(0, 6).map((card) => (
                          <DealCard
                            key={card.id}
                            card={card}
                            onMove={moveDeal}
                            onDelete={deleteDeal}
                            onCopyPitch={copyPitch}
                            onCreateFollowup={createFollowup}
                            onSelect={selectDeal}
                          />
                        ))}
                        {stageCards.length > 6 && (
                          <p className="text-xs text-muted-foreground text-center">+{stageCards.length - 6} oportunidade(s)</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : viewMode === "list" ? (
            <div className="divide-y divide-white/10">
              {filteredCards.map((card) => {
                const score = inferDealScore(card);
                const wa = whatsappLink(card);
                return (
                  <div key={card.id} className="p-4 hover:bg-white/[0.03] transition-colors">
                    <div className="grid gap-4 xl:grid-cols-[1.2fr_.5fr_.5fr_.6fr_auto] xl:items-center">
                      <div className="min-w-0">
                        <p className="font-black truncate">{card.title || card.company_name || "Negócio sem nome"}</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {card.city || "Cidade não informada"} • {card.segment || "Sem segmento"} • atualizado {formatDateTime(card.updated_at || card.created_at)}
                        </p>
                      </div>
                      <Badge variant="outline">{formatCurrency(card.value)}</Badge>
                      <Badge className={getPriorityClass(String(card.priority || getPriority(score)))}>{score}/100</Badge>
                      <Select value={card.stage || "prospecting"} onValueChange={(value) => moveDeal(card.id, value as StageId)}>
                        <SelectTrigger className="h-8 text-xs bg-black/20"><SelectValue /></SelectTrigger>
                        <SelectContent>{STAGES.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyPitch(card)}><Copy className="h-4 w-4" /></Button>
                        {wa && <a href={wa} target="_blank" rel="noreferrer"><Button size="sm"><MessageCircle className="h-4 w-4" /></Button></a>}
                        <Button variant="outline" size="sm" onClick={() => createFollowup(card)}><CalendarCheck className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[...filteredCards]
                .sort((a, b) => inferDealScore(b) - inferDealScore(a))
                .map((card) => (
                  <DealCard
                    key={card.id}
                    card={card}
                    onMove={moveDeal}
                    onDelete={deleteDeal}
                    onCopyPitch={copyPitch}
                    onCreateFollowup={createFollowup}
                    onSelect={selectDeal}
                  />
                ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
            <ExpandHeader
              title="Copilot comercial"
              subtitle="Orientação prática para o vendedor agir agora."
              open={expanded.intelligence}
              onClick={() => setExpanded((prev) => ({ ...prev, intelligence: !prev.intelligence }))}
              icon={<Sparkles className="h-5 w-5" />}
            />

            {expanded.intelligence && (
              <div className="space-y-3 text-sm mt-4">
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-300">Agora</p>
                  <p className="font-bold mt-1">{aiDiagnosis.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{aiDiagnosis.text}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  {urgentDeals} oportunidade(s) de alta prioridade precisam de contato.
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  {hotLeads} lead(s) quentes disponíveis para virar pipeline.
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  Forecast ponderado: {formatCurrency(weightedPipeline)}.
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-black mb-3">Rotina de venda do dia</h2>
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-300 flex items-center justify-center"><Wand2 className="h-4 w-4" /></div>
                <div><p className="text-sm font-bold">Importar leads quentes</p><p className="text-xs text-muted-foreground">Transformar base em oportunidades.</p></div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-300 flex items-center justify-center"><Send className="h-4 w-4" /></div>
                <div><p className="text-sm font-bold">Enviar pitch consultivo</p><p className="text-xs text-muted-foreground">Começar pelo score mais alto.</p></div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-300 flex items-center justify-center"><CalendarCheck className="h-4 w-4" /></div>
                <div><p className="text-sm font-bold">Criar follow-up</p><p className="text-xs text-muted-foreground">Não deixar oportunidade esfriar.</p></div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-black mb-3">Ações rápidas</h2>
            <div className="space-y-2">
              <Button onClick={importHotLeads} className="w-full justify-between" disabled={!userId || loading}>
                Importar leads score 65+
                <Flame className="h-4 w-4" />
              </Button>
              <Button onClick={createQuickDeal} variant="outline" className="w-full justify-between" disabled={!userId}>
                Criar negócio manual
                <Plus className="h-4 w-4" />
              </Button>
              <Link href="/leads">
                <Button variant="outline" className="w-full justify-between">
                  Central de oportunidades
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/busca">
                <Button variant="outline" className="w-full justify-between">
                  Nova busca inteligente
                  <Search className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-black mb-3">Saúde do CRM</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Organização</span><span>{Math.min(100, 50 + openDeals * 5)}%</span></div>
                <ProgressBar value={Math.min(100, 50 + openDeals * 5)} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Velocidade</span><span>{Math.min(100, 40 + urgentDeals * 12)}%</span></div>
                <ProgressBar value={Math.min(100, 40 + urgentDeals * 12)} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Potencial</span><span>{Math.min(100, Math.round(weightedPipeline / 100))}%</span></div>
                <ProgressBar value={Math.min(100, Math.round(weightedPipeline / 100))} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Crm;
