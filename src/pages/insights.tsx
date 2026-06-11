import * as React from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  Brain,
  TrendingUp,
  MapPin,
  Globe,
  Zap,
  AlertTriangle,
  Star,
  Target,
  BarChart3,
  RefreshCw,
  Database,
  Flame,
  Thermometer,
  Snowflake,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useToast } from "@/hooks/use-toast";

function toArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.leads)) return value.leads;
  return [];
}

function scoreOf(lead: any) {
  return Number(lead.nxaScore ?? lead.nxa_score ?? lead.score ?? 0);
}

function ratingOf(lead: any) {
  return Number(lead.rating ?? lead.google_rating ?? 0);
}

function getScoreColor(score: number) {
  if (score >= 81) return "#f87171";
  if (score >= 61) return "#fb923c";
  if (score >= 41) return "#facc15";
  return "#60a5fa";
}

function getScoreIcon(score: number) {
  if (score >= 61) return <Flame className="h-3.5 w-3.5" />;
  if (score >= 41) return <Thermometer className="h-3.5 w-3.5" />;
  return <Snowflake className="h-3.5 w-3.5" />;
}

function normalizeLead(lead: any) {
  return {
    ...lead,
    id: lead.id || crypto.randomUUID(),
    name: lead.name || lead.title || lead.company || "Lead sem nome",
    phone: lead.phone || lead.whatsapp || lead.telefone || "",
    city: lead.city || lead.cidade || "",
    state: lead.state || lead.uf || "",
    segment:
      lead.segment ||
      lead.category ||
      lead.niche ||
      lead.categoria ||
      "Outros",
    website: lead.website || lead.site || "",
    rating: ratingOf(lead),
    nxaScore: scoreOf(lead),
    status: lead.status || "new",
  };
}

function InsightCard({ icon, title, color, children }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: "hsl(240 10% 5%)",
        border: "1px solid hsl(240 10% 11%)",
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: "1px solid hsl(240 10% 9%)" }}
      >
        <span style={{ color }}>{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
          {title}
        </span>
        <div className="ml-auto h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: color }} />
      </div>
      <div className="p-4">{children}</div>
    </motion.div>
  );
}

