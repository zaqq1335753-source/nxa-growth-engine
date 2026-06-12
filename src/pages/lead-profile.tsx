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
  Instagram,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  Target,
  Copy,
  Users,
  BarChart3,
  BadgeCheck,
  Activity,
  DollarSign,
  TrendingUp,
  CalendarPlus,
  Send,
  ShieldCheck,
  Zap,
  ClipboardList,
  Lightbulb,
  Rocket,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = [
  { value: "new", label: "Novo" },
  { value: "qualified", label: "Qualificado" },
  { value: "contacted", label: "Contatado" },
  { value: "proposal", label: "Proposta" },
  { value: "negotiating", label: "Negociando" },
  { value: "closed", label: "Fechado" },
  { value: "lost", label: "Perdido" },
];

const FOLLOWUP_CHANNELS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "call", label: "Ligação" },
  { value: "email", label: "E-mail" },
  { value: "meeting", label: "Reunião" },
];

type SalesOffer = {
  id?: string;
  name?: string;
  description?: string;
  price?: string | number;
  ideal_customer?: string;
  pain_points?: string;
  differentials?: string;
  objections?: string;
  target_segments?: string;
};

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

type LeadIntelligence = {
  id?: string;
  lead_id?: string;
  user_id?: string;
  score?: number;
  ai_score?: number;
  fit_score?: number;
  purchase_probability?: number;
  status?: string;
  ai_summary?: string;
  approach_message?: string;
  ai_pitch?: string;
  ai_next_action?: string;
  next_action?: string;
  ai_reason?: string;
  ai_fit?: string;
  ai_ticket?: string;
  ticket_estimate?: string;
  potential?: string;
  offer_name?: string;
  offer_snapshot?: SalesOffer | null;
  opportunities?: string[];
  missing_items?: string[];
  objections?: string[];
  recommended_followup?: string;
  recommended_channel?: string;
  cnpj?: string;
  cnpj_data?: any | null;
  website_scan?: any | null;
  social_links?: any | null;
  compatibility_score?: number;
  need_score?: number;
  financial_score?: number;
  response_score?: number;
  confidence_score?: number;
  disqualification_risk?: string;
  qualification_level?: string;
  strategic_tags?: string[];
  buying_triggers?: string[];
  pain_hypotheses?: string[];
  decision_maker_hint?: string;
  offer_fit_reason?: string;
  personalization_hooks?: string[];
  first_question?: string;
  created_at?: string;
  updated_at?: string;
};

