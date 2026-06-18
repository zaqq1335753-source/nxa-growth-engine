// BUSCA LEAD HUNTER AVANÇADA - foco total em pesquisa, enriquecimento, score e abordagem de leads
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
  Lightbulb,
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

type LeadObjective =
  | "all"
  | "whatsapp"
  | "no_site"
  | "high_reviews"
  | "social_gap"
  | "premium"
  | "new_business"
  | "high_flow"
  | "weak_instagram"
  | "no_digital_presence";

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
  place_id?: string | null;
  source?: string;
  real_data?: boolean;
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
  ai_customer_summary?: string;
  ai_opportunity?: string;
  ai_offer_recommendation?: string;
  ai_approach_summary?: string;
  ai_priority_label?: string;
  ai_interest_label?: string;
  ai_why_this_lead?: string;
  ai_best_channel?: string;
  social_links?: Record<string, string>;
  social_profiles?: Record<string, any>;
  instagram_url?: string;
  instagram_username?: string;
  instagram_followers?: number;
  instagram_bio?: string;
  facebook_url?: string;
  linkedin_url?: string;
  tiktok_url?: string;
  youtube_url?: string;
  web_enrichment_status?: "pending" | "completed" | "failed" | "skipped";
  web_enrichment_summary?: string;
  web_enrichment_confidence?: number;
  working_hours?: string;
  contact_quality?: number;
  digital_strength?: number;
  response_chance?: number;
  commercial_signals?: string[];
  commercial_score_breakdown?: Array<{ label: string; points: number }>;
  campaign_status?: "none" | "selected" | "contacted" | "discarded";
  commercial_score?: number;
  offer_compatibility_score?: number;
  final_priority_score?: number;
  decision_label?: string;
  decision_reason?: string;
  offer_fit_summary?: string;
  offer_fit_next_step?: string;
  financial_potential?: number;
  structure_score?: number;
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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


type OfferIntelligence = {
  summary: string;
  offerSummary: string;
  idealCustomer: string;
  painPoints: string;
  differentials: string;
  objections: string;
  suggestedQueries: string[];
  searchStrategy: string;
  confidence: number;
};

function uniqueTerms(items: string[]) {
  return Array.from(
    new Set(
      items
        .map((item) => item.trim().toLowerCase())
        .filter((item) => item.length >= 3)
    )
  );
}

function buildSearchTermsFromOffer(offer: SalesOffer, source: string) {
  const explicitIdeal = splitTerms(offer.idealCustomer || "");
  const explicitDescription = splitTerms(offer.description || "");
  const nameTerms = splitTerms(offer.name || "");

  const petTerms = /banho|tosa|pet|cachorro|gato|veterin|animal|petshop|pet shop|ração/.test(source)
    ? ["pet shop", "banho e tosa", "clínica veterinária", "hotel pet", "creche pet", "loja de ração"]
    : [];

  const automationTerms = /whatsapp|agenda|agendamento|crm|follow|lead|atendimento|chatbot|ia|automacao/.test(source)
    ? ["clínica de estética", "barbearia", "clínica odontológica", "salão de beleza", "pet shop", "academia"]
    : [];

  const marketingTerms = /marketing|trafego|anuncio|google ads|meta ads|social media|landing|site|funil|prospeccao/.test(source)
    ? ["clínica estética", "clínica odontológica", "imobiliária", "academia", "restaurante", "escola particular"]
    : [];

  const furnitureTerms = /cadeira|mesa|moveis|mobiliario|ergonom|poltrona|escritorio/.test(source)
    ? ["escritório de contabilidade", "escritório de advocacia", "clínica", "consultório", "imobiliária", "coworking"]
    : [];

  const cleaningTerms = /limpeza|higienizacao|impermeabilizacao|sofa|colchao|tapete|estofado|lavagem/.test(source)
    ? ["hotel", "pousada", "clínica", "academia", "restaurante", "condomínio"]
    : [];

  return uniqueTerms([
    ...explicitIdeal,
    ...petTerms,
    ...automationTerms,
    ...marketingTerms,
    ...furnitureTerms,
    ...cleaningTerms,
    ...explicitDescription,
    ...nameTerms,
  ]).slice(0, 8);
}

function inferOfferIntelligence(offer: SalesOffer): OfferIntelligence {
  const productName = offer.name?.trim() || "Oferta do cliente";
  const description = offer.description?.trim();
  const ideal = offer.idealCustomer?.trim();
  const pains = offer.painPoints?.trim();
  const diffs = offer.differentials?.trim();
  const objections = offer.objections?.trim();

  const source = normalizeText([
    offer.name,
    offer.description,
    offer.idealCustomer,
    offer.painPoints,
    offer.differentials,
    offer.objections,
  ].join(" "));

  const hasPet = /banho|tosa|pet|cachorro|gato|veterin|animal|petshop|pet shop|ração/.test(source);
  const hasAutomation = /whatsapp|agenda|agendamento|crm|follow|lead|atendimento|chatbot|ia|automacao/.test(source);
  const hasMarketing = /marketing|trafego|anuncio|google ads|meta ads|social media|landing|site|funil|prospeccao/.test(source);
  const hasFurniture = /cadeira|mesa|moveis|mobiliario|ergonom|poltrona|escritorio/.test(source);
  const hasCleaning = /limpeza|higienizacao|impermeabilizacao|sofa|colchao|tapete|estofado|lavagem/.test(source);

  let detectedCategory = "oferta comercial";
  let defaultIdeal = "Empresas locais com operação ativa, atendimento comercial, recorrência de clientes e capacidade de compra.";
  let defaultPains = "Baixa eficiência, perda de oportunidades, dificuldade operacional, falta de previsibilidade e necessidade de melhorar resultados.";
  let defaultDiffs = "Atendimento consultivo, solução prática, implantação simples, ganho operacional e foco em resultado para o cliente.";
  let defaultObjections = "Preço, falta de tempo, comparação com fornecedores atuais, dúvida sobre retorno e baixa urgência percebida.";
  let searchStrategy = "Buscar empresas que apresentem sinais de necessidade, capacidade financeira e canal de contato direto para abordagem.";

  if (hasPet) {
    detectedCategory = "serviço/produto do mercado pet";
    defaultIdeal = "Pet shops, clínicas veterinárias, banho e tosa, hotéis pet, creches pet, lojas de ração e negócios do ecossistema pet.";
    defaultPains = "Tutoria com pouco tempo, recorrência de cuidado, necessidade de confiança, higiene, segurança no atendimento e facilidade para agendar.";
    defaultDiffs = "Cuidado com cães e gatos, atendimento claro pelo WhatsApp, higiene, recorrência, carinho no manuseio e experiência tranquila para o tutor.";
    defaultObjections = "Preço, medo do pet se estressar, preferência por fazer em casa, falta de tempo para levar, comparação com outro fornecedor e receio com animais sensíveis.";
    searchStrategy = "Como a busca encontra empresas, a IA vai procurar negócios do ecossistema pet que tenham aderência, parceria, indicação, revenda ou demanda relacionada à oferta.";
  }

  if (hasAutomation) {
    detectedCategory = "automação comercial/atendimento";
    defaultIdeal = "Clínicas, estética, odontologia, barbearias, salões, pet shops, academias, escolas, imobiliárias e negócios que vendem pelo WhatsApp.";
    defaultPains = "Demora para responder, perda de mensagens, agenda bagunçada, no-show, falta de follow-up, baixa conversão e equipe sobrecarregada.";
    defaultDiffs = "IA 24h, agendamento automático, follow-up inteligente, CRM, priorização de leads e mensagens personalizadas.";
    defaultObjections = "Já tenho atendente, acho caro, não sei se IA funciona, medo de respostas erradas e falta de tempo para configurar.";
    searchStrategy = "Priorizar empresas com alto volume de WhatsApp, dependência de agenda, recorrência e dor clara de atendimento/follow-up.";
  }

  if (hasMarketing) {
    detectedCategory = "aquisição de clientes/marketing";
    defaultIdeal = "Clínicas, estética, odontologia, imobiliárias, escolas, restaurantes, lojas, academias, pet shops, barbearias e prestadores locais.";
    defaultPains = "Poucos clientes novos, dependência de indicação, presença digital fraca, anúncios ruins, baixo volume de leads e falta de previsibilidade.";
    defaultDiffs = "Estratégia local, criativos, página de conversão, acompanhamento de métricas, otimização e foco em vendas reais.";
    defaultObjections = "Já tentei anúncios e não deu certo, acho caro, não tenho verba, medo de gastar sem retorno e dúvida sobre demanda online.";
    searchStrategy = "Buscar empresas competitivas, com ticket viável e presença digital que possa ser melhorada.";
  }

  if (hasFurniture) {
    detectedCategory = "mobiliário/estrutura física";
    defaultIdeal = "Escritórios, contabilidades, advocacias, clínicas, consultórios, imobiliárias, coworkings, agências e empresas em expansão.";
    defaultPains = "Móveis antigos, desconforto da equipe, falta de ergonomia, ambiente pouco profissional, expansão ou reforma.";
    defaultDiffs = "Produtos confortáveis, visual profissional, opções corporativas, entrega rápida, atendimento consultivo e montagem facilitada.";
    defaultObjections = "Está caro, já tenho móveis, vou deixar para depois, preciso medir o espaço, medo da qualidade e comparação com fornecedores.";
    searchStrategy = "Buscar empresas com estrutura física, atendimento presencial, equipe administrativa ou sinais de expansão/reforma.";
  }

  if (hasCleaning) {
    detectedCategory = "limpeza/higienização";
    defaultIdeal = "Hotéis, pousadas, clínicas, consultórios, escolas, creches, academias, restaurantes, condomínios, imobiliárias e espaços de atendimento.";
    defaultPains = "Mau cheiro, manchas, ácaros, aparência ruim, alto fluxo de pessoas, manutenção recorrente e reclamação de clientes.";
    defaultDiffs = "Higienização profunda, atendimento no local, eliminação de odores, impermeabilização, agenda rápida e serviço recorrente.";
    defaultObjections = "Acho caro, não está tão sujo, posso deixar para depois, medo de molhar demais, já tenho fornecedor e preciso ver disponibilidade.";
    searchStrategy = "Priorizar empresas com ambiente físico e alto fluxo de pessoas, onde higiene e aparência impactam percepção do cliente.";
  }

  const suggestedQueries = buildSearchTermsFromOffer(offer, source);
  const hasUserContext = [description, ideal, pains, diffs, objections].filter(Boolean).length;
  const confidence = clamp(48 + hasUserContext * 10 + (suggestedQueries.length >= 4 ? 10 : 0) + (source.length > 80 ? 8 : 0), 42, 96);

  return {
    summary: `A IA usou a oferta cadastrada "${productName}" como base principal. A priorização dos leads será feita pelo cruzamento entre produto, cliente ideal, dores resolvidas, segmento, contato, presença digital e sinais comerciais.`,
    offerSummary: description
      ? description
      : `${productName}. Complete a descrição para a IA entender melhor o resultado que o cliente compra.`,
    idealCustomer: ideal || defaultIdeal,
    painPoints: pains || defaultPains,
    differentials: diffs || defaultDiffs,
    objections: objections || defaultObjections,
    suggestedQueries: suggestedQueries.length ? suggestedQueries : ["empresa local", "prestador de serviço", "clínica", "loja", "escritório"],
    searchStrategy,
    confidence,
  };
}
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

