import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Radar,
  Sparkles,
  Target,
  Plus,
  X,
  Zap,
  Filter,
  Globe2,
  Loader2,
  Coins,
  MapPin,
  Star,
  Phone,
  Globe,
  Flame,
  Thermometer,
  Snowflake,
  Eye,
  BookmarkPlus,
  Send,
  BrainCircuit,
  MessageSquareText,
  Download,
  RefreshCw,
  Check,
  BarChart3,
  ShieldCheck,
  ExternalLink,
  ArrowUpRight,
  Wand2,
  DollarSign,
  Users,
  Lightbulb,
  Gauge,
  ChevronDown,
  ChevronUp,
  Layers3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const CREDIT_COST_PER_LEAD = 1;
const MIN_CREDITS_TO_SEARCH = 1;

type Mode = "catalogo" | "custom";

type SalesOffer = {
  name: string;
  description: string;
  price: string;
  idealCustomer: string;
  painPoints: string;
  differentials: string;
  objections: string;
};

type Lead = {
  id: string;
  name: string;
  segment: string;
  city: string;
  state: string;
  address: string;
  phone?: string;
  website?: string;
  maps_url?: string;
  google_rating?: number;
  google_reviews_count?: number;
  score: number;
  status: string;
  ai_fit_score?: number;
  ai_purchase_probability?: number;
  ai_ticket_estimate?: string;
  ai_fit_label?: string;
  ai_reason?: string;
  ai_next_action?: string;
  ai_pitch?: string;
  ai_pain_detected?: string[];
  ai_offer_name?: string;
  ai_need_score?: number;
  ai_financial_capacity?: number;
  ai_response_probability?: number;
  ai_compatibility_reason?: string;
  ai_disqualification_risk?: string;
  ai_confidence?: number;
  ai_segments_matched?: string[];
  ai_strategy_tags?: string[];
};

type Category = {
  key: string;
  label: string;
  emoji: string;
  niches: Niche[];
};

type Niche = {
  key: string;
  label: string;
  emoji: string;
  keywords: string[];
  includedTypes: string[];
};

const STATES = [
  "SP",
  "RJ",
  "MG",
  "BA",
  "RS",
  "PR",
  "SC",
  "CE",
  "GO",
  "PE",
  "MA",
  "AM",
  "ES",
  "MT",
  "MS",
  "PA",
  "RN",
  "AL",
  "PB",
  "PI",
  "TO",
  "AP",
  "RO",
  "SE",
  "AC",
  "RR",
  "DF",
];