export function Insights() {
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [source, setSource] = React.useState("Carregando...");
  const [leads, setLeads] = React.useState<any[]>([]);
  const [searchHistory, setSearchHistory] = React.useState<any[]>([]);
  const [crmCards, setCrmCards] = React.useState<any[]>([]);

  async function loadEverything() {
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setLeads([]);
        setSearchHistory([]);
        setCrmCards([]);
        setSource("Usuário não autenticado");
        return;
      }

      const [dbLeads, dbSearchHistory, dbCrmCards] = await Promise.all([
        supabase
          .from("leads")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5000),

        supabase
          .from("search_history")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1000),

        supabase
          .from("crm_cards")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1000),
      ]);

      if (dbLeads.error) throw dbLeads.error;
      if (dbSearchHistory.error) throw dbSearchHistory.error;
      if (dbCrmCards.error) throw dbCrmCards.error;

      setLeads(toArray(dbLeads.data).map(normalizeLead));
      setSearchHistory(toArray(dbSearchHistory.data));
      setCrmCards(toArray(dbCrmCards.data));
      setSource("Supabase · dados do usuário logado");
    } catch (error: any) {
      toast({
        title: "Erro ao carregar IA Insights",
        description: error?.message || "Não foi possível buscar os dados.",
        variant: "destructive",
      });

      setLeads([]);
      setSearchHistory([]);
      setCrmCards([]);
      setSource("Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadEverything();
  }, []);

  const totalLeads = leads.length;

  const avgScore = totalLeads
    ? Math.round(leads.reduce((sum, lead) => sum + scoreOf(lead), 0) / totalLeads)
    : 0;

  const hotLeads = leads.filter((lead) => scoreOf(lead) >= 61);
  const veryHotLeads = leads.filter((lead) => scoreOf(lead) >= 81);
  const noWebsite = leads.filter((lead) => !lead.website);
  const lowRating = leads.filter((lead) => ratingOf(lead) > 0 && ratingOf(lead) < 4);
  const withPhone = leads.filter((lead) => lead.phone);

  const segmentData = React.useMemo(() => {
    const map: Record<string, { count: number; score: number }> = {};

    leads.forEach((lead) => {
      const key = lead.segment || "Outros";
      if (!map[key]) map[key] = { count: 0, score: 0 };
      map[key].count += 1;
      map[key].score += scoreOf(lead);
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgScore: Math.round(data.score / data.count),
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 8);
  }, [leads]);

  const cityData = React.useMemo(() => {
    const map: Record<string, { count: number; score: number }> = {};

    leads.forEach((lead) => {
      const key = lead.city || "Sem cidade";
      if (!map[key]) map[key] = { count: 0, score: 0 };
      map[key].count += 1;
      map[key].score += scoreOf(lead);
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgScore: Math.round(data.score / data.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [leads]);

  const topSegment = segmentData[0];
  const topCity = cityData[0];

  const recommendations = [
    topSegment && {
      icon: <Target className="h-4 w-4" />,
      color: "#00ffff",
      title: `Nicho mais forte: ${topSegment.name}`,
      desc: `Esse segmento tem score médio de ${topSegment.avgScore}/100. Priorize campanhas e prospecções nele.`,
    },
    topCity && {
      icon: <MapPin className="h-4 w-4" />,
      color: "#34d399",
      title: `Cidade com maior volume: ${topCity.name}`,
      desc: `${topCity.count} leads encontrados. Boa região para abordagem local e campanha segmentada.`,
    },
    noWebsite.length > 0 && {
      icon: <Globe className="h-4 w-4" />,
      color: "#a78bfa",
      title: `${noWebsite.length} empresas sem site`,
      desc: "Oportunidade para vender site, landing page, presença digital e automação de atendimento.",
    },
    veryHotLeads.length > 0 && {
      icon: <Zap className="h-4 w-4" />,
      color: "#f87171",
      title: `${veryHotLeads.length} leads muito quentes`,
      desc: `Comece por ${veryHotLeads[0]?.name}. Esses leads devem entrar primeiro no CRM/follow-up.`,
    },
    lowRating.length > 0 && {
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "#facc15",
      title: `${lowRating.length} empresas com avaliação baixa`,
      desc: "Boa oportunidade para vender reputação, automação de avaliações e melhoria no atendimento.",
    },
  ].filter(Boolean) as any[];

  const aiSummary =
    totalLeads === 0
      ? "Este usuário ainda não possui dados suficientes. Faça uma busca e salve leads para a IA analisar."
      : `A IA analisou ${totalLeads} leads, ${searchHistory.length} buscas e ${crmCards.length} cards de CRM deste usuário. O melhor foco agora é ${topSegment?.name || "o segmento com maior score"}, principalmente em ${topCity?.name || "cidades com maior volume"}, priorizando leads com score acima de 61.`;

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-start justify-between gap-4 flex-col lg:flex-row">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            IA Insights
          </h1>

          <p className="text-xs text-muted-foreground mt-1">
            Análise inteligente usando apenas dados do usuário logado.
          </p>
        </div>

        <button
          onClick={loadEverything}
          className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
          style={{
            background: "rgba(0,255,255,0.08)",
            border: "1px solid rgba(0,255,255,0.25)",
            color: "#00ffff",
          }}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar análise
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Database className="h-4 w-4" />
        Fonte: {source}
        {loading && <span> • analisando...</span>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Leads analisados", value: totalLeads, color: "#00ffff" },
          { label: "Score médio", value: `${avgScore}/100`, color: getScoreColor(avgScore) },
          { label: "Leads quentes", value: hotLeads.length, color: "#fb923c" },
          { label: "Com telefone", value: withPhone.length, color: "#34d399" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl p-4"
            style={{
              background: `${item.color}08`,
              border: `1px solid ${item.color}25`,
            }}
          >
            <p className="text-2xl font-black" style={{ color: item.color }}>
              {item.value}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <InsightCard icon={<Brain className="h-4 w-4" />} title="Diagnóstico da IA" color="#a78bfa">
        <p className="text-sm leading-relaxed text-muted-foreground">{aiSummary}</p>
      </InsightCard>

      <div className="grid lg:grid-cols-2 gap-4">
        <InsightCard icon={<BarChart3 className="h-4 w-4" />} title="Segmentos mais promissores" color="#00ffff">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="avgScore" fill="#00ffff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </InsightCard>

        <InsightCard icon={<MapPin className="h-4 w-4" />} title="Cidades com maior volume" color="#34d399">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#34d399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </InsightCard>
      </div>

      <InsightCard icon={<TrendingUp className="h-4 w-4" />} title="Recomendações automáticas" color="#fb923c">
        <div className="space-y-3">
          {recommendations.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Ainda não há recomendações. Importe leads para este usuário primeiro.
            </p>
          )}

          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="p-3 rounded-lg flex gap-3"
              style={{
                background: `${rec.color}08`,
                border: `1px solid ${rec.color}20`,
              }}
            >
              <div style={{ color: rec.color }}>{rec.icon}</div>
              <div>
                <p className="text-sm font-bold" style={{ color: rec.color }}>
                  {rec.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{rec.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </InsightCard>

      <InsightCard icon={<Star className="h-4 w-4" />} title="Top leads para atacar agora" color="#f87171">
        <div className="space-y-2">
          {leads
            .slice()
            .sort((a, b) => scoreOf(b) - scoreOf(a))
            .slice(0, 8)
            .map((lead) => {
              const score = scoreOf(lead);

              return (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div>
                    <p className="text-sm font-bold">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.segment} • {lead.city || "Sem cidade"} • {lead.phone || "Sem telefone"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-sm font-black" style={{ color: getScoreColor(score) }}>
                    {getScoreIcon(score)}
                    {score}
                  </div>
                </div>
              );
            })}

          {leads.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum lead encontrado para este usuário.
            </p>
          )}
        </div>
      </InsightCard>
    </motion.div>
  );
}

export default Insights;