function getCustomerPriorityLabel(score: number) {
  if (score >= 86) return "🟢 Excelente oportunidade";
  if (score >= 72) return "🟢 Alta prioridade";
  if (score >= 55) return "🟡 Vale qualificar";
  return "🔴 Baixa prioridade";
}

function getInterestLabel(score: number) {
  if (score >= 82) return "Alta";
  if (score >= 62) return "Média";
  return "Baixa";
}

function buildCustomerOpportunityText(params: {
  lead: Lead;
  offer: SalesOffer;
  score: number;
  matchedRule?: { label: string; reason: string; pains: string[] };
  pains: string[];
  hasStrongRuleMatch: boolean;
  idealMatches: string[];
}) {
  const { lead, offer, score, matchedRule, pains, hasStrongRuleMatch, idealMatches } = params;
  const offerName = offer.name?.trim() || "sua oferta";
  const mainPain = pains[0] || "possível melhoria comercial";
  const secondPain = pains[1] || "oportunidade de ganho operacional";

  const why = hasStrongRuleMatch
    ? `A NXA encontrou este lead porque o perfil da empresa combina com a oferta cadastrada. O segmento indica uma possível dor em ${mainPain} e ${secondPain}.`
    : idealMatches.length
      ? `A NXA encontrou termos do cliente ideal neste lead. Antes de vender, vale confirmar se a empresa realmente sofre com ${mainPain}.`
      : `A NXA encontrou dados públicos suficientes para qualificação, mas ainda não existe aderência forte com a oferta. Use como lead secundário.`;

  const opportunity = score >= 72
    ? `Existe uma boa abertura para apresentar ${offerName}, principalmente conectando a oferta com ${mainPain}.`
    : score >= 55
      ? `Pode existir oportunidade, mas a primeira mensagem deve validar a dor antes de apresentar ${offerName}.`
      : `Não parece ser prioridade para venda direta agora. Melhor usar em nutrição ou abordagem mais leve.`;

  const offerRecommendation = score >= 72
    ? `Vender ${offerName} como solução para reduzir perdas, melhorar operação e gerar mais resultado no atendimento ou processo comercial.`
    : score >= 55
      ? `Apresentar ${offerName} somente depois de confirmar necessidade, responsável pela decisão e momento de compra.`
      : `Não iniciar com proposta. Primeiro entender cenário, volume de demanda e se existe dor real.`;

  const channel = lead.phone ? "WhatsApp" : lead.website ? "Site" : "Maps";
  const approach = channel === "WhatsApp"
    ? `Abordar pelo WhatsApp com mensagem curta. Comece falando da oportunidade percebida e evite abrir a conversa falando preço.`
    : channel === "Site"
      ? `Usar o site para localizar um contato comercial e iniciar com uma pergunta de diagnóstico.`
      : `Abrir no Maps, validar dados de contato e qualificar antes de salvar como oportunidade principal.`;

  const summary = score >= 72
    ? `A NXA identificou que este negócio pode se beneficiar da sua oferta porque possui sinais comerciais compatíveis com o que você vende.`
    : score >= 55
      ? `A NXA identificou um possível encaixe, mas recomenda qualificar antes de tratar como oportunidade quente.`
      : `A NXA recomenda baixa prioridade neste lead, pois os sinais de compra ainda são fracos para a oferta cadastrada.`;

  return {
    why,
    opportunity,
    offerRecommendation,
    approach,
    summary,
    channel,
  };
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
    ai_customer_summary: buildCustomerOpportunityText({ lead, offer, score, matchedRule, pains: uniquePains, hasStrongRuleMatch, idealMatches }).summary,
    ai_opportunity: buildCustomerOpportunityText({ lead, offer, score, matchedRule, pains: uniquePains, hasStrongRuleMatch, idealMatches }).opportunity,
    ai_offer_recommendation: buildCustomerOpportunityText({ lead, offer, score, matchedRule, pains: uniquePains, hasStrongRuleMatch, idealMatches }).offerRecommendation,
    ai_approach_summary: buildCustomerOpportunityText({ lead, offer, score, matchedRule, pains: uniquePains, hasStrongRuleMatch, idealMatches }).approach,
    ai_priority_label: getCustomerPriorityLabel(score),
    ai_interest_label: getInterestLabel(probability),
    ai_why_this_lead: buildCustomerOpportunityText({ lead, offer, score, matchedRule, pains: uniquePains, hasStrongRuleMatch, idealMatches }).why,
    ai_best_channel: buildCustomerOpportunityText({ lead, offer, score, matchedRule, pains: uniquePains, hasStrongRuleMatch, idealMatches }).channel,
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

function slimLeadForStorage(lead: Lead) {
  return {
    id: lead.id,
    place_id: lead.place_id || null,
    name: lead.name,
    segment: lead.segment,
    city: lead.city,
    state: lead.state,
    address: lead.address,
    phone: lead.phone || "",
    website: lead.website || "",
    maps_url: lead.maps_url || "",
    google_rating: lead.google_rating || 0,
    google_reviews_count: lead.google_reviews_count || 0,
    score: lead.ai_fit_score || lead.score || 0,
    ai_fit_score: lead.ai_fit_score || lead.score || 0,
    ai_purchase_probability: lead.ai_purchase_probability || 0,
    ai_priority_label: lead.ai_priority_label || "",
    ai_best_channel: lead.ai_best_channel || "",
    ai_pitch: lead.ai_pitch || "",
    contact_quality: lead.contact_quality || 0,
    digital_strength: lead.digital_strength || 0,
    response_chance: lead.response_chance || 0,
    commercial_score_breakdown: lead.commercial_score_breakdown || [],
    status: lead.status || "new",
    instagram_url: lead.instagram_url || lead.social_links?.instagram || "",
    facebook_url: lead.facebook_url || lead.social_links?.facebook || "",
    linkedin_url: lead.linkedin_url || lead.social_links?.linkedin || "",
    web_enrichment_status: lead.web_enrichment_status || "skipped",
  };
}

function slimSearchForStorage(search: any, maxLeads = 20) {
  const sourceLeads = Array.isArray(search.results)
    ? search.results
    : Array.isArray(search.leads)
      ? search.leads
      : [];

  const slimLeads = sourceLeads
    .slice(0, maxLeads)
    .map((lead: Lead) => slimLeadForStorage(lead));

  return {
    id: search.id,
    user_id: search.user_id || null,
    niche: search.niche,
    query: search.query,
    city: search.city,
    state: search.state,
    radius_km: search.radius_km,
    quantity: search.quantity,
    precision: search.precision,
    only_opportunity: search.only_opportunity,
    results_count: search.results_count || sourceLeads.length || 0,
    total: search.total || search.results_count || sourceLeads.length || 0,
    credits_used: search.credits_used || 0,
    status: search.status || "completed",
    payload: {
      niche: search.payload?.niche || search.niche,
      queries: search.payload?.queries || [],
      city: search.payload?.city || search.city,
      state: search.payload?.state || search.state,
      lead_objective: search.payload?.lead_objective,
      min_score: search.payload?.min_score,
      error: search.payload?.error || null,
    },
    results: slimLeads,
    leads: slimLeads,
    created_at: search.created_at || new Date().toISOString(),
    local_storage_limited: sourceLeads.length > maxLeads,
  };
}

function safeSetLocalStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error: any) {
    if (error?.name === "QuotaExceededError") {
      try {
        localStorage.removeItem("nxa_search_history");
        localStorage.removeItem("nxa_saved_leads");
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (retryError) {
        console.warn(`Sem espaço no localStorage para ${key}:`, retryError);
        return false;
      }
    }

    console.warn(`Não foi possível salvar ${key} no localStorage:`, error);
    return false;
  }
}

function compactLocalLeadCaches() {
  try {
    const history = safeReadArrayStorage("nxa_search_history");
    if (history.length) {
      safeSetLocalStorage(
        "nxa_search_history",
        history.slice(0, 8).map((item: any) => slimSearchForStorage(item, 12))
      );
    }

    const lastSearch = localStorage.getItem("nxa_last_search_results");
    if (lastSearch) {
      safeSetLocalStorage("nxa_last_search_results", slimSearchForStorage(JSON.parse(lastSearch), 30));
    }
  } catch (error) {
    console.warn("Não foi possível compactar caches locais:", error);
  }
}

function saveLastSearchForRadar(search: any) {
  const compact = slimSearchForStorage(search, 30);
  safeSetLocalStorage("nxa_last_search_results", compact);
}