const NICHE_CATALOG: Category[] = [
  {
    key: "beleza",
    label: "Beleza",
    emoji: "💅",
    niches: [
      {
        key: "barbearia",
        label: "Barbearias",
        emoji: "💈",
        keywords: [
          "barbearia",
          "barbearia premium",
          "barbearia masculina",
          "barber shop",
          "corte masculino",
          "barbearia perto de mim",
        ],
        includedTypes: ["beauty_salon", "hair_care"],
      },
      {
        key: "salao",
        label: "Salões de beleza",
        emoji: "💇",
        keywords: [
          "salão de beleza",
          "cabeleireiro",
          "escovaria",
          "manicure",
          "designer de sobrancelhas",
          "spa dos cabelos",
        ],
        includedTypes: ["beauty_salon", "hair_care"],
      },
      {
        key: "estetica",
        label: "Clínicas de estética",
        emoji: "✨",
        keywords: [
          "clínica de estética",
          "estética facial",
          "limpeza de pele",
          "harmonização facial",
          "depilação a laser",
          "procedimentos estéticos",
        ],
        includedTypes: ["beauty_salon", "spa"],
      },
    ],
  },
  {
    key: "saude",
    label: "Saúde",
    emoji: "🩺",
    niches: [
      {
        key: "dentista",
        label: "Dentistas",
        emoji: "🦷",
        keywords: [
          "dentista",
          "clínica odontológica",
          "implante dentário",
          "ortodontia",
          "clareamento dental",
          "odontologia estética",
        ],
        includedTypes: ["dentist"],
      },
      {
        key: "clinica",
        label: "Clínicas médicas",
        emoji: "🏥",
        keywords: [
          "clínica médica",
          "consultório médico",
          "dermatologista",
          "fisioterapia",
          "psicólogo",
          "nutricionista",
        ],
        includedTypes: ["doctor", "physiotherapist", "health"],
      },
    ],
  },
  {
    key: "fitness",
    label: "Fitness",
    emoji: "🏋️",
    niches: [
      {
        key: "academia",
        label: "Academias",
        emoji: "💪",
        keywords: [
          "academia",
          "studio fitness",
          "crossfit",
          "pilates",
          "personal trainer",
          "musculação",
        ],
        includedTypes: ["gym"],
      },
    ],
  },
  {
    key: "servicos",
    label: "Serviços",
    emoji: "🛠️",
    niches: [
      {
        key: "auto",
        label: "Auto / Mecânicas",
        emoji: "🚗",
        keywords: [
          "oficina mecânica",
          "auto center",
          "funilaria",
          "lava jato",
          "estética automotiva",
          "mecânico",
        ],
        includedTypes: ["car_repair", "car_wash"],
      },
      {
        key: "pet",
        label: "Pet shops",
        emoji: "🐶",
        keywords: [
          "pet shop",
          "banho e tosa",
          "clínica veterinária",
          "veterinário",
          "hotel pet",
          "day care pet",
        ],
        includedTypes: ["pet_store", "veterinary_care"],
      },
    ],
  },
  {
    key: "negocios",
    label: "Negócios",
    emoji: "🏢",
    niches: [
      {
        key: "imobiliaria",
        label: "Imobiliárias",
        emoji: "🏠",
        keywords: [
          "imobiliária",
          "corretor de imóveis",
          "imóveis",
          "administração de imóveis",
          "aluguel de imóveis",
          "venda de imóveis",
        ],
        includedTypes: ["real_estate_agency"],
      },
      {
        key: "advocacia",
        label: "Advocacias",
        emoji: "⚖️",
        keywords: [
          "advogado",
          "escritório de advocacia",
          "advogado trabalhista",
          "advogado previdenciário",
          "advogado criminal",
          "advogado empresarial",
        ],
        includedTypes: ["lawyer"],
      },
    ],
  },
  {
    key: "alimentacao",
    label: "Alimentação",
    emoji: "🍽️",
    niches: [
      { key: "restaurante", label: "Restaurantes", emoji: "🍝", keywords: ["restaurante", "restaurante delivery", "pizzaria", "hamburgueria", "self service", "bar e restaurante"], includedTypes: ["restaurant", "meal_takeaway"] },
      { key: "cafeteria", label: "Cafeterias", emoji: "☕", keywords: ["cafeteria", "coffee shop", "padaria artesanal", "doceria", "confeitaria", "brunch"], includedTypes: ["cafe", "bakery"] },
    ],
  },
  {
    key: "educacao",
    label: "Educação",
    emoji: "🎓",
    niches: [
      { key: "escola", label: "Escolas e cursos", emoji: "📚", keywords: ["escola particular", "curso profissionalizante", "curso de inglês", "escola de idiomas", "reforço escolar", "curso técnico"], includedTypes: ["school", "university"] },
    ],
  },
  {
    key: "casa_construcao",
    label: "Casa & Construção",
    emoji: "🏗️",
    niches: [
      { key: "construcao", label: "Construção e reformas", emoji: "🧱", keywords: ["construtora", "empreiteira", "reformas", "marcenaria", "marmoraria", "vidraçaria", "material de construção"], includedTypes: ["hardware_store", "home_goods_store", "general_contractor"] },
      { key: "ar_condicionado", label: "Ar-condicionado", emoji: "❄️", keywords: ["instalação de ar condicionado", "manutenção ar condicionado", "climatização", "refrigeração", "assistência ar condicionado"], includedTypes: ["point_of_interest", "establishment"] },
    ],
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getScoreColor(score: number) {
  if (score >= 81) return "#f87171";
  if (score >= 61) return "#fb923c";
  if (score >= 41) return "#facc15";
  return "#60a5fa";
}

function getScoreLabel(score: number) {
  if (score >= 81) return "Muito quente";
  if (score >= 61) return "Quente";
  if (score >= 41) return "Morno";
  return "Frio";
}

function getScoreIcon(score: number) {
  if (score >= 61) return <Flame className="h-3.5 w-3.5" />;
  if (score >= 41) return <Thermometer className="h-3.5 w-3.5" />;
  return <Snowflake className="h-3.5 w-3.5" />;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function capitalizeWords(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}


const DEFAULT_SALES_OFFER: SalesOffer = {
  name: "Automação WhatsApp com IA",
  description:
    "Atendimento automático com IA para responder leads, organizar contatos, agendar horários e recuperar oportunidades perdidas.",
  price: "R$497/mês",
  idealCustomer:
    "Clínicas, estética, odontologia, barbearias, salões, pet shops e negócios que dependem de WhatsApp, agenda e recorrência.",
  painPoints:
    "Demora para responder, perda de mensagens, agenda desorganizada, no-show, falta de follow-up e baixa conversão no WhatsApp.",
  differentials:
    "IA 24h, agendamento automático, follow-up inteligente, CRM, análise de leads, priorização comercial e mensagens personalizadas.",
  objections:
    "Já tenho alguém respondendo, estou sem tempo, acho caro, não sei se IA funciona para meu negócio.",
};

function readSalesOfferStorage(): SalesOffer {
  try {
    const raw = localStorage.getItem("nxa_sales_offer_v2");
    if (!raw) return DEFAULT_SALES_OFFER;
    return { ...DEFAULT_SALES_OFFER, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SALES_OFFER;
  }
}

function writeSalesOfferStorage(offer: SalesOffer) {
  try {
    localStorage.setItem("nxa_sales_offer_v2", JSON.stringify(offer));
  } catch {
    // localStorage indisponível não deve travar a busca
  }
}

function splitTerms(value: string) {
  return normalizeText(value)
    .split(/[,;\n\.]+|\s+e\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 3);
}

function estimateTicketFromOffer(offer: SalesOffer, score: number) {
  const price = offer.price?.trim();

  if (price) {
    if (score >= 85) return `${price} ou plano superior`;
    if (score >= 70) return price;
    return `Entrada/teste até ${price}`;
  }

  if (score >= 85) return "Alto";
  if (score >= 70) return "Médio/alto";
  if (score >= 50) return "Médio";
  return "Baixo";
}

function getOfferFitLabel(score: number) {
  if (score >= 86) return "Fit premium";
  if (score >= 72) return "Alta aderência";
  if (score >= 55) return "Precisa qualificar";
  return "Baixa prioridade";
}

function analyzeLeadForOffer(lead: Lead, offer: SalesOffer): Lead {
  const leadText = normalizeText(
    [
      lead.name,
      lead.segment,
      lead.city,
      lead.address,
      lead.website ? "tem site website presenca digital empresa estruturada" : "sem site baixa presenca digital",
      lead.phone ? "tem telefone whatsapp contato direto" : "sem telefone sem whatsapp",
    ]
      .filter(Boolean)
      .join(" ")
  );

  const offerText = normalizeText(
    [
      offer.name,
      offer.description,
      offer.idealCustomer,
      offer.painPoints,
      offer.differentials,
      offer.objections,
    ].join(" ")
  );

  const leadSegment = normalizeText(`${lead.segment || ""} ${lead.name || ""}`);
  const idealTerms = splitTerms(offer.idealCustomer);
  const painTerms = splitTerms(offer.painPoints);
  const productTerms = splitTerms(`${offer.name} ${offer.description}`);
  const idealMatches = idealTerms.filter((term) => leadText.includes(term));
  const productMatches = productTerms.filter((term) => leadText.includes(term));
  const painMatches = painTerms.filter((term) => leadText.includes(term));

  const rules = [
    {
      label: "agenda/atendimento",
      offer: /whatsapp|agenda|agendamento|atendimento|crm|follow|mensagem|lead|recepcao|secretaria|ia|chatbot/,
      segments: ["clinica", "estetica", "dent", "odont", "barbearia", "salao", "pet", "veterin", "academia", "pilates", "fisioterapia", "psicolog", "nutric", "consultorio"],
      pains: ["perda de mensagens", "demora no atendimento", "no-show", "baixa conversao", "agenda desorganizada"],
      reason: "negócio depende de atendimento rápido, agenda, recorrência e relacionamento com clientes.",
    },
    {
      label: "mobiliário corporativo",
      offer: /cadeira|mesa|movel|moveis|mobiliario|ergonom|poltrona|estacao de trabalho|escritorio/,
      segments: ["escritorio", "contabilidade", "advocacia", "clinica", "consultorio", "coworking", "imobiliaria", "administr", "empresa", "corretora", "financeira", "agencia", "ti", "software"],
      pains: ["conforto da equipe", "ergonomia", "estrutura do escritório", "renovação do ambiente"],
      reason: "empresa com ambiente administrativo ou atendimento presencial tende a usar cadeiras, mesas e estações de trabalho.",
    },
    {
      label: "marketing/vendas",
      offer: /marketing|trafego|anuncio|google ads|meta ads|social media|site|landing|vendas|funil|crm|prospeccao/,
      segments: ["clinica", "estetica", "dent", "advocacia", "imobiliaria", "construtora", "escola", "curso", "academia", "restaurante", "loja", "pet", "barbearia", "salao"],
      pains: ["atração de clientes", "presença digital", "conversão", "demanda previsível"],
      reason: "negócio local competitivo que pode aumentar demanda com aquisição digital e processo comercial.",
    },
    {
      label: "limpeza/higienização",
      offer: /limpeza|higienizacao|impermeabilizacao|estofado|sofa|colchao|tapete|carpete|lavagem/,
      segments: ["hotel", "pousada", "clinica", "consultorio", "escola", "creche", "restaurante", "bar", "academia", "condominio", "imobiliaria", "buffet", "salao", "estetica"],
      pains: ["higiene", "manutenção", "aparência do ambiente", "alto fluxo de pessoas"],
      reason: "local com circulação de clientes ou uso de estofados tende a ter necessidade recorrente de limpeza.",
    },
    {
      label: "energia solar/eficiência",
      offer: /energia solar|fotovoltaica|placa solar|economia de energia|conta de luz|eficiencia energetica/,
      segments: ["industria", "supermercado", "mercado", "hotel", "pousada", "academia", "escola", "clinica", "restaurante", "posto", "fazenda", "condominio", "galpao"],
      pains: ["redução de custo fixo", "conta de energia", "alto consumo"],
      reason: "operação com estrutura física e consumo relevante pode ter ganho financeiro com redução de energia.",
    },
    {
      label: "sistemas/ERP/software",
      offer: /erp|software|sistema|gestao|automacao comercial|pdv|controle financeiro|estoque|emissor|nota fiscal|saas/,
      segments: ["loja", "mercado", "distribuidora", "restaurante", "oficina", "auto pecas", "clinica", "escola", "industria", "ecommerce", "farmacia"],
      pains: ["controle operacional", "gestão financeira", "estoque", "processos manuais"],
      reason: "empresa com rotina operacional, vendas, estoque ou atendimento pode ganhar controle com sistema de gestão.",
    },
  ];

  const matchedRules = rules.filter(
    (rule) => rule.offer.test(offerText) && rule.segments.some((term) => leadSegment.includes(term))
  );

  const conflictingRules = rules.filter(
    (rule) => rule.offer.test(offerText) && !rule.segments.some((term) => leadSegment.includes(term))
  );

  const matchedRule = matchedRules[0];
  const hasStrongRuleMatch = matchedRules.length > 0;
  const reviewCount = Number(lead.google_reviews_count || 0);
  const rating = Number(lead.google_rating || 0);

  let compatibility = 18;
  compatibility += Math.min(32, idealMatches.length * 11);
  compatibility += Math.min(18, productMatches.length * 8);
  compatibility += hasStrongRuleMatch ? 34 : 0;
  compatibility += lead.website ? 4 : 0;
  compatibility += lead.phone ? 4 : 0;
  if (!hasStrongRuleMatch && conflictingRules.length > 0 && idealMatches.length === 0 && productMatches.length === 0) {
    compatibility -= 18;
  }
  compatibility = Math.max(5, Math.min(98, Math.round(compatibility)));

  let need = 22;
  need += hasStrongRuleMatch ? 36 : 0;
  need += Math.min(18, painMatches.length * 7);
  need += reviewCount >= 80 ? 9 : reviewCount >= 25 ? 5 : 0;
  need += rating >= 4.5 ? 4 : 0;
  if (!hasStrongRuleMatch && idealMatches.length === 0) need -= 10;
  need = Math.max(5, Math.min(96, Math.round(need)));

  let financial = 30;
  financial += lead.website ? 18 : 4;
  financial += reviewCount >= 150 ? 20 : reviewCount >= 70 ? 15 : reviewCount >= 25 ? 9 : reviewCount >= 8 ? 5 : 0;
  financial += rating >= 4.7 ? 8 : rating >= 4.3 ? 5 : rating > 0 ? 2 : 0;
  financial += lead.phone ? 7 : 0;
  financial += /clinica|odont|imobiliaria|hotel|industria|advocacia|contabilidade|construtora|academia|software|empresa/.test(leadSegment) ? 10 : 0;
  financial = Math.max(8, Math.min(95, Math.round(financial)));

  let response = 24;
  response += lead.phone ? 32 : -10;
  response += lead.website ? 14 : 3;
  response += rating >= 4.4 ? 7 : 0;
  response += reviewCount >= 20 ? 7 : 0;
  response += compatibility >= 70 ? 10 : compatibility >= 50 ? 5 : 0;
  response = Math.max(5, Math.min(96, Math.round(response)));

  const score = Math.max(
    6,
    Math.min(
      99,
      Math.round(compatibility * 0.42 + need * 0.26 + financial * 0.18 + response * 0.14)
    )
  );

  const detectedPains: string[] = [];
  if (matchedRule) detectedPains.push(...matchedRule.pains.slice(0, 3));
  if (!lead.website) detectedPains.push("presença digital limitada");
  if (reviewCount >= 80) detectedPains.push("alto volume de demanda/reputação");
  if (lead.phone) detectedPains.push("canal direto para abordagem comercial");
  if (rating >= 4.6) detectedPains.push("boa reputação para escalar aquisição");

  const uniquePains = Array.from(new Set(detectedPains)).slice(0, 5);
  const confidence = Math.max(
    18,
    Math.min(
      98,
      Math.round(
        (hasStrongRuleMatch ? 40 : 10) +
          Math.min(24, idealMatches.length * 8) +
          (lead.phone ? 12 : 0) +
          (lead.website ? 10 : 0) +
          (reviewCount > 0 ? 8 : 0)
      )
    )
  );

  const probability = Math.max(
    5,
    Math.min(97, Math.round(score * 0.58 + response * 0.27 + confidence * 0.15))
  );

  const fitExplanation = hasStrongRuleMatch
    ? matchedRule.reason
    : idealMatches.length
      ? `há termos do cliente ideal compatíveis com o lead: ${idealMatches.slice(0, 3).join(", ")}.`
      : "não há sinais fortes suficientes entre a oferta e o segmento do lead; exige validação manual antes de priorizar.";

  const disqualificationRisk =
    score >= 72
      ? "baixo: sinais comerciais suficientes para abordagem."
      : score >= 50
        ? "médio: abordar com pergunta de qualificação antes da oferta."
        : "alto: baixa aderência aparente entre oferta e segmento encontrado.";

  const reason = [
    `${getOfferFitLabel(score)} para "${offer.name || "sua oferta"}"`,
    `Compatibilidade ${compatibility}/100`,
    `Necessidade ${need}/100`,
    fitExplanation,
  ].join(" · ");

  const nextAction =
    score >= 86
      ? "Prioridade máxima: abordar hoje com diagnóstico direto, prova de valor e proposta objetiva."
      : score >= 72
        ? "Abordar hoje validando a dor principal e oferecendo uma demonstração rápida."
        : score >= 55
          ? "Qualificar antes: confirmar responsável, cenário atual e urgência da dor."
          : "Não priorizar agora: usar apenas em nutrição ou quando os leads quentes acabarem.";

  const mainPain = uniquePains[0] || "possível oportunidade de melhoria operacional";
  const pitch = `Olá, tudo bem? Vi a ${lead.name} e estou fazendo uma análise rápida de empresas que podem ter aderência com ${offer.name || "minha solução"}. Pelo perfil de vocês, o ponto que mais chamou atenção foi: ${mainPain}. Faz sentido eu te mostrar em 2 minutos como isso poderia se aplicar ao negócio de vocês?`;

  return {
    ...lead,
    score,
    ai_fit_score: score,
    ai_purchase_probability: probability,
    ai_ticket_estimate: estimateTicketFromOffer(offer, score),
    ai_fit_label: getOfferFitLabel(score),
    ai_reason: reason,
    ai_next_action: nextAction,
    ai_pitch: pitch,
    ai_pain_detected: uniquePains,
    ai_offer_name: offer.name,
    ai_need_score: need,
    ai_financial_capacity: financial,
    ai_response_probability: response,
    ai_compatibility_reason: fitExplanation,
    ai_disqualification_risk: disqualificationRisk,
    ai_confidence: confidence,
    ai_segments_matched: matchedRules.map((rule) => rule.label),
    ai_strategy_tags: [
      compatibility >= 72 ? "oferta aderente" : "validar fit",
      need >= 70 ? "dor provável" : "dor incerta",
      financial >= 70 ? "bom potencial financeiro" : "ticket a validar",
      response >= 70 ? "contato fácil" : "contato difícil",
    ],
    status: score >= 86 ? "prioridade_ia" : score >= 72 ? "fit_alto" : score >= 55 ? "qualificar" : "nutrir",
  };
}


function safeReadArrayStorage(key: string) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLastSearchForRadar(search: any) {
  try {
    localStorage.setItem("nxa_last_search_results", JSON.stringify(search));
  } catch (error) {
    console.error("Erro ao salvar última busca para o Radar:", error);
  }
}

function saveSearchHistoryLocal(search: any) {
  try {
    const history = safeReadArrayStorage("nxa_search_history");
    const updated = [search, ...history].slice(0, 50);
    localStorage.setItem("nxa_search_history", JSON.stringify(updated));
  } catch (error) {
    console.error("Erro ao salvar histórico local:", error);
  }
}

function makeLocalLeads(params: {
  queries: string[];
  city: string;
  state: string;
  niche: string;
  quantity: number;
  onlyOpportunity: boolean;
}) {
  const city = params.city || "Belo Horizonte";
  const state = params.state || "MG";
  const quantity = Math.max(1, Math.min(params.quantity || 20, 100));
  const queries = params.queries.length ? params.queries : [params.niche];

  const streets = [
    "Av. Principal",
    "Rua Comercial",
    "Av. Brasil",
    "Rua das Flores",
    "Av. Central",
    "Rua São João",
    "Av. Contorno",
    "Rua Minas Gerais",
  ];

  const suffixes = [
    "Prime",
    "Center",
    "Pro",
    "Premium",
    "Studio",
    "Express",
    "Master",
    "Elite",
    "Concept",
    "Digital",
  ];

  const leads: Lead[] = [];

  for (let i = 0; i < quantity; i++) {
    const query = queries[i % queries.length];
    const suffix = suffixes[i % suffixes.length];
    const hasWebsite = params.onlyOpportunity ? i % 4 === 0 : i % 3 !== 0;
    const rating = Number((3.7 + ((i * 13) % 13) / 10).toFixed(1));
    const reviews = 12 + ((i * 47) % 420);

    const digitalGap = hasWebsite ? 0 : 15;
    const ratingScore = Math.round(rating * 8);
    const reviewScore = Math.min(30, Math.round(reviews / 12));
    const score = Math.min(
      98,
      Math.max(35, 38 + ratingScore + reviewScore + digitalGap - (i % 7))
    );

    leads.push({
      id: `lead-${Date.now()}-${i}`,
      name: `${capitalizeWords(query)} ${suffix}`,
      segment: params.niche,
      city,
      state,
      address: `${streets[i % streets.length]}, ${
        100 + i * 7
      } - ${city}/${state}`,
      phone:
        i % 5 === 0 ? "" : `(31) 9${String(90000000 + i * 7913).slice(0, 8)}`,
      website: hasWebsite
        ? `https://${normalizeText(query).replace(
            /\s+/g,
            ""
          )}${suffix.toLowerCase()}.com.br`
        : "",
      google_rating: rating,
      google_reviews_count: reviews,
      score,
      status: score >= 81 ? "prioridade" : score >= 61 ? "qualificar" : "novo",
    });
  }

  return leads;
}

async function searchLeads(body: any): Promise<Lead[]> {
  const { data, error } = await supabase.functions.invoke("bright-worker", {
    body: {
      niche: body.niche || body.query,
      city: body.city,
      state: body.state,
      limit: body.quantity || 20,
    },
  });

  console.log("RETORNO GOOGLE PLACES:", data);

  if (error) {
    throw new Error(error.message || "Erro ao chamar Edge Function");
  }

  if (!data?.success) {
    throw new Error(data?.error || "Erro ao buscar no Google Places");
  }

  const raw = Array.isArray(data?.leads) ? data.leads : [];

  return raw.map((item: any, index: number) => ({
    id: String(item.id || item.place_id || `google-${index}`),
    place_id: item.place_id || item.id || null,
    name: item.name || "Empresa sem nome",
    segment: body.niche || body.query,
    city: body.city,
    state: body.state,
    address: item.address || "",
    phone: item.phone || "",
    website: item.website || "",
    maps_url: item.maps_url || "",
    google_rating: Number(item.rating || 0),
    google_reviews_count: Number(item.reviews || 0),
    score: Number(item.score || 70),
    status: "new",
    source: "google_places",
    real_data: true,
  }));
}

function getOpportunityReason(lead: Lead) {
  const reasons: string[] = [];

  if ((lead.google_rating || 0) >= 4.7) {
    reasons.push("alta avaliação");
  }

  if ((lead.google_reviews_count || 0) >= 80) {
    reasons.push("volume forte de avaliações");
  }

  if (lead.phone) {
    reasons.push("telefone disponível");
  }

  if (lead.website) {
    reasons.push("site ativo");
  } else {
    reasons.push("sem site detectado");
  }

  if ((lead.score || 0) >= 80) {
    reasons.push("alto potencial comercial");
  }

  return reasons.slice(0, 3).join(" + ") || "dados suficientes para abordagem";
}

function getResultSummary(leads: Lead[]) {
  const total = leads.length;
  const withPhone = leads.filter((lead) => Boolean(lead.phone)).length;
  const withWebsite = leads.filter((lead) => Boolean(lead.website)).length;
  const withoutWebsite = total - withWebsite;
  const hot = leads.filter((lead) => (lead.score || 0) >= 70).length;
  const avgRating =
    total > 0
      ? leads.reduce((sum, lead) => sum + Number(lead.google_rating || 0), 0) /
        total
      : 0;
  const avgScore =
    total > 0
      ? Math.round(
          leads.reduce((sum, lead) => sum + Number(lead.score || 0), 0) / total
        )
      : 0;

  return {
    total,
    withPhone,
    withWebsite,
    withoutWebsite,
    hot,
    avgRating,
    avgScore,
  };
}

function buildApproachText(lead: Lead, offer?: SalesOffer) {
  if (lead.ai_pitch) return lead.ai_pitch;

  const offerName = offer?.name || "Automação WhatsApp com IA";
  const offerDescription =
    offer?.description ||
    "responder leads automaticamente, organizar contatos e transformar conversas em vendas";

  return `Olá, tudo bem? Vi a ${lead.name} e percebi que vocês têm potencial para melhorar aquisição e atendimento. Trabalho com ${offerName}, uma solução para ${offerDescription}. Posso te mostrar uma ideia rápida aplicada ao seu negócio?`;
}

function normalizeExternalUrl(url?: string) {
  const clean = String(url || "").trim();

  if (!clean) return "";

  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }

  return `https://${clean}`;
}

function onlyDigits(value?: string) {
  return String(value || "").replace(/\D/g, "");
}

function buildWhatsAppUrl(phone?: string) {
  let digits = onlyDigits(phone);

  if (!digits) return "";

  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }

  return `https://wa.me/${digits}`;
}

function buildMapsUrl(lead: Lead) {
  if (lead.maps_url) return normalizeExternalUrl(lead.maps_url);

  const query = [lead.name, lead.address, lead.city, lead.state]
    .filter(Boolean)
    .join(" ");

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
}

function readStringArrayStorage(key: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function writeStringArrayStorage(key: string, value: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(new Set(value))));
  } catch {
    // localStorage indisponível não deve travar a busca
  }
}