function getLeadField(lead: any, keys: string[]) {
  for (const key of keys) {
    const value = lead?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
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
  return String(getLeadField(lead, ["segment", "category", "type", "lead_category", "primary_type"]));
}

function getLeadAddress(lead: any) {
  return (
    lead?.address ||
    lead?.formatted_address ||
    [getLeadCity(lead), getLeadState(lead)].filter(Boolean).join(" - ") ||
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

function clampScore(value: any) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function getScore(lead: any, intelligence?: LeadIntelligence | null) {
  return clampScore(
    intelligence?.ai_score ??
      intelligence?.score ??
      lead?.ai_score ??
      lead?.nxa_score ??
      lead?.nxaScore ??
      lead?.score ??
      0
  );
}

function getFitScore(lead: any, intelligence?: LeadIntelligence | null) {
  return clampScore(intelligence?.fit_score ?? lead?.fit_score ?? intelligence?.score ?? lead?.ai_score ?? 0);
}

function getProbability(lead: any, intelligence?: LeadIntelligence | null) {
  return clampScore(intelligence?.purchase_probability ?? lead?.purchase_probability ?? lead?.close_probability ?? 0);
}

function getScoreColor(score: number) {
  if (score >= 81) return "text-emerald-300";
  if (score >= 61) return "text-cyan-300";
  if (score >= 41) return "text-orange-300";
  return "text-slate-400";
}

function getScoreIcon(score: number) {
  if (score >= 75) return <Flame className="h-5 w-5" />;
  if (score >= 45) return <Thermometer className="h-5 w-5" />;
  return <Snowflake className="h-5 w-5" />;
}

function getCommercialTemperature(score: number) {
  if (score >= 85) return "Oportunidade premium";
  if (score >= 70) return "Muito aderente";
  if (score >= 50) return "Aderência moderada";
  return "Baixa aderência";
}

function formatNumber(value?: number | string | null) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return "0";
  return new Intl.NumberFormat("pt-BR").format(number);
}

function arrayFrom(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") {
    return value
      .split(/\n|;|\|/g)
      .map((item) => item.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean);
  }
  return [];
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function Pill({ children, tone = "cyan" }: { children: React.ReactNode; tone?: "cyan" | "emerald" | "orange" | "pink" | "slate" }) {
  const tones = {
    cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
    emerald: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    orange: "border-orange-400/25 bg-orange-400/10 text-orange-200",
    pink: "border-pink-400/25 bg-pink-400/10 text-pink-200",
    slate: "border-white/10 bg-white/[0.04] text-slate-300",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black ${tones[tone]}`}>{children}</span>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">{text}</div>;
}

function MetricCard({ icon, label, value, hint, tone = "cyan" }: { icon: React.ReactNode; label: string; value: React.ReactNode; hint?: string; tone?: "cyan" | "emerald" | "orange" | "pink" | "purple" }) {
  const tones = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    orange: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    pink: "border-pink-400/20 bg-pink-400/10 text-pink-300",
    purple: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition-all hover:-translate-y-1 hover:border-cyan-400/25 hover:bg-white/[0.055]">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl border ${tones[tone]}`}>{icon}</div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black tracking-tight text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function ProgressBar({ value, tone = "cyan" }: { value: number; tone?: "cyan" | "emerald" | "orange" | "pink" }) {
  const tones = {
    cyan: "from-cyan-400 to-blue-400",
    emerald: "from-emerald-400 to-cyan-400",
    orange: "from-orange-400 to-yellow-300",
    pink: "from-pink-400 to-violet-400",
  };
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <div className={`h-full rounded-full bg-gradient-to-r ${tones[tone]}`} style={{ width: `${clampScore(value)}%` }} />
    </div>
  );
}

function InsightList({ title, icon, items, empty, tone = "cyan" }: { title: string; icon: React.ReactNode; items: string[]; empty: string; tone?: "cyan" | "orange" | "emerald" | "pink" }) {
  const tones = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    orange: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    pink: "border-pink-400/20 bg-pink-400/10 text-pink-300",
  };
  return (
    <div className={`rounded-2xl border p-4 text-sm ${tones[tone]}`}>
      <div className="mb-2 flex items-center gap-2 font-black">{icon}{title}</div>
      {items.length ? (
        <ul className="space-y-2 text-slate-300">
          {items.map((item, index) => <li key={index}>• {item}</li>)}
        </ul>
      ) : <span className="text-slate-400">{empty}</span>}
    </div>
  );
}

function BooleanSignal({ value, label }: { value?: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm">
      <span className="text-slate-300">{label}</span>
      {value ? (
        <span className="flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-xs font-black text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Sim</span>
      ) : (
        <span className="flex items-center gap-1 rounded-full border border-red-400/20 bg-red-400/10 px-2 py-0.5 text-xs font-black text-red-300"><XCircle className="h-3.5 w-3.5" /> Não</span>
      )}
    </div>
  );
}


function parseMoney(value: any) {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = String(value)
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function moneyBRL(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "Não estimado";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

function getReviewsCount(lead: any) {
  return Number(lead?.reviews_count || lead?.user_ratings_total || lead?.rating_count || 0) || 0;
}

function getExecutiveRecommendation(score: number) {
  if (score >= 85) return { label: "Prospectar agora", tone: "emerald" as const, description: "Lead com muitos sinais públicos favoráveis. Priorize contato consultivo ainda hoje e avance para diagnóstico ou demonstração." };
  if (score >= 70) return { label: "Alta prioridade", tone: "cyan" as const, description: "Boa oportunidade. Validar dor principal, conectar a oferta aos sinais encontrados e criar follow-up curto." };
  if (score >= 50) return { label: "Nutrir e validar", tone: "orange" as const, description: "Existe potencial, mas faltam sinais claros de urgência. Faça abordagem leve e colete mais contexto antes de proposta." };
  return { label: "Baixa prioridade", tone: "slate" as const, description: "Não coloque no topo da fila. Use cadência fria ou automação apenas se houver sobra de capacidade comercial." };
}

function getPriorityLevel(score: number) {
  if (score >= 75) return { label: "Alta", tone: "emerald" as const, description: "Lead acessível, com bons sinais públicos e alta prioridade para contato." };
  if (score >= 50) return { label: "Média", tone: "orange" as const, description: "Lead com sinais úteis, mas ainda precisa validação de dor, orçamento e timing." };
  return { label: "Baixa", tone: "slate" as const, description: "Lead com poucos sinais comerciais. Não deve ocupar o topo da operação." };
}

function getIntentLevel(score: number, hasWhatsapp: boolean, hasSite: boolean, reviewsCount: number) {
  const intentScore = clampScore((hasWhatsapp ? 30 : 0) + (hasSite ? 20 : 0) + (reviewsCount >= 50 ? 25 : reviewsCount >= 10 ? 15 : 5) + Math.round(score * 0.25));
  if (intentScore >= 75) return { label: "Alta", score: intentScore, tone: "emerald" as const, description: "Possui bons sinais públicos para iniciar abordagem comercial agora." };
  if (intentScore >= 50) return { label: "Média", score: intentScore, tone: "orange" as const, description: "Existe abertura para contato, mas a intenção real precisa ser validada na conversa." };
  return { label: "Baixa", score: intentScore, tone: "slate" as const, description: "Poucos sinais de intenção observável. Use abordagem fria e sem promessa de urgência." };
}

function getAnalysisConfidence(signals: boolean[]) {
  const available = signals.filter(Boolean).length;
  return clampScore(Math.round((available / Math.max(signals.length, 1)) * 100));
}


function normalizeText(value: any) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function keywordScore(text: string, groups: string[][]) {
  const normalized = normalizeText(text);
  let score = 0;
  groups.forEach((group) => {
    if (group.some((word) => normalized.includes(normalizeText(word)))) score += 1;
  });
  return score;
}

function getOfferText(offer?: SalesOffer | null) {
  if (!offer) return "";
  return [offer.name, offer.description, offer.ideal_customer, offer.pain_points, offer.differentials, offer.target_segments]
    .filter(Boolean)
    .join(" ");
}

function buildOfferFitEngine(params: {
  lead: any;
  intelligence?: LeadIntelligence | null;
  offer?: SalesOffer | null;
  hasWhatsapp: boolean;
  hasSite: boolean;
  hasInstagram: boolean;
  hasOnlineScheduling: boolean;
  hasPixel: boolean;
  hasAnalytics: boolean;
  reviewsCount: number;
}) {
  const { lead, intelligence, offer, hasWhatsapp, hasSite, hasInstagram, hasOnlineScheduling, hasPixel, hasAnalytics, reviewsCount } = params;
  const leadCategory = getLeadCategory(lead);
  const leadName = getLeadName(lead);
  const leadText = [leadName, leadCategory, getLeadCity(lead), getLeadState(lead), getLeadAddress(lead), lead?.description, lead?.types, lead?.business_status]
    .filter(Boolean)
    .join(" ");
  const offerText = getOfferText(offer);
  const fullText = `${offerText} ${leadText}`;

  const officeNeed = keywordScore(fullText, [["cadeira", "moveis", "móveis", "ergonom"], ["escritorio", "advocacia", "contabilidade", "clinica", "administrativo", "coworking"]]);
  const digitalNeed = keywordScore(fullText, [["marketing", "trafego", "tráfego", "site", "crm", "automacao", "automação", "ia", "lead"], ["clinica", "barbearia", "estetica", "imobiliaria", "academia", "pet", "restaurante"]]);
  const operationsNeed = keywordScore(fullText, [["erp", "sistema", "gestao", "gestão", "agenda", "financeiro", "software"], ["loja", "oficina", "clinica", "distribuidora", "servicos", "serviços"]]);
  const solarNeed = keywordScore(fullText, [["solar", "energia", "fotovoltaica"], ["industria", "supermercado", "academia", "hotel", "condominio", "restaurante", "posto"]]);
  const cleaningNeed = keywordScore(fullText, [["limpeza", "higienizacao", "higienização", "estofado", "impermeabilizacao"], ["hotel", "pousada", "clinica", "escola", "buffet", "restaurante", "estetica"]]);

  const segmentAffinity = Math.max(officeNeed, digitalNeed, operationsNeed, solarNeed, cleaningNeed);
  const offerDeclared = Boolean(offer?.name || offer?.description);
  const publicSignalScore = clampScore((hasWhatsapp ? 18 : 0) + (hasSite ? 14 : 0) + (hasInstagram ? 10 : 0) + (reviewsCount >= 50 ? 18 : reviewsCount >= 10 ? 12 : reviewsCount > 0 ? 6 : 0) + (hasPixel || hasAnalytics ? 8 : 0));

  const compatibility = clampScore(
    intelligence?.compatibility_score ??
      intelligence?.fit_score ??
      (offerDeclared ? 42 + segmentAffinity * 14 + (hasSite ? 8 : 0) + (reviewsCount >= 10 ? 7 : 0) : getFitScore(lead, intelligence) || 45)
  );
  const need = clampScore(
    intelligence?.need_score ??
      (38 + segmentAffinity * 13 + (!hasOnlineScheduling && digitalNeed ? 10 : 0) + (!hasSite && digitalNeed ? 8 : 0) + (reviewsCount >= 20 ? 8 : 0))
  );
  const financial = clampScore(
    intelligence?.financial_score ??
      (30 + (hasSite ? 18 : 0) + (reviewsCount >= 100 ? 24 : reviewsCount >= 30 ? 17 : reviewsCount >= 10 ? 10 : 3) + (hasInstagram ? 8 : 0) + (hasPixel || hasAnalytics ? 10 : 0))
  );
  const response = clampScore(
    intelligence?.response_score ??
      (25 + (hasWhatsapp ? 30 : 0) + (hasSite ? 10 : 0) + (hasInstagram ? 12 : 0) + (reviewsCount > 0 ? 8 : 0))
  );
  const confidence = clampScore(intelligence?.confidence_score ?? Math.round((publicSignalScore + compatibility) / 2));
  const finalScore = clampScore(Math.round(compatibility * 0.34 + need * 0.26 + financial * 0.2 + response * 0.2));

  const qualificationLevel = intelligence?.qualification_level || (finalScore >= 82 ? "Lead premium" : finalScore >= 68 ? "Alta chance comercial" : finalScore >= 52 ? "Validar antes da proposta" : "Nutrição fria");
  const disqualificationRisk = intelligence?.disqualification_risk || (!offerDeclared ? "Oferta não cadastrada: análise usa sinais públicos e fica menos precisa." : finalScore < 52 ? "Aderência baixa: não investir muito tempo sem validar dor e orçamento." : confidence < 55 ? "Poucos dados públicos: confirmar contexto antes de prometer resultado." : "Baixo risco: sinais suficientes para uma abordagem consultiva.");

  const tags = arrayFrom(intelligence?.strategic_tags).length ? arrayFrom(intelligence?.strategic_tags) : [
    offerDeclared ? "Oferta conectada" : "Precisa cadastrar oferta",
    hasWhatsapp ? "Contato direto" : "Enriquecer telefone",
    hasSite ? "Presença digital" : "Sem site claro",
    reviewsCount >= 20 ? "Prova social" : "Poucas avaliações",
    finalScore >= 70 ? "Prioridade alta" : "Validar fit",
  ];

  const painHypotheses = arrayFrom(intelligence?.pain_hypotheses).length ? arrayFrom(intelligence?.pain_hypotheses) : [
    !hasOnlineScheduling ? "Pode perder oportunidades por atendimento manual, demora de resposta ou ausência de agendamento online." : "Pode precisar melhorar integração entre agenda, CRM, pós-venda e reativação.",
    !hasPixel && !hasAnalytics ? "Pode não medir bem origem dos contatos, remarketing e retorno das campanhas." : "Já possui sinais de mensuração, então a conversa pode avançar para otimização e escala.",
    reviewsCount >= 20 ? "Fluxo de clientes já existe; o foco da oferta deve ser ganho de eficiência, conversão ou ticket." : "Precisa validar volume de demanda antes de falar em expansão agressiva.",
  ];

  const buyingTriggers = arrayFrom(intelligence?.buying_triggers).length ? arrayFrom(intelligence?.buying_triggers) : [
    activeTextTrigger(offer, leadCategory),
    hasWhatsapp ? "Possui canal direto para abordagem imediata." : "Encontrar decisor ou WhatsApp antes de propor reunião.",
    hasSite || hasInstagram ? "Já existe presença pública para personalizar a mensagem." : "Oferta pode entrar como modernização básica do processo comercial.",
  ].filter(Boolean);

  const hooks = arrayFrom(intelligence?.personalization_hooks).length ? arrayFrom(intelligence?.personalization_hooks) : [
    reviewsCount ? `Vi que vocês têm ${reviewsCount} avaliações no Google, isso mostra que já existe movimento e demanda.` : `Vi a ${leadName} na região e queria entender como vocês captam novos clientes hoje.`,
    hasSite ? "Notei que vocês já têm presença digital; talvez faça sentido melhorar conversão e follow-up." : "Não encontrei um site claro, então talvez exista espaço para melhorar a captação digital.",
    offer?.name ? `Tenho uma solução específica de ${offer.name} e queria validar se faz sentido para o momento de vocês.` : "Estou validando uma solução para empresas com esse perfil e queria fazer uma pergunta rápida.",
  ];

  return { compatibility, need, financial, response, confidence, finalScore, qualificationLevel, disqualificationRisk, tags, painHypotheses, buyingTriggers, hooks };
}

function activeTextTrigger(offer?: SalesOffer | null, category?: string) {
  const offerName = offer?.name || "sua oferta";
  if (!offer?.name) return "Cadastrar a oferta melhora a precisão da IA e evita análise genérica.";
  return `A oferta "${offerName}" pode ser conectada ao contexto de ${category || "negócio local"} com uma abordagem focada em dor, timing e retorno.`;
}

function DetailRow({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <div className="mt-1 text-lg font-black text-white">{value}</div>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function ScoreFactor({ label, value, positive = true }: { label: string; value: number; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
      <span className="text-slate-300">{label}</span>
      <span className={`font-black ${positive ? "text-emerald-300" : "text-orange-300"}`}>{positive ? "+" : ""}{value}</span>
    </div>
  );
}

function ObjectionCard({ title, answer }: { title: string; answer: string }) {
  return (
    <div className="rounded-2xl border border-pink-400/15 bg-pink-400/[0.06] p-4">
      <p className="text-sm font-black text-pink-100">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{answer}</p>
    </div>
  );
}

export function LeadProfile() {
  const [, params] = useRoute("/leads/:id");
  const id = params?.id;
  const { toast } = useToast();

  const [userId, setUserId] = React.useState<string | null>(null);
  const [lead, setLead] = React.useState<any>(null);
  const [intelligence, setIntelligence] = React.useState<LeadIntelligence | null>(null);
  const [offer, setOffer] = React.useState<SalesOffer | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [creatingFollowup, setCreatingFollowup] = React.useState(false);
  const [status, setStatus] = React.useState("new");
  const [notes, setNotes] = React.useState("");
  const [followupDate, setFollowupDate] = React.useState(getTomorrowDate());
  const [followupTime, setFollowupTime] = React.useState("09:00");
  const [followupChannel, setFollowupChannel] = React.useState("whatsapp");

  async function getSessionUserId() {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id || null;
  }

  async function loadOffer(uid: string) {
    try {
      const { data, error } = await supabase
        .from("sales_offers")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn("sales_offers ainda não configurada:", error.message);
        setOffer(null);
        return null;
      }

      setOffer(data as SalesOffer | null);
      return data as SalesOffer | null;
    } catch (error) {
      console.warn("Não foi possível carregar oferta:", error);
      setOffer(null);
      return null;
    }
  }

  async function loadIntelligence(leadId: string, uid: string) {
    try {
      let query = supabase.from("lead_intelligence").select("*").eq("lead_id", leadId);
      query = query.eq("user_id", uid);
      const { data, error } = await query.order("updated_at", { ascending: false }).limit(1).maybeSingle();

      if (error) {
        console.warn("lead_intelligence ainda não configurada:", error.message);
        setIntelligence(null);
        return null;
      }

      setIntelligence(data as LeadIntelligence | null);
      return data as LeadIntelligence | null;
    } catch (error) {
      console.warn("Tabela lead_intelligence ainda não existe ou está sem permissão.", error);
      setIntelligence(null);
      return null;
    }
  }

  async function loadLead() {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const uid = await getSessionUserId();
      setUserId(uid);

      if (!uid) {
        setLead(null);
        return;
      }

      let query = supabase.from("leads").select("*").eq("id", id);
      query = query.eq("user_id", uid);

      const { data, error } = await query.maybeSingle();
      if (error) throw error;

      setLead(data);
      setStatus(data?.status || "new");
      setNotes(data?.notes || "");

      await Promise.all([loadIntelligence(id, uid), loadOffer(uid)]);
    } catch (error: any) {
      console.error("Erro ao buscar lead:", error);
      toast({ title: "Erro ao carregar lead.", description: error?.message || "Não foi possível buscar este lead.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadLead();
  }, [id]);

  async function saveLead() {
    if (!id || !userId) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("leads")
        .update({ status, notes, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      toast({ title: "Lead atualizado.", description: "Status e observações foram salvos." });
      await loadLead();
    } catch (error: any) {
      toast({ title: "Erro ao salvar.", description: error?.message || "Não foi possível salvar o lead.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function analyzeLead() {
    if (!id || !lead || !userId) return;
    setAnalyzing(true);

    try {
      const activeOffer = offer || (await loadOffer(userId));
      const { data, error } = await supabase.functions.invoke("analyze-lead", {
        body: {
          user_id: userId,
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
          sales_offer: activeOffer,
          requested_outputs: [
            "compatibility_score",
            "need_score",
            "financial_score",
            "response_score",
            "confidence_score",
            "qualification_level",
            "disqualification_risk",
            "strategic_tags",
            "buying_triggers",
            "pain_hypotheses",
            "personalization_hooks",
            "decision_maker_hint",
            "first_question",
            "approach_message"
          ],
          scoring_weights: { compatibility: 0.34, need: 0.26, financial: 0.2, response: 0.2 },
          lead_raw: lead,
          offer_raw: activeOffer,
          analysis_mode: "offer_fit_sales_intelligence_v3",
        },
      });

      if (error) throw error;

      if (data?.intelligence) {
        setIntelligence(data.intelligence);
      } else {
        await loadIntelligence(id, userId);
      }

      toast({ title: "Análise concluída.", description: "A IA analisou o lead com base na sua oferta." });
    } catch (error: any) {
      console.error("Erro ao analisar lead:", error);
      toast({ title: "IA ainda não configurada.", description: error?.message || "Verifique a Edge Function analyze-lead e a tabela lead_intelligence.", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  }

  async function copyText(text?: string | null) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    toast({ title: "Copiado.", description: "Texto copiado para a área de transferência." });
  }

  async function createFollowup() {
    if (!lead || !userId) return;
    setCreatingFollowup(true);

    try {
      const leadName = getLeadName(lead);
      const payload = {
        user_id: userId,
        lead_id: lead.id,
        lead_name: leadName,
        lead_phone: getLeadPhone(lead) || null,
        company_name: leadName,
        title: intelligence?.recommended_followup || intelligence?.ai_next_action || intelligence?.next_action || `Contato comercial com ${leadName}`,
        notes: intelligence?.approach_message || intelligence?.ai_pitch || intelligence?.ai_summary || notes || null,
        channel: followupChannel,
        priority: getScore(lead, intelligence) >= 75 ? "high" : "normal",
        status: "pending",
        due_date: followupDate,
        due_time: followupTime,
        sync_calendar: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("followups").insert(payload);
      if (error) throw error;

      toast({ title: "Follow-up criado.", description: "A próxima ação foi sincronizada com a página Follow-up." });
    } catch (error: any) {
      toast({ title: "Erro ao criar follow-up.", description: error?.message || "Verifique a tabela followups e as políticas RLS.", variant: "destructive" });
    } finally {
      setCreatingFollowup(false);
    }
  }

  if (loading) return <div className="p-8 text-muted-foreground">Carregando lead...</div>;

  if (!lead) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">Lead não encontrado ou não pertence ao usuário logado.</p>
        <Link href="/leads"><span className="cursor-pointer text-sm font-bold text-cyan-300">← Voltar</span></Link>
      </div>
    );
  }

  const score = getScore(lead, intelligence);
  const fitScore = getFitScore(lead, intelligence);
  const temperature = getCommercialTemperature(score);
  const leadName = getLeadName(lead);
  const leadPhone = getLeadPhone(lead);
  const leadWebsite = getLeadWebsite(lead);
  const leadCategory = getLeadCategory(lead);
  const whatsapp = String(leadPhone || "").replace(/\D/g, "");
  const pitch = intelligence?.approach_message || intelligence?.ai_pitch || `Olá, tudo bem? Vi a ${leadName} e acredito que a nossa solução pode ajudar vocês a melhorar o atendimento, captar mais oportunidades e organizar o processo comercial.`;
  const whatsappUrl = whatsapp ? `https://wa.me/55${whatsapp.replace(/^55/, "")}?text=${encodeURIComponent(pitch)}` : "";
  const websiteUrl = normalizeWebsite(leadWebsite);
  const scan = intelligence?.website_scan || {};
  const socials = intelligence?.social_links || {};
  const instagramIntel = scan?.social_intelligence?.instagram || null;
  const instagramProfile: InstagramProfile | null = instagramIntel?.profile || socials.instagram_profile || null;
  const instagramUrl = instagramProfile?.url || instagramIntel?.source_url || socials.instagram || "";
  const activeOffer = offer || intelligence?.offer_snapshot || null;
  const reviewsCount = getReviewsCount(lead);
  const hasSite = Boolean(websiteUrl || scan?.has_site || scan?.has_website);
  const hasInstagram = Boolean(scan?.has_instagram || instagramUrl);
  const hasOnlineScheduling = Boolean(scan?.has_online_scheduling);
  const hasWhatsapp = Boolean(scan?.has_whatsapp || leadPhone);
  const hasPixel = Boolean(scan?.has_meta_pixel);
  const hasAnalytics = Boolean(scan?.has_google_analytics || scan?.has_google_tag_manager);
  const hasReviewsSignal = reviewsCount > 0 || Number(lead?.rating || 0) > 0;
  const priorityLevel = getPriorityLevel(score);
  const intentLevel = getIntentLevel(score, hasWhatsapp, hasSite, reviewsCount);
  const analysisConfidence = getAnalysisConfidence([hasWhatsapp, hasSite, hasReviewsSignal, hasInstagram, hasOnlineScheduling, hasPixel || hasAnalytics]);
  const searchContext = [leadCategory, getLeadCity(lead), getLeadState(lead)].filter(Boolean).join(" • ");
  const offerFit = buildOfferFitEngine({ lead, intelligence, offer: activeOffer, hasWhatsapp, hasSite, hasInstagram, hasOnlineScheduling, hasPixel, hasAnalytics, reviewsCount });
  const commercialScore = offerFit.finalScore || score;
  const firstQuestion = intelligence?.first_question || `Hoje, qual é a maior dificuldade da ${leadName}: captar novos clientes, responder rápido ou converter quem chama?`;
  const decisionMakerHint = intelligence?.decision_maker_hint || (leadCategory ? `Procure pelo dono, gestor comercial ou responsável operacional de ${leadCategory}.` : "Procure pelo dono, gestor comercial ou responsável pela operação.");

  const generatedOpportunities = [
    activeOffer?.name ? `Conectar a oferta "${activeOffer.name}" às dores operacionais deste negócio.` : "Cadastrar uma oferta na Busca Inteligente para personalizar o encaixe Produto x Lead.",
    hasWhatsapp ? "Usar WhatsApp como porta de entrada para diagnóstico e proposta consultiva." : "Validar canal direto de contato antes de avançar para proposta.",
    reviewsCount >= 20 ? `Explorar prova social: ${reviewsCount} avaliações indicam demanda e fluxo comercial.` : "Criar conversa inicial para descobrir volume mensal de atendimentos e oportunidades.",
    !hasOnlineScheduling ? "Oferecer automação de agenda, confirmação e follow-up como ganho imediato." : "Analisar como a automação atual pode ser integrada a CRM, retenção e remarketing.",
  ];
  const generatedMissing = [
    !hasInstagram ? "Presença social fraca ou Instagram não identificado." : "Instagram identificado; avaliar frequência e qualidade de conteúdo.",
    !hasOnlineScheduling ? "Agendamento online não identificado, provável processo manual." : "Possui agendamento online; vender otimização, integração e follow-up.",
    !hasPixel ? "Meta Pixel não detectado, limita remarketing e campanhas de reativação." : "Meta Pixel identificado, pode existir maturidade para mídia paga.",
    !hasAnalytics ? "Analytics/Tag não detectado, dificulta mensuração comercial." : "Analytics/Tag detectado, bom sinal de maturidade digital.",
  ];
  const generatedObjections = [
    "Já fazemos isso manualmente",
    "Agora não tenho orçamento",
    "Preciso falar com meu sócio/equipe",
  ];

  const opportunities = arrayFrom(intelligence?.opportunities || lead?.ai_opportunities);
  const missing = arrayFrom(intelligence?.missing_items || lead?.ai_missing_items);
  const objections = arrayFrom(intelligence?.objections || lead?.ai_objections);
  const finalOpportunities = opportunities.length ? opportunities : generatedOpportunities;
  const finalMissing = missing.length ? missing : generatedMissing;
  const finalObjections = objections.length ? objections : generatedObjections;

  const ticket = intelligence?.ai_ticket || intelligence?.ticket_estimate || lead?.ai_ticket || (activeOffer?.price ? String(activeOffer.price) : "Não estimado");
  const offerPrice = parseMoney(activeOffer?.price || ticket);
  const hasFinancialProjection = Boolean(activeOffer?.name && offerPrice > 0);
  const expectedRevenue = hasFinancialProjection ? Math.round(offerPrice * (intentLevel.score / 100)) : 0;
  const estimatedLtv = hasFinancialProjection ? offerPrice * 12 : 0;
  const roiClients = score >= 75 ? 8 : score >= 55 ? 5 : 3;
  const averageClientTicket = leadCategory.toLowerCase().includes("barbear") ? 70 : leadCategory.toLowerCase().includes("clínic") || leadCategory.toLowerCase().includes("estética") ? 250 : 120;
  const possibleExtraRevenue = roiClients * averageClientTicket;
  const roiPercent = offerPrice ? Math.round((possibleExtraRevenue / offerPrice) * 100) : 0;
  const potential = intelligence?.potential || lead?.potential || (score >= 75 ? "Alto" : score >= 50 ? "Médio" : "Baixo");
  const recommendation = getExecutiveRecommendation(score);
  const nextAction = intelligence?.ai_next_action || intelligence?.next_action || intelligence?.recommended_followup || (recommendation.label === "Prospectar agora" ? "Enviar abordagem personalizada pelo WhatsApp e propor uma demonstração rápida com foco em ganho de tempo, captação e follow-up." : "Realizar primeiro contato consultivo e validar a dor principal.");
  const reason = intelligence?.ai_reason || intelligence?.ai_fit || intelligence?.ai_summary || `Diagnóstico provisório: ${leadName} possui score ${score}/100, fit ${fitScore || score}/100 e sinais digitais que indicam ${potential.toLowerCase()} potencial. Cadastre ou atualize sua oferta para a IA refinar a análise Produto x Lead.`;

  return (
    <div className="relative space-y-6 pb-28">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.10),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(236,72,153,0.10),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(2,6,23,1))]" />

      <Link href="/leads">
        <button className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-bold text-cyan-300 transition-all hover:-translate-x-1 hover:border-cyan-400/30 hover:bg-cyan-400/10">
          <ArrowLeft className="h-4 w-4" /> Voltar para Leads
        </button>
      </Link>

      <div className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#050914]/90 p-6 shadow-[0_0_80px_rgba(34,211,238,0.10)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(236,72,153,0.12),transparent_28%)]" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-cyan-400"><Building2 className="h-5 w-5" /><span className="text-xs font-bold uppercase">AI Sales Intelligence Profile</span></div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">{leadName || "Lead sem nome"}</h1>
            <p className="mt-2 text-slate-400">{leadCategory || "Segmento não informado"} • {getLeadAddress(lead)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill tone={score >= 75 ? "emerald" : score >= 50 ? "cyan" : "orange"}>{temperature}</Pill>
              <Pill tone="pink">{intelligence ? "IA analisada" : "IA pendente"}</Pill>
              {activeOffer?.name ? <Pill tone="slate">Oferta: {activeOffer.name}</Pill> : <Pill tone="orange">Oferta não cadastrada</Pill>}
            </div>
          </div>

          <div className="grid min-w-[260px] grid-cols-3 gap-3 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500">Score IA</p>
              <div className={`mt-1 flex items-center gap-1 text-3xl font-black ${getScoreColor(score)}`}>{getScoreIcon(score)}{score}</div>
              <ProgressBar value={score} tone="emerald" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500">Fit</p>
              <p className="mt-1 text-3xl font-black text-cyan-200">{fitScore || score}</p>
              <ProgressBar value={fitScore || score} tone="cyan" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500">Prioridade</p>
              <p className={`mt-1 text-2xl font-black ${priorityLevel.tone === "emerald" ? "text-emerald-200" : priorityLevel.tone === "orange" ? "text-orange-200" : "text-slate-300"}`}>{priorityLevel.label}</p>
              <ProgressBar value={score} tone={priorityLevel.tone === "emerald" ? "emerald" : priorityLevel.tone === "orange" ? "orange" : "cyan"} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5 shadow-[0_0_60px_rgba(16,185,129,0.08)]">
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-emerald-300"><Rocket className="h-4 w-4" /> Recomendação executiva IA</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white">{recommendation.label}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">{recommendation.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Pill tone={recommendation.tone}>{score >= 75 ? "Prioridade comercial" : score >= 50 ? "Validar oportunidade" : "Baixa prioridade"}</Pill>
                <Pill tone="cyan">Fit {fitScore || score}%</Pill>
                <Pill tone={intentLevel.tone}>Intenção observável: {intentLevel.label}</Pill>
                <Pill tone="slate">Confiança {analysisConfidence}%</Pill>
                {activeOffer?.name ? <Pill tone="emerald">Oferta conectada</Pill> : <Pill tone="orange">Oferta pendente</Pill>}
              </div>
            </div>
            <div className="min-w-[220px] rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Decisão sugerida</p>
              <p className="mt-2 text-2xl font-black text-white">{score >= 70 ? "Atacar" : score >= 50 ? "Nutrir" : "Automatizar"}</p>
              <p className="mt-1 text-xs text-slate-400">Baseado em score, fit, sinais digitais e sinais públicos auditáveis.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-400/15 bg-[#070b12]/80 p-5 backdrop-blur-xl">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-300"><DollarSign className="h-4 w-4" /> Projeção financeira</p>
          {hasFinancialProjection ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <DetailRow label="Oferta usada" value={activeOffer?.name || "Oferta"} hint={`Preço base ${String(activeOffer?.price || ticket)}`} />
              <DetailRow label="Receita ponderada" value={moneyBRL(expectedRevenue)} hint="Preço x intenção observável" />
              <DetailRow label="LTV 12 meses" value={moneyBRL(estimatedLtv)} hint="Preço mensal x 12" />
            </div>
          ) : (
            <EmptyState text="Cadastre uma oferta com preço na Busca Inteligente para habilitar projeções financeiras. Sem oferta cadastrada, a IA mostra apenas prioridade, fit e sinais auditáveis." />
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-violet-400/15 bg-[#070b12]/80 p-5 shadow-[0_0_70px_rgba(139,92,246,0.08)] backdrop-blur-xl">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-violet-300"><Brain className="h-4 w-4" /> Motor Produto x Lead</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Análise real da oferta contra este lead</h2>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-400">A IA cruza a oferta cadastrada, segmento, sinais digitais, contato, avaliações e maturidade pública para explicar por que este lead merece prioridade ou deve ser nutrido.</p>
          </div>
          <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 px-5 py-4 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-200">Score comercial</p>
            <p className="text-4xl font-black text-white">{commercialScore}</p>
            <p className="text-xs font-bold text-violet-200">{offerFit.qualificationLevel}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs font-black uppercase text-slate-400"><span>Compatibilidade</span><span className="text-cyan-200">{offerFit.compatibility}%</span></div>
              <ProgressBar value={offerFit.compatibility} tone="cyan" />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs font-black uppercase text-slate-400"><span>Necessidade provável</span><span className="text-emerald-200">{offerFit.need}%</span></div>
              <ProgressBar value={offerFit.need} tone="emerald" />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs font-black uppercase text-slate-400"><span>Potencial financeiro</span><span className="text-orange-200">{offerFit.financial}%</span></div>
              <ProgressBar value={offerFit.financial} tone="orange" />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs font-black uppercase text-slate-400"><span>Chance de resposta</span><span className="text-pink-200">{offerFit.response}%</span></div>
              <ProgressBar value={offerFit.response} tone="pink" />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-slate-400">
              <span className="font-black text-white">Risco de desqualificação:</span> {offerFit.disqualificationRisk}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <InsightList title="Gatilhos de compra" icon={<Zap className="h-4 w-4" />} items={offerFit.buyingTriggers} empty="Sem gatilhos claros." tone="emerald" />
            <InsightList title="Hipóteses de dor" icon={<AlertTriangle className="h-4 w-4" />} items={offerFit.painHypotheses} empty="Sem dores prováveis." tone="orange" />
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 md:col-span-2">
              <p className="mb-2 flex items-center gap-2 text-sm font-black text-cyan-100"><MessageCircle className="h-4 w-4" /> Pergunta de abertura recomendada</p>
              <p className="text-sm leading-relaxed text-slate-200">{firstQuestion}</p>
              <p className="mt-3 text-xs leading-relaxed text-slate-400"><span className="font-black text-white">Decisor provável:</span> {decisionMakerHint}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:col-span-2">
              <p className="mb-2 text-sm font-black text-white">Hooks personalizados para mensagem</p>
              <div className="flex flex-wrap gap-2">{offerFit.hooks.map((item, index) => <Pill key={index} tone={index === 0 ? "cyan" : index === 1 ? "pink" : "slate"}>{item}</Pill>)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<Target className="h-5 w-5" />} label="Aderência com a oferta" value={`${offerFit.compatibility}%`} hint="Produto x sinais públicos" tone="cyan" />
        <MetricCard icon={<TrendingUp className="h-5 w-5" />} label="Intenção observável" value={intentLevel.label} hint={intentLevel.description} tone={intentLevel.tone === "emerald" ? "emerald" : intentLevel.tone === "orange" ? "orange" : "purple"} />
        <MetricCard icon={<ShieldCheck className="h-5 w-5" />} label="Confiança da análise" value={`${analysisConfidence}%`} hint="Volume de dados públicos encontrados" tone="emerald" />
        <MetricCard icon={<Rocket className="h-5 w-5" />} label="Nível de oportunidade" value={priorityLevel.label} hint={priorityLevel.description} tone={priorityLevel.tone === "emerald" ? "emerald" : priorityLevel.tone === "orange" ? "orange" : "purple"} />
      </div>

      <div className="rounded-3xl border border-cyan-400/15 bg-[#070b12]/80 p-5 backdrop-blur-xl">
        <h2 className="mb-4 flex items-center gap-2 font-black uppercase tracking-wide"><BadgeCheck className="h-5 w-5 text-cyan-300" /> Por que este lead entrou na busca?</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <DetailRow label="Contexto da busca" value={searchContext || "Nicho/local não informado"} hint="Segmento e localização salvos no lead" />
          <DetailRow label="Contato público" value={hasWhatsapp ? "Encontrado" : "Não encontrado"} hint={hasWhatsapp ? "Pronto para abordagem" : "Exige enriquecimento"} />
          <DetailRow label="Site" value={hasSite ? "Identificado" : "Ausente"} hint={hasSite ? "Permite scanner digital" : "Oportunidade de presença digital"} />
          <DetailRow label="Prova social" value={reviewsCount ? `${lead.rating || "—"} • ${reviewsCount} avaliações` : "Sem dados"} hint="Avaliações públicas do Google" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-orange-400/15 bg-[#070b12]/80 p-5 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 font-black uppercase tracking-wide"><DollarSign className="h-5 w-5 text-orange-300" /> Simulador comercial defensável</h2>
          {hasFinancialProjection ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow label="Cenário conservador" value={`+${roiClients} clientes/mês`} hint="Hipótese para argumentação" />
                <DetailRow label="Ticket médio do segmento" value={moneyBRL(averageClientTicket)} hint="Referência operacional, não promessa" />
                <DetailRow label="Receita adicional possível" value={moneyBRL(possibleExtraRevenue)} hint="Clientes x ticket médio" />
                <DetailRow label="Relação investimento/ganho" value={`${roiPercent}%`} hint="Cenário, não garantia" />
              </div>
              <p className="mt-4 rounded-2xl border border-orange-400/15 bg-orange-400/[0.06] p-3 text-sm leading-relaxed text-slate-300">
                Use como argumento consultivo: se a solução gerar apenas {roiClients} novos clientes/mês, o ganho pode ajudar a justificar o investimento. Valide ticket, volume e margem na conversa.
              </p>
            </>
          ) : (
            <EmptyState text="Sem preço de oferta cadastrado, a plataforma não estima ROI. Isso evita números inventados e mantém a análise explicável para o cliente." />
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#070b12]/80 p-5 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 font-black uppercase tracking-wide"><BarChart3 className="h-5 w-5 text-cyan-300" /> Como a IA chegou ao score</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <ScoreFactor label="Telefone/WhatsApp encontrado" value={hasWhatsapp ? 15 : -10} positive={hasWhatsapp} />
            <ScoreFactor label="Site identificado" value={hasSite ? 10 : -5} positive={hasSite} />
            <ScoreFactor label="Avaliações e prova social" value={reviewsCount >= 50 ? 20 : reviewsCount >= 10 ? 10 : 3} positive={reviewsCount >= 10} />
            <ScoreFactor label="Agendamento online" value={hasOnlineScheduling ? 5 : -12} positive={hasOnlineScheduling} />
            <ScoreFactor label="Presença social" value={hasInstagram ? 10 : -6} positive={hasInstagram} />
            <ScoreFactor label="Medição/remarketing" value={hasPixel || hasAnalytics ? 8 : -6} positive={hasPixel || hasAnalytics} />
          </div>
          <div className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.06] p-4 text-sm leading-relaxed text-slate-300">
            <p className="font-black text-cyan-100">Resumo explicável da IA</p>
            <p className="mt-2">
              Este lead recebeu score {score}/100 porque {hasWhatsapp ? "possui telefone/WhatsApp público" : "não possui canal direto claro"}, {hasSite ? "tem site identificado" : "não possui site identificado"} e {reviewsCount > 0 ? `tem ${reviewsCount} avaliação(ões) como prova social` : "não possui prova social suficiente"}. A prioridade ficou {priorityLevel.label.toLowerCase()} porque os sinais digitais indicam {priorityLevel.description.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-[#070b12]/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-black uppercase tracking-wide text-white"><Brain className="h-5 w-5 text-cyan-300" /> Diagnóstico IA por oferta</h2>
            <button onClick={analyzeLead} disabled={analyzing} className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 font-black text-cyan-100 transition-all hover:-translate-y-0.5 hover:bg-cyan-400/15 disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${analyzing ? "animate-spin" : ""}`} /> {analyzing ? "Analisando..." : intelligence ? "Reanalisar com IA" : "Analisar com IA"}
            </button>
          </div>

          <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.06] p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Pill tone="cyan">Confiança da análise: {analysisConfidence}%</Pill>
              <Pill tone={priorityLevel.tone}>Prioridade: {priorityLevel.label}</Pill>
              <Pill tone={intentLevel.tone}>Intenção observável: {intentLevel.label}</Pill>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{reason}</p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <InsightList title="Oportunidades" icon={<Sparkles className="h-4 w-4" />} items={finalOpportunities} empty="Aguardando análise da IA." tone="emerald" />
            <InsightList title="Riscos/Pontos ausentes" icon={<AlertTriangle className="h-4 w-4" />} items={finalMissing} empty="Nenhum ponto crítico identificado." tone="orange" />
            <InsightList title="Objeções prováveis" icon={<ShieldCheck className="h-4 w-4" />} items={finalObjections} empty="Sem objeções mapeadas ainda." tone="pink" />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#070b12]/80 p-5 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 font-black uppercase tracking-wide"><Lightbulb className="h-5 w-5 text-orange-300" /> Próxima melhor ação</h2>
          <div className="rounded-2xl border border-orange-400/20 bg-orange-400/10 p-4 text-sm text-slate-200">{nextAction}</div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-400">Data</label>
              <input type="date" value={followupDate} min={todayDate()} onChange={(e) => setFollowupDate(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#050914] px-3 py-2 text-sm outline-none focus:border-cyan-400/40" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400">Hora</label>
              <input type="time" value={followupTime} onChange={(e) => setFollowupTime(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#050914] px-3 py-2 text-sm outline-none focus:border-cyan-400/40" />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-bold text-slate-400">Canal</label>
            <select value={followupChannel} onChange={(e) => setFollowupChannel(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#050914] px-3 py-2 text-sm outline-none focus:border-cyan-400/40">
              {FOLLOWUP_CHANNELS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>

          <button onClick={createFollowup} disabled={creatingFollowup} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/15 px-4 py-3 font-black text-emerald-100 transition-all hover:-translate-y-0.5 hover:bg-emerald-400/20 disabled:opacity-60">
            <CalendarPlus className="h-4 w-4" /> {creatingFollowup ? "Criando..." : "Criar follow-up recomendado"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-[#070b12]/80 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-black uppercase tracking-wide"><Send className="h-5 w-5 text-emerald-300" /> Abordagem personalizada</h2>
            <button onClick={() => copyText(pitch)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-black text-slate-200 hover:border-cyan-400/30"><Copy className="h-4 w-4" /> Copiar</button>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">{pitch}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill tone="slate">Gerado por segmento</Pill>
            {hasReviewsSignal ? <Pill tone="slate">Avaliações públicas</Pill> : null}
            {hasSite ? <Pill tone="slate">Site analisado</Pill> : null}
            {hasInstagram ? <Pill tone="slate">Presença social</Pill> : null}
            {activeOffer?.name ? <Pill tone="emerald">Oferta conectada</Pill> : <Pill tone="orange">Oferta pendente</Pill>}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#070b12]/80 p-5 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 font-black uppercase tracking-wide"><ClipboardList className="h-5 w-5 text-cyan-300" /> Oferta usada na análise</h2>
          {activeOffer?.name ? (
            <div className="space-y-3 text-sm">
              <div><p className="text-xs font-black uppercase text-slate-500">Nome</p><p className="font-bold text-white">{activeOffer.name}</p></div>
              {activeOffer.description ? <div><p className="text-xs font-black uppercase text-slate-500">Descrição</p><p className="text-slate-300">{activeOffer.description}</p></div> : null}
              {activeOffer.ideal_customer ? <div><p className="text-xs font-black uppercase text-slate-500">ICP</p><p className="text-slate-300">{activeOffer.ideal_customer}</p></div> : null}
              {activeOffer.price ? <Pill tone="emerald">Preço: {String(activeOffer.price)}</Pill> : null}
            </div>
          ) : (
            <EmptyState text="Cadastre uma oferta na Busca Inteligente para a IA avaliar exatamente o encaixe entre seu produto e este lead." />
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-pink-400/15 bg-[#070b12]/80 p-5 backdrop-blur-xl lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-black uppercase tracking-wide"><ShieldCheck className="h-5 w-5 text-pink-300" /> Objeções previstas e respostas</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <ObjectionCard title={finalObjections[0] || "Já faço manualmente"} answer="Responda mostrando economia de tempo, menos perda de contatos e organização do histórico comercial. Foque no custo oculto do atendimento manual." />
            <ObjectionCard title={finalObjections[1] || "Está caro"} answer={`Use o ROI: se gerar apenas ${roiClients} novos clientes/mês, a receita adicional estimada pode chegar a ${moneyBRL(possibleExtraRevenue)}.`} />
            <ObjectionCard title={finalObjections[2] || "Preciso pensar"} answer="Crie um follow-up curto, envie demonstração simples e pergunte qual etapa do processo comercial mais trava hoje." />
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-400/15 bg-[#070b12]/80 p-5 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 font-black uppercase tracking-wide"><Target className="h-5 w-5 text-cyan-300" /> Playbook de ataque</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <p><span className="font-black text-white">1.</span> Abrir pelo problema mais provável: atendimento, agenda, follow-up ou captação.</p>
            <p><span className="font-black text-white">2.</span> Usar prova observável: site, avaliações, ausência de Instagram/agendamento ou baixa mensuração.</p>
            <p><span className="font-black text-white">3.</span> Conectar com a oferta: {activeOffer?.name || "cadastre uma oferta para personalizar esta etapa"}.</p>
            <p><span className="font-black text-white">4.</span> Finalizar com pergunta leve: “Hoje vocês perdem muitos contatos por demora no atendimento?”</p>
          </div>
        </div>
      </div>

      {instagramProfile ? (
        <div className="rounded-3xl border border-pink-400/20 bg-[#070711]/80 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-black uppercase tracking-wide"><Instagram className="h-5 w-5 text-pink-300" /> Social Intelligence</h2>
            {instagramUrl ? <a href={instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-black text-pink-200">Abrir Instagram <ExternalLink className="h-3.5 w-3.5" /></a> : null}
          </div>
          <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
            <div className="flex items-start gap-4">
              {instagramProfile.profile_pic_url ? <img src={instagramProfile.profile_pic_url} alt={instagramProfile.username || "Instagram"} className="h-20 w-20 rounded-full border-2 border-pink-400/50 object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full border border-pink-400/40 bg-pink-400/10"><Instagram className="h-8 w-8 text-pink-300" /></div>}
              <div className="min-w-0">
                <h3 className="break-all text-2xl font-black text-white">@{instagramProfile.username || "perfil"}</h3>
                <p className="text-sm text-slate-400">{instagramProfile.full_name || "Nome não informado"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {instagramProfile.is_verified ? <Pill tone="pink"><BadgeCheck className="h-3 w-3" /> Verificado</Pill> : null}
                  {instagramProfile.is_business_account ? <Pill tone="cyan"><Building2 className="h-3 w-3" /> Comercial</Pill> : null}
                  <Pill tone="slate"><Activity className="h-3 w-3" /> Analisado</Pill>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard icon={<Users className="h-5 w-5" />} label="Seguidores" value={formatNumber(instagramProfile.followers)} hint="Audiência" tone="purple" />
              <MetricCard icon={<Users className="h-5 w-5" />} label="Seguindo" value={formatNumber(instagramProfile.following)} hint="Conexões" tone="orange" />
              <MetricCard icon={<BarChart3 className="h-5 w-5" />} label="Posts" value={formatNumber(instagramProfile.posts_count)} hint="Publicações" tone="emerald" />
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-[#070b12]/80 p-5 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 font-black uppercase tracking-wide"><FileText className="h-5 w-5 text-cyan-300" /> Informações principais</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-cyan-400" /> {leadPhone || "Telefone não informado"}</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan-400" /> {getLeadAddress(lead)}</p>
            <p className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-400" /> {lead.rating || "Sem avaliação"} {lead.user_ratings_total ? `• ${lead.user_ratings_total} avaliações` : ""}</p>
            <p className="flex items-center gap-2 break-all"><Globe className="h-4 w-4 shrink-0 text-cyan-400" /> {websiteUrl ? <a href={websiteUrl} target="_blank" rel="noreferrer" className="text-cyan-200 hover:underline">{leadWebsite}</a> : "Site não informado"}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#070b12]/80 p-5 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 font-black uppercase tracking-wide"><Zap className="h-5 w-5 text-orange-300" /> Sinais digitais</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <BooleanSignal value={hasSite} label="Possui site" />
            <BooleanSignal value={hasWhatsapp} label="WhatsApp/Telefone" />
            <BooleanSignal value={hasInstagram} label="Instagram" />
            <BooleanSignal value={hasOnlineScheduling} label="Agendamento online" />
            <BooleanSignal value={hasPixel} label="Meta Pixel" />
            <BooleanSignal value={hasAnalytics} label="Analytics/Tag" />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#070b12]/80 p-5 backdrop-blur-xl">
        <h2 className="mb-4 font-black uppercase tracking-wide">CRM do Lead</h2>
        <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
          <div>
            <label className="text-xs font-bold text-slate-400">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#050914] px-3 py-2 text-sm outline-none focus:border-cyan-400/40">
              {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400">Observações</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: falou pelo WhatsApp, pediu proposta, retornar amanhã..." className="mt-1 min-h-24 w-full rounded-xl border border-white/10 bg-[#050914] px-3 py-2 text-sm outline-none focus:border-cyan-400/40" />
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-4 right-4 z-20 mx-auto grid max-w-6xl gap-3 rounded-2xl border border-white/10 bg-[#060a12]/95 p-3 shadow-[0_10px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl md:grid-cols-5">
        {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/15 px-4 py-3 font-black text-emerald-100 transition-all hover:-translate-y-0.5 hover:bg-emerald-400/20"><MessageCircle className="h-4 w-4" /> WhatsApp</a> : <button disabled className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-black text-slate-500">Sem WhatsApp</button>}
        {leadPhone ? <a href={`tel:${leadPhone}`} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-black text-slate-200 transition-all hover:-translate-y-0.5 hover:border-cyan-400/30"><Phone className="h-4 w-4" /> Ligar</a> : <button disabled className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-black text-slate-500">Sem telefone</button>}
        {websiteUrl ? <a href={websiteUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-black text-slate-200 transition-all hover:-translate-y-0.5 hover:border-blue-400/30"><Globe className="h-4 w-4" /> Site</a> : <button disabled className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-black text-slate-500">Sem site</button>}
        <button onClick={() => copyText(pitch)} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-black text-slate-200 transition-all hover:-translate-y-0.5 hover:border-pink-400/30"><Copy className="h-4 w-4" /> Copiar pitch</button>
        <button onClick={saveLead} disabled={saving} className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/15 px-4 py-3 font-black text-cyan-100 transition-all hover:-translate-y-0.5 hover:bg-cyan-400/20 disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar CRM"}</button>
      </div>
    </div>
  );
}

export default LeadProfile;