function saveSearchHistoryLocal(search: any) {
  const compact = slimSearchForStorage(search, 12);
  const history = safeReadArrayStorage("nxa_search_history");
  const updated = [compact, ...history.filter((item: any) => item?.id !== compact.id)].slice(0, 8);
  safeSetLocalStorage("nxa_search_history", updated);
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
  const payload = {
    niche: body.niche || body.query,
    query: body.query || body.niche,
    queries: body.queries || [],
    included_types: body.included_types || [],
    city: body.city,
    state: body.state,
    radius_km: body.radius_km,
    precision: body.precision,
    only_opportunity: body.only_opportunity,
    sales_offer: body.sales_offer,
    lead_objective: body.lead_objective,
    min_score: body.min_score,
    only_with_contact: body.only_with_contact,
    only_without_website: body.only_without_website,
    ai_scoring: body.ai_scoring,
    limit: body.quantity || body.limit || 20,
    quantity: body.quantity || body.limit || 20,
  };

  const { data, error } = await supabase.functions.invoke("bright-worker", {
    body: payload,
  });

  console.log("RETORNO GOOGLE PLACES:", data);

  if (error) {
    throw new Error(error.message || "Erro ao chamar Edge Function");
  }

  if (!data?.success) {
    throw new Error(data?.error || "Erro ao buscar no Google Places");
  }

  const raw = Array.isArray(data?.leads)
    ? data.leads
    : Array.isArray(data?.results)
      ? data.results
      : [];

  return raw.map((item: any, index: number) => {
    const placeId = item.place_id || item.id || item.google_place_id || null;
    const phone = item.phone || item.internationalPhoneNumber || item.formatted_phone_number || "";
    const rating = Number(item.rating || item.google_rating || 0);
    const reviews = Number(item.reviews || item.user_ratings_total || item.google_reviews_count || 0);
    const baseScore = Number(item.score || item.ai_fit_score || 0);

    return {
      id: String(placeId || `${body.city}-${body.state}-${item.name || "lead"}-${index}`),
      place_id: placeId,
      name: item.name || item.displayName?.text || item.displayName || "Empresa sem nome",
      segment: item.segment || item.category || body.niche || body.query,
      city: item.city || body.city,
      state: item.state || body.state,
      address: item.address || item.formattedAddress || item.formatted_address || "",
      phone,
      website: item.website || item.websiteUri || item.website_uri || "",
      maps_url: item.maps_url || item.googleMapsUri || item.google_maps_uri || "",
      google_rating: rating,
      google_reviews_count: reviews,
      score: baseScore > 0 ? baseScore : 70,
      status: "new",
      social_links: item.social_links || item.socials || {},
      instagram_url: item.instagram_url || item.social_links?.instagram || item.socials?.instagram || "",
      facebook_url: item.facebook_url || item.social_links?.facebook || item.socials?.facebook || "",
      linkedin_url: item.linkedin_url || item.social_links?.linkedin || item.socials?.linkedin || "",
      tiktok_url: item.tiktok_url || item.social_links?.tiktok || item.socials?.tiktok || "",
      youtube_url: item.youtube_url || item.social_links?.youtube || item.socials?.youtube || "",
      working_hours: item.working_hours || item.opening_hours?.weekday_text?.join(" | ") || item.currentOpeningHours?.weekdayDescriptions?.join(" | ") || "",
      contact_quality: 0,
      digital_strength: 0,
      response_chance: 0,
      source: "google_places",
      real_data: true,
    } as Lead;
  });
}


function cleanSocialUrl(url?: string) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("@")) return "";
  return `https://${value.replace(/^\/+/, "")}`;
}

function getInstagramUsernameFromUrl(url?: string) {
  const value = String(url || "").trim();
  const match = value.match(/instagram\.com\/(?!p\/|reel\/|stories\/|explore\/)([A-Za-z0-9._]+)/i);
  return match?.[1] || "";
}

function normalizeSocialEnrichment(raw: any, lead: Lead): Partial<Lead> {
  const socialLinks = raw?.social_links || raw?.socials || raw?.links || raw?.profiles || {};
  const instagramProfile = raw?.instagram_profile || raw?.instagram || raw?.profiles?.instagram || {};
  const instagramUrl = cleanSocialUrl(
    raw?.instagram_url || instagramProfile?.url || socialLinks?.instagram || socialLinks?.instagram_url
  );
  const facebookUrl = cleanSocialUrl(raw?.facebook_url || socialLinks?.facebook || socialLinks?.facebook_url);
  const linkedinUrl = cleanSocialUrl(raw?.linkedin_url || socialLinks?.linkedin || socialLinks?.linkedin_url);
  const tiktokUrl = cleanSocialUrl(raw?.tiktok_url || socialLinks?.tiktok || socialLinks?.tiktok_url);
  const youtubeUrl = cleanSocialUrl(raw?.youtube_url || socialLinks?.youtube || socialLinks?.youtube_url);

  const normalizedLinks = {
    ...(lead.social_links || {}),
    ...(instagramUrl ? { instagram: instagramUrl } : {}),
    ...(facebookUrl ? { facebook: facebookUrl } : {}),
    ...(linkedinUrl ? { linkedin: linkedinUrl } : {}),
    ...(tiktokUrl ? { tiktok: tiktokUrl } : {}),
    ...(youtubeUrl ? { youtube: youtubeUrl } : {}),
  };

  return {
    social_links: normalizedLinks,
    social_profiles: raw?.social_profiles || raw?.profiles || lead.social_profiles || {},
    instagram_url: instagramUrl || lead.instagram_url || "",
    instagram_username:
      raw?.instagram_username ||
      instagramProfile?.username ||
      getInstagramUsernameFromUrl(instagramUrl) ||
      lead.instagram_username ||
      "",
    instagram_followers: Number(raw?.instagram_followers || instagramProfile?.followers || instagramProfile?.followers_count || lead.instagram_followers || 0) || undefined,
    instagram_bio: raw?.instagram_bio || instagramProfile?.bio || instagramProfile?.biography || lead.instagram_bio || "",
    facebook_url: facebookUrl || lead.facebook_url || "",
    linkedin_url: linkedinUrl || lead.linkedin_url || "",
    tiktok_url: tiktokUrl || lead.tiktok_url || "",
    youtube_url: youtubeUrl || lead.youtube_url || "",
    web_enrichment_status: "completed",
    web_enrichment_summary:
      raw?.summary ||
      raw?.web_enrichment_summary ||
      (instagramUrl ? "Instagram encontrado na busca web." : Object.keys(normalizedLinks).length ? "Redes sociais encontradas na busca web." : "Busca web executada, mas sem redes confiáveis."),
    web_enrichment_confidence: clamp(Number(raw?.confidence || raw?.web_enrichment_confidence || 0), 0, 100),
  };
}

function buildWebEnrichmentQueries(lead: Lead) {
  const base = [lead.name, lead.city, lead.state].filter(Boolean).join(" ");
  const websiteHost = lead.website ? String(lead.website).replace(/^https?:\/\//, "").replace(/\/.*$/, "") : "";
  return [
    `${base} Instagram`,
    `${base} Facebook`,
    `${base} LinkedIn`,
    websiteHost ? `${websiteHost} redes sociais` : "",
    `${base} site oficial redes sociais`,
  ].filter(Boolean);
}

let webEnrichmentUnavailable = false;

async function enrichLeadWithWeb(lead: Lead, searchBody: any): Promise<Lead> {
  if (webEnrichmentUnavailable) {
    return {
      ...lead,
      web_enrichment_status: "skipped",
      web_enrichment_summary: "Enriquecimento web pausado nesta sessão porque a Edge Function retornou erro. A busca principal continua funcionando.",
    };
  }

  try {
    const payload = {
      lead: {
        name: lead.name,
        segment: lead.segment,
        city: lead.city,
        state: lead.state,
        address: lead.address,
        phone: lead.phone,
        website: lead.website,
        maps_url: lead.maps_url,
        place_id: lead.place_id,
      },
      sales_offer: searchBody.sales_offer,
      search_context: {
        niche: searchBody.niche,
        city: searchBody.city,
        state: searchBody.state,
        queries: searchBody.queries,
      },
      queries: buildWebEnrichmentQueries(lead),
      requested_outputs: [
        "instagram_url",
        "instagram_username",
        "instagram_followers",
        "instagram_bio",
        "facebook_url",
        "linkedin_url",
        "tiktok_url",
        "youtube_url",
        "social_links",
        "social_profiles",
      ],
    };

    const { data, error } = await supabase.functions.invoke("enrich-lead-web", { body: payload });

    if (error) throw error;
    if (data?.success === false || data?.error) {
      throw new Error(data?.error || "Edge Function enrich-lead-web retornou falha.");
    }

    const enrichment = data?.enrichment || data?.social_intelligence || data?.result || data || {};
    return {
      ...lead,
      ...normalizeSocialEnrichment(enrichment, lead),
    };
  } catch (error: any) {
    const message = String(error?.message || error || "");
    const isEdgeConfigProblem =
      message.includes("400") ||
      message.toLowerCase().includes("failed to send") ||
      message.toLowerCase().includes("missing") ||
      message.toLowerCase().includes("api key") ||
      message.toLowerCase().includes("unauthorized");

    if (isEdgeConfigProblem) {
      webEnrichmentUnavailable = true;
    } else {
      console.warn("Enriquecimento web não executado para lead:", lead.name, error);
    }

    return {
      ...lead,
      web_enrichment_status: isEdgeConfigProblem ? "skipped" : "failed",
      web_enrichment_summary: isEdgeConfigProblem
        ? "Enriquecimento web indisponível: revise a Edge Function enrich-lead-web e as secrets Tavily/Serper/Apify. A busca principal, score e WhatsApp continuam funcionando."
        : "Enriquecimento web falhou para este lead, mas a busca principal continuou normalmente.",
    };
  }
}

async function enrichLeadsWithWeb(leads: Lead[], searchBody: any) {
  const concurrency = 3;
  const queue = [...leads];
  const enriched: Lead[] = [];

  async function worker() {
    while (queue.length) {
      const lead = queue.shift();
      if (!lead) return;
      const result = await enrichLeadWithWeb(lead, searchBody);
      enriched.push(result);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, leads.length) }, worker));
  const byId = new Map(enriched.map((lead) => [lead.id, lead]));
  return leads.map((lead) => byId.get(lead.id) || lead);
}

function hasAnySocial(lead: Lead) {
  return Boolean(
    lead.instagram_url ||
      lead.facebook_url ||
      lead.linkedin_url ||
      lead.tiktok_url ||
      lead.youtube_url ||
      Object.keys(lead.social_links || {}).length
  );
}

function leadDedupKey(lead: Lead) {
  const phone = onlyDigits(lead.phone);
  if (phone) return `phone:${phone}`;
  const normalized = normalizeText([lead.name, lead.city, lead.state].filter(Boolean).join("|"));
  return `name:${normalized}`;
}

function dedupeLeads(leads: Lead[]) {
  const map = new Map<string, Lead>();

  for (const lead of leads) {
    const key = leadDedupKey(lead);
    const current = map.get(key);
    if (!current) {
      map.set(key, lead);
      continue;
    }

    const currentScore = Number(current.ai_fit_score || current.score || 0);
    const nextScore = Number(lead.ai_fit_score || lead.score || 0);
    if (nextScore > currentScore) map.set(key, { ...current, ...lead });
  }

  return Array.from(map.values());
}

function getLeadObjectiveLabel(objective?: LeadObjective) {
  const labels: Record<LeadObjective, string> = {
    all: "Todos os bons leads",
    whatsapp: "Com WhatsApp/telefone",
    no_site: "Sem site",
    high_reviews: "Muitas avaliações",
    social_gap: "Lacuna digital",
    premium: "Premium/local forte",
    new_business: "Empresas novas",
    high_flow: "Alto fluxo local",
    weak_instagram: "Instagram fraco",
    no_digital_presence: "Sem presença digital",
  };

  return labels[objective || "all"];
}

