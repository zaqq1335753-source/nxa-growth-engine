import * as React from "react";
import { useRoute, Link } from "wouter";
import {
  ArrowLeft,
  Building2,
  Phone,
  MapPin,
  Globe,
  Star,
  Flame,
  Thermometer,
  Snowflake,
  Sparkles,
  MessageCircle,
  Save,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = [
  { value: "new", label: "Novo" },
  { value: "contacted", label: "Contatado" },
  { value: "proposal", label: "Proposta" },
  { value: "negotiating", label: "Negociando" },
  { value: "closed", label: "Fechado" },
  { value: "lost", label: "Perdido" },
];

function getScore(lead: any) {
  return Number(lead?.nxa_score ?? lead?.nxaScore ?? lead?.score ?? 0);
}

function getScoreColor(score: number) {
  if (score >= 81) return "text-red-400";
  if (score >= 61) return "text-orange-400";
  if (score >= 41) return "text-yellow-400";
  return "text-blue-400";
}

function getScoreIcon(score: number) {
  if (score >= 61) return <Flame className="h-5 w-5" />;
  if (score >= 41) return <Thermometer className="h-5 w-5" />;
  return <Snowflake className="h-5 w-5" />;
}

function getCommercialTemperature(score: number) {
  if (score >= 81) return "Muito quente";
  if (score >= 61) return "Quente";
  if (score >= 41) return "Morno";
  return "Frio";
}

export function LeadProfile() {
  const [, params] = useRoute("/leads/:id");
  const id = params?.id;
  const { toast } = useToast();

  const [lead, setLead] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState("new");
  const [notes, setNotes] = React.useState("");

  async function loadLead() {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data: authData } = await supabase.auth.getSession();

      if (!authData.session) {
        setLead(null);
        return;
      }

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      setLead(data);
      setStatus(data?.status || "new");
      setNotes(data?.notes || "");
    } catch (error: any) {
      console.error("Erro ao buscar lead:", error);

      toast({
        title: "Erro ao carregar lead.",
        description: error?.message || "Não foi possível buscar este lead.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadLead();
  }, [id]);

  async function saveLead() {
    if (!id) return;

    setSaving(true);

    try {
      const { data: authData } = await supabase.auth.getSession();

      if (!authData.session) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const { error } = await supabase
        .from("leads")
        .update({
          status,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Lead atualizado.",
        description: "Status e observações foram salvos.",
      });

      await loadLead();
    } catch (error: any) {
      console.error("Erro ao salvar lead:", error);

      toast({
        title: "Erro ao salvar.",
        description:
          error?.message ||
          "Se der erro em updated_at ou notes, adicione essas colunas no Supabase.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-muted-foreground">Carregando lead...</div>;
  }

  if (!lead) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">Lead não encontrado.</p>

        <Link href="/leads">
          <span className="text-sm font-bold cursor-pointer">← Voltar</span>
        </Link>
      </div>
    );
  }

  const score = getScore(lead);
  const temperature = getCommercialTemperature(score);
  const whatsapp = String(lead.phone || "").replace(/\D/g, "");
  const whatsappUrl = whatsapp
    ? `https://wa.me/55${whatsapp.replace(/^55/, "")}?text=${encodeURIComponent(
        `Olá, tudo bem? Vi a empresa ${lead.name} e queria te apresentar uma solução para automatizar atendimento e captar mais clientes.`
      )}`
    : "";

  return (
    <div className="space-y-6">
      <Link href="/leads">
        <button className="text-sm font-bold text-cyan-400 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Leads
        </button>
      </Link>

      <div className="rounded-2xl border border-cyan-500/20 bg-card/50 p-6">
        <div className="flex items-start justify-between gap-4 flex-col lg:flex-row">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Building2 className="h-5 w-5" />
              <span className="text-xs font-bold uppercase">
                Perfil comercial do Lead
              </span>
            </div>

            <h1 className="text-3xl font-bold">
              {lead.name || "Lead sem nome"}
            </h1>

            <p className="text-muted-foreground mt-1">
              {lead.segment || lead.category || "Segmento não informado"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">NXA Score</p>

            <div
              className={`flex items-center gap-2 text-4xl font-black ${getScoreColor(
                score
              )}`}
            >
              {getScoreIcon(score)}
              {score}
            </div>

            <p className="text-xs text-muted-foreground mt-1">{temperature}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card/50 p-5 space-y-4 lg:col-span-2">
          <h2 className="font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            Análise da IA
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Este lead está classificado como{" "}
            <strong className={getScoreColor(score)}>{temperature}</strong>.{" "}
            {score >= 80
              ? "Priorize contato imediato, pois o perfil demonstra alta chance comercial."
              : score >= 60
              ? "Boa oportunidade para abordagem consultiva e envio de proposta."
              : "Pode ser trabalhado em campanha de nutrição ou abordagem futura."}
          </p>

          <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-4 text-sm">
            Sugestão: oferecer automação de atendimento, recuperação de leads,
            follow-up inteligente, agenda automática e relatório comercial.
          </div>

          <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-4 text-sm">
            Abordagem recomendada: mostrar perda de vendas por demora no
            WhatsApp e apresentar a NXA como atendimento 24h.
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-5 space-y-4">
          <h2 className="font-bold">Ações rápidas</h2>

          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <button className="w-full rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold py-2 flex items-center justify-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Chamar no WhatsApp
              </button>
            </a>
          ) : (
            <button
              disabled
              className="w-full rounded-lg bg-muted text-muted-foreground font-bold py-2"
            >
              Sem WhatsApp
            </button>
          )}

          <button
            onClick={saveLead}
            disabled={saving}
            className="w-full rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold py-2 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card/50 p-5 space-y-4">
          <h2 className="font-bold">Informações principais</h2>

          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-cyan-400" />
              {lead.phone || "Telefone não informado"}
            </p>

            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-400" />
              {lead.city || "Cidade não informada"}{" "}
              {lead.state ? `- ${lead.state}` : ""}
            </p>

            <p className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              {lead.rating || "Sem avaliação"}
            </p>

            <p className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400" />
              {lead.website || "Site não informado"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-5 space-y-4">
          <h2 className="font-bold">CRM do Lead</h2>

          <div>
            <label className="text-xs text-muted-foreground">Status</label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg bg-background border border-border px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Observações</label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: falou pelo WhatsApp, pediu proposta, retornar amanhã..."
              className="mt-1 w-full min-h-28 rounded-lg bg-background border border-border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadProfile;