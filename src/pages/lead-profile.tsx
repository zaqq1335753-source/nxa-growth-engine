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
  Brain,
  ShieldCheck,
  SearchCheck,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  Target,
  Send,
  Copy,
  Users,
  BarChart3,
  BadgeCheck,
  Activity,
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

type InstagramProfile = {
  username?: string;
  full_name?: string;
  biography?: string;
  followers?: number;
  following?: number;
  posts_count?: number;
  is_verified?: boolean;
  is_business_account?: boolean;
  external_url?: string;
  profile_pic_url?: string;
  url?: string;
};

type InstagramIntelligence = {
  found?: boolean;
  username?: string;
  source_url?: string;
  error?: string;
  profile?: InstagramProfile | null;
  raw?: any;
};

type LeadIntelligence = {
  id?: string;
  lead_id?: string;
  score?: number;
  status?: string;
  ai_summary?: string;
  approach_message?: string;
  opportunities?: string[];
  missing_items?: string[];
  objections?: string[];
  cnpj?: string;
  cnpj_data?: {
    cnpj?: string;
    razao_social?: string;
    nome_fantasia?: string;
    situacao?: string;
    descricao_situacao_cadastral?: string;
    porte?: string;
    descricao_porte?: string;
    cnae_fiscal_descricao?: string;
    data_inicio_atividade?: string;
    municipio?: string;
    uf?: string;
    nxa_resolution?: {
      formatted_cnpj?: string;
      source?: string;
      confidence?: number;
      error?: string;
    };
  } | null;
  website_scan?: {
    ok?: boolean;
    url?: string;
    status?: number;
    has_site?: boolean;
    has_website?: boolean;
    has_ssl?: boolean;
    has_whatsapp?: boolean;
    has_instagram?: boolean;
    has_facebook?: boolean;
    has_tiktok?: boolean;
    has_linkedin?: boolean;
    has_youtube?: boolean;
    has_form?: boolean;
    has_contact_form?: boolean;
    has_meta_pixel?: boolean;
    has_google_analytics?: boolean;
    has_google_tag_manager?: boolean;
    has_online_scheduling?: boolean;
    performance_status?: string;
    scanned_url?: string;
    cnpj_resolution?: {
      formatted_cnpj?: string;
      source?: string;
      confidence?: number;
    };
    cnpj_search_results?: Array<{ title?: string; url?: string; content?: string }>;
    social_intelligence?: {
      instagram?: InstagramIntelligence | null;
    };
  } | null;
  social_links?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    instagram_profile?: InstagramProfile | null;
  } | null;
  created_at?: string;
  updated_at?: string;
};