function upsertLocalStorageItem<T extends { id: string }>(key: string, item: T) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    const current = Array.isArray(parsed) ? parsed : [];
    const next = [item, ...current.filter((row: any) => row?.id !== item.id)];
    localStorage.setItem(key, JSON.stringify(next.slice(0, 500)));
  } catch {
    // fallback silencioso para não quebrar a interface
  }
}

function exportLeadsCsv(leads: Lead[], filename = "nxa-leads.csv") {
  const headers = [
    "Nome",
    "Segmento",
    "Cidade",
    "Estado",
    "Endereco",
    "Telefone",
    "Site",
    "Avaliacao",
    "Avaliacoes",
    "Score IA",
    "Probabilidade",
    "Ticket estimado",
    "Motivo IA",
    "Proxima acao",
    "Status",
  ];

  const rows = leads.map((lead) => [
    lead.name,
    lead.segment,
    lead.city,
    lead.state,
    lead.address,
    lead.phone || "",
    lead.website || "",
    lead.google_rating || "",
    lead.google_reviews_count || "",
    lead.ai_fit_score || lead.score || "",
    lead.ai_purchase_probability || "",
    lead.ai_ticket_estimate || "",
    lead.ai_reason || "",
    lead.ai_next_action || "",
    lead.status || "",
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(";")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export function Busca() {
  const { toast } = useToast();

  const [mode, setMode] = React.useState<Mode>("catalogo");
  const [categoryKey, setCategoryKey] = React.useState(NICHE_CATALOG[0].key);
  const [nicheKey, setNicheKey] = React.useState(
    NICHE_CATALOG[0].niches[0].key
  );
  const [selectedKeywords, setSelectedKeywords] = React.useState<string[]>([]);
  const [customQueries, setCustomQueries] = React.useState<string[]>([]);
  const [customInput, setCustomInput] = React.useState("");
  const [city, setCity] = React.useState("Belo Horizonte");
  const [state, setState] = React.useState("MG");
  const [radius, setRadius] = React.useState(10);
  const [quantity, setQuantity] = React.useState(40);
  const [precisionMode, setPrecisionMode] = React.useState(true);
  const [onlyOpportunity, setOnlyOpportunity] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [loadingHistory, setLoadingHistory] = React.useState(false);
  const [results, setResults] = React.useState<Lead[]>([]);
  const [searches, setSearches] = React.useState<any[]>([]);
  const [credits, setCredits] = React.useState<number>(0);
  const [creditsLoading, setCreditsLoading] = React.useState(true);
  const [savedLeadIds, setSavedLeadIds] = React.useState<string[]>([]);
  const [crmLeadIds, setCrmLeadIds] = React.useState<string[]>([]);
  const [approachLeadIds, setApproachLeadIds] = React.useState<string[]>([]);
  const [offer, setOffer] = React.useState<SalesOffer>(() => readSalesOfferStorage());
  const [showOfferAdvanced, setShowOfferAdvanced] = React.useState(false);
  const [aiScoringEnabled, setAiScoringEnabled] = React.useState(true);
  const [engineStage, setEngineStage] = React.useState(0);
  const [showSearchSetup, setShowSearchSetup] = React.useState(true);
  const [showResultsDetails, setShowResultsDetails] = React.useState(true);
  const [showHistoryPanel, setShowHistoryPanel] = React.useState(false);
  const [visibleResultsCount, setVisibleResultsCount] = React.useState(6);
  const [visibleHistoryCount, setVisibleHistoryCount] = React.useState(6);

  const category = React.useMemo(() => {
    return (
      NICHE_CATALOG.find((item) => item.key === categoryKey) || NICHE_CATALOG[0]
    );
  }, [categoryKey]);

  const niche = React.useMemo(() => {
    return (
      category.niches.find((item) => item.key === nicheKey) || category.niches[0]
    );
  }, [category, nicheKey]);

  React.useEffect(() => {
    setSelectedKeywords(niche.keywords.slice(0, 3));
  }, [niche]);

  React.useEffect(() => {
    loadSearchHistory();
    loadCredits();
  }, []);

  React.useEffect(() => {
    setSavedLeadIds(readStringArrayStorage("nxa_saved_lead_ids"));
    setCrmLeadIds(readStringArrayStorage("nxa_crm_lead_ids"));
    setApproachLeadIds(readStringArrayStorage("nxa_approach_lead_ids"));
  }, []);

  React.useEffect(() => {
    writeSalesOfferStorage(offer);
  }, [offer]);

  React.useEffect(() => {
    if (!running) {
      setEngineStage(0);
      return;
    }

    const interval = window.setInterval(() => {
      setEngineStage((current) => (current + 1) % 5);
    }, 1200);

    return () => window.clearInterval(interval);
  }, [running]);

  function updateOffer<K extends keyof SalesOffer>(key: K, value: SalesOffer[K]) {
    setOffer((current) => ({ ...current, [key]: value }));
  }

  async function loadCredits() {
    setCreditsLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setCredits(0);
        return;
      }

      const { data, error } = await supabase
        .from("wallets")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      setCredits(Number(data?.credits || 0));
    } catch (error) {
      console.error("Erro ao carregar créditos:", error);
      setCredits(0);
    } finally {
      setCreditsLoading(false);
    }
  }

  async function ensureEnoughCredits(requiredCredits: number) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;

    if (!user) {
      throw new Error("Faça login para usar a busca.");
    }

    const { data, error } = await supabase
      .from("wallets")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;

    const currentCredits = Number(data?.credits || 0);
    setCredits(currentCredits);

    if (currentCredits < requiredCredits) {
      throw new Error(
        `Créditos insuficientes. Você tem ${currentCredits} crédito(s), mas esta busca exige até ${requiredCredits}.`
      );
    }

    return currentCredits;
  }

  async function consumeCredits(amount: number, metadata: any) {
    if (amount <= 0) return;

    const { data, error } = await supabase.rpc("use_credits", {
      p_amount: amount,
      p_description: `Busca inteligente - ${amount} lead(s) encontrado(s)`,
      p_metadata: metadata,
    });

    if (error) throw error;

    const nextCredits = Number(data?.credits_after ?? Math.max(0, credits - amount));
    setCredits(nextCredits);
  }

  async function loadSearchHistory() {
    setLoadingHistory(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSearches([]);
        return;
      }

      const localHistory = safeReadArrayStorage("nxa_search_history").filter(
        (item: any) => !item.user_id || item.user_id === user.id
      );

      const { data, error } = await supabase
        .from("search_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setSearches(data?.length ? data : localHistory);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      setSearches([]);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function saveSearchHistory(params: {
    body: any;
    leads: Lead[];
    status: "completed" | "failed";
    errorMessage?: string;
  }) {
    const { data: currentAuthData } = await supabase.auth.getUser();
    const currentUserId = currentAuthData?.user?.id || null;

    const localRecord = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now()),
      user_id: currentUserId,
      niche: params.body.niche,
      query: params.body.queries?.join(", ") || "",
      city: params.body.city,
      state: params.body.state,
      radius_km: params.body.radius_km,
      quantity: params.body.quantity,
      precision: params.body.precision,
      only_opportunity: params.body.only_opportunity,
      results_count: params.leads.length,
      total: params.leads.length,
      credits_used: params.body.credits_used ?? params.leads.length * CREDIT_COST_PER_LEAD,
      status: params.status,
      payload: {
        ...params.body,
        error: params.errorMessage || null,
      },
      results: params.leads,
      leads: params.leads,
      created_at: new Date().toISOString(),
    };

    saveLastSearchForRadar(localRecord);
    saveSearchHistoryLocal(localRecord);

    try {
      const payload = {
        user_id: currentUserId,
        business_id: import.meta.env.VITE_BUSINESS_ID || null,
        tenant_id: import.meta.env.VITE_TENANT_ID || null,
        query: localRecord.query,
        niche: localRecord.niche,
        city: localRecord.city,
        state: localRecord.state,
        radius_km: localRecord.radius_km,
        quantity: localRecord.quantity,
        precision: localRecord.precision,
        only_opportunity: localRecord.only_opportunity,
        results_count: localRecord.results_count,
        credits_used: localRecord.credits_used,
        status: localRecord.status,
        payload: localRecord.payload,
        results: localRecord.results,
      };

      const { data, error } = await supabase
        .from("search_history")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      const finalRecord = data || localRecord;
      saveLastSearchForRadar(finalRecord);
      setSearches((current) => [finalRecord, ...current]);
    } catch (error) {
      console.error("Erro ao salvar busca no Supabase:", error);
      setSearches((current) => [localRecord, ...current]);

      toast({
        title: "Busca salva localmente",
        description:
          "O Radar já consegue ler os leads. Verifique a tabela search_history no Supabase para salvar no banco.",
        variant: "destructive",
      });
    }
  }

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((current) =>
      current.includes(keyword)
        ? current.filter((item) => item !== keyword)
        : [...current, keyword]
    );
  };

  const addCustom = () => {
    const value = customInput.trim();

    if (!value) return;

    if (!customQueries.includes(value)) {
      setCustomQueries((current) => [...current, value]);
    }

    setCustomInput("");
  };

  const removeCustom = (query: string) => {
    setCustomQueries((current) => current.filter((item) => item !== query));
  };

  const buildQueries = () => {
    if (mode === "catalogo") {
      const queries = selectedKeywords.length
        ? selectedKeywords
        : niche.keywords.slice(0, 1);

      return {
        queries,
        includedTypes: precisionMode ? niche.includedTypes || [] : [],
        label: niche.label,
      };
    }

    const queries = customQueries.length
      ? customQueries
      : customInput.trim()
        ? [customInput.trim()]
        : [];

    return {
      queries,
      includedTypes: [],
      label: queries[0] || "Busca custom",
    };
  };

  const totalQueries =
    mode === "catalogo" ? selectedKeywords.length : customQueries.length;

  const estimated = Math.min(quantity, Math.max(1, totalQueries) * 20);
  const maxCost = Math.max(MIN_CREDITS_TO_SEARCH, quantity * CREDIT_COST_PER_LEAD);
  const cost = maxCost;

  const start = async () => {
    const built = buildQueries();

    if (built.queries.length === 0) {
      toast({
        title: "Selecione ou informe ao menos um termo",
        variant: "destructive",
      });
      return;
    }

    if (!city.trim() || !state.trim()) {
      toast({
        title: "Informe cidade e estado",
        variant: "destructive",
      });
      return;
    }

    try {
      await ensureEnoughCredits(maxCost);
    } catch (error: any) {
      toast({
        title: "Créditos insuficientes",
        description:
          error?.message ||
          "Recarregue seus créditos para continuar usando a busca.",
        variant: "destructive",
      });
      return;
    }

    setResults([]);
    setEngineStage(0);
    setRunning(true);

    const body = {
      city,
      state,
      niche: built.label,
      queries: built.queries,
      included_types: built.includedTypes,
      radius_km: radius,
      quantity,
      precision: precisionMode,
      only_opportunity: onlyOpportunity,
      sales_offer: offer,
      ai_scoring: aiScoringEnabled,
    };

    try {
      const rawLeads = await searchLeads(body);
      const leads = aiScoringEnabled
        ? rawLeads
            .map((lead) => analyzeLeadForOffer(lead, offer))
            .sort((a, b) => (b.ai_fit_score || b.score || 0) - (a.ai_fit_score || a.score || 0))
        : rawLeads;

      const creditsUsed = leads.length * CREDIT_COST_PER_LEAD;

      await consumeCredits(creditsUsed, {
        city,
        state,
        niche: built.label,
        queries: built.queries,
        quantity,
        results_count: leads.length,
        sales_offer: offer,
        ai_scoring: aiScoringEnabled,
      });

      setResults(leads);

      await saveSearchHistory({
        body: {
          ...body,
          credits_used: creditsUsed,
        },
        leads,
        status: "completed",
      });

      toast({
        title: `${leads.length} leads encontrados`,
        description: `Varredura concluída em ${city}/${state}. ${leads.length} crédito(s) usado(s).`,
      });
    } catch (error: any) {
      await saveSearchHistory({
        body: {
          ...body,
          credits_used: 0,
        },
        leads: [],
        status: "failed",
        errorMessage: error?.message || "Erro desconhecido",
      });

      toast({
        title: "Falha na busca",
        description: error?.message || "Não foi possível executar a varredura.",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };


  const resultSummary = React.useMemo(
    () => getResultSummary(results),
    [results]
  );

  const bestLead = React.useMemo(() => {
    return [...results].sort(
      (a, b) => (b.ai_fit_score || b.score || 0) - (a.ai_fit_score || a.score || 0)
    )[0];
  }, [results]);

  const commandMetrics = React.useMemo(() => {
    const avgScore = resultSummary.avgScore || 0;
    const hot = resultSummary.hot || 0;
    const contactable = resultSummary.withPhone || 0;
    const marketSignal = avgScore >= 75 ? "Mercado aquecido" : avgScore >= 60 ? "Mercado promissor" : "Mercado em análise";
    const estimatedPipeline = results.reduce((sum, lead) => {
      const score = lead.ai_fit_score || lead.score || 0;
      const reviews = Number(lead.google_reviews_count || 0);
      return sum + Math.max(350, Math.round((score * 12) + Math.min(reviews, 600) * 1.4));
    }, 0);

    return { hot, contactable, marketSignal, estimatedPipeline };
  }, [results, resultSummary]);

  const visibleResults = React.useMemo(() => results.slice(0, visibleResultsCount), [results, visibleResultsCount]);
  const visibleSearches = React.useMemo(() => searches.slice(0, visibleHistoryCount), [searches, visibleHistoryCount]);

  const engineSteps = [
    "Interpretando intenção comercial",
    "Consultando base histórica",
    "Deduplicando oportunidades",
    "Enriquecendo sinais públicos",
    "Priorizando abordagem de venda",
  ];

  const handleExportCsv = () => {
    if (!results.length) {
      toast({
        title: "Nenhum lead para exportar",
        description: "Execute uma busca antes de exportar.",
        variant: "destructive",
      });
      return;
    }

    exportLeadsCsv(
      results,
      `nxa-leads-${city.toLowerCase().replace(/\s+/g, "-")}-${state}.csv`
    );

    toast({
      title: "CSV exportado",
      description: `${results.length} lead(s) enviados para download.`,
    });
  };

  const markLeadSaved = React.useCallback((lead: Lead) => {
    setSavedLeadIds((current) => {
      const next = Array.from(new Set([...current, lead.id]));
      writeStringArrayStorage("nxa_saved_lead_ids", next);
      return next;
    });

    upsertLocalStorageItem("nxa_saved_leads", {
      ...lead,
      saved_at: new Date().toISOString(),
    });
  }, []);

  const markLeadCrm = React.useCallback((lead: Lead) => {
    setCrmLeadIds((current) => {
      const next = Array.from(new Set([...current, lead.id]));
      writeStringArrayStorage("nxa_crm_lead_ids", next);
      return next;
    });

    upsertLocalStorageItem("nxa_crm_queue", {
      ...lead,
      stage: "novo",
      sent_at: new Date().toISOString(),
    });
  }, []);

  const markApproachGenerated = React.useCallback((lead: Lead) => {
    setApproachLeadIds((current) => {
      const next = Array.from(new Set([...current, lead.id]));
      writeStringArrayStorage("nxa_approach_lead_ids", next);
      return next;
    });
  }, []);

  const handleSaveLead = async (lead: Lead) => {
    if (savedLeadIds.includes(lead.id)) {
      toast({
        title: "Lead já salvo",
        description: `${lead.name} já está na sua lista de leads salvos.`,
      });
      return;
    }

    markLeadSaved(lead);

    try {
      const { data: authData } = await supabase.auth.getUser();

      const payload = {
        user_id: authData?.user?.id || null,
        business_id: import.meta.env.VITE_BUSINESS_ID || null,
        tenant_id: import.meta.env.VITE_TENANT_ID || null,
        name: lead.name,
        segment: lead.segment,
        city: lead.city,
        state: lead.state,
        address: lead.address,
        phone: lead.phone || null,
        website: lead.website || null,
        google_rating: lead.google_rating || null,
        google_reviews_count: lead.google_reviews_count || null,
        score: lead.ai_fit_score || lead.score || 0,
        status: "saved",
        source: "busca_inteligente_ia",
        payload: lead,
      };

      const { error } = await supabase.from("leads").insert(payload);

      if (error) throw error;

      toast({
        title: "Lead salvo",
        description: `${lead.name} foi enviado para sua base de leads.`,
      });
    } catch (error) {
      console.error("Erro ao salvar lead no banco:", error);

      toast({
        title: "Lead salvo localmente",
        description:
          "O banco não aceitou esse registro agora, mas o lead ficou salvo neste navegador e pode ser exportado.",
      });
    }
  };

  const handleSendToCrm = async (lead: Lead) => {
    if (crmLeadIds.includes(lead.id)) {
      toast({
        title: "Lead já está no CRM",
        description: `${lead.name} já foi enviado para o pipeline.`,
      });
      return;
    }

    markLeadCrm(lead);

    try {
      const { data: authData } = await supabase.auth.getUser();

      const payload = {
        user_id: authData?.user?.id || null,
        business_id: import.meta.env.VITE_BUSINESS_ID || null,
        tenant_id: import.meta.env.VITE_TENANT_ID || null,
        title: lead.name,
        company_name: lead.name,
        contact_phone: lead.phone || null,
        website: lead.website || null,
        city: lead.city,
        state: lead.state,
        stage: "novo",
        score: lead.ai_fit_score || lead.score || 0,
        value: 0,
        source: "busca_inteligente_ia",
        notes: `Lead enviado pela Busca Inteligente IA. Oferta: ${offer.name}. Score: ${lead.ai_fit_score || lead.score}/100. Probabilidade: ${lead.ai_purchase_probability || "—"}%. Motivo: ${lead.ai_reason || getOpportunityReason(lead)}. Próxima ação: ${lead.ai_next_action || "Qualificar lead."}`,
        payload: lead,
      };

      const { error } = await supabase.from("crm_deals").insert(payload);

      if (error) throw error;

      toast({
        title: "Enviado para o CRM",
        description: `${lead.name} entrou no pipeline comercial.`,
      });
    } catch (error) {
      console.error("Erro ao enviar para CRM no banco:", error);

      toast({
        title: "CRM salvo localmente",
        description:
          "Não consegui gravar no banco agora, mas o lead foi marcado como enviado e entrou na fila local.",
      });
    }
  };

  const handleGenerateApproach = async (lead: Lead) => {
    const text = buildApproachText(lead, offer);
    markApproachGenerated(lead);

    try {
      await navigator.clipboard.writeText(text);

      toast({
        title: "Abordagem IA copiada",
        description: `Mensagem pronta para abordar ${lead.name}.`,
      });
    } catch {
      toast({
        title: "Abordagem IA gerada",
        description:
          "Seu navegador bloqueou a cópia automática, mas a abordagem foi gerada.",
      });
    }
  };

  const handleOpenWebsite = (lead: Lead) => {
    const url = normalizeExternalUrl(lead.website);

    if (!url) {
      toast({
        title: "Site não encontrado",
        description: "Esse lead não possui site disponível.",
        variant: "destructive",
      });
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenMaps = (lead: Lead) => {
    window.open(buildMapsUrl(lead), "_blank", "noopener,noreferrer");
  };

  const handleOpenWhatsApp = (lead: Lead) => {
    const url = buildWhatsAppUrl(lead.phone);

    if (!url) {
      toast({
        title: "Telefone indisponível",
        description: "Esse lead não possui telefone para abrir no WhatsApp.",
        variant: "destructive",
      });
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  async function resolveHistoryLeads(search: any): Promise<Lead[]> {
    const embeddedLeads = Array.isArray(search.results)
      ? search.results
      : Array.isArray(search.leads)
        ? search.leads
        : [];

    if (embeddedLeads.length > 0) {
      return embeddedLeads;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !search.city || !search.state) return [];

    const searchNiche = String(search.niche || search.query || "").trim();
    const limit = Number(search.results_count || search.quantity || 40);

    let query = supabase
      .from("leads")
      .select("*")
      .eq("city", search.city)
      .eq("state", search.state)
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order("created_at", { ascending: false })
      .limit(Math.max(1, Math.min(limit, 100)));

    if (searchNiche) {
      query = query.ilike("segment", `%${searchNiche.split(",")[0].trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Não foi possível recuperar leads do histórico no banco:", error);
      return [];
    }

    return (data || []) as Lead[];
  }

  function applyHistoryParameters(search: any) {
    if (search.city) setCity(search.city);
    if (search.state) setState(search.state);
    if (search.radius_km) setRadius(Number(search.radius_km));
    if (search.quantity) setQuantity(Number(search.quantity));

    const payloadQueries = Array.isArray(search.payload?.queries) ? search.payload.queries : [];
    if (payloadQueries.length) {
      setMode("custom");
      setCustomQueries(payloadQueries);
      setSelectedKeywords([]);
    }
  }

  const handleOpenHistory = async (search: any) => {
    applyHistoryParameters(search);
    const leads = await resolveHistoryLeads(search);

    if (!leads.length) {
      toast({
        title: "Histórico sem leads salvos",
        description: "Os parâmetros foram recuperados. Clique em Iniciar para reconstruir essa varredura.",
      });
      return;
    }

    const ranked = [...leads].sort(
      (a, b) => (b.ai_fit_score || b.score || 0) - (a.ai_fit_score || a.score || 0)
    );

    setResults(ranked);
    saveLastSearchForRadar({
      ...search,
      results: ranked,
      leads: ranked,
      results_count: ranked.length,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    toast({
      title: "Varredura reaberta",
      description: `${ranked.length} oportunidade(s) carregada(s) no Opportunity Engine.`,
    });
  };

  const handleSendHistoryToRadar = async (search: any) => {
    const leads = await resolveHistoryLeads(search);

    if (!leads.length) {
      toast({
        title: "Nada para enviar ao Radar",
        description: "Essa busca não possui resultados salvos. Execute novamente para gerar leads.",
        variant: "destructive",
      });
      return;
    }

    saveLastSearchForRadar({
      ...search,
      results: leads,
      leads,
      results_count: leads.length,
    });

    toast({
      title: "Radar atualizado",
      description: `${leads.length} lead(s) enviados para análise territorial.`,
    });

    setTimeout(() => {
      window.location.href = "/radar";
    }, 350);
  };

  const handleRecoverHistoryParameters = (search: any, autoRun = false) => {
    applyHistoryParameters(search);

    toast({
      title: autoRun ? "Reexecutando missão" : "Missão recuperada",
      description: autoRun
        ? "Os filtros foram restaurados e a busca será iniciada novamente."
        : "Filtros restaurados. Revise os dados e clique em Iniciar.",
    });

    if (autoRun) {
      setTimeout(() => start(), 250);
    }
  };

  return (
    <div className="relative overflow-hidden p-4 lg:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-12rem] top-[-12rem] h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[-10rem] top-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1600px] space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-[2rem] border border-primary/25 bg-gradient-to-br from-card/95 via-background/90 to-primary/5 p-6 shadow-2xl shadow-primary/5 lg:p-8"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
          <div className="absolute right-6 top-6 hidden rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-primary lg:block">
            NXA Opportunity Engine
          </div>

          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Command Center de Prospecção
              </div>

              <h1 className="max-w-4xl text-4xl font-black tracking-[-0.05em] text-foreground md:text-6xl">
                Encontre quem tem mais chance de comprar hoje.
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                A busca deixa de ser uma lista comum e vira um motor comercial: consulta a base, evita repetição, cruza oferta com sinais públicos, ranqueia o fit e entrega as próximas oportunidades para abordagem.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MiniMetric label="Saldo" value={creditsLoading ? "..." : `${credits} cr`} icon={Coins} />
                <MiniMetric label="Consulta" value={`${totalQueries || 1} termo(s)`} icon={Search} />
                <MiniMetric label="Estimativa" value={`~${estimated} leads`} icon={Radar} />
                <MiniMetric label="Custo máximo" value={`${cost} cr`} icon={ShieldCheck} />
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-background/60 p-4 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Painel vivo da busca
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {running ? engineSteps[engineStage] : results.length ? commandMetrics.marketSignal : "Pronto para iniciar"}
                  </div>
                </div>
                <div className={cn("h-3 w-3 rounded-full", running ? "animate-pulse bg-primary" : results.length ? "bg-emerald-400" : "bg-muted")} />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card/60 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Oportunidades</div>
                  <div className="mt-2 text-3xl font-black text-primary">{results.length || "—"}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">resultado atual</div>
                </div>
                <div className="rounded-2xl border border-border bg-card/60 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Quentes</div>
                  <div className="mt-2 text-3xl font-black text-orange-400">{commandMetrics.hot || "—"}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">prioridade alta</div>
                </div>
                <div className="rounded-2xl border border-border bg-card/60 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Pipeline</div>
                  <div className="mt-2 text-2xl font-black text-emerald-400">
                    {commandMetrics.estimatedPipeline ? `R$ ${commandMetrics.estimatedPipeline.toLocaleString("pt-BR")}` : "—"}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">potencial bruto</div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {engineSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
                    <div className={cn("flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold", running && engineStage === index ? "border-primary bg-primary text-primary-foreground" : !running && results.length ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-border text-muted-foreground")}>
                      {!running && results.length ? <Check className="h-3 w-3" /> : index + 1}
                    </div>
                    <span className="text-xs text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <CollapsibleShell
          title="Configuração da busca"
          eyebrow="Search cockpit"
          description="Oferta, nicho, região e limites ficam recolhíveis para deixar a experiência menos poluída após configurar."
          open={showSearchSetup}
          onToggle={() => setShowSearchSetup((current) => !current)}
          rightSlot={<span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-black text-primary">{mode === "catalogo" ? "Catálogo IA" : "Busca livre"}</span>}
        >
        <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-[1.75rem] border border-border bg-card/70 p-5 shadow-xl shadow-black/5 backdrop-blur"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Wand2 className="h-4 w-4 text-primary" />
                  Oferta que a IA deve vender
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Quanto melhor essa oferta, mais precisa fica a priorização.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-muted/20 px-3 py-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={aiScoringEnabled}
                  onChange={(event) => setAiScoringEnabled(event.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                IA ativa
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Nome da oferta">
                <input value={offer.name} onChange={(event) => updateOffer("name", event.target.value)} placeholder="Automação WhatsApp com IA" className="h-11 w-full rounded-xl border border-border bg-background/80 px-3 text-sm outline-none focus:border-primary" />
              </Field>
              <Field label="Preço / ticket">
                <input value={offer.price} onChange={(event) => updateOffer("price", event.target.value)} placeholder="R$497/mês" className="h-11 w-full rounded-xl border border-border bg-background/80 px-3 text-sm outline-none focus:border-primary" />
              </Field>
            </div>

            <div className="mt-3">
              <Field label="Cliente ideal">
                <input value={offer.idealCustomer} onChange={(event) => updateOffer("idealCustomer", event.target.value)} placeholder="Clínicas, barbearias, estética, dentistas..." className="h-11 w-full rounded-xl border border-border bg-background/80 px-3 text-sm outline-none focus:border-primary" />
              </Field>
            </div>

            <div className="mt-3">
              <Field label="Descrição curta do produto">
                <textarea value={offer.description} onChange={(event) => updateOffer("description", event.target.value)} rows={4} placeholder="O que você vende, para quem e qual resultado promete." className="w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm outline-none focus:border-primary" />
              </Field>
            </div>

            <button type="button" onClick={() => setShowOfferAdvanced((current) => !current)} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
              {showOfferAdvanced ? "Ocultar inteligência avançada" : "Configurar dores, objeções e diferenciais"}
              <ArrowUpRight className="h-3 w-3" />
            </button>

            <AnimatePresence>
              {showOfferAdvanced && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="mt-3 grid gap-3">
                    <Field label="Dores que resolve">
                      <textarea value={offer.painPoints} onChange={(event) => updateOffer("painPoints", event.target.value)} rows={3} className="w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm outline-none focus:border-primary" />
                    </Field>
                    <Field label="Diferenciais">
                      <textarea value={offer.differentials} onChange={(event) => updateOffer("differentials", event.target.value)} rows={3} className="w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm outline-none focus:border-primary" />
                    </Field>
                    <Field label="Objeções comuns">
                      <textarea value={offer.objections} onChange={(event) => updateOffer("objections", event.target.value)} rows={3} className="w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm outline-none focus:border-primary" />
                    </Field>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-[1.75rem] border border-primary/20 bg-gradient-to-br from-card/80 to-primary/5 p-5 shadow-xl shadow-primary/5 backdrop-blur"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Radar className="h-4 w-4 text-primary" />
                  Missão de busca
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Configure nicho, região e limite. O motor consulta a base antes de gastar APIs.
                </p>
              </div>

              <div className="inline-flex rounded-xl border border-border bg-background/60 p-1">
                <button onClick={() => setMode("catalogo")} className={cn("inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all", mode === "catalogo" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground")}>
                  <Target className="h-3.5 w-3.5" /> Catálogo
                </button>
                <button onClick={() => setMode("custom")} className={cn("inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all", mode === "custom" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground")}>
                  <Zap className="h-3.5 w-3.5" /> Livre
                </button>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap items-center gap-3 text-xs">
              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1.5">
                <input type="checkbox" checked={precisionMode} onChange={(event) => setPrecisionMode(event.target.checked)} className="h-4 w-4 accent-primary" />
                <Filter className="h-3 w-3" /> Modo precisão
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1.5">
                <input type="checkbox" checked={onlyOpportunity} onChange={(event) => setOnlyOpportunity(event.target.checked)} className="h-4 w-4 accent-primary" />
                <Globe2 className="h-3 w-3" /> Priorizar lacuna digital
              </label>
            </div>

            {mode === "catalogo" ? (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {NICHE_CATALOG.map((item) => (
                    <button key={item.key} onClick={() => { setCategoryKey(item.key); setNicheKey(item.niches[0].key); }} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition-all", categoryKey === item.key ? "border-primary bg-primary/15 text-foreground shadow-lg shadow-primary/10" : "border-border bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground")}>
                      <span className="mr-1">{item.emoji}</span>{item.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
                  {category.niches.map((item) => (
                    <button key={item.key} onClick={() => setNicheKey(item.key)} className={cn("group rounded-2xl border p-3 text-left transition-all", nicheKey === item.key ? "border-primary bg-primary/15 shadow-lg shadow-primary/10" : "border-border bg-background/50 hover:border-primary/40 hover:bg-muted/40")}>
                      <div className="text-xl">{item.emoji}</div>
                      <div className="mt-2 truncate text-sm font-bold">{item.label}</div>
                      <div className="mt-1 text-[10px] text-muted-foreground">{item.keywords.length} sinais</div>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sinais semânticos da busca</label>
                    <span className="text-xs text-primary">{selectedKeywords.length} ativo(s)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {niche.keywords.map((keyword) => {
                      const active = selectedKeywords.includes(keyword);
                      return (
                        <button key={keyword} onClick={() => toggleKeyword(keyword)} className={cn("rounded-full border px-3 py-1.5 text-xs transition-all", active ? "border-primary/60 bg-primary/15 text-foreground" : "border-border bg-background/40 text-muted-foreground hover:text-foreground")}>
                          {active && <span className="mr-1 text-primary">✓</span>}{keyword}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Field label="Termos personalizados">
                  <div className="flex gap-2">
                    <input value={customInput} onChange={(event) => setCustomInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustom(); } }} placeholder="ex: empresas que precisam de automação" className="h-11 w-full rounded-xl border border-border bg-background/80 px-3 text-sm outline-none focus:border-primary" />
                    <Button variant="secondary" onClick={addCustom}><Plus className="h-4 w-4" /></Button>
                  </div>
                </Field>
                {customQueries.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customQueries.map((query) => (
                      <span key={query} className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs">
                        {query}<button onClick={() => removeCustom(query)} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-6 md:grid-cols-5">
              <Field label="Cidade"><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Belo Horizonte" className="h-11 w-full rounded-xl border border-border bg-background/80 px-3 text-sm outline-none focus:border-primary" /></Field>
              <Field label="Estado">
                <Select value={state} onValueChange={setState}><SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="UF" /></SelectTrigger><SelectContent>{STATES.map((item) => (<SelectItem key={item} value={item}>{item}</SelectItem>))}</SelectContent></Select>
              </Field>
              <Field label="Raio"><input type="number" min={1} max={100} value={radius} onChange={(event) => setRadius(Number(event.target.value || 1))} className="h-11 w-full rounded-xl border border-border bg-background/80 px-3 text-sm outline-none focus:border-primary" /></Field>
              <Field label="Quantidade"><input type="number" min={1} max={100} value={quantity} onChange={(event) => setQuantity(Number(event.target.value || 1))} className="h-11 w-full rounded-xl border border-border bg-background/80 px-3 text-sm outline-none focus:border-primary" /></Field>
              <div className="flex items-end">
                <Button size="lg" className="h-11 w-full gap-2 rounded-xl font-black shadow-xl shadow-primary/20" onClick={start} disabled={running}>
                  {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
                  {running ? "Executando" : "Iniciar"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
        </CollapsibleShell>

        <CollapsibleShell
          title="Oportunidades priorizadas"
          eyebrow="Fila comercial"
          description="Mostra primeiro o que vender. Métricas e diagnóstico podem ser recolhidos para a tela não ficar pesada."
          open={showResultsDetails}
          onToggle={() => setShowResultsDetails((current) => !current)}
          rightSlot={results.length ? <span className="rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1 text-[11px] font-black text-orange-200">{results.length} oportunidade(s)</span> : null}
        >
        <div className="rounded-[1.75rem] border border-border bg-card/70 p-5 shadow-xl shadow-black/5 backdrop-blur">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold">
                <Search className="h-4 w-4 text-primary" />
                Oportunidades priorizadas
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Não é uma lista: é uma fila de abordagem com fit, dor provável, ticket e próxima ação.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {bestLead && (
                <Button variant="secondary" size="sm" className="gap-2" onClick={() => handleGenerateApproach(bestLead)}>
                  <MessageSquareText className="h-3.5 w-3.5" /> Melhor abordagem
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={!results.length} className="gap-2">
                <Download className="h-3.5 w-3.5" /> Exportar CSV
              </Button>
            </div>
          </div>

          {results.length > 0 && !running && showResultsDetails && (
            <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
              <SummaryCard icon={BarChart3} label="Encontrados" value={resultSummary.total} description="oportunidades" />
              <SummaryCard icon={Phone} label="Contatáveis" value={resultSummary.withPhone} description="telefone/WhatsApp" />
              <SummaryCard icon={Globe} label="Com site" value={resultSummary.withWebsite} description="presença digital" />
              <SummaryCard icon={Target} label="Lacuna" value={resultSummary.withoutWebsite} description="sem site" />
              <SummaryCard icon={Star} label="Média" value={resultSummary.avgRating ? resultSummary.avgRating.toFixed(1) : "—"} description="Google" />
              <SummaryCard icon={Flame} label="NXA Score" value={`${resultSummary.avgScore}/100`} description={`${resultSummary.hot} quentes`} />
            </div>
          )}

          {results.length > 0 && !running && showResultsDetails && (
            <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_0.8fr_0.8fr]">
              <div className="rounded-2xl border border-primary/25 bg-primary/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-primary/15 p-2"><BrainCircuit className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-sm font-bold">Diagnóstico comercial da varredura</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {resultSummary.withPhone} leads prontos para abordagem, {resultSummary.withoutWebsite} com lacuna digital e {resultSummary.hot} oportunidades quentes para atacar primeiro.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Melhor alvo agora</div>
                <div className="mt-2 truncate text-sm font-black">{bestLead?.name || "—"}</div>
                <div className="mt-1 text-xs text-muted-foreground">{bestLead ? `${bestLead.ai_fit_score || bestLead.score}/100 de fit` : "Execute uma busca"}</div>
              </div>

              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Próxima ação</div>
                <div className="mt-2 text-sm font-black">{bestLead?.ai_next_action || "Começar pelos scores acima de 75"}</div>
              </div>
            </div>
          )}

          {running ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="relative h-64 overflow-hidden rounded-2xl border border-border bg-muted/20">
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-background/35 py-16 text-center text-sm text-muted-foreground">
              <BrainCircuit className="mb-4 h-12 w-12 text-primary/50" />
              Configure a missão e inicie a varredura inteligente.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleResults.map((lead, index) => (
                <div key={lead.id} className="relative">
                  {index < 3 && <div className="absolute -top-2 left-4 z-10 rounded-full border border-orange-400/40 bg-orange-500/15 px-2 py-0.5 text-[10px] font-black text-orange-300">TOP {index + 1}</div>}
                  <LeadCard lead={lead} saved={savedLeadIds.includes(lead.id)} inCrm={crmLeadIds.includes(lead.id)} approachGenerated={approachLeadIds.includes(lead.id)} onSave={handleSaveLead} onSendToCrm={handleSendToCrm} onGenerateApproach={handleGenerateApproach} onOpenWebsite={handleOpenWebsite} onOpenMaps={handleOpenMaps} onOpenWhatsApp={handleOpenWhatsApp} />
                </div>
              ))}
            </div>
          )}

          {results.length > 6 && !running && (
            <div className="mt-5 flex justify-center">
              <Button variant="outline" className="rounded-xl px-6 font-black" onClick={() => setVisibleResultsCount((current) => current >= results.length ? 6 : Math.min(results.length, current + 6))}>
                {visibleResultsCount >= results.length ? "Recolher oportunidades" : `Expandir mais ${Math.min(6, results.length - visibleResultsCount)} oportunidades`}
              </Button>
            </div>
          )}
        </div>
        </CollapsibleShell>

        <CollapsibleShell
          title="Central de varreduras"
          eyebrow="Mission replay"
          description="Histórico recolhível para recuperar buscas sem transformar a página em lista infinita."
          open={showHistoryPanel}
          onToggle={() => setShowHistoryPanel((current) => !current)}
          rightSlot={<span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-black text-primary">{searches.length} registro(s)</span>}
        >
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-card/90 via-background/80 to-card/60 p-5 shadow-2xl shadow-primary/5 backdrop-blur">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
          </div>

          <div className="relative mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                  <Radar className="h-3.5 w-3.5" /> Mission Replay
                </span>
                <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-[11px] font-bold text-muted-foreground">
                  Histórico inteligente
                </span>
              </div>
              <h2 className="mt-3 text-xl font-black tracking-tight text-foreground md:text-2xl">Central de varreduras</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Reabra operações, restaure filtros, envie resultados ao Radar e reutilize inteligência já coletada sem deixar a tela com cara de lista simples.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl border border-border bg-background/55 px-4 py-3">
                <div className="text-lg font-black text-primary">{searches.length}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">operações</div>
              </div>
              <div className="rounded-2xl border border-border bg-background/55 px-4 py-3">
                <div className="text-lg font-black text-orange-300">{searches.reduce((sum, item: any) => sum + Number(item.results_count || item.total || 0), 0)}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">leads</div>
              </div>
              <div className="rounded-2xl border border-border bg-background/55 px-4 py-3">
                <div className="text-lg font-black text-emerald-300">{searches.filter((item: any) => (item.status || "completed") === "completed").length}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">concluídas</div>
              </div>
            </div>
          </div>

          {loadingHistory ? (
            <div className="relative grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-44 animate-pulse rounded-3xl border border-border bg-muted/20" />
              ))}
            </div>
          ) : searches.length === 0 ? (
            <div className="relative flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-background/40 text-center">
              <BrainCircuit className="mb-3 h-10 w-10 text-primary/50" />
              <div className="text-sm font-bold">Nenhuma missão registrada ainda</div>
              <p className="mt-1 text-xs text-muted-foreground">Execute sua primeira busca para criar um histórico operacional reutilizável.</p>
            </div>
          ) : (
            <div className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleSearches.map((search, index) => {
                const leads = Array.isArray(search.results) ? search.results : Array.isArray(search.leads) ? search.leads : [];
                const count = Number(search.results_count || search.total || leads.length || 0);
                const credits = Number(search.credits_used || count * CREDIT_COST_PER_LEAD || 0);
                const completed = (search.status || "completed") === "completed";
                const dateLabel = search.created_at ? new Date(search.created_at).toLocaleString("pt-BR") : "Data não informada";
                const title = search.niche || search.query || "Busca operacional";
                const location = `${search.city || "—"} / ${search.state || "—"}`;
                const density = count >= 40 ? "Alta base" : count >= 20 ? "Base validada" : "Base curta";

                return (
                  <motion.div
                    key={search.id || `${title}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.2) }}
                    className="group relative overflow-hidden rounded-3xl border border-border bg-background/55 p-4 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-background/75 hover:shadow-primary/10"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-orange-400 opacity-70" />
                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />

                    <div className="relative flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                            <Search className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-black text-foreground">{title}</div>
                            <div className="mt-0.5 truncate text-xs font-medium text-muted-foreground">{location}</div>
                          </div>
                        </div>
                      </div>
                      <StatusPill status={completed ? "completed" : search.status || "pending"} />
                    </div>

                    <div className="relative mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-2xl border border-border bg-card/60 p-3">
                        <div className="text-lg font-black text-primary">{count}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">leads</div>
                      </div>
                      <div className="rounded-2xl border border-border bg-card/60 p-3">
                        <div className="text-lg font-black text-emerald-300">{credits}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">créditos</div>
                      </div>
                      <div className="rounded-2xl border border-border bg-card/60 p-3">
                        <div className="text-xs font-black text-orange-300">{density}</div>
                        <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">sinal</div>
                      </div>
                    </div>

                    <div className="relative mt-4 rounded-2xl border border-border bg-card/40 p-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Registro</div>
                      <div className="mt-1 text-xs font-semibold text-foreground">{dateLabel}</div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{search.radius_km || radius} km</span>
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[10px] font-bold text-cyan-200">{search.precision || "precisão IA"}</span>
                        <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-2 py-1 text-[10px] font-bold text-orange-200">{search.only_opportunity ? "oportunidade" : "mercado amplo"}</span>
                      </div>
                    </div>

                    <div className="relative mt-4 grid grid-cols-2 gap-2">
                      <Button size="sm" className="h-9 gap-1.5 rounded-xl font-black" onClick={() => handleOpenHistory(search)}>
                        <Eye className="h-3.5 w-3.5" /> Abrir
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl font-bold" onClick={() => handleSendHistoryToRadar(search)}>
                        <Radar className="h-3.5 w-3.5" /> Radar
                      </Button>
                      <Button variant="secondary" size="sm" className="col-span-2 h-9 gap-1.5 rounded-xl font-bold" onClick={() => handleRecoverHistoryParameters(search)}>
                        <RefreshCw className="h-3.5 w-3.5" /> Recuperar filtros
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {searches.length > 6 && (
            <div className="relative mt-5 flex justify-center">
              <Button variant="outline" className="rounded-xl px-6 font-black" onClick={() => setVisibleHistoryCount((current) => current >= searches.length ? 6 : Math.min(searches.length, current + 6))}>
                {visibleHistoryCount >= searches.length ? "Recolher histórico" : `Expandir mais ${Math.min(6, searches.length - visibleHistoryCount)} varreduras`}
              </Button>
            </div>
          )}
        </div>
        </CollapsibleShell>
      </div>
    </div>
  );
}

function CollapsibleShell({ title, eyebrow, description, open, onToggle, rightSlot, children }: { title: string; eyebrow: string; description?: string; open: boolean; onToggle: () => void; rightSlot?: React.ReactNode; children: React.ReactNode; }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-border/80 bg-card/45 shadow-xl shadow-black/5 backdrop-blur">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/20 lg:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary"><Layers3 className="h-4 w-4" /></div>
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{eyebrow}</div>
            <h2 className="mt-1 text-lg font-black tracking-tight text-foreground md:text-xl">{title}</h2>
            {description && <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">{description}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {rightSlot}
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground">{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24 }} className="overflow-hidden">
            <div className="px-4 pb-5 lg:px-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending: {
      label: "Aguardando",
      color: "#facc15",
      bg: "rgba(250,204,21,0.12)",
    },
    running: {
      label: "Rodando",
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.12)",
    },
    completed: {
      label: "Concluído",
      color: "#34d399",
      bg: "rgba(52,211,153,0.12)",
    },
    failed: {
      label: "Falhou",
      color: "#f87171",
      bg: "rgba(248,113,113,0.12)",
    },
  };

  const value = map[status] || map.pending;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ background: value.bg, color: value.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: value.color }}
      />
      {value.label}
    </span>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-black">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function LeadCard({
  lead,
  saved,
  inCrm,
  approachGenerated,
  onSave,
  onSendToCrm,
  onGenerateApproach,
  onOpenWebsite,
  onOpenMaps,
  onOpenWhatsApp,
}: {
  lead: Lead;
  saved: boolean;
  inCrm: boolean;
  approachGenerated: boolean;
  onSave: (lead: Lead) => void;
  onSendToCrm: (lead: Lead) => void;
  onGenerateApproach: (lead: Lead) => void;
  onOpenWebsite: (lead: Lead) => void;
  onOpenMaps: (lead: Lead) => void;
  onOpenWhatsApp: (lead: Lead) => void;
}) {
  const scoreColor = getScoreColor(lead.score || 0);
  const hasWebsite = Boolean(lead.website);
  const hasPhone = Boolean(lead.phone);
  const opportunityReason = getOpportunityReason(lead);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group overflow-hidden rounded-xl border bg-background/60 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
      style={{
        borderColor: `${scoreColor}33`,
      }}
    >
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${scoreColor}, transparent)`,
        }}
      />

      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold">
              {lead.name || "Empresa sem nome"}
            </h3>

            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {lead.segment || "Segmento não informado"}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <div
              className="flex items-center justify-end gap-1 text-sm font-black"
              style={{ color: scoreColor }}
            >
              {getScoreIcon(lead.score || 0)}
              {lead.score || 0}
            </div>

            <div
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{ color: scoreColor }}
            >
              {getScoreLabel(lead.score || 0)}
            </div>
          </div>
        </div>

        <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center justify-between gap-2 text-xs font-semibold">
            <span className="flex items-center gap-2">
              <BrainCircuit className="h-3.5 w-3.5 text-primary" />
              Fit IA {lead.ai_fit_score || lead.score || 0}/100
            </span>
            <span className="rounded-full bg-background/70 px-2 py-0.5 text-[10px] text-primary">
              {lead.ai_fit_label || getScoreLabel(lead.score || 0)}
            </span>
          </div>

          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {lead.ai_reason || `Motivo: ${opportunityReason}.`}
          </p>

          {lead.ai_next_action && (
            <div className="mt-2 flex items-start gap-1.5 rounded-md border border-border bg-background/50 p-2 text-[11px] text-muted-foreground">
              <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
              <span>{lead.ai_next_action}</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Info icon={MapPin}>{lead.address || "Endereço não informado"}</Info>

          {hasPhone ? (
            <Info icon={Phone}>{lead.phone}</Info>
          ) : (
            <Info icon={Phone}>Telefone não informado</Info>
          )}

          {hasWebsite ? (
            <Info icon={Globe}>{lead.website}</Info>
          ) : (
            <Info icon={Globe}>Sem website detectado</Info>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <MiniMetric
            label="Chance"
            value={`${lead.ai_purchase_probability || Math.round((lead.score || 0) * 0.8)}%`}
            icon={Gauge}
          />

          <MiniMetric
            label="Ticket"
            value={lead.ai_ticket_estimate || "—"}
            icon={DollarSign}
          />

          <MiniMetric
            label="Reviews"
            value={lead.google_reviews_count || 0}
            icon={MessageSquareText}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
          <div className="rounded-lg border border-border bg-muted/20 p-2">
            <span className="block font-semibold text-foreground">Compatibilidade</span>
            {lead.ai_fit_score || lead.score || 0}/100
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-2">
            <span className="block font-semibold text-foreground">Necessidade</span>
            {lead.ai_need_score ?? "—"}/100
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-2">
            <span className="block font-semibold text-foreground">Potencial financeiro</span>
            {lead.ai_financial_capacity ?? "—"}/100
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-2">
            <span className="block font-semibold text-foreground">Confiança da IA</span>
            {lead.ai_confidence ?? "—"}%
          </div>
        </div>

        {(lead.ai_strategy_tags?.length || lead.ai_disqualification_risk) && (
          <div className="mt-3 space-y-2">
            {lead.ai_strategy_tags?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {lead.ai_strategy_tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            {lead.ai_disqualification_risk ? (
              <p className="rounded-lg border border-border bg-background/50 p-2 text-[10px] leading-relaxed text-muted-foreground">
                <b className="text-foreground">Risco:</b> {lead.ai_disqualification_risk}
              </p>
            ) : null}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
          <Button
            variant={approachGenerated ? "outline" : "secondary"}
            size="sm"
            className="h-8 flex-1 gap-1.5"
            onClick={() => onGenerateApproach(lead)}
          >
            {approachGenerated ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <BrainCircuit className="h-3.5 w-3.5" />
            )}
            {approachGenerated ? "Copiada" : "Abordagem IA"}
          </Button>

          <Button
            variant={saved ? "secondary" : "outline"}
            size="sm"
            className="h-8 flex-1 gap-1.5"
            onClick={() => onSave(lead)}
          >
            {saved ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <BookmarkPlus className="h-3.5 w-3.5" />
            )}
            {saved ? "Salvo" : "Salvar"}
          </Button>

          <Button
            variant={inCrm ? "secondary" : "outline"}
            size="sm"
            className="h-8 flex-1 gap-1.5"
            onClick={() => onSendToCrm(lead)}
          >
            {inCrm ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {inCrm ? "No CRM" : "CRM"}
          </Button>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            disabled={!hasPhone}
            onClick={() => onOpenWhatsApp(lead)}
          >
            <Phone className="h-3.5 w-3.5" />
            WhatsApp
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            disabled={!hasWebsite}
            onClick={() => onOpenWebsite(lead)}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Site
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => onOpenMaps(lead)}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Maps
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">
              {lead.google_rating ? lead.google_rating.toFixed(1) : "—"}
            </span>
            <span className="text-muted-foreground">
              ({lead.google_reviews_count || 0})
            </span>
          </div>

          <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
            {lead.status || "novo"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function MiniMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: any;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-2">
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>

      <div className="mt-1 text-sm font-bold">{value}</div>
    </div>
  );
}

function Info({
  icon: Icon,
  children,
}: {
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{children}</span>
    </div>
  );
}

export default Busca;