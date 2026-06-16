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
  Search,
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
  idealCustomer?: string;
  pain_points?: string;
  painPoints?: string;
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


type SocialProfile = {
  network: "instagram" | "facebook" | "linkedin" | "tiktok" | "youtube" | "whatsapp";
  label: string;
  username?: string;
  url?: string;
  found: boolean;
  followers?: number | string;
  posts?: number | string;
  description?: string;
  tone: "pink" | "blue" | "cyan" | "red" | "emerald" | "slate";
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



function normalizeAnyUrl(value?: any) {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("@")) return raw;
  if (raw.includes(".") && !raw.includes(" ")) return `https://${raw}`;
  return raw;
}

function socialUsernameFromUrl(value?: any) {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (raw.startsWith("@")) return raw.replace("@", "");
  try {
    const url = raw.startsWith("http") ? new URL(raw) : new URL(`https://${raw}`);
    const parts = url.pathname.split("/").filter(Boolean);
    return (parts[0] || "").replace("@", "");
  } catch {
    return raw.replace("@", "").split(/[/?#]/)[0];
  }
}

function ensureSocialUrl(network: SocialProfile["network"], value?: any) {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  const username = raw.replace("@", "").replace(/^https?:\/\//, "").split(/[/?#\s]/)[0];
  if (!username) return "";

  const base: Record<SocialProfile["network"], string> = {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    linkedin: "https://linkedin.com/company/",
    tiktok: "https://tiktok.com/@",
    youtube: "https://youtube.com/@",
    whatsapp: "https://wa.me/",
  };

  return `${base[network]}${username}`;
}

function firstSocialValue(...values: any[]) {
  for (const value of values) {
    if (!value) continue;
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "object") {
      if (value.url) return value.url;
      if (value.link) return value.link;
      if (value.profile_url) return value.profile_url;
      if (value.username) return value.username;
      if (value.handle) return value.handle;
    }
  }
  return "";
}

function buildSocialSearchUrl(leadName: string, city?: string, network?: string) {
  const query = [leadName, city, network].filter(Boolean).join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function buildSocialProfiles(params: {
  lead: any;
  scan: any;
  socials: any;
  instagramProfile?: InstagramProfile | null;
  instagramUrl?: string;
  whatsapp?: string;
}) {
  const { lead, scan, socials, instagramProfile, instagramUrl, whatsapp } = params;
  const scanLinks = scan?.social_links || {};
  const scanIntel = scan?.social_intelligence || {};
  const leadLinks = lead?.social_links || lead?.socials || {};

  const instagramValue = firstSocialValue(
    instagramUrl,
    instagramProfile?.url,
    instagramProfile?.username,
    socials?.instagram,
    socials?.instagram_url,
    scanLinks?.instagram,
    scanIntel?.instagram?.source_url,
    leadLinks?.instagram,
    lead?.instagram,
    lead?.instagram_url
  );

  const facebookValue = firstSocialValue(
    socials?.facebook,
    socials?.facebook_url,
    scanLinks?.facebook,
    scanIntel?.facebook?.source_url,
    leadLinks?.facebook,
    lead?.facebook,
    lead?.facebook_url
  );

  const linkedinValue = firstSocialValue(
    socials?.linkedin,
    socials?.linkedin_url,
    scanLinks?.linkedin,
    scanIntel?.linkedin?.source_url,
    leadLinks?.linkedin,
    lead?.linkedin,
    lead?.linkedin_url
  );

  const tiktokValue = firstSocialValue(
    socials?.tiktok,
    socials?.tiktok_url,
    scanLinks?.tiktok,
    scanIntel?.tiktok?.source_url,
    leadLinks?.tiktok,
    lead?.tiktok,
    lead?.tiktok_url
  );

  const youtubeValue = firstSocialValue(
    socials?.youtube,
    socials?.youtube_url,
    scanLinks?.youtube,
    scanIntel?.youtube?.source_url,
    leadLinks?.youtube,
    lead?.youtube,
    lead?.youtube_url
  );

  const profiles: SocialProfile[] = [
    {
      network: "instagram",
      label: "Instagram",
      username: instagramProfile?.username || socialUsernameFromUrl(instagramValue),
      url: ensureSocialUrl("instagram", instagramValue),
      found: Boolean(instagramValue || instagramProfile?.username),
      followers: instagramProfile?.followers,
      posts: instagramProfile?.posts_count,
      description: instagramProfile?.biography || "Conteúdo, prova social, frequência de postagem e posicionamento da marca.",
      tone: "pink",
    },
    {
      network: "facebook",
      label: "Facebook",
      username: socialUsernameFromUrl(facebookValue),
      url: ensureSocialUrl("facebook", facebookValue),
      found: Boolean(facebookValue),
      description: "Página local, avaliações, comunidade e sinais de atendimento.",
      tone: "blue",
    },
    {
      network: "linkedin",
      label: "LinkedIn",
      username: socialUsernameFromUrl(linkedinValue),
      url: ensureSocialUrl("linkedin", linkedinValue),
      found: Boolean(linkedinValue),
      description: "Perfil institucional, decisores e maturidade B2B.",
      tone: "cyan",
    },
    {
      network: "tiktok",
      label: "TikTok",
      username: socialUsernameFromUrl(tiktokValue),
      url: ensureSocialUrl("tiktok", tiktokValue),
      found: Boolean(tiktokValue),
      description: "Conteúdo rápido, viralização e presença de marca local.",
      tone: "slate",
    },
    {
      network: "youtube",
      label: "YouTube",
      username: socialUsernameFromUrl(youtubeValue),
      url: ensureSocialUrl("youtube", youtubeValue),
      found: Boolean(youtubeValue),
      description: "Autoridade, vídeos, depoimentos e demonstrações.",
      tone: "red",
    },
    {
      network: "whatsapp",
      label: "WhatsApp",
      username: whatsapp ? `+${whatsapp}` : "",
      url: whatsapp ? ensureSocialUrl("whatsapp", whatsapp) : "",
      found: Boolean(whatsapp),
      description: "Canal direto de abordagem comercial.",
      tone: "emerald",
    },
  ];

  return profiles;
}

function SocialNetworkCard({ profile, leadName, city }: { profile: SocialProfile; leadName: string; city?: string }) {
  const toneMap = {
    pink: "border-pink-400/20 bg-pink-400/[0.07] text-pink-200",
    blue: "border-blue-400/20 bg-blue-400/[0.07] text-blue-200",
    cyan: "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-200",
    red: "border-red-400/20 bg-red-400/[0.07] text-red-200",
    emerald: "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200",
    slate: "border-white/10 bg-white/[0.04] text-slate-200",
  };

  const searchUrl = buildSocialSearchUrl(leadName, city, profile.label);

  return (
    <div className={`group relative overflow-hidden rounded-3xl border p-4 transition-all hover:-translate-y-1 hover:bg-white/[0.06] ${toneMap[profile.tone]}`}>
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/10 blur-3xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-70">{profile.label}</p>
          <h3 className="mt-2 truncate text-lg font-black text-white">{profile.found ? (profile.username ? `@${profile.username.replace("@", "")}` : "Perfil encontrado") : "Não encontrado"}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{profile.description}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${profile.found ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-orange-400/20 bg-orange-400/10 text-orange-300"}`}>
          {profile.found ? <CheckCircle2 className="h-5 w-5" /> : <Search className="h-5 w-5" />}
        </div>
      </div>

      {(profile.followers || profile.posts) ? (
        <div className="relative mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] font-black uppercase text-slate-500">Seguidores</p>
            <p className="text-lg font-black text-white">{formatNumber(profile.followers)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] font-black uppercase text-slate-500">Posts</p>
            <p className="text-lg font-black text-white">{formatNumber(profile.posts)}</p>
          </div>
        </div>
      ) : null}

      <div className="relative mt-4 grid grid-cols-2 gap-2">
        {profile.url ? (
          <a href={profile.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black text-white hover:border-cyan-400/30">
            Abrir <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <a href={searchUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black text-white hover:border-cyan-400/30">
            Buscar <Search className="h-3.5 w-3.5" />
          </a>
        )}
        <a href={searchUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-black text-slate-200 hover:border-pink-400/30">
          Validar <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
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

function normalizeOffer(raw: any): SalesOffer | null {
  if (!raw || typeof raw !== "object") return null;
  return {
    ...raw,
    name: raw.name || raw.offer_name || raw.product_name || "",
    description: raw.description || raw.offerSummary || raw.summary || "",
    price: raw.price || raw.ticket || raw.amount || "",
    ideal_customer: raw.ideal_customer || raw.idealCustomer || "",
    pain_points: raw.pain_points || raw.painPoints || "",
    differentials: raw.differentials || raw.differentials_text || "",
    objections: raw.objections || "",
    target_segments: raw.target_segments || raw.idealCustomer || raw.ideal_customer || "",
  };
}

function getPublicIdentityLevel(params: { hasSite: boolean; hasInstagram: boolean; hasWhatsapp: boolean; hasOnlineScheduling: boolean; hasPixel: boolean; hasAnalytics: boolean; reviewsCount: number }) {
  const { hasSite, hasInstagram, hasWhatsapp, hasOnlineScheduling, hasPixel, hasAnalytics, reviewsCount } = params;
  const points = (hasSite ? 22 : 0) + (hasInstagram ? 16 : 0) + (hasWhatsapp ? 18 : 0) + (hasOnlineScheduling ? 14 : 0) + ((hasPixel || hasAnalytics) ? 14 : 0) + (reviewsCount >= 50 ? 16 : reviewsCount >= 10 ? 10 : reviewsCount > 0 ? 6 : 0);
  const score = clampScore(points);
  if (score >= 78) return { label: "Identidade digital forte", score, tone: "emerald" as const, description: "O lead já tem presença pública suficiente para uma abordagem bem personalizada." };
  if (score >= 52) return { label: "Identidade digital em construção", score, tone: "cyan" as const, description: "Existem sinais úteis, mas ainda há lacunas para explorar como oportunidade comercial." };
  return { label: "Identidade digital fraca", score, tone: "orange" as const, description: "Poucos ativos públicos foram encontrados. A abordagem deve começar por diagnóstico e validação." };
}

function getCommercialPersona(params: { leadName: string; category: string; activeOffer?: SalesOffer | null; hasWhatsapp: boolean; hasSite: boolean; hasInstagram: boolean; hasOnlineScheduling: boolean; reviewsCount: number; score: number }) {
  const { leadName, category, activeOffer, hasWhatsapp, hasSite, hasInstagram, hasOnlineScheduling, reviewsCount, score } = params;
  const categoryText = category || "negócio local";
  const offerName = activeOffer?.name || "a oferta cadastrada";
  const hasOffer = Boolean(activeOffer?.name || activeOffer?.description);
  const demandSignal = reviewsCount >= 50 ? "alto movimento público" : reviewsCount >= 10 ? "demanda validada por avaliações" : "demanda ainda pouco visível publicamente";
  const operationSignal = hasOnlineScheduling ? "já possui alguma estrutura de agendamento" : "parece depender de atendimento manual ou processo não visível";
  const channelSignal = hasWhatsapp ? "canal direto encontrado" : "canal direto ainda precisa ser validado";
  const digitalGap = !hasSite ? "site ausente ou não identificado" : !hasInstagram ? "presença social incompleta" : !hasOnlineScheduling ? "agendamento online não identificado" : "presença digital razoavelmente estruturada";

  const opportunity = hasOffer
    ? `A melhor oportunidade é conectar ${offerName} com o contexto de ${categoryText}: ${demandSignal}, ${operationSignal} e ${channelSignal}.`
    : `O lead tem sinais comerciais, mas a análise ainda fica limitada porque nenhuma oferta ativa foi encontrada no perfil. Cadastre a oferta para a IA dizer exatamente o que vender e por quê.`;

  const approach = score >= 70
    ? `Abordar ${leadName} com mensagem consultiva curta, citando um sinal observável e oferecendo diagnóstico rápido antes de falar preço.`
    : `Iniciar com pergunta de qualificação para entender volume de contatos, canal principal e urgência antes de apresentar proposta.`;

  const warning = !hasWhatsapp
    ? "Prioridade: encontrar WhatsApp ou decisor antes de gastar tempo comercial."
    : !hasOffer
      ? "Prioridade: cadastrar a oferta para tornar a análise Produto x Lead precisa."
      : score < 52
        ? "Prioridade: não vender direto; validar dor, orçamento e timing."
        : "Prioridade: avançar com abordagem personalizada e follow-up curto.";

  return { demandSignal, operationSignal, channelSignal, digitalGap, opportunity, approach, warning };
}

function SignalTile({ label, value, description, tone = "cyan" }: { label: string; value: string; description?: string; tone?: "cyan" | "emerald" | "orange" | "pink" | "slate" }) {
  const tones = {
    cyan: "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-100",
    emerald: "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-100",
    orange: "border-orange-400/20 bg-orange-400/[0.08] text-orange-100",
    pink: "border-pink-400/20 bg-pink-400/[0.08] text-pink-100",
    slate: "border-white/10 bg-white/[0.035] text-slate-100",
  };
  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
      {description ? <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p> : null}
    </div>
  );
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
  return [
    offer.name,
    offer.description,
    offer.ideal_customer || offer.idealCustomer,
    offer.pain_points || offer.painPoints,
    offer.differentials,
    offer.target_segments,
  ]
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

function isValidUuid(value?: string | null) {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function escapeSupabaseOrValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/\)/g, "\\)");
}

function getRouteLeadCandidates(value?: string | null) {
  if (!value) return [];
  const decoded = decodeURIComponent(value);
  return Array.from(new Set([value, decoded].filter(Boolean)));
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

  async function loadOffer(_uid: string) {
    // A Busca Inteligente salva a oferta em nxa_sales_offer_v2. Mantemos também
    // compatibilidade com nxa_active_sales_offer para não quebrar versões antigas.
    const storageKeys = ["nxa_sales_offer_v2", "nxa_active_sales_offer"];

    for (const key of storageKeys) {
      const localOffer = localStorage.getItem(key);
      if (!localOffer) continue;

      try {
        const parsed = normalizeOffer(JSON.parse(localOffer));
        if (parsed?.name || parsed?.description) {
          setOffer(parsed);
          return parsed;
        }
      } catch {
        localStorage.removeItem(key);
      }
    }

    setOffer(null);
    return null;
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

      const candidates = getRouteLeadCandidates(id);
      let data: any = null;
      let error: any = null;

      if (isValidUuid(id)) {
        const response = await supabase
          .from("leads")
          .select("*")
          .eq("id", id)
          .or(`user_id.eq.${uid},user_id.is.null`)
          .maybeSingle();
        data = response.data;
        error = response.error;
      } else {
        const response = await supabase
          .from("leads")
          .select("*")
          .or(`user_id.eq.${uid},user_id.is.null`)
          .eq("business_id", candidates[0])
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        data = response.data;
        error = response.error;
      }

      if (error) throw error;

      if (data?.id && !data.user_id) {
        await supabase.from("leads").update({ user_id: uid, updated_at: new Date().toISOString() }).eq("id", data.id);
        data = { ...data, user_id: uid };
      }

      setLead(data);
      setStatus(data?.status || "new");
      setNotes(data?.notes || "");

      if (data?.id) {
        await Promise.all([loadIntelligence(data.id, uid), loadOffer(uid)]);
      } else {
        await loadOffer(uid);
      }
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
    if (!lead?.id || !userId) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("leads")
        .update({ status, notes, updated_at: new Date().toISOString() })
        .eq("id", lead.id)
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
    if (!lead?.id || !lead || !userId) return;
    setAnalyzing(true);

    try {
      const activeOffer = offer || (await loadOffer(userId));

      // Primeiro tenta enriquecer o lead na web para trazer Instagram e outras redes.
      // Se a Edge Function ainda não existir, a análise continua normalmente com os dados atuais.
      let enrichedLead = lead;
      let webEnrichment: any = null;
      try {
        const enrichResponse = await supabase.functions.invoke("enrich-lead-web", {
          body: {
            user_id: userId,
            lead_id: lead.id,
            lead_name: getLeadName(enrichedLead),
            lead_phone: getLeadPhone(enrichedLead),
            lead_website: getLeadWebsite(enrichedLead),
            lead_category: getLeadCategory(enrichedLead),
            lead_city: getLeadCity(enrichedLead),
            lead_state: getLeadState(enrichedLead),
            address: getLeadAddress(enrichedLead),
            sales_offer: activeOffer,
            lead_raw: enrichedLead,
          web_enrichment: webEnrichment,
          },
        });

        if (!enrichResponse.error && enrichResponse.data) {
          webEnrichment = enrichResponse.data?.enrichment || enrichResponse.data;
          enrichedLead = {
            ...lead,
            ...(webEnrichment?.lead || {}),
            website_scan: webEnrichment?.website_scan || webEnrichment?.lead?.website_scan || lead?.website_scan,
            social_links: webEnrichment?.social_links || webEnrichment?.lead?.social_links || lead?.social_links,
            social_profiles: webEnrichment?.social_profiles || webEnrichment?.lead?.social_profiles || lead?.social_profiles,
            payload: {
              ...(lead?.payload || {}),
              web_enrichment: webEnrichment,
              website_scan: webEnrichment?.website_scan || lead?.payload?.website_scan,
              social_links: webEnrichment?.social_links || lead?.payload?.social_links,
              social_profiles: webEnrichment?.social_profiles || lead?.payload?.social_profiles,
            },
          };
          setLead(enrichedLead);

          try {
            await supabase
              .from("leads")
              .update({
                website: getLeadWebsite(enrichedLead) || lead.website || null,
                payload: enrichedLead.payload,
                updated_at: new Date().toISOString(),
              })
              .eq("id", lead.id)
              .eq("user_id", userId);
          } catch (persistError) {
            console.warn("Enriquecimento web não foi persistido no lead:", persistError);
          }
        }
      } catch (enrichError) {
        console.warn("enrich-lead-web indisponível; seguindo com análise local:", enrichError);
      }

      const { data, error } = await supabase.functions.invoke("analyze-lead", {
        body: {
          user_id: userId,
          lead_id: lead.id,
          lead_name: getLeadName(lead),
          lead_phone: getLeadPhone(lead),
          lead_website: getLeadWebsite(lead),
          lead_category: getLeadCategory(lead),
          lead_city: getLeadCity(lead),
          lead_state: getLeadState(lead),
          address: getLeadAddress(lead),
          rating: enrichedLead.rating,
          reviews_count: enrichedLead.reviews_count || enrichedLead.user_ratings_total || enrichedLead.google_reviews_count,
          cnpj: enrichedLead.cnpj || "",
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
            "approach_message",
            "website_scan",
            "social_links",
            "social_intelligence",
            "social_summary",
            "social_opportunities"
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
        await loadIntelligence(lead.id, userId);
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
  const leadPayload = lead?.payload || {};
  const webPayload = leadPayload?.web_enrichment || leadPayload?.enrichment || {};
  const scan = intelligence?.website_scan || lead?.website_scan || leadPayload?.website_scan || webPayload?.website_scan || {};
  const socials = intelligence?.social_links || lead?.social_links || leadPayload?.social_links || webPayload?.social_links || {};
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
  const identityLevel = getPublicIdentityLevel({ hasSite, hasInstagram, hasWhatsapp, hasOnlineScheduling, hasPixel, hasAnalytics, reviewsCount });
  const commercialPersona = getCommercialPersona({ leadName, category: leadCategory, activeOffer, hasWhatsapp, hasSite, hasInstagram, hasOnlineScheduling, reviewsCount, score: commercialScore });
  const recommendedOfferText = activeOffer?.name || "Oferta ainda não cadastrada";
  const digitalAssets = [
    hasSite ? "Site encontrado" : "Site não identificado",
    hasWhatsapp ? "WhatsApp/telefone encontrado" : "WhatsApp não validado",
    hasInstagram ? "Instagram identificado" : "Instagram não identificado",
    hasOnlineScheduling ? "Agendamento online detectado" : "Agendamento online ausente",
    hasPixel || hasAnalytics ? "Medição digital detectada" : "Medição digital não detectada",
  ];

  const socialProfiles = buildSocialProfiles({ lead, scan, socials, instagramProfile, instagramUrl, whatsapp });
  const businessSocialProfiles = socialProfiles.filter((profile) => profile.network !== "whatsapp");
  const foundBusinessSocialProfiles = businessSocialProfiles.filter((profile) => profile.found);
  const socialCoverage = clampScore(Math.round((foundBusinessSocialProfiles.length / Math.max(businessSocialProfiles.length, 1)) * 100));
  const socialSearchUrl = buildSocialSearchUrl(leadName, getLeadCity(lead), "Instagram Facebook LinkedIn TikTok");
  const instagramSocial = businessSocialProfiles.find((profile) => profile.network === "instagram");
  const primarySocial = foundBusinessSocialProfiles.find((profile) => profile.network === "instagram") || foundBusinessSocialProfiles[0] || null;
  const hasBusinessInstagram = Boolean(instagramSocial?.found);
  const confirmedChannels = [hasWhatsapp ? "WhatsApp" : "", hasSite ? "Site" : "", ...foundBusinessSocialProfiles.map((profile) => profile.label)].filter(Boolean);
  const cleanInstagramLabel = hasBusinessInstagram
    ? (instagramSocial?.username ? `@${String(instagramSocial.username).replace("@", "")}` : "Instagram encontrado")
    : "Instagram não confirmado";
  const socialPositioning = foundBusinessSocialProfiles.length >= 3
    ? "A empresa tem presença online suficiente para uma abordagem bem personalizada. Antes de chamar, olhe o tom das publicações e use um detalhe real da marca."
    : foundBusinessSocialProfiles.length >= 1
      ? "Existe algum sinal social, mas ainda vale validar o perfil antes de usar isso como gancho na mensagem."
      : "Não encontrei redes confiáveis automaticamente. A melhor ação é usar a busca assistida e validar manualmente antes de personalizar a abordagem.";
  const socialOpportunityText = primarySocial
    ? `Use ${primarySocial.label} como apoio: observe linguagem, comentários, frequência de conteúdo e sinais de demanda antes de enviar a proposta de ${activeOffer?.name || "sua oferta"}.`
    : `Sem rede social confirmada, aborde pelo WhatsApp ou site com uma pergunta simples e valide se ${activeOffer?.name || "sua oferta"} faz sentido para o momento do lead.`;
  const socialOfferFitText = activeOffer?.name
    ? foundBusinessSocialProfiles.length
      ? `As redes ajudam a conectar ${activeOffer.name} com a realidade do lead sem parecer mensagem copiada.`
      : `A oferta ${activeOffer.name} pode fazer sentido, mas falta contexto social para personalizar melhor.`
    : "Cadastre uma oferta na Busca Inteligente para a IA cruzar redes sociais, dor provável e abordagem ideal.";
  const shortReason = commercialPersona.opportunity || reason;
  return (
    <div className="relative space-y-5 pb-28">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.10),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(236,72,153,0.10),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(2,6,23,1))]" />

      <Link href="/leads">
        <button className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-bold text-cyan-300 transition-all hover:-translate-x-1 hover:border-cyan-400/30 hover:bg-cyan-400/10">
          <ArrowLeft className="h-4 w-4" /> Voltar para Leads
        </button>
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#050914]/90 p-5 shadow-[0_0_80px_rgba(34,211,238,0.10)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(236,72,153,0.12),transparent_28%)]" />
        <div className="relative grid gap-5 xl:grid-cols-[1.15fr_0.85fr] xl:items-stretch">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-cyan-400"><Building2 className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.18em]">Perfil comercial do lead</span></div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">{leadName || "Lead sem nome"}</h1>
            <p className="mt-2 text-slate-400">{leadCategory || "Segmento não informado"} • {getLeadAddress(lead)}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Decisão</p>
                <p className="mt-1 text-xl font-black text-white">{score >= 70 ? "Abordar" : score >= 50 ? "Qualificar" : "Nutrir"}</p>
                <p className="mt-1 text-xs text-slate-400">{priorityLevel.description}</p>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.08] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">Melhor canal</p>
                <p className="mt-1 text-xl font-black text-white">{hasWhatsapp ? "WhatsApp" : hasSite ? "Site" : primarySocial?.label || "Validar contato"}</p>
                <p className="mt-1 text-xs text-slate-400">{hasWhatsapp ? "Canal direto pronto para abordagem." : "Antes de vender, confirme o contato."}</p>
              </div>
              <div className="rounded-2xl border border-pink-400/20 bg-pink-400/[0.08] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-pink-300">Redes</p>
                <p className="mt-1 text-xl font-black text-white">{foundBusinessSocialProfiles.length}/{businessSocialProfiles.length}</p>
                <p className="mt-1 text-xs text-slate-400">{cleanInstagramLabel}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500">Score</p>
                <div className={`mt-1 flex items-center gap-1 text-3xl font-black ${getScoreColor(score)}`}>{getScoreIcon(score)}{score}</div>
                <ProgressBar value={score} tone="emerald" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500">Fit</p>
                <p className="mt-1 text-3xl font-black text-cyan-200">{fitScore || score}</p>
                <ProgressBar value={fitScore || score} tone="cyan" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500">Confiança</p>
                <p className="mt-1 text-3xl font-black text-pink-200">{analysisConfidence}</p>
                <ProgressBar value={analysisConfidence} tone="pink" />
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.20em] text-emerald-300">Próxima melhor ação</p>
              <p className="mt-2 text-sm font-bold leading-relaxed text-slate-200">{nextAction}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.055] p-5">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-300"><Rocket className="h-4 w-4" /> Resumo da IA para vender</p>
          <h2 className="mt-2 text-2xl font-black text-white">{recommendation.label}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{shortReason}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <SignalTile label="Oferta indicada" value={recommendedOfferText} description={activeOffer?.description || "Cadastre uma oferta para a IA cruzar produto x lead com mais precisão."} tone={activeOffer?.name ? "emerald" : "orange"} />
            <SignalTile label="Abordagem" value={hasWhatsapp ? "WhatsApp consultivo" : "Validar canal primeiro"} description={commercialPersona.approach} tone={hasWhatsapp ? "cyan" : "orange"} />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#070b12]/80 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Mensagem pronta</p>
              <h2 className="mt-2 text-xl font-black text-white">Abordagem personalizada</h2>
            </div>
            <button onClick={() => copyText(pitch)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-black text-slate-200 hover:border-cyan-400/30"><Copy className="h-4 w-4" /> Copiar</button>
          </div>
          <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">{pitch}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {hasWhatsapp ? <Pill tone="emerald">WhatsApp pronto</Pill> : <Pill tone="orange">Contato a validar</Pill>}
            {activeOffer?.name ? <Pill tone="emerald">Oferta conectada</Pill> : <Pill tone="orange">Oferta pendente</Pill>}
            {primarySocial ? <Pill tone="pink">Rede validável</Pill> : null}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-400/20 bg-[#070812]/90 p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-pink-300"><Instagram className="h-4 w-4" /> Presença online</p>
            <h2 className="mt-2 text-2xl font-black text-white">Redes sociais do lead</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">{socialPositioning}</p>
          </div>
          <div className="rounded-2xl border border-pink-400/20 bg-pink-400/[0.08] px-5 py-3 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Localizadas</p>
            <p className="text-2xl font-black text-white">{socialCoverage}%</p>
            <p className="text-xs text-slate-400">{foundBusinessSocialProfiles.length}/{businessSocialProfiles.length} redes</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {businessSocialProfiles.map((profile) => (
            <div key={profile.network} className={`rounded-2xl border p-4 ${profile.found ? "border-emerald-400/20 bg-emerald-400/[0.06]" : "border-white/10 bg-white/[0.035]"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{profile.label}</p>
                  <p className="mt-1 truncate text-base font-black text-white">{profile.found ? (profile.username ? `@${String(profile.username).replace("@", "")}` : "Encontrado") : "Não confirmado"}</p>
                  {profile.followers ? <p className="mt-1 text-xs text-slate-400">{formatNumber(profile.followers)} seguidores</p> : null}
                </div>
                {profile.found ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" /> : <AlertTriangle className="h-5 w-5 shrink-0 text-orange-300" />}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={profile.url || buildSocialSearchUrl(leadName, getLeadCity(lead), profile.label)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.05] px-2 py-2 text-xs font-black text-white hover:border-pink-400/30">
                  {profile.found ? "Abrir" : "Buscar"} <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button onClick={() => copyText(profile.url || buildSocialSearchUrl(leadName, getLeadCity(lead), profile.label))} className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-xs font-black text-slate-200 hover:border-cyan-400/30">
                  Copiar <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.055] p-4 text-sm leading-relaxed text-slate-300">
          <p className="font-black text-cyan-100">Como usar sem poluir a venda</p>
          <p className="mt-2">{socialOpportunityText}</p>
          <p className="mt-2 text-xs text-slate-500">{socialOfferFitText}</p>
        </div>
      </section>

      <details className="group rounded-3xl border border-white/10 bg-[#070b12]/80 p-5 backdrop-blur-xl">
        <summary className="cursor-pointer list-none font-black text-white flex items-center justify-between gap-3">
          <span className="flex items-center gap-2"><Brain className="h-5 w-5 text-cyan-300" /> Ver diagnóstico completo da IA</span>
          <span className="text-xs text-slate-400 group-open:hidden">Expandir</span><span className="hidden text-xs text-slate-400 group-open:inline">Recolher</span>
        </summary>
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.06] p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Pill tone="cyan">Confiança {analysisConfidence}%</Pill>
              <Pill tone={priorityLevel.tone}>Prioridade {priorityLevel.label}</Pill>
              <Pill tone={intentLevel.tone}>Intenção {intentLevel.label}</Pill>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{reason}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <InsightList title="Oportunidades" icon={<Sparkles className="h-4 w-4" />} items={finalOpportunities.slice(0, 4)} empty="Aguardando análise da IA." tone="emerald" />
            <InsightList title="Pontos para validar" icon={<AlertTriangle className="h-4 w-4" />} items={finalMissing.slice(0, 4)} empty="Nenhum ponto crítico identificado." tone="orange" />
            <InsightList title="Objeções prováveis" icon={<ShieldCheck className="h-4 w-4" />} items={finalObjections.slice(0, 4)} empty="Sem objeções mapeadas ainda." tone="pink" />
          </div>
        </div>
      </details>

      <details className="group rounded-3xl border border-white/10 bg-[#070b12]/80 p-5 backdrop-blur-xl">
        <summary className="cursor-pointer list-none font-black text-white flex items-center justify-between gap-3">
          <span className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-orange-300" /> Ver dados, projeção e CRM</span>
          <span className="text-xs text-slate-400 group-open:hidden">Expandir</span><span className="hidden text-xs text-slate-400 group-open:inline">Recolher</span>
        </summary>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <h3 className="mb-4 font-black text-white">Informações principais</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-cyan-400" /> {leadPhone || "Telefone não informado"}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan-400" /> {getLeadAddress(lead)}</p>
              <p className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-400" /> {lead.rating || "Sem avaliação"} {lead.user_ratings_total ? `• ${lead.user_ratings_total} avaliações` : ""}</p>
              <p className="flex items-center gap-2 break-all"><Globe className="h-4 w-4 shrink-0 text-cyan-400" /> {websiteUrl ? <a href={websiteUrl} target="_blank" rel="noreferrer" className="text-cyan-200 hover:underline">{leadWebsite}</a> : "Site não informado"}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <h3 className="mb-4 font-black text-white">Projeção simples</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Potencial" value={hasFinancialProjection ? moneyBRL(expectedRevenue) : potential} hint="Estimativa, não promessa" />
              <DetailRow label="LTV 12 meses" value={hasFinancialProjection ? moneyBRL(estimatedLtv) : "Não estimado"} hint="Com base na oferta" />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 xl:col-span-2">
            <h3 className="mb-4 font-black text-white">CRM do lead</h3>
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
            <button onClick={saveLead} disabled={saving} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/15 px-4 py-3 font-black text-cyan-100 transition-all hover:-translate-y-0.5 hover:bg-cyan-400/20 disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar CRM"}</button>
          </div>
        </div>
      </details>

      <div className="fixed bottom-4 left-4 right-4 z-20 mx-auto grid max-w-7xl gap-3 rounded-2xl border border-white/10 bg-[#060a12]/95 p-3 shadow-[0_10px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl md:grid-cols-5">
        {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/15 px-4 py-3 font-black text-emerald-100 transition-all hover:-translate-y-0.5 hover:bg-emerald-400/20"><MessageCircle className="h-4 w-4" /> WhatsApp</a> : <button disabled className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-black text-slate-500">Sem WhatsApp</button>}
        {websiteUrl ? <a href={websiteUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-black text-slate-200 transition-all hover:-translate-y-0.5 hover:border-blue-400/30"><Globe className="h-4 w-4" /> Site</a> : <button disabled className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-black text-slate-500">Sem site</button>}
        <a href={primarySocial?.url || socialSearchUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-pink-400/25 bg-pink-400/10 px-4 py-3 font-black text-pink-100 transition-all hover:-translate-y-0.5 hover:bg-pink-400/20"><Instagram className="h-4 w-4" /> Redes</a>
        <button onClick={() => copyText(pitch)} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-black text-slate-200 transition-all hover:-translate-y-0.5 hover:border-pink-400/30"><Copy className="h-4 w-4" /> Copiar pitch</button>
        <button onClick={createFollowup} disabled={creatingFollowup} className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/15 px-4 py-3 font-black text-cyan-100 transition-all hover:-translate-y-0.5 hover:bg-cyan-400/20 disabled:opacity-60"><CalendarPlus className="h-4 w-4" /> {creatingFollowup ? "Criando..." : "Follow-up"}</button>
      </div>
    </div>
  );

}

export default LeadProfile;