function getScore(lead: any, intelligence?: LeadIntelligence | null) {
  return Number(
    intelligence?.score ?? lead?.nxa_score ?? lead?.nxaScore ?? lead?.score ?? 0
  );
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

function getLeadAddress(lead: any) {
  return (
    lead?.address ||
    lead?.formatted_address ||
    [lead?.city, lead?.state].filter(Boolean).join(" - ") ||
    "Endereço não informado"
  );
}

function normalizeWebsite(url?: string | null) {
  if (!url) return "";
  const value = String(url).trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

function getLeadField(lead: any, keys: string[]) {
  for (const key of keys) {
    const value = lead?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
}

function getLeadName(lead: any) {
  return String(getLeadField(lead, ["name", "title", "business_name", "company_name", "lead_name"]));
}

function getLeadPhone(lead: any) {
  return String(getLeadField(lead, ["phone", "formatted_phone_number", "international_phone_number", "lead_phone"]));
}

function getLeadWebsite(lead: any) {
  return String(getLeadField(lead, ["website", "url", "site", "lead_website"]));
}

function getLeadCity(lead: any) {
  return String(getLeadField(lead, ["city", "municipio", "lead_city"]));
}

function getLeadState(lead: any) {
  return String(getLeadField(lead, ["state", "uf", "lead_state"]));
}

function getLeadCategory(lead: any) {
  return String(getLeadField(lead, ["segment", "category", "type", "lead_category"]));
}

function sourceLabel(source?: string) {
  if (source === "manual") return "Manual";
  if (source === "site") return "Site do lead";
  if (source === "web_search") return "Busca web";
  if (source === "not_found") return "Não encontrado";
  return source || "Não informado";
}

function formatNumber(value?: number | string | null) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return "0";
  return new Intl.NumberFormat("pt-BR").format(number);
}

function socialDiagnosis(profile?: InstagramProfile | null) {
  if (!profile) return [];

  const items: string[] = [];

  if (!profile.biography) items.push("Bio ausente ou não identificada");
  if (!profile.external_url) items.push("Sem link externo na bio");
  if (!profile.is_business_account) items.push("Conta comercial não identificada");
  if (Number(profile.followers || 0) > 1000) items.push("Boa base de audiência para campanhas e reativação");
  if (Number(profile.posts_count || 0) < 10) items.push("Poucos posts identificados");

  return items;
}

function BooleanSignal({ value, label }: { value?: boolean; label: string }) {
  return (
    <div className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-cyan-400/[0.04] hover:shadow-[0_0_24px_rgba(34,211,238,0.08)]">
      <span className="text-slate-300 transition-colors group-hover:text-white">{label}</span>
      {value ? (
        <span className="flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-xs font-black text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" /> Sim
        </span>
      ) : (
        <span className="flex items-center gap-1 rounded-full border border-red-400/20 bg-red-400/10 px-2 py-0.5 text-xs font-black text-red-300">
          <XCircle className="h-3.5 w-3.5" /> Não
        </span>
      )}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.08)]">
      {children}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
      {text}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
  accent = "cyan",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: "cyan" | "pink" | "emerald" | "orange" | "blue" | "purple";
}) {
  const accentMap = {
    cyan: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
    pink: "bg-pink-400/10 text-pink-300 border-pink-400/20",
    emerald: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    orange: "bg-orange-400/10 text-orange-300 border-orange-400/20",
    blue: "bg-blue-400/10 text-blue-300 border-blue-400/20",
    purple: "bg-violet-400/10 text-violet-300 border-violet-400/20",
  };

  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/25 hover:bg-white/[0.055]">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl border ${accentMap[accent]}`}>
        {icon}
      </div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black tracking-tight text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}



