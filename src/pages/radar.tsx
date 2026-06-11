import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import {
  Activity,
  ChevronRight,
  Crosshair,
  Filter,
  Flame,
  Globe,
  MapPin,
  Phone,
  Radar as RadarIcon,
  RefreshCw,
  Satellite,
  Search,
  Signal,
  Sparkles,
  Star,
  Target,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function toArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.leads)) return value.leads;
  return [];
}

function getScore(lead: any) {
  const score = Number(lead?.nxaScore ?? lead?.nxa_score ?? lead?.score ?? 0);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getLeadId(lead: any, index: number) {
  return String(lead?.id ?? lead?.place_id ?? lead?.phone ?? `lead-${index}`);
}

function getNxaColor(score: number) {
  if (score >= 81) return "#fb7185";
  if (score >= 61) return "#fb923c";
  if (score >= 41) return "#facc15";
  return "#60a5fa";
}

function getNxaLabel(score: number) {
  if (score >= 81) return "Prioridade máxima";
  if (score >= 61) return "Alta intenção";
  if (score >= 41) return "Potencial médio";
  return "Baixa prioridade";
}

function getSegment(lead: any) {
  return lead?.segment || lead?.category || lead?.niche || "Sem segmento";
}

function getCity(lead: any) {
  return lead?.city || lead?.address || "Localização não informada";
}

interface DotData {
  lead: any;
  x: number;
  y: number;
  angle: number;
  radius: number;
}

function useDots(leads: any[], W: number, H: number): DotData[] {
  return React.useMemo(() => {
    const safeLeads = toArray(leads);
    if (!safeLeads.length) return [];

    const centerX = W / 2;
    const centerY = H / 2;

    return safeLeads.map((lead, index) => {
      const score = getScore(lead);
      const angle = (index * 137.5 + score * 2.1) % 360;
      const radius = 42 + (100 - score) * 1.65 + (index % 7) * 9;
      const rad = (angle * Math.PI) / 180;

      return {
        lead,
        angle,
        radius,
        x: centerX + Math.cos(rad) * radius,
        y: centerY + Math.sin(rad) * radius,
      };
    });
  }, [leads, W, H]);
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>
      <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
    </div>
  );
}