function scoreLeadOpportunity(lead: Lead, context: { objective?: LeadObjective; minScore?: number; onlyWithContact?: boolean; onlyWithoutWebsite?: boolean }) {
  const rating = Number(lead.google_rating || 0);
  const reviews = Number(lead.google_reviews_count || 0);
  const hasPhone = Boolean(lead.phone);
  const hasWebsite = Boolean(lead.website);
  const hasSocial = hasAnySocial(lead);

  const hasInstagram = Boolean(lead.instagram_url || lead.social_links?.instagram);
  const instagramFollowers = Number(lead.instagram_followers || 0);
  const weakInstagram = !hasInstagram || (instagramFollowers > 0 && instagramFollowers < 1500);
  const noDigitalPresence = !hasWebsite && !hasSocial;

  let score = 36;
  if (hasPhone) score += 18;
  if (hasWebsite) score += 8;
  else score += 14;
  if (hasSocial) score += 8;
  if (rating >= 4.7) score += 13;
  else if (rating >= 4.3) score += 10;
  else if (rating >= 4.0) score += 6;
  if (reviews >= 250) score += 16;
  else if (reviews >= 100) score += 12;
  else if (reviews >= 40) score += 8;
  else if (reviews >= 10) score += 4;

  switch (context.objective || "all") {
    case "whatsapp":
      score += hasPhone ? 14 : -18;
      break;
    case "no_site":
      score += !hasWebsite ? 18 : -8;
      break;
    case "high_reviews":
      score += reviews >= 80 ? 16 : -8;
      break;
    case "social_gap":
      score += !hasSocial || !hasWebsite ? 14 : -4;
      break;
    case "premium":
      score += rating >= 4.5 && reviews >= 80 ? 16 : -6;
      break;
    case "new_business":
      score += reviews > 0 && reviews <= 25 ? 14 : -5;
      break;
    case "high_flow":
      score += reviews >= 80 ? 18 : reviews >= 40 ? 10 : -8;
      break;
    case "weak_instagram":
      score += weakInstagram ? 16 : -6;
      break;
    case "no_digital_presence":
      score += noDigitalPresence ? 20 : !hasWebsite ? 10 : -8;
      break;
  }

  const finalScore = clamp(Math.round(score), 25, 99);
  const contactQuality = clamp(Math.round((hasPhone ? 62 : 12) + (hasWebsite ? 18 : 0) + (hasSocial ? 12 : 0) + (reviews >= 20 ? 8 : 0)), 5, 100);
  const digitalStrength = clamp(Math.round((hasWebsite ? 42 : 0) + (hasSocial ? 32 : 0) + (rating >= 4.3 ? 10 : 0) + (reviews >= 40 ? 16 : reviews >= 10 ? 8 : 0)), 0, 100);
  const responseChance = clamp(Math.round(finalScore * 0.5 + contactQuality * 0.35 + (hasPhone ? 15 : 0)), 5, 97);
  const pains: string[] = [];
  if (!hasWebsite) pains.push("sem site detectado");
  if (!hasSocial) pains.push("redes sociais não encontradas");
  if (hasPhone) pains.push("contato direto disponível");
  if (reviews >= 80) pains.push("alto volume de avaliações");
  if (rating >= 4.5) pains.push("boa reputação local");
  if (weakInstagram) pains.push("Instagram fraco ou não encontrado");
  if (noDigitalPresence) pains.push("presença digital praticamente ausente");

  const nextAction = hasPhone
    ? "Abrir WhatsApp com mensagem personalizada e validar responsável comercial."
    : hasWebsite
      ? "Abrir site, capturar canal de contato e qualificar manualmente."
      : "Pesquisar redes sociais antes de abordar.";

  return {
    ...lead,
    score: finalScore,
    ai_fit_score: finalScore,
    ai_purchase_probability: responseChance,
    ai_priority_label: finalScore >= 80 ? "Lead quente" : finalScore >= 62 ? "Bom lead" : "Qualificar",
    ai_interest_label: getLeadObjectiveLabel(context.objective),
    ai_pain_detected: pains.slice(0, 4),
    ai_reason: `Score de oportunidade real: contato ${contactQuality}/100, força digital ${digitalStrength}/100, resposta ${responseChance}/100. Sinais: ${pains.slice(0, 3).join(" + ") || "dados públicos disponíveis"}.`,
    ai_why_this_lead: `${lead.name} entrou na fila porque combina com o objetivo "${getLeadObjectiveLabel(context.objective)}" e possui sinais públicos úteis para prospecção.`,
    ai_next_action: nextAction,
    ai_best_channel: hasPhone ? "WhatsApp" : hasWebsite ? "Site" : "Pesquisa manual",
    ai_pitch: buildLeadHunterApproachText({ ...lead, score: finalScore, contact_quality: contactQuality, digital_strength: digitalStrength, response_chance: responseChance }, context.objective),
    contact_quality: contactQuality,
    digital_strength: digitalStrength,
    response_chance: responseChance,
    commercial_signals: pains.slice(0, 6),
    status: finalScore >= 80 ? "hot" : finalScore >= 62 ? "warm" : "new",
  } as Lead;
}


function isDefaultOffer(offer: SalesOffer) {
  return JSON.stringify(offer) === JSON.stringify(DEFAULT_SALES_OFFER);
}

function hasMeaningfulOffer(offer: SalesOffer) {
  const text = [offer.name, offer.description, offer.idealCustomer, offer.painPoints, offer.differentials]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join(" ");

  // O default antigo não deve prender a plataforma em automação. Só ativa fit de oferta
  // quando o usuário realmente preencheu ou editou algo.
  return text.length >= 18 && !isDefaultOffer(offer);
}

function getDecisionLabel(score: number, offerScore?: number) {
  if (offerScore && offerScore >= 82 && score >= 72) return "Atacar agora";
  if (score >= 82) return "Lead quente";
  if (score >= 68) return "Boa oportunidade";
  if (score >= 52) return "Qualificar primeiro";
  return "Baixa prioridade";
}

function calculateStructureScore(lead: Lead) {
  const reviews = Number(lead.google_reviews_count || 0);
  const rating = Number(lead.google_rating || 0);
  const hasWebsite = Boolean(lead.website);
  const hasPhone = Boolean(lead.phone);
  const hasSocial = hasAnySocial(lead);

  return clamp(
    Math.round(
      24 +
        (hasWebsite ? 18 : 4) +
        (hasPhone ? 12 : 0) +
        (hasSocial ? 10 : 2) +
        (reviews >= 250 ? 24 : reviews >= 100 ? 18 : reviews >= 40 ? 12 : reviews >= 10 ? 7 : 0) +
        (rating >= 4.7 ? 12 : rating >= 4.3 ? 8 : rating > 0 ? 4 : 0)
    ),
    8,
    98
  );
}

function calculateFinancialPotential(lead: Lead) {
  const reviews = Number(lead.google_reviews_count || 0);
  const rating = Number(lead.google_rating || 0);
  const segment = normalizeText(`${lead.segment || ""} ${lead.name || ""}`);
  const premiumSegment = /clinica|odont|dent|imobiliaria|hotel|industria|advocacia|contabilidade|construtora|academia|escola|software|empresa|consultorio|estetica/.test(segment);

  return clamp(
    Math.round(
      28 +
        (premiumSegment ? 18 : 6) +
        (reviews >= 250 ? 24 : reviews >= 100 ? 18 : reviews >= 40 ? 12 : reviews >= 10 ? 7 : 0) +
        (rating >= 4.6 ? 10 : rating >= 4.2 ? 6 : 0) +
        (lead.website ? 8 : 2) +
        (lead.phone ? 7 : 0)
    ),
    10,
    98
  );
}

function applyOfferCompatibility(lead: Lead, offer: SalesOffer, enabled: boolean): Lead {
  const commercialScore = Number(lead.ai_fit_score || lead.score || 0);
  const structureScore = calculateStructureScore(lead);
  const financialPotential = calculateFinancialPotential(lead);

  if (!enabled || !hasMeaningfulOffer(offer)) {
    const finalScore = clamp(Math.round(commercialScore * 0.74 + structureScore * 0.14 + financialPotential * 0.12), 1, 99);
    return {
      ...lead,
      commercial_score: commercialScore,
      structure_score: structureScore,
      financial_potential: financialPotential,
      final_priority_score: finalScore,
      score: finalScore,
      ai_fit_score: finalScore,
      decision_label: getDecisionLabel(finalScore),
      decision_reason: "Prioridade calculada por score comercial universal: contato, estrutura, reputação, presença digital, potencial financeiro e chance de resposta.",
      ai_priority_label: getDecisionLabel(finalScore),
    };
  }

  const offerAnalysis = analyzeLeadForOffer(lead, offer);
  const offerScore = Number(offerAnalysis.ai_fit_score || offerAnalysis.score || 0);
  const finalScore = clamp(
    Math.round(commercialScore * 0.48 + offerScore * 0.34 + financialPotential * 0.11 + structureScore * 0.07),
    1,
    99
  );

  const label = getDecisionLabel(finalScore, offerScore);
  const lowFit = offerScore < 50 && commercialScore >= 70;

  return {
    ...lead,
    commercial_score: commercialScore,
    offer_compatibility_score: offerScore,
    structure_score: structureScore,
    financial_potential: financialPotential,
    final_priority_score: finalScore,
    score: finalScore,
    ai_fit_score: finalScore,
    ai_offer_name: offer.name,
    decision_label: lowFit ? "Bom lead, oferta fraca" : label,
    decision_reason: lowFit
      ? "A empresa parece comercialmente boa, mas a oferta cadastrada ainda não combina forte com esse segmento. Priorize somente se fizer sentido estratégico."
      : `Prioridade calculada com score comercial ${commercialScore}/100 + compatibilidade da oferta ${offerScore}/100 + potencial financeiro ${financialPotential}/100.`,
    offer_fit_summary: offerAnalysis.ai_compatibility_reason || offerAnalysis.ai_reason,
    offer_fit_next_step: offerAnalysis.ai_next_action,
    ai_priority_label: lowFit ? "Bom lead, oferta fraca" : label,
    ai_offer_recommendation: offerAnalysis.ai_offer_recommendation,
    ai_approach_summary: offerAnalysis.ai_approach_summary,
    ai_why_this_lead: offerAnalysis.ai_why_this_lead || lead.ai_why_this_lead,
    ai_pitch: buildUniversalOrOfferApproachText({ ...lead, score: finalScore }, offer, offerScore),
  };
}