export function LeadProfile() {
  const [, params] = useRoute("/leads/:id");
  const id = params?.id;
  const { toast } = useToast();

  const [lead, setLead] = React.useState<any>(null);
  const [intelligence, setIntelligence] = React.useState<LeadIntelligence | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);
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

      await loadIntelligence(id);
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

  async function loadIntelligence(leadId: string) {
    try {
      const { data, error } = await supabase
        .from("lead_intelligence")
        .select("*")
        .eq("lead_id", leadId)
        .maybeSingle();

      if (error) {
        console.warn("Inteligência ainda não configurada:", error.message);
        setIntelligence(null);
        return;
      }

      setIntelligence(data as LeadIntelligence | null);
    } catch (error) {
      console.warn("Tabela lead_intelligence ainda não existe ou está sem permissão.", error);
      setIntelligence(null);
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

  async function analyzeLead() {
    if (!id || !lead) return;

    setAnalyzing(true);

    try {
      const { data: authData } = await supabase.auth.getSession();

      if (!authData.session) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const { data, error } = await supabase.functions.invoke("analyze-lead", {
        body: {
          lead_id: id,
          lead_name: getLeadName(lead),
          lead_phone: getLeadPhone(lead),
          lead_website: getLeadWebsite(lead),
          lead_category: getLeadCategory(lead),
          lead_city: getLeadCity(lead),
          lead_state: getLeadState(lead),
          address: getLeadAddress(lead),
          rating: lead.rating,
          reviews_count: lead.reviews_count || lead.user_ratings_total,
          cnpj: lead.cnpj || "",
        },
      });

      if (error) throw error;

      if (data?.intelligence) {
        setIntelligence(data.intelligence);
      } else {
        await loadIntelligence(id);
      }

      toast({
        title: "Análise concluída.",
        description: "A inteligência comercial do lead foi atualizada.",
      });
    } catch (error: any) {
      console.error("Erro ao analisar lead:", error);

      toast({
        title: "Inteligência ainda não configurada.",
        description:
          error?.message ||
          "Na próxima etapa vamos criar a tabela e a Edge Function analyze-lead.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  }

  async function copyText(text?: string | null) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    toast({ title: "Copiado.", description: "Texto copiado para a área de transferência." });
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

  const score = getScore(lead, intelligence);
  const temperature = getCommercialTemperature(score);
  const leadName = getLeadName(lead);
  const leadPhone = getLeadPhone(lead);
  const leadWebsite = getLeadWebsite(lead);
  const leadCategory = getLeadCategory(lead);
  const whatsapp = String(leadPhone || "").replace(/\D/g, "");
  const defaultMessage =
    intelligence?.approach_message ||
    `Olá, tudo bem? Vi a empresa ${leadName} e queria te apresentar uma solução para automatizar atendimento e captar mais clientes.`;
  const whatsappUrl = whatsapp
    ? `https://wa.me/55${whatsapp.replace(/^55/, "")}?text=${encodeURIComponent(defaultMessage)}`
    : "";
  const websiteUrl = normalizeWebsite(leadWebsite);
  const cnpj = intelligence?.cnpj_data;
  const cnpjResolution = cnpj?.nxa_resolution || intelligence?.website_scan?.cnpj_resolution;
  const scan = intelligence?.website_scan;
  const socials = intelligence?.social_links || {};
  const instagramIntel = scan?.social_intelligence?.instagram || null;
  const instagramProfile = instagramIntel?.profile || socials.instagram_profile || null;
  const instagramFound = Boolean(instagramIntel?.found || instagramProfile);
  const instagramUrl = instagramProfile?.url || instagramIntel?.source_url || socials.instagram || "";
  const instagramInsights = socialDiagnosis(instagramProfile);

  return (
    <div className="relative space-y-6 pb-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.10),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(236,72,153,0.10),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(2,6,23,1))]" />
      <Link href="/leads">
        <button className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-bold text-cyan-300 transition-all hover:-translate-x-1 hover:border-cyan-400/30 hover:bg-cyan-400/10">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Leads
        </button>
      </Link>

      <div className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#050914]/85 p-6 shadow-[0_0_60px_rgba(34,211,238,0.08)] backdrop-blur-xl">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(236,72,153,0.12),transparent_28%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        <div className="relative flex items-start justify-between gap-4 flex-col lg:flex-row">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Building2 className="h-5 w-5" />
              <span className="text-xs font-bold uppercase">Perfil comercial do Lead</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">{leadName || "Lead sem nome"}</h1>

            <p className="text-muted-foreground mt-1">
              {leadCategory || "Segmento não informado"}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              <Pill>{temperature}</Pill>
              <Pill>{intelligence ? "IA analisada" : "IA pendente"}</Pill>
              {(cnpj?.situacao || cnpj?.descricao_situacao_cadastral) && <Pill>CNPJ {cnpj.situacao || cnpj.descricao_situacao_cadastral}</Pill>}
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">NXA Score</p>

            <div className={`flex items-center gap-2 text-4xl font-black ${getScoreColor(score)}`}>
              {getScoreIcon(score)}
              {score}
            </div>

            <p className="text-xs text-muted-foreground mt-1">{temperature}</p>
          </div>
        </div>
      </div>

      {instagramProfile ? (
        <div className="relative overflow-hidden rounded-3xl border border-pink-400/25 bg-[#070711]/85 p-6 shadow-[0_0_70px_rgba(236,72,153,0.10)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(236,72,153,0.22),transparent_28%),radial-gradient(circle_at_70%_0%,rgba(34,211,238,0.12),transparent_26%)]" />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.3fr_2fr]">
            <div className="flex items-start gap-4">
              {instagramProfile.profile_pic_url ? (
                <img
                  src={instagramProfile.profile_pic_url}
                  alt={instagramProfile.username || "Instagram"}
                  className="h-24 w-24 rounded-full border-2 border-pink-400/60 object-cover shadow-[0_0_34px_rgba(236,72,153,0.22)]"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-pink-400/60 bg-pink-400/10">
                  <Instagram className="h-10 w-10 text-pink-300" />
                </div>
              )}

              <div className="min-w-0">
                <div className="mb-2 inline-flex rounded-full border border-pink-400/25 bg-pink-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-pink-200">
                  Social Intelligence
                </div>
                <h2 className="break-all text-2xl font-black text-white md:text-3xl">
                  @{instagramProfile.username || instagramIntel?.username || "perfil"}
                </h2>
                <p className="mt-1 text-sm text-slate-400">{instagramProfile.full_name || "Nome não informado"}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {instagramProfile.is_verified ? <Pill><BadgeCheck className="h-3 w-3" /> Verificado</Pill> : null}
                  {instagramProfile.is_business_account ? <Pill><Building2 className="h-3 w-3" /> Conta comercial</Pill> : null}
                  <Pill><Activity className="h-3 w-3" /> Apify analisado</Pill>
                </div>

                {instagramUrl ? (
                  <a href={instagramUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-pink-200 hover:text-pink-100">
                    Abrir Instagram <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard icon={<Users className="h-5 w-5" />} label="Seguidores" value={formatNumber(instagramProfile.followers)} hint="Público total" accent="purple" />
              <MetricCard icon={<Users className="h-5 w-5" />} label="Seguindo" value={formatNumber(instagramProfile.following)} hint="Conexões" accent="orange" />
              <MetricCard icon={<BarChart3 className="h-5 w-5" />} label="Posts" value={formatNumber(instagramProfile.posts_count)} hint="Publicações" accent="emerald" />
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#070b12]/75 p-5 space-y-4 lg:col-span-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/25">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-bold flex items-center gap-2">
              <Brain className="h-4 w-4 text-cyan-400" />
              Inteligência Comercial IA
            </h2>

            <button
              onClick={analyzeLead}
              disabled={analyzing}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 font-black text-cyan-200 transition-all hover:-translate-y-0.5 hover:bg-cyan-400/15 hover:shadow-[0_0_24px_rgba(34,211,238,0.14)] disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${analyzing ? "animate-spin" : ""}`} />
              {analyzing ? "Analisando..." : intelligence ? "Reanalisar com IA" : "Analisar com IA"}
            </button>
          </div>

          {intelligence?.ai_summary ? (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {intelligence.ai_summary}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              Este lead está classificado como <strong className={getScoreColor(score)}>{temperature}</strong>. Clique em
              <strong> Analisar com IA </strong>para gerar diagnóstico com CNPJ, site, redes sociais,
              oportunidades, pontos ausentes e mensagem de abordagem.
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm transition-all hover:-translate-y-0.5 hover:bg-cyan-400/[0.13]">
              <div className="font-bold text-cyan-300 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" /> Oportunidades detectadas
              </div>
              {intelligence?.opportunities?.length ? (
                <ul className="space-y-2 text-muted-foreground">
                  {intelligence.opportunities.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-muted-foreground">Aguardando análise da IA.</span>
              )}
            </div>

            <div className="rounded-2xl border border-orange-400/20 bg-orange-400/10 p-4 text-sm transition-all hover:-translate-y-0.5 hover:bg-orange-400/[0.13]">
              <div className="font-bold text-orange-300 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Pontos ausentes
              </div>
              {intelligence?.missing_items?.length ? (
                <ul className="space-y-2 text-muted-foreground">
                  {intelligence.missing_items.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-muted-foreground">Aguardando scanner do site.</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm transition-all hover:-translate-y-0.5">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="font-bold text-emerald-300 flex items-center gap-2">
                <Send className="h-4 w-4" /> Abordagem recomendada
              </div>

              <button
                onClick={() => copyText(defaultMessage)}
                className="text-xs font-bold text-emerald-300 flex items-center gap-1"
              >
                <Copy className="h-3 w-3" /> Copiar
              </button>
            </div>
            <p className="text-muted-foreground leading-relaxed">{defaultMessage}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#070b12]/75 p-5 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/25">
          <h2 className="font-bold">Ações rápidas</h2>

          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 py-2.5 font-black text-emerald-200 transition-all hover:-translate-y-0.5 hover:bg-emerald-400/15 hover:shadow-[0_0_24px_rgba(52,211,153,0.12)]">
                <MessageCircle className="h-4 w-4" />
                Chamar no WhatsApp
              </button>
            </a>
          ) : (
            <button disabled className="w-full rounded-lg bg-muted text-muted-foreground font-bold py-2">
              Sem WhatsApp
            </button>
          )}

          {websiteUrl ? (
            <a href={websiteUrl} target="_blank" rel="noreferrer">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-400/10 py-2.5 font-black text-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-400/15">
                <ExternalLink className="h-4 w-4" />
                Abrir site
              </button>
            </a>
          ) : null}

          <button
            onClick={saveLead}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 py-2.5 font-black text-cyan-200 transition-all hover:-translate-y-0.5 hover:bg-cyan-400/15 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#070b12]/75 p-5 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/25">
          <h2 className="font-bold flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-400" /> CNPJ Intelligence
          </h2>

          {cnpj ? (
            <div className="space-y-3 text-sm">
              <p><span className="text-muted-foreground">CNPJ:</span> <strong>{cnpjResolution?.formatted_cnpj || intelligence?.cnpj || cnpj.cnpj || "Não encontrado"}</strong></p>
              <p><span className="text-muted-foreground">Razão social:</span> <strong>{cnpj.razao_social || "Não informado"}</strong></p>
              <p><span className="text-muted-foreground">Nome fantasia:</span> <strong>{cnpj.nome_fantasia || "Não informado"}</strong></p>
              <p><span className="text-muted-foreground">Situação:</span> <strong>{cnpj.situacao || cnpj.descricao_situacao_cadastral || "Não informado"}</strong></p>
              <p><span className="text-muted-foreground">Porte:</span> <strong>{cnpj.porte || cnpj.descricao_porte || "Não informado"}</strong></p>
              <p><span className="text-muted-foreground">CNAE:</span> <strong>{cnpj.cnae_fiscal_descricao || "Não informado"}</strong></p>
              <p><span className="text-muted-foreground">Abertura:</span> <strong>{cnpj.data_inicio_atividade || "Não informado"}</strong></p>
              <p><span className="text-muted-foreground">Fonte:</span> <strong>{sourceLabel(cnpjResolution?.source)}</strong></p>
              <p><span className="text-muted-foreground">Confiança:</span> <strong>{cnpjResolution?.confidence ? `${cnpjResolution.confidence}%` : "Não informado"}</strong></p>
            </div>
          ) : (
            <EmptyState text="CNPJ ainda não analisado. Depois criaremos a função para consultar BrasilAPI/Receita e salvar aqui." />
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#070b12]/75 p-5 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/25">
          <h2 className="font-bold flex items-center gap-2">
            <SearchCheck className="h-4 w-4 text-cyan-400" /> Scanner Digital
          </h2>

          {scan ? (
            <div className="space-y-2">
              <BooleanSignal label="Site ativo" value={scan.has_site ?? scan.has_website ?? scan.ok} />
              <BooleanSignal label="SSL / HTTPS" value={scan.has_ssl} />
              <BooleanSignal label="WhatsApp no site" value={scan.has_whatsapp} />
              <BooleanSignal label="Formulário de contato" value={scan.has_form ?? scan.has_contact_form} />
              <BooleanSignal label="Meta Pixel" value={scan.has_meta_pixel} />
              <BooleanSignal label="Google Analytics" value={scan.has_google_analytics} />
              <BooleanSignal label="Google Tag Manager" value={scan.has_google_tag_manager} />
              <BooleanSignal label="Agendamento online" value={scan.has_online_scheduling} />
            </div>
          ) : (
            <EmptyState text="Scanner pendente. Ele vai detectar WhatsApp, pixel, analytics, formulário, SSL e agendamento online." />
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#070b12]/75 p-5 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/25">
          <h2 className="font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" /> Presença Social
          </h2>

          <div className="space-y-2 text-sm">
            {instagramUrl ? (
              <a className="flex items-center gap-2 text-pink-300" href={instagramUrl} target="_blank" rel="noreferrer">
                <Instagram className="h-4 w-4" /> Instagram encontrado
              </a>
            ) : <BooleanSignal label="Instagram" value={false} />}

            {socials.facebook ? (
              <a className="flex items-center gap-2 text-blue-300" href={socials.facebook} target="_blank" rel="noreferrer">
                <Facebook className="h-4 w-4" /> Facebook encontrado
              </a>
            ) : <BooleanSignal label="Facebook" value={false} />}

            {socials.linkedin ? (
              <a className="flex items-center gap-2 text-blue-300" href={socials.linkedin} target="_blank" rel="noreferrer">
                <Linkedin className="h-4 w-4" /> LinkedIn encontrado
              </a>
            ) : <BooleanSignal label="LinkedIn" value={false} />}

            {socials.youtube ? (
              <a className="flex items-center gap-2 text-red-300" href={socials.youtube} target="_blank" rel="noreferrer">
                <Youtube className="h-4 w-4" /> YouTube encontrado
              </a>
            ) : <BooleanSignal label="YouTube" value={false} />}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-pink-400/20 bg-[#080711]/80 p-5 space-y-4 shadow-[0_0_50px_rgba(236,72,153,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-pink-400/35">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-bold flex items-center gap-2">
            <Instagram className="h-4 w-4 text-pink-400" /> Social Intelligence — Instagram
          </h2>

          {instagramFound ? (
            <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-xs font-bold text-pink-300">
              Apify analisado
            </span>
          ) : (
            <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">
              Sem dados do Instagram
            </span>
          )}
        </div>

        {instagramProfile ? (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-start gap-4">
                {instagramProfile.profile_pic_url ? (
                  <img
                    src={instagramProfile.profile_pic_url}
                    alt={instagramProfile.username || "Instagram"}
                    className="h-16 w-16 rounded-full object-cover border border-pink-500/30"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full border border-pink-500/30 bg-pink-500/10 flex items-center justify-center">
                    <Instagram className="h-7 w-7 text-pink-300" />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black">
                      @{instagramProfile.username || instagramIntel?.username || "perfil"}
                    </h3>
                    {instagramProfile.is_verified ? <Pill>Verificado</Pill> : null}
                    {instagramProfile.is_business_account ? <Pill>Conta comercial</Pill> : null}
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    {instagramProfile.full_name || "Nome não informado"}
                  </p>

                  {instagramUrl ? (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-pink-300"
                    >
                      Abrir Instagram <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>
              </div>

              {instagramProfile.biography ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Bio</p>
                  <p className="text-sm leading-relaxed">{instagramProfile.biography}</p>
                </div>
              ) : null}

              {instagramProfile.external_url ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Link da bio</p>
                  <a
                    href={normalizeWebsite(instagramProfile.external_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-bold text-cyan-300 break-all"
                  >
                    {instagramProfile.external_url}
                  </a>
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs text-muted-foreground">Seguidores</p>
                  <p className="text-lg font-black">{formatNumber(instagramProfile.followers)}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs text-muted-foreground">Seguindo</p>
                  <p className="text-lg font-black">{formatNumber(instagramProfile.following)}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs text-muted-foreground">Posts</p>
                  <p className="text-lg font-black">{formatNumber(instagramProfile.posts_count)}</p>
                </div>
              </div>

              {instagramInsights.length ? (
                <div className="rounded-2xl border border-pink-400/20 bg-pink-400/10 p-4 text-sm">
                  <div className="font-bold text-pink-300 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Insights sociais
                  </div>
                  <ul className="space-y-2 text-muted-foreground">
                    {instagramInsights.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <EmptyState
            text={
              instagramIntel?.error ||
              "Nenhum perfil analisado ainda. O backend precisa encontrar um Instagram no site do lead ou salvar social_intelligence pelo Apify."
            }
          />
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#070b12]/75 p-5 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/25">
          <h2 className="flex items-center gap-2 font-black uppercase tracking-wide"><FileText className="h-4 w-4 text-cyan-300" /> Informações principais</h2>

          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-cyan-400" />
              {leadPhone || "Telefone não informado"}
            </p>

            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-400" />
              {getLeadAddress(lead)}
            </p>

            <p className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              {lead.rating || "Sem avaliação"}
            </p>

            <p className="flex items-center gap-2 break-all">
              <Globe className="h-4 w-4 shrink-0 text-cyan-400" />
              {websiteUrl ? (
                <a href={websiteUrl} target="_blank" rel="noreferrer" className="text-cyan-200 hover:underline">
                  {leadWebsite}
                </a>
              ) : (
                "Site não informado"
              )}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#070b12]/75 p-5 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/25">
          <h2 className="font-bold">CRM do Lead</h2>

          <div>
            <label className="text-xs text-muted-foreground">Status</label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none transition-all focus:border-cyan-400/40"
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
              className="mt-1 min-h-28 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none transition-all focus:border-cyan-400/40"
            />
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 z-20 grid gap-3 rounded-2xl border border-white/10 bg-[#060a12]/90 p-3 shadow-[0_10px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl md:grid-cols-4">
        {whatsappUrl ? (
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/15 px-4 py-3 font-black text-emerald-100 transition-all hover:-translate-y-0.5 hover:bg-emerald-400/20">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        ) : (
          <button disabled className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-black text-slate-500">Sem WhatsApp</button>
        )}
        {leadPhone ? (
          <a href={`tel:${leadPhone}`} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-black text-slate-200 transition-all hover:-translate-y-0.5 hover:border-cyan-400/30">
            <Phone className="h-4 w-4" /> Ligar agora
          </a>
        ) : null}
        {websiteUrl ? (
          <a href={websiteUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-black text-slate-200 transition-all hover:-translate-y-0.5 hover:border-blue-400/30">
            <Globe className="h-4 w-4" /> Abrir site
          </a>
        ) : null}
        {instagramUrl ? (
          <a href={instagramUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-pink-400/25 bg-pink-400/10 px-4 py-3 font-black text-pink-100 transition-all hover:-translate-y-0.5 hover:bg-pink-400/15">
            <Instagram className="h-4 w-4" /> Instagram
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default LeadProfile;