export function Radar() {
  const [allLeads, setAllLeads] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<any>(null);
  const [filterScore, setFilterScore] = React.useState("all");
  const [filterNicho, setFilterNicho] = React.useState("all");
  const [pulse, setPulse] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;

    async function loadUserLeads() {
      setIsLoading(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          if (mounted) setAllLeads([]);
          return;
        }

        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (mounted) setAllLeads(toArray(data));
      } catch (error) {
        console.error("[Radar] Erro ao carregar leads do usuário:", error);
        if (mounted) setAllLeads([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadUserLeads();

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setPulse((value) => value + 1);
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  const allLeadsArray = React.useMemo(() => toArray(allLeads), [allLeads]);

  const leads = React.useMemo(() => {
    let result = allLeadsArray;

    if (filterScore !== "all") {
      if (filterScore === "vhot") result = result.filter((l) => getScore(l) >= 81);
      if (filterScore === "hot")
        result = result.filter((l) => getScore(l) >= 61 && getScore(l) < 81);
      if (filterScore === "warm")
        result = result.filter((l) => getScore(l) >= 41 && getScore(l) < 61);
      if (filterScore === "cold") result = result.filter((l) => getScore(l) < 41);
    }

    if (filterNicho !== "all") {
      result = result.filter((l) => getSegment(l) === filterNicho);
    }

    return result;
  }, [allLeadsArray, filterScore, filterNicho]);

  const segments = React.useMemo(() => {
    const set = new Set(allLeadsArray.map(getSegment).filter(Boolean));
    return Array.from(set);
  }, [allLeadsArray]);

  const dots = useDots(leads, 720, 520);

  const veryHot = allLeadsArray.filter((l) => getScore(l) >= 81).length;
  const hot = allLeadsArray.filter((l) => getScore(l) >= 61 && getScore(l) < 81).length;
  const warm = allLeadsArray.filter((l) => getScore(l) >= 41 && getScore(l) < 61).length;
  const cold = allLeadsArray.filter((l) => getScore(l) < 41).length;
  const average = allLeadsArray.length
    ? Math.round(allLeadsArray.reduce((acc, l) => acc + getScore(l), 0) / allLeadsArray.length)
    : 0;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Satellite className="h-3.5 w-3.5" />
            Radar comercial em tempo real
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Radar de oportunidades
          </h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Visualize seus leads por temperatura, intenção comercial e prioridade.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={filterScore} onValueChange={setFilterScore}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Temperatura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas temperaturas</SelectItem>
              <SelectItem value="vhot">Prioridade máxima</SelectItem>
              <SelectItem value="hot">Alta intenção</SelectItem>
              <SelectItem value="warm">Potencial médio</SelectItem>
              <SelectItem value="cold">Baixa prioridade</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterNicho} onValueChange={setFilterNicho}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Segmento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos segmentos</SelectItem>
              {segments.map((segment) => (
                <SelectItem key={segment} value={segment}>
                  {segment}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Link href="/busca">
            <Button>
              <Search className="mr-2 h-4 w-4" />
              Nova busca
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MiniStat icon={<Target className="h-5 w-5" />} label="Leads" value={allLeadsArray.length} />
        <MiniStat icon={<Flame className="h-5 w-5 text-rose-400" />} label="Quentes" value={veryHot + hot} />
        <MiniStat icon={<Signal className="h-5 w-5 text-yellow-400" />} label="Média NXA" value={average} />
        <MiniStat icon={<Globe className="h-5 w-5 text-blue-400" />} label="Segmentos" value={segments.length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-4 md:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.10),transparent_55%)]" />

          <div className="relative z-10 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                <RadarIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-black">Mapa de intensidade</h2>
                <p className="text-xs text-muted-foreground">
                  Cada ponto representa um lead do usuário logado.
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Online
            </div>
          </div>

          <div className="relative z-10 min-h-[520px] overflow-hidden rounded-3xl border border-white/10 bg-black/40">
            <svg viewBox="0 0 720 520" className="h-[520px] w-full">
              <defs>
                <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(0,255,255,0.22)" />
                  <stop offset="70%" stopColor="rgba(0,255,255,0.04)" />
                  <stop offset="100%" stopColor="rgba(0,255,255,0)" />
                </radialGradient>
              </defs>

              <rect width="720" height="520" fill="url(#radarGlow)" />

              {[80, 150, 220].map((r) => (
                <circle
                  key={r}
                  cx="360"
                  cy="260"
                  r={r}
                  fill="none"
                  stroke="rgba(0,255,255,0.13)"
                  strokeWidth="1"
                />
              ))}

              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                const rad = (angle * Math.PI) / 180;
                return (
                  <line
                    key={angle}
                    x1="360"
                    y1="260"
                    x2={360 + Math.cos(rad) * 260}
                    y2={260 + Math.sin(rad) * 260}
                    stroke="rgba(0,255,255,0.08)"
                    strokeWidth="1"
                  />
                );
              })}

              <motion.line
                x1="360"
                y1="260"
                x2="360"
                y2="20"
                stroke="rgba(0,255,255,0.75)"
                strokeWidth="2"
                style={{ transformOrigin: "360px 260px" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
              />

              <circle cx="360" cy="260" r="6" fill="rgba(0,255,255,0.95)" />

              {dots.map((dot, index) => {
                const score = getScore(dot.lead);
                const color = getNxaColor(score);

                return (
                  <g key={getLeadId(dot.lead, index)}>
                    <motion.circle
                      cx={dot.x}
                      cy={dot.y}
                      r={score >= 81 ? 8 : score >= 61 ? 6 : 5}
                      fill={color}
                      opacity="0.95"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [1, 1.25, 1],
                        opacity: [0.85, 1, 0.85],
                      }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        delay: index * 0.05,
                      }}
                      onClick={() => setSelected(dot.lead)}
                      style={{ cursor: "pointer" }}
                    />

                    <circle
                      cx={dot.x}
                      cy={dot.y}
                      r={score >= 81 ? 18 : 13}
                      fill="none"
                      stroke={color}
                      strokeOpacity="0.25"
                    />
                  </g>
                );
              })}
            </svg>

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur">
                <div className="flex items-center gap-3 text-primary">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-bold">Carregando radar...</span>
                </div>
              </div>
            )}

            {!isLoading && allLeadsArray.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                <div>
                  <Crosshair className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-black">Nenhum lead encontrado</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Faça uma busca inteligente para alimentar o radar deste usuário.
                  </p>
                  <Link href="/busca">
                    <Button className="mt-5">
                      <Search className="mr-2 h-4 w-4" />
                      Fazer busca
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="font-black">Distribuição</h2>
            </div>

            {[
              ["Prioridade máxima", veryHot, "bg-rose-400"],
              ["Alta intenção", hot, "bg-orange-400"],
              ["Potencial médio", warm, "bg-yellow-400"],
              ["Baixa prioridade", cold, "bg-blue-400"],
            ].map(([label, value, color]) => (
              <div key={String(label)} className="mb-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-bold">{String(value)}</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full ${color}`}
                    style={{
                      width: allLeadsArray.length
                        ? `${(Number(value) / allLeadsArray.length) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-black">Top oportunidades</h2>
            </div>

            <div className="space-y-3">
              {leads.slice(0, 6).map((lead, index) => {
                const score = getScore(lead);

                return (
                  <button
                    key={getLeadId(lead, index)}
                    onClick={() => setSelected(lead)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-left transition hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black">
                          {lead?.name || lead?.title || "Lead sem nome"}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {getSegment(lead)} · {getCity(lead)}
                        </p>
                      </div>

                      <div
                        className="rounded-full px-2 py-1 text-xs font-black"
                        style={{
                          background: `${getNxaColor(score)}22`,
                          color: getNxaColor(score),
                        }}
                      >
                        {score}
                      </div>
                    </div>
                  </button>
                );
              })}

              {!leads.length && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nenhuma oportunidade para os filtros atuais.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="w-full max-w-lg rounded-3xl border border-white/10 bg-background p-6 shadow-2xl"
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    Oportunidade detectada
                  </p>
                  <h3 className="mt-2 text-2xl font-black">
                    {selected?.name || selected?.title || "Lead sem nome"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getSegment(selected)} · {getCity(selected)}
                  </p>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="rounded-xl border border-white/10 p-2 hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-muted-foreground">Score NXA</p>
                  <p
                    className="mt-1 text-3xl font-black"
                    style={{ color: getNxaColor(getScore(selected)) }}
                  >
                    {getScore(selected)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getNxaLabel(getScore(selected))}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-muted-foreground">Contato</p>
                  <p className="mt-2 text-sm font-bold">
                    {selected?.phone || selected?.formatted_phone_number || "Não informado"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selected?.website || selected?.url || "Sem site"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {selected?.phone || selected?.formatted_phone_number ? (
                  <a
                    href={`tel:${selected?.phone || selected?.formatted_phone_number}`}
                    className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-bold text-primary"
                  >
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Ligar agora
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                ) : null}

                <Link href="/crm">
                  <Button className="w-full">
                    <Star className="mr-2 h-4 w-4" />
                    Ver no CRM
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Radar;