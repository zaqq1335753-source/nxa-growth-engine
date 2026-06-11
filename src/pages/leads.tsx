import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "../lib/supabase";import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Search,
  Star,
  Flame,
  Thermometer,
  Snowflake,
  ChevronRight,
  RefreshCw,
  Database,
  Trash2,
  Radar,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_BUSINESS_ID = "NEXA_PROD_01";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: {
    label: "Novo",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  contacted: {
    label: "Contatado",
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  proposal: {
    label: "Proposta",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  negotiating: {
    label: "Negociando",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  closed: {
    label: "Fechado",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  lost: {
    label: "Perdido",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

function getBusinessId() {
  return localStorage.getItem("nxa_business_id") || DEFAULT_BUSINESS_ID;
}

function toArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.leads)) return value.leads;
  return [];
}

function safeJsonParse(value: string | null, fallback: any = null) {
  try {
    if (!value) return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function cleanText(value: any) {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}

function normalizeForKey(value: any) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function leadKey(lead: any) {
  return [
    normalizeForKey(lead.business_id || getBusinessId()),
    normalizeForKey(lead.phone),
    normalizeForKey(lead.name),
    normalizeForKey(lead.city),
  ].join("|");
}

function getLeadScore(lead: any) {
  const score = Number(lead?.nxaScore ?? lead?.nxa_score ?? lead?.score ?? 0);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getNxaColor(score: number) {
  if (score >= 81) return "text-red-400";
  if (score >= 61) return "text-orange-400";
  if (score >= 41) return "text-yellow-400";
  return "text-blue-400";
}

function getNxaIcon(score: number) {
  if (score >= 61) return <Flame className="h-3.5 w-3.5" />;
  if (score >= 41) return <Thermometer className="h-3.5 w-3.5" />;
  return <Snowflake className="h-3.5 w-3.5" />;
}

function normalizeLead(lead: any) {
  return {
    ...lead,
    id: lead?.id || crypto.randomUUID(),
    user_id: lead?.user_id || null,
    business_id: lead?.business_id || getBusinessId(),
    name:
      cleanText(lead?.name) ||
      cleanText(lead?.title) ||
      cleanText(lead?.company) ||
      "Lead sem nome",
    phone:
      cleanText(lead?.phone) ||
      cleanText(lead?.whatsapp) ||
      cleanText(lead?.telefone),
    city: cleanText(lead?.city) || cleanText(lead?.cidade),
    state: cleanText(lead?.state) || cleanText(lead?.uf),
    segment:
      cleanText(lead?.segment) ||
      cleanText(lead?.category) ||
      cleanText(lead?.niche) ||
      cleanText(lead?.categoria) ||
      "Sem segmento",
    category:
      cleanText(lead?.category) ||
      cleanText(lead?.segment) ||
      cleanText(lead?.niche),
    rating: lead?.rating ?? lead?.google_rating ?? null,
    address: cleanText(lead?.address) || cleanText(lead?.endereco),
    website: cleanText(lead?.website) || cleanText(lead?.site),
    status: cleanText(lead?.status) || "new",
    nxaScore: getLeadScore(lead),
    created_at: lead?.created_at || new Date().toISOString(),
  };
}

function mapLeadToDatabase(lead: any, userId: string) {
  const normalized = normalizeLead(lead);

  return {
    user_id: userId,
    business_id: normalized.business_id || getBusinessId(),
    name: normalized.name,
    phone: normalized.phone,
    city: normalized.city,
    state: normalized.state,
    segment: normalized.segment,
    category: normalized.category,
    rating: normalized.rating,
    address: normalized.address,
    website: normalized.website,
    status: normalized.status || "new",
    nxa_score: getLeadScore(normalized),
    created_at: normalized.created_at || new Date().toISOString(),
  };
}

function uniqueByKey<T extends Record<string, any>>(items: T[]) {
  const map = new Map<string, T>();

  for (const item of items) {
    const normalized = normalizeLead(item);
    const key = leadKey(normalized);

    if (!map.has(key)) {
      map.set(key, normalized as T);
    }
  }

  return Array.from(map.values());
}

async function getCurrentUser() {
  const { data } = await supabase.auth.getSession();

  if (data?.session?.user?.id) {
    return data.session.user;
  }

  return {
    id: "00000000-0000-0000-0000-000000000000",
  };
}

async function fetchAllLeadsFromSupabase(businessId: string, userId: string) {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("business_id", businessId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export function Leads() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [leads, setLeads] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isImporting, setIsImporting] = React.useState(false);
  const [source, setSource] = React.useState<"supabase" | "cache" | "offline">(
    "supabase"
  );
  const [lastSync, setLastSync] = React.useState<string | null>(null);

  const { toast } = useToast();

  const loadLeadsFromSupabase = React.useCallback(async () => {
    setIsLoading(true);

    try {
      const user = await getCurrentUser();
      const businessId = getBusinessId();

      const data = await fetchAllLeadsFromSupabase(businessId, user.id);
      const normalized = toArray(data).map(normalizeLead);

      setLeads(normalized);
      setSource("supabase");
      setLastSync(
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );

      localStorage.setItem("nxa_leads_cache", JSON.stringify(normalized));
    } catch (error: any) {
      console.error("Erro ao buscar leads no Supabase:", error);

      const cached = safeJsonParse(localStorage.getItem("nxa_leads_cache"), []);
      const normalizedCache = toArray(cached).map(normalizeLead);

      setLeads(normalizedCache);
      setSource(normalizedCache.length ? "cache" : "offline");

      toast({
        title: "Banco indisponível.",
        description:
          error?.message ||
          "Não foi possível carregar do Supabase. Mostrando cache local.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadLeadsFromSupabase();
  }, [loadLeadsFromSupabase]);

  async function insertPayloadSafely(payload: any[]) {
    if (payload.length === 0) {
      return { inserted: 0, duplicated: 0 };
    }

    const { error } = await supabase.from("leads").insert(payload);

    if (!error) {
      return { inserted: payload.length, duplicated: 0 };
    }

    if (error.code !== "23505") {
      throw error;
    }

    let inserted = 0;
    let duplicated = 0;

    for (const row of payload) {
      const single = await supabase.from("leads").insert(row);

      if (!single.error) {
        inserted += 1;
        continue;
      }

      if (single.error.code === "23505") {
        duplicated += 1;
        continue;
      }

      throw single.error;
    }

    return { inserted, duplicated };
  }

  const importLastSearchToLeads = async () => {
    if (isImporting) return;

    setIsImporting(true);

    try {
      const user = await getCurrentUser();

      const parsed = safeJsonParse(
        localStorage.getItem("nxa_last_search_results"),
        null
      );

      if (!parsed) {
        toast({
          title: "Nenhuma busca encontrada.",
          description: "Faça uma busca nova antes de importar leads.",
        });
        return;
      }

      const rawResults = toArray(parsed.results || parsed.leads || parsed.data);

      if (rawResults.length === 0) {
        toast({
          title: "Busca sem leads.",
          description: "A última busca não possui leads para importar.",
        });
        return;
      }

      const businessId = getBusinessId();

      const normalizedResults = uniqueByKey(
        rawResults.map((lead: any) => ({
          ...lead,
          user_id: user.id,
          business_id: businessId,
          segment:
            lead.segment ||
            lead.category ||
            parsed.niche ||
            parsed.segment ||
            parsed.query ||
            "Sem segmento",
          city: lead.city || parsed.city || lead.cidade,
          state: lead.state || parsed.state || lead.uf,
        }))
      );

      const currentDbLeads = await fetchAllLeadsFromSupabase(
        businessId,
        user.id
      );

      const existingKeys = new Set(
        currentDbLeads.map((lead: any) =>
          leadKey({
            ...lead,
            user_id: user.id,
            business_id: businessId,
          })
        )
      );

      const payload = normalizedResults
        .map((lead: any) => mapLeadToDatabase(lead, user.id))
        .filter((lead: any) => !existingKeys.has(leadKey(lead)));

      if (payload.length === 0) {
        toast({
          title: "Nada novo para importar.",
          description: "Todos os leads dessa busca já estão salvos no banco.",
        });

        await loadLeadsFromSupabase();
        return;
      }

      const result = await insertPayloadSafely(payload);

      const history = safeJsonParse(
        localStorage.getItem("nxa_leads_import_history"),
        []
      );

      localStorage.setItem(
        "nxa_leads_import_history",
        JSON.stringify([
          {
            id: crypto.randomUUID(),
            user_id: user.id,
            business_id: businessId,
            total_received: rawResults.length,
            total_unique_in_search: normalizedResults.length,
            total_inserted: result.inserted,
            total_duplicated: result.duplicated,
            source: "last_search",
            query: parsed.query || parsed.niche || parsed.segment || null,
            city: parsed.city || null,
            state: parsed.state || null,
            created_at: new Date().toISOString(),
          },
          ...toArray(history),
        ])
      );

      toast({
        title: "Importação concluída.",
        description: `${result.inserted} novo(s) lead(s) salvo(s). ${result.duplicated} duplicado(s) ignorado(s).`,
      });

      await loadLeadsFromSupabase();
    } catch (error: any) {
      console.error("Erro ao importar leads:", error);

      toast({
        title: "Erro ao salvar no banco.",
        description:
          error?.code === "23505"
            ? "Lead duplicado bloqueado pelo banco. Atualize a lista."
            : error?.message || "Não foi possível importar os leads.",
        variant: "destructive",
      });

      await loadLeadsFromSupabase();
    } finally {
      setIsImporting(false);
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      const user = await getCurrentUser();

      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", leadId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({ title: "Lead removido." });
      await loadLeadsFromSupabase();
    } catch (error: any) {
      console.error("Erro ao remover lead:", error);

      toast({
        title: "Erro ao remover lead.",
        description: error?.message || "Não foi possível remover este lead.",
        variant: "destructive",
      });
    }
  };

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    return leads.filter((lead: any) => {
      const statusOk = statusFilter === "all" || lead.status === statusFilter;

      if (!statusOk) return false;
      if (!q) return true;

      const searchable = [
        lead.name,
        lead.city,
        lead.state,
        lead.segment,
        lead.category,
        lead.phone,
        lead.status,
        lead.website,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(q);
    });
  }, [leads, search, statusFilter]);

  const hotLeads = filtered.filter((lead: any) => getLeadScore(lead) >= 61).length;

  const avgScore =
    filtered.length > 0
      ? Math.round(
          filtered.reduce(
            (acc: number, lead: any) => acc + getLeadScore(lead),
            0
          ) / filtered.length
        )
      : 0;

  const sourceLabel =
    source === "supabase"
      ? "Supabase"
      : source === "cache"
        ? "Cache local"
        : "Offline";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-col lg:flex-row">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              NXA Lead OS
            </Badge>

            <Badge variant="outline" className="text-xs">
              Fonte: {sourceLabel}
            </Badge>

            {lastSync && (
              <Badge variant="outline" className="text-xs">
                Sync: {lastSync}
              </Badge>
            )}

            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Anti-duplicidade ativo
            </Badge>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>

          <p className="text-muted-foreground mt-1">
            Central inteligente de prospectos com banco de dados, importação segura e bloqueio de duplicados.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={loadLeadsFromSupabase}
            disabled={isLoading || isImporting}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>

          <Button
            onClick={importLastSearchToLeads}
            disabled={isLoading || isImporting}
          >
            <Database
              className={`h-4 w-4 mr-2 ${
                isImporting ? "animate-pulse" : ""
              }`}
            />
            {isImporting ? "Importando..." : "Importar última busca"}
          </Button>
        </div>
      </div>

      {source === "offline" && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex gap-3 text-red-300">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-bold">Banco indisponível</p>
              <p className="text-sm">
                Verifique se o usuário está logado e se as políticas RLS da tabela leads estão corretas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur border-card-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de leads</p>
                <p className="text-3xl font-bold mt-1">{filtered.length}</p>
              </div>

              <Radar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-card-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leads quentes</p>
                <p className="text-3xl font-bold mt-1 text-orange-400">
                  {hotLeads}
                </p>
              </div>

              <Flame className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-card-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score médio</p>
                <p className={`text-3xl font-bold mt-1 ${getNxaColor(avgScore)}`}>
                  {avgScore}
                </p>
              </div>

              <Thermometer className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-card-border">
        <CardContent className="pt-4">
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

              <Input
                placeholder="Buscar por empresa, cidade, segmento, telefone ou status..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>

                {Object.entries(STATUS_LABELS).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur border-card-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Empresa</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Segmento</TableHead>
              <TableHead className="text-center">Rating</TableHead>
              <TableHead className="text-center">NXA Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-muted-foreground"
                >
                  Carregando leads...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-muted-foreground"
                >
                  Nenhum lead encontrado.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              filtered.map((lead: any, index: number) => {
                const score = getLeadScore(lead);
                const status = STATUS_LABELS[lead.status] || STATUS_LABELS.new;

                return (
                  <TableRow
                    key={lead.id || index}
                    className="border-border group hover:bg-muted/30"
                  >
                    <TableCell>
                      <div className="font-medium text-sm">
                        {lead.name || "Lead sem nome"}
                      </div>

                      {lead.phone && (
                        <div className="text-xs text-muted-foreground">
                          {lead.phone}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {lead.city || "—"}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {lead.segment || lead.category || "—"}
                    </TableCell>

                    <TableCell className="text-center">
                      {lead.rating ? (
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                          <span>{lead.rating}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <div
                        className={`flex items-center justify-center gap-1 font-bold text-sm ${getNxaColor(
                          score
                        )}`}
                      >
                        {getNxaIcon(score)}
                        {score}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/leads/${lead.id}`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400 hover:text-red-300"
                          onClick={() => deleteLead(lead.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default Leads;