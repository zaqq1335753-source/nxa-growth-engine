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
  ArrowUpRight,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Flame,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Users,
  Wand2,
} from "lucide-react";

const DEFAULT_BUSINESS_ID = "NEXA_PROD_01";

type StageId =
  | "prospecting"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

const STAGES = [
  { id: "prospecting", label: "Prospecção", probability: 10 },
  { id: "qualified", label: "Qualificado", probability: 30 },
  { id: "proposal", label: "Proposta", probability: 55 },
  { id: "negotiation", label: "Negociação", probability: 75 },
  { id: "won", label: "Ganho", probability: 100 },
  { id: "lost", label: "Perdido", probability: 0 },
] as const;

const PRIORITIES = {
  low: "Baixa",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
} as const;

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

function formatCurrency(value: any) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getScore(lead: any) {
  const score = Number(lead?.nxa_score ?? lead?.nxaScore ?? lead?.score ?? 0);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getStage(stage: any) {
  return STAGES.find((item) => item.id === stage) || STAGES[0];
}

function getPriorityClass(priority: string) {
  if (priority === "urgent")
    return "bg-red-500/10 text-red-400 border-red-500/20";
  if (priority === "high")
    return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  if (priority === "low")
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  return "bg-muted text-muted-foreground border-border";
}

function leadKey(value: any) {
  return [
    String(value?.phone || "").replace(/\D/g, ""),
    String(value?.title || value?.company_name || value?.name || "")
      .trim()
      .toLowerCase(),
    String(value?.city || "").trim().toLowerCase(),
  ].join("|");
}

function makeDealFromLead(lead: any, businessId: string, userId: string) {
  const score = getScore(lead);

  return {
    user_id: userId,
    business_id: businessId,
    lead_id: lead.id || null,
    title: cleanText(lead.name) || "Lead sem nome",
    company_name: cleanText(lead.name) || "Lead sem nome",
    phone: cleanText(lead.phone),
    city: cleanText(lead.city),
    state: cleanText(lead.state),
    segment: cleanText(lead.segment) || cleanText(lead.category) || "Sem segmento",
    stage: score >= 80 ? "qualified" : "prospecting",
    value: score >= 80 ? 997 : score >= 60 ? 497 : 297,
    probability: score >= 80 ? 40 : 15,
    priority: score >= 90 ? "urgent" : score >= 75 ? "high" : "normal",
    source: "lead_import",
    notes: `Importado da base de leads. NXA Score: ${score}.`,
    next_action: "Enviar primeira abordagem pelo WhatsApp",
    next_action_date: null,
    updated_at: new Date().toISOString(),
  };
}

function MetricCard({ title, value, description, icon }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
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

export function Crm() {
  const [cards, setCards] = React.useState<any[]>([]);
  const [leads, setLeads] = React.useState<any[]>([]);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [source, setSource] = React.useState<"Supabase" | "Offline">("Supabase");
  const [lastSync, setLastSync] = React.useState("—");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

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
          .order("created_at", { ascending: false }),

        supabase
          .from("leads")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(500),
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

  async function moveDeal(id: string, stageId: StageId) {
    if (!userId) return;

    const stage = getStage(stageId);

    const { error } = await supabase
      .from("crm_cards")
      .update({
        stage: stageId,
        probability: stage.probability,
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
      return;
    }

    setCards((prev) =>
      prev.map((card) =>
        card.id === id
          ? { ...card, stage: stageId, probability: stage.probability }
          : card
      )
    );
  }

  async function deleteDeal(id: string) {
    if (!userId) return;

    const { error } = await supabase
      .from("crm_cards")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Erro ao remover card",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setCards((prev) => prev.filter((card) => card.id !== id));
    toast({ title: "Card removido" });
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
      .filter((lead) => getScore(lead) >= 70)
      .sort((a, b) => getScore(b) - getScore(a))
      .map((lead) => makeDealFromLead(lead, businessId, userId))
      .filter((deal) => !existing.has(leadKey(deal)))
      .slice(0, 50);

    if (!payload.length) {
      toast({
        title: "Nada novo para importar",
        description: "Os leads quentes já estão no CRM.",
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
      title: "Leads importados",
      description: `${payload.length} oportunidade(s) adicionada(s).`,
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

    const { error } = await supabase.from("crm_cards").insert({
      user_id: userId,
      business_id: businessId,
      title: "Nova oportunidade",
      company_name: "Nova oportunidade",
      stage: "prospecting",
      value: 497,
      probability: 10,
      priority: "normal",
      source: "manual",
      next_action: "Realizar primeiro contato",
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast({
        title: "Erro ao criar negócio",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Nova oportunidade criada" });
    await loadData();
  }

  const filteredCards = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cards;

    return cards.filter((card) =>
      [
        card.title,
        card.company_name,
        card.phone,
        card.city,
        card.segment,
        card.stage,
        card.next_action,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [cards, search]);

  const totalPipeline = cards
    .filter((card) => !["won", "lost"].includes(card.stage))
    .reduce((acc, card) => acc + Number(card.value || 0), 0);

  const wonRevenue = cards
    .filter((card) => card.stage === "won")
    .reduce((acc, card) => acc + Number(card.value || 0), 0);

  const openDeals = cards.filter(
    (card) => !["won", "lost"].includes(card.stage)
  ).length;

  const urgentDeals = cards.filter((card) =>
    ["urgent", "high"].includes(String(card.priority))
  ).length;

  const conversion = cards.length
    ? Math.round(
        (cards.filter((card) => card.stage === "won").length / cards.length) *
          100
      )
    : 0;

  const hotLeads = leads.filter((lead) => getScore(lead) >= 80).length;

  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-3xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/10 via-white/[0.03] to-transparent p-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                NXA CRM Command
              </Badge>
              <Badge variant="outline">Fonte: {source}</Badge>
              <Badge variant="outline">Sync: {lastSync}</Badge>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <Activity className="h-3.5 w-3.5 mr-1" />
                Ativo
              </Badge>
            </div>

            <h1 className="text-3xl font-black tracking-tight">
              CRM comercial inteligente
            </h1>

            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Visão limpa das oportunidades, etapas, prioridade e próxima ação
              comercial apenas do usuário logado.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>

            <Button variant="outline" onClick={importHotLeads} disabled={!userId}>
              <Wand2 className="h-4 w-4 mr-2" />
              Importar leads quentes
            </Button>

            <Button onClick={createQuickDeal} disabled={!userId}>
              <Plus className="h-4 w-4 mr-2" />
              Novo negócio
            </Button>
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

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Pipeline aberto"
          value={formatCurrency(totalPipeline)}
          description="Valor em negociação"
          icon={<CircleDollarSign className="h-5 w-5" />}
        />

        <MetricCard
          title="Negócios ativos"
          value={openDeals}
          description="Oportunidades abertas"
          icon={<Target className="h-5 w-5" />}
        />

        <MetricCard
          title="Receita ganha"
          value={formatCurrency(wonRevenue)}
          description="Fechamentos realizados"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <MetricCard
          title="Conversão"
          value={`${conversion}%`}
          description="Ganho sobre total"
          icon={<TrendingUp className="h-5 w-5" />}
        />

        <MetricCard
          title="Leads quentes"
          value={hotLeads}
          description="Score acima de 80"
          icon={<Flame className="h-5 w-5" />}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold">Pipeline compacto</h2>
            <p className="text-xs text-muted-foreground">
              Resumo por etapa sem ocupar a tela inteira.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {STAGES.map((stage) => {
            const stageCards = cards.filter(
              (card) => (card.stage || "prospecting") === stage.id
            );

            const stageValue = stageCards.reduce(
              (acc, card) => acc + Number(card.value || 0),
              0
            );

            return (
              <div
                key={stage.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm">{stage.label}</p>
                  <Badge variant="outline">{stageCards.length}</Badge>
                </div>

                <p className="text-xl font-black mt-3">
                  {formatCurrency(stageValue)}
                </p>

                <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400"
                    style={{
                      width: `${Math.min(100, stage.probability)}%`,
                    }}
                  />
                </div>

                <p className="text-[11px] text-muted-foreground mt-2">
                  {stage.probability}% probabilidade
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_.7fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empresa, telefone, cidade, segmento, etapa ou próxima ação..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9 bg-black/20"
              />
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {filteredCards.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {loading
                  ? "Carregando oportunidades..."
                  : "Nenhuma oportunidade encontrada para este usuário."}
              </div>
            ) : (
              filteredCards.map((card) => {
                const priority = String(card.priority || "normal");

                return (
                  <div
                    key={card.id}
                    className="p-4 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="grid gap-4 xl:grid-cols-[1.1fr_.7fr_.7fr_.6fr_auto] xl:items-center">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-cyan-300 shrink-0" />
                          <p className="font-bold truncate">
                            {card.title ||
                              card.company_name ||
                              "Negócio sem nome"}
                          </p>
                        </div>

                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {card.city || "Cidade não informada"} •{" "}
                          {card.segment || "Sem segmento"}
                        </p>

                        {card.phone && (
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {card.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-[11px] text-muted-foreground mb-1">
                          Valor
                        </p>
                        <Badge variant="outline" className="font-bold">
                          {formatCurrency(card.value)}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-[11px] text-muted-foreground mb-1">
                          Prioridade
                        </p>
                        <Badge className={getPriorityClass(priority)}>
                          {PRIORITIES[priority as keyof typeof PRIORITIES] ||
                            "Normal"}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-[11px] text-muted-foreground mb-1">
                          Etapa
                        </p>
                        <Select
                          value={card.stage || "prospecting"}
                          onValueChange={(value) =>
                            moveDeal(card.id, value as StageId)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs bg-black/20">
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

                      <div className="flex items-center gap-2">
                        <Link href={`/leads/${card.lead_id || card.id}`}>
                          <Button variant="outline" size="sm">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteDeal(card.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-[11px] text-muted-foreground">
                        Próxima ação
                      </p>
                      <p className="text-xs mt-1">
                        {card.next_action ||
                          "Definir próxima ação comercial para este negócio."}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-cyan-300" />
              <h2 className="font-bold">Inteligência NXA</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                {urgentDeals} oportunidade(s) de alta prioridade precisam de
                contato.
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                {hotLeads} lead(s) quentes disponíveis para importar.
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                Receita potencial aberta: {formatCurrency(totalPipeline)}.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-bold mb-3">Ações rápidas</h2>

            <div className="space-y-2">
              <Button
                onClick={importHotLeads}
                className="w-full justify-between"
                disabled={!userId}
              >
                Importar leads score 70+
                <Flame className="h-4 w-4" />
              </Button>

              <Link href="/leads">
                <Button variant="outline" className="w-full justify-between">
                  Abrir base de leads
                  <Users className="h-4 w-4" />
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
        </div>
      </div>
    </div>
  );
}

export default Crm;