function buildUniversalOrOfferApproachText(lead: Lead, offer: SalesOffer, offerScore?: number) {
  const reviews = Number(lead.google_reviews_count || 0);
  const rating = Number(lead.google_rating || 0);
  const offerName = offer.name?.trim();
  const hasOffer = hasMeaningfulOffer(offer) && offerName;

  const proof = reviews >= 80
    ? `vi que vocês têm um volume forte de avaliações no Google (${reviews})`
    : rating >= 4.5
      ? `vi que vocês têm uma boa reputação local (${rating.toFixed(1)} no Google)`
      : "vi o perfil de vocês no Google";

  const gap = !lead.website
    ? "Também notei que não encontrei um site claro, o que pode estar deixando oportunidades na mesa."
    : !hasAnySocial(lead)
      ? "Também não encontrei redes sociais fortes vinculadas ao perfil, o que pode limitar novas oportunidades."
      : "Achei que poderia existir uma oportunidade de melhorar a captação e organização de novos contatos.";

  if (hasOffer && Number(offerScore || 0) >= 55) {
    return `Olá, tudo bem? Estava analisando empresas em ${lead.city}/${lead.state} e ${proof}. ${gap} Trabalho com ${offerName} e acredito que pode fazer sentido para a ${lead.name}. Posso te mostrar uma ideia rápida e objetiva?`;
  }

  return `Olá, tudo bem? Estava analisando empresas em ${lead.city}/${lead.state} e ${proof}. ${gap} Posso te mandar uma sugestão objetiva de melhoria para o negócio de vocês?`;
}

function buildLeadHunterApproachText(lead: Lead, objective: LeadObjective = "all") {
  const gap = !lead.website
    ? "notei que não encontrei um site claro de vocês no Google"
    : (lead.google_reviews_count || 0) >= 80
      ? `vi que vocês têm bastante movimento e ${lead.google_reviews_count} avaliações no Google`
      : "vi o perfil de vocês no Google e achei que fazia sentido um contato rápido";

  const hook = objective === "no_site"
    ? "Tenho ajudado negócios locais a transformar presença digital e WhatsApp em mais oportunidades."
    : objective === "whatsapp"
      ? "Tenho uma ideia rápida para melhorar atendimento e conversão pelo WhatsApp."
      : "Tenho uma ideia rápida para gerar e organizar mais oportunidades comerciais.";

  return `Olá, tudo bem? Vi a ${lead.name} e ${gap}. ${hook} Posso te mandar uma sugestão objetiva de melhoria para o negócio de vocês?`;
}

function filterLeadByHunterRules(lead: Lead, context: { objective?: LeadObjective; minScore?: number; onlyWithContact?: boolean; onlyWithoutWebsite?: boolean }) {
  const score = Number(lead.ai_fit_score || lead.score || 0);
  if (score < Number(context.minScore || 0)) return false;
  if (context.onlyWithContact && !lead.phone) return false;
  if (context.onlyWithoutWebsite && lead.website) return false;

  switch (context.objective || "all") {
    case "whatsapp":
      return Boolean(lead.phone);
    case "no_site":
      return !lead.website;
    case "high_reviews":
      return Number(lead.google_reviews_count || 0) >= 40;
    case "social_gap":
      return !hasAnySocial(lead) || !lead.website;
    case "premium":
      return Number(lead.google_rating || 0) >= 4.3 && Number(lead.google_reviews_count || 0) >= 40;
    case "new_business":
      return Number(lead.google_reviews_count || 0) > 0 && Number(lead.google_reviews_count || 0) <= 35;
    case "high_flow":
      return Number(lead.google_reviews_count || 0) >= 40;
    case "weak_instagram":
      return !lead.instagram_url || Number(lead.instagram_followers || 0) < 1500;
    case "no_digital_presence":
      return !lead.website && !hasAnySocial(lead);
    default:
      return true;
  }
}

