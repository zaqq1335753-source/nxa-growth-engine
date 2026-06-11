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

type Lead = {
  id: string;
  name: string;
  segment: string;
  city: string;
  state: string;
  address: string;
  phone?: string;
  website?: string;
  google_rating?: number;
  google_reviews_count?: number;
  score: number;
  status: string;
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
    const localHistory = safeReadArrayStorage("nxa_search_history");

    setLoadingHistory(true);

    try {
      const { data, error } = await supabase
        .from("search_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setSearches(data?.length ? data : localHistory);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      setSearches(localHistory);
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
    const localRecord = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now()),
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
      const { data: authData } = await supabase.auth.getUser();

      const payload = {
        user_id: authData?.user?.id || null,
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
    };

    try {
      const leads = await searchLeads(body);
      const creditsUsed = leads.length * CREDIT_COST_PER_LEAD;

      await consumeCredits(creditsUsed, {
        city,
        state,
        niche: built.label,
        queries: built.queries,
        quantity,
        results_count: leads.length,
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

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Discovery Engine
          </div>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Busca inteligente multi-nicho
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Expansão semântica de termos, cobertura por categoria e deduplicação
            automática.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">Estimado:</span>
          <span className="font-semibold">~{estimated} leads</span>
          <span className="text-muted-foreground">·</span>
          <span className="font-semibold">{totalQueries || 1} consulta(s)</span>
          <span className="text-muted-foreground">·</span>
          <Coins className="h-3 w-3 text-primary" />
          <span className="font-semibold tabular-nums">{cost} cr</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">Saldo:</span>
          <span className="font-semibold tabular-nums">
            {creditsLoading ? "..." : `${credits} cr`}
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-border bg-card/60 p-6 shadow-sm"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl border border-border bg-muted/30 p-1">
            <button
              onClick={() => setMode("catalogo")}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                mode === "catalogo"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Target className="h-3.5 w-3.5" />
              Catálogo de nichos
            </button>

            <button
              onClick={() => setMode("custom")}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                mode === "custom"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Zap className="h-3.5 w-3.5" />
              Termos personalizados
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={precisionMode}
                onChange={(event) => setPrecisionMode(event.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <span className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Modo precisão
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={onlyOpportunity}
                onChange={(event) => setOnlyOpportunity(event.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <span className="flex items-center gap-1">
                <Globe2 className="h-3 w-3" />
                Só sem website
              </span>
            </label>
          </div>
        </div>

        {mode === "catalogo" ? (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {NICHE_CATALOG.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setCategoryKey(item.key);
                    setNicheKey(item.niches[0].key);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                    categoryKey === item.key
                      ? "border-primary/60 bg-primary/10 text-foreground"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  <span className="mr-1">{item.emoji}</span>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {category.niches.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setNicheKey(item.key)}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-all",
                    nicheKey === item.key
                      ? "border-primary/70 bg-primary/10"
                      : "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
                  )}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Termos de busca · selecione para combinar
                </label>

                <span className="text-xs text-muted-foreground">
                  {selectedKeywords.length} selecionado(s)
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {niche.keywords.map((keyword) => {
                  const active = selectedKeywords.includes(keyword);

                  return (
                    <button
                      key={keyword}
                      onClick={() => toggleKeyword(keyword)}
                      className={cn(
                        "rounded-md border px-2.5 py-1.5 text-xs transition-all",
                        active
                          ? "border-primary/60 bg-primary/15 text-foreground"
                          : "border-border bg-muted/20 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {active && <span className="mr-1 text-primary">✓</span>}
                      {keyword}
                    </button>
                  );
                })}
              </div>

              {niche.includedTypes.length > 0 && precisionMode && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Filter className="h-3 w-3" />
                  Filtro ativo:
                  <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                    {niche.includedTypes.join(", ")}
                  </code>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Termos personalizados
              </label>

              <div className="mt-2 flex gap-2">
                <input
                  value={customInput}
                  onChange={(event) => setCustomInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCustom();
                    }
                  }}
                  placeholder="ex: estúdio de tatuagem premium"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />

                <Button variant="secondary" onClick={addCustom}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Adicione múltiplas variações. Cada termo executa uma consulta
                independente.
              </p>
            </div>

            <AnimatePresence>
              {customQueries.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-2"
                >
                  {customQueries.map((query) => (
                    <span
                      key={query}
                      className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs"
                    >
                      {query}

                      <button
                        onClick={() => removeCustom(query)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-6 md:grid-cols-5">
          <Field label="Cidade">
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Belo Horizonte"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </Field>

          <Field label="Estado">
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="UF" />
              </SelectTrigger>

              <SelectContent>
                {STATES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Raio (km)">
            <input
              type="number"
              min={1}
              max={100}
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value || 1))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </Field>

          <Field label="Qtd. máxima">
            <input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value || 1))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </Field>

          <div className="flex items-end">
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={start}
              disabled={running}
            >
              {running ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Radar className="h-4 w-4" />
              )}
              Iniciar
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Search className="h-4 w-4" />
            Resultados da busca
          </div>

          <span className="text-xs text-muted-foreground">
            {results.length} lead(s)
          </span>
        </div>

        {running ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-xl border border-border bg-muted/30"
              />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-muted-foreground">
            <Search className="mb-3 h-10 w-10 opacity-30" />
            Nenhuma busca executada ainda.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {results.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Search className="h-4 w-4" />
          Histórico de buscas
        </div>

        {loadingHistory ? (
          <div className="text-sm text-muted-foreground">
            Carregando histórico...
          </div>
        ) : searches.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Nenhuma busca ainda.
          </div>
        ) : (
          <div className="space-y-2">
            {searches.map((search) => (
              <button
                key={search.id}
                onClick={() => {
                  const leads = Array.isArray(search.results)
                    ? search.results
                    : Array.isArray(search.leads)
                      ? search.leads
                      : [];

                  if (leads.length) {
                    setResults(leads);
                    saveLastSearchForRadar({
                      ...search,
                      results: leads,
                      leads,
                    });
                  }
                }}
                className="w-full text-left flex items-center justify-between rounded-md border border-border bg-muted/20 p-3 hover:bg-muted/40 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium">
                    {search.niche || search.query || "Busca"}
                    <span className="text-muted-foreground">
                      {" "}
                      · {search.city || "—"} / {search.state || "—"}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {search.created_at
                      ? new Date(search.created_at).toLocaleString("pt-BR")
                      : "Data não informada"}{" "}
                    · {search.results_count || 0} resultados ·{" "}
                    {search.credits_used || 0} créditos
                  </div>
                </div>

                <StatusPill status={search.status || "completed"} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
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

function LeadCard({ lead }: { lead: Lead }) {
  const scoreColor = getScoreColor(lead.score || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border bg-background/60 transition-all hover:-translate-y-0.5 hover:border-primary/40"
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

        <div className="space-y-1.5">
          <Info icon={MapPin}>{lead.address || "Endereço não informado"}</Info>

          {lead.phone && <Info icon={Phone}>{lead.phone}</Info>}

          {lead.website ? (
            <Info icon={Globe}>{lead.website}</Info>
          ) : (
            <Info icon={Globe}>Sem website detectado</Info>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
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