function shouldKeepOpportunity(lead: Lead) {
  const score = Number(lead.ai_fit_score || lead.score || 0);
  return score >= 55 && Boolean(lead.phone || lead.website || (lead.google_reviews_count || 0) >= 10);
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

function buildWhatsAppUrl(phone?: string, message?: string) {
  let digits = onlyDigits(phone);

  if (!digits) return "";

  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }

  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
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
    "Instagram",
    "Facebook",
    "LinkedIn",
    "TikTok",
    "YouTube",
    "Status enriquecimento web",
    "Avaliacao",
    "Avaliacoes",
    "Score IA",
    "Probabilidade",
    "Potencial estimado",
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
    lead.instagram_url || lead.social_links?.instagram || "",
    lead.facebook_url || lead.social_links?.facebook || "",
    lead.linkedin_url || lead.social_links?.linkedin || "",
    lead.tiktok_url || lead.social_links?.tiktok || "",
    lead.youtube_url || lead.social_links?.youtube || "",
    lead.web_enrichment_status || "",
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
  const [leadObjective, setLeadObjective] = React.useState<LeadObjective>("all");
  const [minScore, setMinScore] = React.useState(55);
  const [onlyWithContact, setOnlyWithContact] = React.useState(false);
  const [onlyWithoutWebsite, setOnlyWithoutWebsite] = React.useState(false);
  const [autoSaveFoundLeads, setAutoSaveFoundLeads] = React.useState(true);
  const [running, setRunning] = React.useState(false);
  const [loadingHistory, setLoadingHistory] = React.useState(false);
  const [results, setResults] = React.useState<Lead[]>([]);
  const [searches, setSearches] = React.useState<any[]>([]);
  const [credits, setCredits] = React.useState<number>(0);
  const [creditsLoading, setCreditsLoading] = React.useState(true);
  const [savedLeadIds, setSavedLeadIds] = React.useState<string[]>([]);
  const [crmLeadIds, setCrmLeadIds] = React.useState<string[]>([]);
  const [approachLeadIds, setApproachLeadIds] = React.useState<string[]>([]);
  const [contactedLeadIds, setContactedLeadIds] = React.useState<string[]>([]);
  const [discardedLeadIds, setDiscardedLeadIds] = React.useState<string[]>([]);
  const [campaignLeadIds, setCampaignLeadIds] = React.useState<string[]>([]);
  const [followupLeadIds, setFollowupLeadIds] = React.useState<string[]>([]);
  const [offer, setOffer] = React.useState<SalesOffer>(() => readSalesOfferStorage());
  const [offerInsight, setOfferInsight] = React.useState<OfferIntelligence | null>(() => inferOfferIntelligence(readSalesOfferStorage()));
  const [analyzingOffer, setAnalyzingOffer] = React.useState(false);
  const [showOfferAdvanced, setShowOfferAdvanced] = React.useState(false);
  const [aiScoringEnabled, setAiScoringEnabled] = React.useState(true);
  const [offerCompatibilityEnabled, setOfferCompatibilityEnabled] = React.useState(false);
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
    compactLocalLeadCaches();
    loadSearchHistory();
    loadCredits();
  }, []);

  React.useEffect(() => {
    setSavedLeadIds(readStringArrayStorage("nxa_saved_lead_ids"));
    setCrmLeadIds(readStringArrayStorage("nxa_crm_lead_ids"));
    setApproachLeadIds(readStringArrayStorage("nxa_approach_lead_ids"));
    setContactedLeadIds(readStringArrayStorage("nxa_contacted_lead_ids"));
    setDiscardedLeadIds(readStringArrayStorage("nxa_discarded_lead_ids"));
    setCampaignLeadIds(readStringArrayStorage("nxa_campaign_lead_ids"));
    setFollowupLeadIds(readStringArrayStorage("nxa_followup_lead_ids"));
  }, []);

  React.useEffect(() => {
    writeSalesOfferStorage(offer);
    setOfferInsight(inferOfferIntelligence(offer));
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

  function applyOfferIntelligenceToSearch(insight: OfferIntelligence) {
    const cleanQueries = Array.from(new Set(insight.suggestedQueries.map((item) => item.trim()).filter(Boolean))).slice(0, 8);
    if (!cleanQueries.length) return;
    setMode("custom");
    setCustomQueries(cleanQueries);
    setCustomInput("");
    setOnlyOpportunity(true);
    setPrecisionMode(true);
    toast({
      title: "Busca alinhada com a oferta",
      description: `${cleanQueries.length} termos inteligentes foram aplicados na missão de busca.`,
    });
  }

  async function analyzeAndFillOffer() {
    if (!offer.name.trim() && !offer.description.trim()) {
      toast({
        title: "Informe a oferta primeiro",
        description: "Digite pelo menos o nome do produto ou uma descrição curta para a IA estruturar a análise.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzingOffer(true);
    await new Promise((resolve) => window.setTimeout(resolve, 650));

    const insight = inferOfferIntelligence(offer);
    const enrichedOffer: SalesOffer = {
      ...offer,
      idealCustomer: insight.idealCustomer,
      painPoints: insight.painPoints,
      differentials: insight.differentials,
      objections: insight.objections,
      description: offer.description?.trim() || insight.offerSummary,
    };

    setOffer(enrichedOffer);
    setOfferInsight(insight);
    setShowOfferAdvanced(true);
    applyOfferIntelligenceToSearch(insight);
    setAnalyzingOffer(false);

    toast({
      title: "Oferta analisada",
      description: "A IA preencheu dores, diferenciais, objeções e preparou os termos de busca para cruzar com os leads.",
    });
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

    if (requiredCredits <= 0) return Number(credits || 0);

    // Leitura tolerante para não travar a busca quando o projeto ainda está com
    // schema antigo ou nome de carteira diferente. O bloqueio só acontece quando
    // conseguimos ler a carteira com segurança.
    const walletReads = [
      () => supabase.from("wallets").select("credits").eq("user_id", user.id).maybeSingle(),
      () => supabase.from("user_wallets").select("credits").eq("user_id", user.id).maybeSingle(),
    ];

    for (const readWallet of walletReads) {
      const { data, error } = await readWallet();
      if (!error && data) {
        const currentCredits = Number(data?.credits || 0);
        setCredits(currentCredits);

        if (currentCredits < requiredCredits) {
          throw new Error(
            `Créditos insuficientes. Você tem ${currentCredits} crédito(s), mas esta busca exige até ${requiredCredits}.`
          );
        }

        return currentCredits;
      }
    }

    return Number(credits || 0);
  }

  async function consumeCredits(amount: number, metadata: any) {
    if (amount <= 0) return;

    // O consumo de crédito não pode derrubar uma busca já concluída. Primeiro
    // tentamos o RPC oficial; se ele ainda não existir no banco, registramos no
    // histórico local e mantemos os leads encontrados na tela.
    const { data, error } = await supabase.rpc("use_credits", {
      p_amount: amount,
      p_description: `Busca inteligente - ${amount} lead(s) encontrado(s)`,
      p_metadata: metadata,
    });

    if (error) {
      console.warn("Créditos não debitados pelo RPC use_credits:", error.message);
      return;
    }

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

  async function saveLeadsToDatabase(leadsToSave: Lead[], searchBody: any) {
    if (!leadsToSave.length) return { saved: 0, failed: false };

    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id || null;
      const businessId = import.meta.env.VITE_BUSINESS_ID || "NEXA_PROD_01";
      const tenantId = import.meta.env.VITE_TENANT_ID || null;

      const rows = leadsToSave.map((lead) => ({
        user_id: userId,
        business_id: businessId,
        tenant_id: tenantId,
        place_id: (lead as any).place_id || null,
        name: lead.name,
        segment: lead.segment || searchBody.niche,
        category: lead.segment || searchBody.niche,
        city: lead.city || searchBody.city,
        state: lead.state || searchBody.state,
        address: lead.address || null,
        phone: lead.phone || null,
        website: lead.website || null,
        maps_url: lead.maps_url || null,
        instagram_url: lead.instagram_url || lead.social_links?.instagram || null,
        facebook_url: lead.facebook_url || lead.social_links?.facebook || null,
        linkedin_url: lead.linkedin_url || lead.social_links?.linkedin || null,
        tiktok_url: lead.tiktok_url || lead.social_links?.tiktok || null,
        youtube_url: lead.youtube_url || lead.social_links?.youtube || null,
        social_links: lead.social_links || null,
        social_profiles: lead.social_profiles || null,
        web_enrichment_status: lead.web_enrichment_status || null,
        web_enrichment_summary: lead.web_enrichment_summary || null,
        google_rating: lead.google_rating || null,
        google_reviews_count: lead.google_reviews_count || null,
        rating: lead.google_rating || null,
        score: lead.ai_fit_score || lead.score || 0,
        status: lead.ai_fit_score && lead.ai_fit_score >= 80 ? "hot" : lead.ai_fit_score && lead.ai_fit_score >= 60 ? "warm" : "new",
        source: "busca_inteligente_ia",
        payload: {
          ...lead,
          search: searchBody,
          lead_objective: searchBody.lead_objective,
          min_score: searchBody.min_score,
          saved_automatically: true,
        },
      }));

      const persistRows = async (payloadRows: any[]) => {
        const { error } = await supabase
          .from("leads")
          .upsert(payloadRows, { onConflict: "business_id,phone,name,city", ignoreDuplicates: false });
        return error;
      };

      let error = await persistRows(rows);

      if (error) {
        const message = String(error.message || "");
        const schemaMismatch = message.includes("schema cache") || message.includes("does not exist") || message.includes("column");

        if (!schemaMismatch) throw error;

        const compatibleRows = rows.map((row) => ({
          user_id: row.user_id,
          business_id: row.business_id,
          name: row.name,
          segment: row.segment,
          city: row.city,
          state: row.state,
          address: row.address,
          phone: row.phone,
          website: row.website,
          google_rating: row.google_rating,
          google_reviews_count: row.google_reviews_count,
          score: row.score,
          status: row.status,
          source: row.source,
          payload: row.payload,
        }));

        error = await persistRows(compatibleRows);
        if (error) throw error;
      }

      setSavedLeadIds((current) => {
        const next = Array.from(new Set([...current, ...leadsToSave.map((lead) => lead.id)]));
        writeStringArrayStorage("nxa_saved_lead_ids", next);
        return next;
      });

      leadsToSave.forEach((lead) => {
        upsertLocalStorageItem("nxa_saved_leads", {
          ...lead,
          saved_at: new Date().toISOString(),
          saved_automatically: true,
        });
      });

      return { saved: rows.length, failed: false };
    } catch (error) {
      console.error("Erro ao salvar leads automaticamente:", error);

      leadsToSave.forEach((lead) => {
        upsertLocalStorageItem("nxa_saved_leads", {
          ...lead,
          saved_at: new Date().toISOString(),
          saved_automatically: true,
        });
      });

      return { saved: 0, failed: true };
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

    const requiredCreditsBeforeSearch = mode === "custom" ? 0 : maxCost;

    try {
      await ensureEnoughCredits(requiredCreditsBeforeSearch);
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
      lead_objective: leadObjective,
      min_score: minScore,
      only_with_contact: onlyWithContact,
      only_without_website: onlyWithoutWebsite,
      auto_save_found_leads: autoSaveFoundLeads,
      ai_scoring: aiScoringEnabled,
      offer_compatibility: offerCompatibilityEnabled && hasMeaningfulOffer(offer),
      sales_offer: offerCompatibilityEnabled && hasMeaningfulOffer(offer) ? offer : null,
      web_enrichment: true,
      enrichment_layers: [
        "google_places",
        "web_search_tavily_serper",
        "social_apify",
        "cnpj_brasilapi_receitaws",
        "phone_whatsapp_validation",
        "ai_classification",
      ],
    };

    try {
      const rawLeads = await searchLeads(body);
      const hunterContext = { objective: leadObjective, minScore, onlyWithContact, onlyWithoutWebsite };
      const commerciallyScoredLeads = aiScoringEnabled
        ? rawLeads.map((lead) => scoreLeadOpportunity(lead, hunterContext))
        : rawLeads;

      const scoredLeads = commerciallyScoredLeads.map((lead) =>
        applyOfferCompatibility(lead, offer, offerCompatibilityEnabled)
      );

      const dedupedLeads = dedupeLeads(scoredLeads);
      const hunterFiltered = dedupedLeads.filter((lead) => filterLeadByHunterRules(lead, hunterContext));
      const filteredLeads = onlyOpportunity
        ? hunterFiltered.filter(shouldKeepOpportunity)
        : hunterFiltered;

      // Se o filtro de oportunidade ficar agressivo demais, não deixa a tela
      // parecer quebrada: mostra os melhores leads encontrados e mantém o score
      // explicando o fit comercial.
      const qualifiedLeads = filteredLeads.length ? filteredLeads : dedupedLeads;

      const leadsBeforeWeb = qualifiedLeads
        .sort((a, b) => (b.ai_fit_score || b.score || 0) - (a.ai_fit_score || a.score || 0))
        .slice(0, quantity);

      setEngineStage(4);
      const leads = body.web_enrichment
        ? await enrichLeadsWithWeb(leadsBeforeWeb, body)
        : leadsBeforeWeb;

      const creditsUsed = mode === "custom" ? 0 : leads.length * CREDIT_COST_PER_LEAD;

      await consumeCredits(creditsUsed, {
        city,
        state,
        niche: built.label,
        queries: built.queries,
        quantity,
        results_count: leads.length,
        lead_objective: leadObjective,
        min_score: minScore,
        ai_scoring: aiScoringEnabled,
        offer_compatibility: offerCompatibilityEnabled && hasMeaningfulOffer(offer),
      });

      const persistence = autoSaveFoundLeads
        ? await saveLeadsToDatabase(leads, body)
        : { saved: 0, failed: false };

      setResults(leads);

      await saveSearchHistory({
        body: {
          ...body,
          raw_results_count: rawLeads.length,
          deduped_results_count: dedupedLeads.length,
          persisted_results_count: persistence.saved,
          credits_used: creditsUsed,
        },
        leads,
        status: "completed",
      });

      toast({
        title: `${leads.length} leads encontrados`,
        description: persistence.failed
          ? `Busca concluída. Os leads ficaram salvos localmente; revise o schema da tabela leads para salvar no banco.`
          : `Busca concluída em ${city}/${state}. ${persistence.saved} lead(s) sincronizado(s) na base${creditsUsed ? ` e ${creditsUsed} crédito(s) usado(s)` : ""}.`,
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
    "Mapeando nicho e região",
    "Consultando Google Places",
    "Removendo duplicados",
    "Enriquecendo redes e site",
    "Ranqueando melhores leads",
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

  const markContacted = React.useCallback((lead: Lead) => {
    setContactedLeadIds((current) => {
      const next = Array.from(new Set([...current, lead.id]));
      writeStringArrayStorage("nxa_contacted_lead_ids", next);
      return next;
    });
    upsertLocalStorageItem("nxa_contacted_leads", { ...lead, contacted_at: new Date().toISOString() });
    toast({ title: "Lead marcado como contatado", description: `${lead.name} saiu da fila fria e ficou registrado no histórico.` });
  }, [toast]);

  const markDiscarded = React.useCallback((lead: Lead) => {
    setDiscardedLeadIds((current) => {
      const next = Array.from(new Set([...current, lead.id]));
      writeStringArrayStorage("nxa_discarded_lead_ids", next);
      return next;
    });
    upsertLocalStorageItem("nxa_discarded_leads", { ...lead, discarded_at: new Date().toISOString() });
    toast({ title: "Lead descartado", description: `${lead.name} foi removido da prospecção prioritária.` });
  }, [toast]);

  const addToCampaign = React.useCallback((lead: Lead) => {
    setCampaignLeadIds((current) => {
      const next = Array.from(new Set([...current, lead.id]));
      writeStringArrayStorage("nxa_campaign_lead_ids", next);
      return next;
    });
    upsertLocalStorageItem("nxa_campaign_leads", { ...lead, campaign_added_at: new Date().toISOString(), message: buildLeadHunterApproachText(lead, leadObjective) });
    toast({ title: "Lead adicionado à campanha", description: "Mensagem individual salva para envio semi-automático, evitando disparo em massa." });
  }, [leadObjective, toast]);

  const createFollowup = React.useCallback((lead: Lead) => {
    setFollowupLeadIds((current) => {
      const next = Array.from(new Set([...current, lead.id]));
      writeStringArrayStorage("nxa_followup_lead_ids", next);
      return next;
    });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    upsertLocalStorageItem("nxa_followups", {
      id: `followup-${lead.id}`,
      lead_id: lead.id,
      title: `Follow-up ${lead.name}`,
      channel: lead.phone ? "WhatsApp" : lead.website ? "Site" : "Maps",
      date: tomorrow.toISOString(),
      priority: (lead.score || 0) >= 80 ? "alta" : "media",
      status: "pending",
      notes: lead.ai_next_action || "Retomar contato e validar interesse.",
      lead,
    });
    toast({ title: "Follow-up criado", description: `Próximo contato de ${lead.name} salvo para amanhã.` });
  }, [toast]);

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
        notes: `Lead enviado pelo NXA Lead Hunter. Objetivo: ${getLeadObjectiveLabel(leadObjective)}. Score: ${lead.ai_fit_score || lead.score}/100. Probabilidade: ${lead.ai_purchase_probability || "—"}%. Motivo: ${lead.ai_reason || getOpportunityReason(lead)}. Próxima ação: ${lead.ai_next_action || "Qualificar lead."}`,
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
    const text = buildLeadHunterApproachText(lead, leadObjective);
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
    const url = buildWhatsAppUrl(lead.phone, buildLeadHunterApproachText(lead, leadObjective));

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
                Pesquise qualquer nicho em qualquer cidade e receba uma lista priorizada de empresas com maior chance de virar cliente: contato, força digital, avaliações, Maps, redes, score comercial e mensagem semi-automática para WhatsApp.
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
          description="Nicho, região, objetivo e filtros comerciais ficam recolhíveis para deixar a tela leve depois da configuração."
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
                  <BrainCircuit className="h-4 w-4 text-primary" />
                  Lead Hunter avançado
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Escolha a intenção comercial da pesquisa. A IA ranqueia por sinais reais: contato, reputação, presença digital, fluxo local, chance de resposta e potencial comercial.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-muted/20 px-3 py-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={aiScoringEnabled}
                  onChange={(event) => setAiScoringEnabled(event.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                Score IA
              </label>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              {[
                { key: "all", title: "Melhores leads", desc: "equilíbrio entre contato, reputação e lacuna" },
                { key: "whatsapp", title: "Com WhatsApp", desc: "prioriza telefone para abordagem rápida" },
                { key: "no_site", title: "Sem site", desc: "ótimo para vender presença digital" },
                { key: "high_reviews", title: "Muitas avaliações", desc: "negócios com demanda e movimento" },
                { key: "social_gap", title: "Lacuna digital", desc: "sem redes fortes ou site claro" },
                { key: "premium", title: "Premium local", desc: "boa nota + volume de avaliações" },
                { key: "new_business", title: "Empresas novas", desc: "poucas avaliações e chance de vender estrutura" },
                { key: "high_flow", title: "Alto fluxo local", desc: "muitas avaliações e demanda aparente" },
                { key: "weak_instagram", title: "Instagram fraco", desc: "rede ausente ou pouco forte" },
                { key: "no_digital_presence", title: "Sem presença digital", desc: "sem site e sem redes encontradas" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setLeadObjective(item.key as LeadObjective)}
                  className={cn(
                    "rounded-2xl border p-3 text-left transition-all",
                    leadObjective === item.key
                      ? "border-primary bg-primary/15 shadow-lg shadow-primary/10"
                      : "border-border bg-background/50 hover:border-primary/40 hover:bg-muted/40"
                  )}
                >
                  <div className="text-sm font-black">{item.title}</div>
                  <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{item.desc}</div>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">Filtro de qualidade</div>
                <span className="rounded-full border border-primary/25 bg-background/60 px-2.5 py-1 text-[10px] font-black text-primary">mín. {minScore}/100</span>
              </div>
              <input
                type="range"
                min={30}
                max={90}
                value={minScore}
                onChange={(event) => setMinScore(Number(event.target.value))}
                className="w-full accent-primary"
              />
              <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                <span>Mais volume</span>
                <span>Mais qualidade</span>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-background/50 px-3 py-2 text-xs">
                <span>Mostrar só leads com telefone/WhatsApp</span>
                <input type="checkbox" checked={onlyWithContact} onChange={(event) => setOnlyWithContact(event.target.checked)} className="h-4 w-4 accent-primary" />
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-background/50 px-3 py-2 text-xs">
                <span>Mostrar só empresas sem site detectado</span>
                <input type="checkbox" checked={onlyWithoutWebsite} onChange={(event) => setOnlyWithoutWebsite(event.target.checked)} className="h-4 w-4 accent-primary" />
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-background/50 px-3 py-2 text-xs">
                <span>Salvar automaticamente os leads encontrados</span>
                <input type="checkbox" checked={autoSaveFoundLeads} onChange={(event) => setAutoSaveFoundLeads(event.target.checked)} className="h-4 w-4 accent-primary" />
              </label>
            </div>

            <div className="mt-4 rounded-2xl border border-primary/25 bg-primary/5 p-4">
              <label className="flex cursor-pointer items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
                    <Wand2 className="h-3.5 w-3.5" /> Compatibilidade com minha oferta
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Mantém o score comercial universal para qualquer nicho e adiciona uma segunda nota: o quanto esse lead combina com o produto/serviço que o usuário vende.
                  </p>
                </div>
                <input type="checkbox" checked={offerCompatibilityEnabled} onChange={(event) => setOfferCompatibilityEnabled(event.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
              </label>

              {offerCompatibilityEnabled && (
                <div className="mt-4 grid gap-2">
                  <input value={offer.name} onChange={(event) => updateOffer("name", event.target.value)} placeholder="O que você vende? Ex: Curso para dentistas, energia solar, software, móveis corporativos..." className="h-10 w-full rounded-xl border border-border bg-background/80 px-3 text-xs outline-none focus:border-primary" />
                  <textarea value={offer.description} onChange={(event) => updateOffer("description", event.target.value)} placeholder="Descreva rapidamente o produto, quem compra e qual dor resolve." rows={3} className="w-full resize-none rounded-xl border border-border bg-background/80 px-3 py-2 text-xs outline-none focus:border-primary" />
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("text-[10px] font-bold", hasMeaningfulOffer(offer) ? "text-emerald-300" : "text-orange-300")}>
                      {hasMeaningfulOffer(offer) ? "Fit de oferta ativo" : "Preencha uma oferta real para ativar o fit"}
                    </span>
                    <Button type="button" size="sm" variant="secondary" className="h-8 rounded-xl text-xs" onClick={analyzeAndFillOffer} disabled={analyzingOffer}>
                      {analyzingOffer ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1 h-3.5 w-3.5" />}
                      Melhorar oferta
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-border/70 bg-background/45 p-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5 text-primary" />
                Estratégia atual
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                A busca vai procurar <strong className="text-foreground">{getLeadObjectiveLabel(leadObjective)}</strong> em {city}/{state}, enriquecer redes sociais quando possível, limitar a exibição para não travar a tela e gerar mensagem individual para WhatsApp.
              </p>
            </div>
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
                Não é uma lista comum: é uma fila de abordagem com score, contato, lacuna digital, reputação e próxima ação.
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
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-2">
              {visibleResults.map((lead, index) => (
                <div key={lead.id} className="relative">
                  {index < 3 && <div className="absolute -top-2 left-4 z-10 rounded-full border border-orange-400/40 bg-orange-500/15 px-2 py-0.5 text-[10px] font-black text-orange-300">TOP {index + 1}</div>}
                  <LeadCard lead={lead} saved={savedLeadIds.includes(lead.id)} inCrm={crmLeadIds.includes(lead.id)} approachGenerated={approachLeadIds.includes(lead.id)} contacted={contactedLeadIds.includes(lead.id)} discarded={discardedLeadIds.includes(lead.id)} inCampaign={campaignLeadIds.includes(lead.id)} hasFollowup={followupLeadIds.includes(lead.id)} onSave={handleSaveLead} onSendToCrm={handleSendToCrm} onGenerateApproach={handleGenerateApproach} onMarkContacted={markContacted} onDiscard={markDiscarded} onAddToCampaign={addToCampaign} onCreateFollowup={createFollowup} onOpenWebsite={handleOpenWebsite} onOpenMaps={handleOpenMaps} onOpenWhatsApp={handleOpenWhatsApp} />
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

function getPotentialLabel(lead: Lead) {
  const score = Number(lead.ai_fit_score || lead.score || 0);
  const reviews = Number(lead.google_reviews_count || 0);
  const rating = Number(lead.google_rating || 0);
  const hasPhone = Boolean(lead.phone);

  if (score >= 88 && reviews >= 120 && hasPhone) return "Premium";
  if (score >= 76 && (reviews >= 50 || rating >= 4.5)) return "Alto";
  if (score >= 58) return "Médio";
  return "Baixo";
}

function getPrimaryOpportunityBullets(lead: Lead) {
  const signals = lead.commercial_signals || lead.ai_pain_detected || [];
  const bullets: string[] = [];

  if ((lead.google_reviews_count || 0) >= 80) bullets.push("Alto volume de avaliações");
  if (lead.phone) bullets.push("WhatsApp/telefone disponível");
  if (!lead.website) bullets.push("Presença digital abaixo do potencial");
  if (hasAnySocial(lead) && (lead.instagram_followers || 0) < 1500) bullets.push("Rede social com espaço para crescer");
  if ((lead.google_rating || 0) >= 4.5) bullets.push("Boa reputação local");

  for (const signal of signals) {
    if (bullets.length >= 4) break;
    const clean = String(signal || "").trim();
    if (clean && !bullets.some((item) => normalizeText(item) === normalizeText(clean))) {
      bullets.push(capitalizeWords(clean));
    }
  }

  return bullets.slice(0, 4).length
    ? bullets.slice(0, 4)
    : ["Dados públicos suficientes para qualificação", "Validar responsável antes da proposta"];
}

function getRecommendedActionBullets(lead: Lead) {
  const bullets: string[] = [];

  if (lead.phone) bullets.push("Chamar no WhatsApp");
  else if (lead.website) bullets.push("Abrir site e capturar contato");
  else bullets.push("Validar contato no Maps");

  if ((lead.google_reviews_count || 0) >= 80) bullets.push("Citar volume de avaliações");
  if (!lead.website || !hasAnySocial(lead)) bullets.push("Falar sobre presença digital");
  bullets.push("Validar responsável comercial");
  bullets.push("Não começar pelo preço");

  return bullets.slice(0, 4);
}

function getScoreBreakdown(lead: Lead) {
  const rating = Number(lead.google_rating || 0);
  const reviews = Number(lead.google_reviews_count || 0);
  const hasPhone = Boolean(lead.phone);
  const hasWebsite = Boolean(lead.website);
  const hasSocial = hasAnySocial(lead);
  const score = Number(lead.ai_fit_score || lead.score || 0);

  const rows = [
    { label: "WhatsApp/telefone encontrado", points: hasPhone ? 20 : 0, active: hasPhone },
    { label: reviews >= 80 ? "Muitas avaliações no Google" : "Avaliações moderadas", points: reviews >= 250 ? 20 : reviews >= 80 ? 18 : reviews >= 40 ? 12 : reviews >= 10 ? 8 : 0, active: reviews >= 10 },
    { label: "Nota 4.5+", points: rating >= 4.5 ? 14 : rating >= 4.0 ? 8 : 0, active: rating >= 4.0 },
    { label: hasWebsite ? "Site ativo" : "Lacuna: sem site claro", points: hasWebsite ? 8 : 14, active: true },
    { label: hasSocial ? "Redes encontradas" : "Lacuna em redes sociais", points: hasSocial ? 8 : 12, active: true },
    { label: "Score comercial consolidado", points: Math.max(0, Math.round(score / 5)), active: score >= 55 },
  ];

  return rows.filter((row) => row.points > 0).slice(0, 6);
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const safeValue = clamp(Number(value || 0), 0, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
        <span>{label}</span>
        <span className="text-foreground">{safeValue}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full border border-border bg-muted/30">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

function LeadCard({
  lead,
  saved,
  inCrm,
  approachGenerated,
  contacted,
  discarded,
  inCampaign,
  hasFollowup,
  onSave,
  onSendToCrm,
  onGenerateApproach,
  onMarkContacted,
  onDiscard,
  onAddToCampaign,
  onCreateFollowup,
  onOpenWebsite,
  onOpenMaps,
  onOpenWhatsApp,
}: {
  lead: Lead;
  saved: boolean;
  inCrm: boolean;
  approachGenerated: boolean;
  contacted: boolean;
  discarded: boolean;
  inCampaign: boolean;
  hasFollowup: boolean;
  onSave: (lead: Lead) => void;
  onSendToCrm: (lead: Lead) => void;
  onGenerateApproach: (lead: Lead) => void;
  onMarkContacted: (lead: Lead) => void;
  onDiscard: (lead: Lead) => void;
  onAddToCampaign: (lead: Lead) => void;
  onCreateFollowup: (lead: Lead) => void;
  onOpenWebsite: (lead: Lead) => void;
  onOpenMaps: (lead: Lead) => void;
  onOpenWhatsApp: (lead: Lead) => void;
}) {
  const score = Number(lead.ai_fit_score || lead.score || 0);
  const scoreColor = getScoreColor(score);
  const hasWebsite = Boolean(lead.website);
  const hasPhone = Boolean(lead.phone);
  const contactQuality = Number(lead.contact_quality || (hasPhone ? 78 : 18));
  const digitalStrength = Number(lead.digital_strength || (hasWebsite ? 62 : 28));
  const responseChance = Number(lead.response_chance || lead.ai_purchase_probability || score || 0);
  const commercialScore = Number(lead.commercial_score || score);
  const offerScore = Number(lead.offer_compatibility_score || 0);
  const financialPotential = Number(lead.financial_potential || 0);
  const structureScore = Number(lead.structure_score || 0);
  const potential = getPotentialLabel(lead);
  const opportunityBullets = getPrimaryOpportunityBullets(lead);
  const actionBullets = getRecommendedActionBullets(lead);
  const breakdown = getScoreBreakdown(lead);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group overflow-hidden rounded-2xl border bg-background/70 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
      style={{ borderColor: `${scoreColor}3D` }}
    >
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${scoreColor}, transparent 75%)` }} />

      <div className="p-4 lg:p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-black tracking-tight text-foreground">{lead.name || "Empresa sem nome"}</h3>
              {contacted && <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9px] font-black text-emerald-300">contatado</span>}
            </div>
            <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">{lead.segment || "Segmento não informado"}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />{lead.google_rating ? lead.google_rating.toFixed(1) : "—"} ({lead.google_reviews_count || 0})</span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{lead.city}/{lead.state}</span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="inline-flex items-center gap-1.5 rounded-2xl border bg-card/70 px-3 py-2" style={{ borderColor: `${scoreColor}55`, color: scoreColor }}>
              {getScoreIcon(score)}
              <span className="text-2xl font-black leading-none">{score}</span>
              <span className="text-[10px] font-black">/100</span>
            </div>
            <div className="mt-1 text-[9px] font-black uppercase tracking-wider" style={{ color: scoreColor }}>{lead.ai_priority_label || getScoreLabel(score)}</div>
          </div>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
                <Target className="h-3.5 w-3.5" /> Oportunidade
              </div>
              <span className="rounded-full border border-primary/25 bg-background/70 px-2.5 py-1 text-[10px] font-black text-primary">{potential}</span>
            </div>
            <ul className="space-y-2 text-[12px] leading-relaxed text-muted-foreground">
              {opportunityBullets.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card/45 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5 text-primary" /> Diagnóstico visual
            </div>
            <div className="space-y-3">
              <MetricBar label="Comercial" value={commercialScore} />
              {offerScore > 0 ? <MetricBar label="Fit da oferta" value={offerScore} /> : null}
              <MetricBar label="Contato" value={contactQuality} />
              <MetricBar label="Digital" value={digitalStrength} />
              <MetricBar label="Resposta" value={responseChance} />
              {structureScore > 0 ? <MetricBar label="Estrutura" value={structureScore} /> : null}
              {financialPotential > 0 ? <MetricBar label="Financeiro" value={financialPotential} /> : null}
            </div>
          </div>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
              <Lightbulb className="h-3.5 w-3.5" /> Ação recomendada
            </div>
            <ul className="space-y-2 text-[12px] leading-relaxed text-muted-foreground">
              {actionBullets.map((item, index) => (
                <li key={item} className="flex items-start gap-2">
                  {index === actionBullets.length - 1 && item.includes("Não") ? <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-300" /> : <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />}
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-background/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Por que vale abordar?
            </div>
            <div className="space-y-1.5">
              {breakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/45 px-3 py-2 text-[11px]">
                  <span className="truncate text-muted-foreground">{item.label}</span>
                  <span className="shrink-0 font-black text-emerald-300">+{item.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {(lead.decision_reason || lead.offer_fit_summary) && (
          <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
              <BrainCircuit className="h-3.5 w-3.5" /> Decisão da IA
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{lead.decision_reason}</p>
            {lead.offer_fit_summary ? <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Fit da oferta: {lead.offer_fit_summary}</p> : null}
          </div>
        )}

        <div className="space-y-1.5 rounded-2xl border border-border bg-card/35 p-3">
          <Info icon={MapPin}>{lead.address || "Endereço não informado"}</Info>
          <Info icon={Phone}>{hasPhone ? lead.phone : "Telefone não informado"}</Info>
          <Info icon={Globe}>{hasWebsite ? lead.website : "Sem website detectado"}</Info>
          {lead.working_hours ? <Info icon={RefreshCw}>{lead.working_hours}</Info> : null}
        </div>

        <div className="mt-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">Social Intelligence</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-black", hasAnySocial(lead) ? "bg-emerald-400/10 text-emerald-300" : "bg-orange-400/10 text-orange-300")}>
              {hasAnySocial(lead) ? "redes encontradas" : lead.web_enrichment_status === "failed" ? "configurar função" : "sem redes"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {lead.instagram_url || lead.social_links?.instagram ? <SocialChip label={lead.instagram_username ? `@${lead.instagram_username}` : "Instagram"} url={lead.instagram_url || lead.social_links?.instagram} /> : null}
            {lead.facebook_url || lead.social_links?.facebook ? <SocialChip label="Facebook" url={lead.facebook_url || lead.social_links?.facebook} /> : null}
            {lead.linkedin_url || lead.social_links?.linkedin ? <SocialChip label="LinkedIn" url={lead.linkedin_url || lead.social_links?.linkedin} /> : null}
            {lead.tiktok_url || lead.social_links?.tiktok ? <SocialChip label="TikTok" url={lead.tiktok_url || lead.social_links?.tiktok} /> : null}
            {lead.youtube_url || lead.social_links?.youtube ? <SocialChip label="YouTube" url={lead.youtube_url || lead.social_links?.youtube} /> : null}
            {!hasAnySocial(lead) ? <span className="text-[11px] text-muted-foreground">{lead.web_enrichment_summary || "A busca web ainda não retornou redes confiáveis."}</span> : null}
          </div>
          {lead.instagram_followers ? <p className="mt-2 text-[11px] text-muted-foreground">Instagram: {new Intl.NumberFormat("pt-BR").format(lead.instagram_followers)} seguidores{lead.instagram_bio ? ` · ${lead.instagram_bio}` : ""}</p> : null}
        </div>

        <div className="mt-4 grid gap-2 border-t border-border pt-4 sm:grid-cols-3">
          <Button
            size="sm"
            className="h-10 gap-1.5 rounded-xl font-black shadow-lg shadow-primary/15 sm:col-span-3"
            disabled={!hasPhone}
            onClick={() => onOpenWhatsApp(lead)}
          >
            <Phone className="h-3.5 w-3.5" />
            Prospectar agora
          </Button>

          <Button variant={approachGenerated ? "secondary" : "outline"} size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => onGenerateApproach(lead)}>
            {approachGenerated ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <BrainCircuit className="h-3.5 w-3.5" />}
            {approachGenerated ? "Copiada" : "Mensagem"}
          </Button>
          <Button variant={saved ? "secondary" : "outline"} size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => onSave(lead)}>
            {saved ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <BookmarkPlus className="h-3.5 w-3.5" />}
            {saved ? "Salvo" : "Salvar"}
          </Button>
          <Button variant={inCrm ? "secondary" : "outline"} size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => onSendToCrm(lead)}>
            {inCrm ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Send className="h-3.5 w-3.5" />}
            {inCrm ? "No CRM" : "CRM"}
          </Button>
          <Button variant={hasFollowup ? "secondary" : "outline"} size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => onCreateFollowup(lead)}>
            {hasFollowup ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Follow-up
          </Button>
          <Button variant={inCampaign ? "secondary" : "outline"} size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => onAddToCampaign(lead)}>
            {inCampaign ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <MessageSquareText className="h-3.5 w-3.5" />}
            Campanha
          </Button>
          <Button variant={contacted ? "secondary" : "outline"} size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => onMarkContacted(lead)}>
            {contacted ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Phone className="h-3.5 w-3.5" />}
            Contatado
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" disabled={!hasWebsite} onClick={() => onOpenWebsite(lead)}>
            <ExternalLink className="h-3.5 w-3.5" /> Site
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => onOpenMaps(lead)}>
            <ArrowUpRight className="h-3.5 w-3.5" /> Maps
          </Button>
          <Button variant={discarded ? "secondary" : "ghost"} size="sm" className="h-8 gap-1.5 text-xs" onClick={() => onDiscard(lead)}>
            {discarded ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <X className="h-3.5 w-3.5" />}
            {discarded ? "Descartado" : "Descartar"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function InsightRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background/50 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        {value}
      </p>
    </div>
  );
}

function LeadDecisionMetric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-2.5">
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-black text-foreground">{value}</div>
    </div>
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

function SocialChip({ label, url }: { label: string; url?: string }) {
  const href = normalizeExternalUrl(url);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 rounded-full border border-cyan-400/25 bg-background/60 px-2.5 py-1 text-[11px] font-black text-cyan-200 transition-colors hover:border-cyan-300 hover:bg-cyan-400/10"
    >
      {label}
      <ExternalLink className="h-3 w-3" />
    </a>
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