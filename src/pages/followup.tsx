import * as React from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  CalendarCheck,
  Plus,
  Check,
  Trash2,
  Clock,
  AlertCircle,
  RefreshCw,
  MessageCircle,
  Phone,
  Mail,
  User,
  Search,
  CalendarPlus,
  Building2,
  Sparkles,
  ArrowUpRight,
  Loader2,
  CircleDot,
  X,
  ChevronDown,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

const DEFAULT_BUSINESS_ID = "NEXA_PROD_01";
const NO_LEAD_VALUE = "__manual__";

type LeadOption = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  status?: string | null;
  raw: any;
};

type FollowupPayload = {
  title: string;
  client_name?: string | null;
  lead_id?: string | null;
  lead_name?: string | null;
  lead_phone?: string | null;
  lead_email?: string | null;
  company_name?: string | null;
  notes?: string | null;
  channel: string;
  priority: string;
  due_date: string;
  status: string;
  business_id?: string;
  user_id?: string | null;
  created_by?: string | null;
  source?: string;
  create_appointment?: boolean;
};

type Option = {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
};

const CHANNEL_OPTIONS: Option[] = [
  { value: "whatsapp", label: "WhatsApp", description: "Mensagem direta para o lead", icon: <MessageCircle className="h-4 w-4" /> },
  { value: "phone", label: "Telefone", description: "Ligação comercial", icon: <Phone className="h-4 w-4" /> },
  { value: "email", label: "E-mail", description: "Envio de proposta ou retorno", icon: <Mail className="h-4 w-4" /> },
  { value: "visit", label: "Visita", description: "Contato presencial ou reunião", icon: <Building2 className="h-4 w-4" /> },
  { value: "other", label: "Outro", description: "Ação personalizada", icon: <User className="h-4 w-4" /> },
];

const PRIORITY_OPTIONS: Option[] = [
  { value: "low", label: "Baixa", description: "Pode aguardar" },
  { value: "normal", label: "Normal", description: "Rotina comercial padrão" },
  { value: "high", label: "Alta", description: "Lead quente ou proposta aberta" },
  { value: "urgent", label: "Urgente", description: "Retorno crítico ou fechamento" },
];

const CHANNEL_LABELS = Object.fromEntries(CHANNEL_OPTIONS.map((item) => [item.value, item.label]));
const PRIORITY_LABELS = Object.fromEntries(PRIORITY_OPTIONS.map((item) => [item.value, item.label]));

function getBusinessId() {
  if (typeof window === "undefined") return DEFAULT_BUSINESS_ID;
  return localStorage.getItem("nxa_business_id") || DEFAULT_BUSINESS_ID;
}

function onlyDigits(value: string) {
  return String(value || "").replace(/\D/g, "");
}

function getDateValue(item: any) {
  return (
    item?.due_date ||
    item?.dueDate ||
    item?.date ||
    item?.scheduled_at ||
    item?.scheduledAt ||
    item?.scheduled_date ||
    item?.created_at ||
    ""
  );
}

function isValidDate(date: string) {
  if (!date) return false;
  const d = new Date(date);
  return !Number.isNaN(d.getTime());
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isOverdue(date: string) {
  if (!date || !isValidDate(date)) return false;
  const d = new Date(date);
  return d < startOfToday();
}

function isToday(date: string) {
  if (!date || !isValidDate(date)) return false;
  return new Date(date).toDateString() === new Date().toDateString();
}

function formatDate(date: string) {
  if (!date || !isValidDate(date)) return "Sem data";

  return new Date(date).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function normalizeLead(item: any): LeadOption {
  const name =
    item?.name ||
    item?.lead_name ||
    item?.client_name ||
    item?.business_name ||
    item?.company_name ||
    item?.title ||
    "Lead sem nome";

  return {
    id: String(item?.id || crypto.randomUUID()),
    name: String(name),
    phone: item?.phone || item?.lead_phone || item?.whatsapp || item?.mobile || item?.telefone || null,
    email: item?.email || item?.lead_email || null,
    company: item?.company_name || item?.business_name || item?.company || item?.empresa || null,
    status: item?.status || item?.stage || item?.crm_status || null,
    raw: item,
  };
}

function getClientName(item: any) {
  return (
    item?.client_name ||
    item?.lead_name ||
    item?.company_name ||
    item?.business_name ||
    item?.name ||
    "Cliente não informado"
  );
}

function getChannelIcon(channel: string) {
  if (channel === "whatsapp") return <MessageCircle className="h-3.5 w-3.5" />;
  if (channel === "phone") return <Phone className="h-3.5 w-3.5" />;
  if (channel === "email") return <Mail className="h-3.5 w-3.5" />;
  if (channel === "visit") return <Building2 className="h-3.5 w-3.5" />;
  return <User className="h-3.5 w-3.5" />;
}

function parseMissingColumn(error: any) {
  const message = String(error?.message || error?.details || "");
  const patterns = [
    /Could not find the '([^']+)' column/i,
    /column "([^"]+)" does not exist/i,
    /record "new" has no field "([^"]+)"/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function cleanObject(payload: Record<string, any>) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

async function insertWithSchemaFallback(table: string, payload: Record<string, any>) {
  let cleanPayload = cleanObject(payload);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { data, error } = await supabase.from(table).insert(cleanPayload).select("*").single();

    if (!error) return { data, error: null };

    const missingColumn = parseMissingColumn(error);
    if (missingColumn && missingColumn in cleanPayload) {
      const nextPayload = { ...cleanPayload };
      delete nextPayload[missingColumn];
      cleanPayload = nextPayload;
      continue;
    }

    return { data: null, error };
  }

  return {
    data: null,
    error: new Error(`Não foi possível inserir em ${table}. Verifique as colunas da tabela.`),
  };
}

async function updateWithSchemaFallback(table: string, id: string, payload: Record<string, any>) {
  let cleanPayload = cleanObject(payload);

  for (let attempt = 0; attempt < 15; attempt += 1) {
    const { error } = await supabase.from(table).update(cleanPayload).eq("id", id);

    if (!error) return { error: null };

    const missingColumn = parseMissingColumn(error);
    if (missingColumn && missingColumn in cleanPayload) {
      const nextPayload = { ...cleanPayload };
      delete nextPayload[missingColumn];
      cleanPayload = nextPayload;
      continue;
    }

    return { error };
  }

  return { error: new Error(`Não foi possível atualizar ${table}.`) };
}

function AdvancedSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const selected = options.find((item) => item.value === value) || options[0];

  React.useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative space-y-2">
      <label className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between gap-3 rounded-md border border-input bg-black/20 px-3 text-left text-sm ring-offset-background transition hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.icon}
          <span className="truncate">{selected?.label}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[10000] mt-2 overflow-hidden rounded-xl border border-cyan-500/20 bg-[#070a0f] shadow-2xl shadow-black/60">
          <div className="max-h-64 overflow-y-auto p-1">
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition ${
                    active ? "bg-cyan-400/12 text-cyan-100" : "hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="mt-0.5 text-cyan-300">{option.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{option.label}</span>
                    {option.description && <span className="block text-xs text-muted-foreground">{option.description}</span>}
                  </span>
                  {active && <Check className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LeadPicker({
  leads,
  value,
  onChange,
}: {
  leads: LeadOption[];
  value: string;
  onChange: (lead: LeadOption | null) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const ref = React.useRef<HTMLDivElement | null>(null);
  const selectedLead = leads.find((lead) => lead.id === value) || null;

  React.useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredLeads = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    const source = leads.slice(0, 250);

    if (!term) return source.slice(0, 20);

    return source
      .filter((lead) =>
        [lead.name, lead.company, lead.phone, lead.email, lead.status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)
      )
      .slice(0, 40);
  }, [leads, search]);

  return (
    <div ref={ref} className="relative space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Lead sincronizado</label>
        {selectedLead && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Limpar seleção
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-md border border-input bg-black/20 px-3 py-2 text-left ring-offset-background transition hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-white">
            {selectedLead ? selectedLead.name : "Cadastrar manualmente"}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {selectedLead
              ? [selectedLead.company, selectedLead.phone, selectedLead.email].filter(Boolean).join(" • ") || "Lead salvo sem detalhes adicionais"
              : "Clique para escolher um lead salvo ou mantenha manual"}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[10000] mt-2 overflow-hidden rounded-xl border border-cyan-500/20 bg-[#070a0f] shadow-2xl shadow-black/60">
          <div className="border-b border-white/10 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pesquisar lead, empresa, telefone..."
                className="h-10 bg-black/30 pl-9"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-1">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition ${
                !selectedLead ? "bg-cyan-400/12 text-cyan-100" : "hover:bg-white/[0.06]"
              }`}
            >
              <User className="mt-0.5 h-4 w-4 text-cyan-300" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">Cadastrar manualmente</span>
                <span className="block text-xs text-muted-foreground">Use quando o lead ainda não estiver salvo.</span>
              </span>
              {!selectedLead && <Check className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />}
            </button>

            {filteredLeads.map((lead) => {
              const active = selectedLead?.id === lead.id;
              return (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => {
                    onChange(lead);
                    setOpen(false);
                  }}
                  className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition ${
                    active ? "bg-cyan-400/12 text-cyan-100" : "hover:bg-white/[0.06]"
                  }`}
                >
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{lead.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[lead.company, lead.phone, lead.email].filter(Boolean).join(" • ") || "Sem detalhes adicionais"}
                    </span>
                  </span>
                  {active ? (
                    <Check className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />
                  ) : lead.status ? (
                    <span className="mt-0.5 shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {lead.status}
                    </span>
                  ) : null}
                </button>
              );
            })}

            {filteredLeads.length === 0 && (
              <div className="p-5 text-center text-sm text-muted-foreground">Nenhum lead encontrado.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AddFollowupDialog({
  leads,
  onAdd,
}: {
  leads: LeadOption[];
  onAdd: (data: FollowupPayload) => Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [channel, setChannel] = React.useState("whatsapp");
  const [priority, setPriority] = React.useState("normal");
  const [dueDate, setDueDate] = React.useState("");
  const [selectedLeadId, setSelectedLeadId] = React.useState(NO_LEAD_VALUE);
  const [createAppointment, setCreateAppointment] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const selectedLead = React.useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) || null,
    [leads, selectedLeadId]
  );

  function resetForm() {
    setTitle("");
    setClientName("");
    setNotes("");
    setChannel("whatsapp");
    setPriority("normal");
    setDueDate("");
    setSelectedLeadId(NO_LEAD_VALUE);
    setCreateAppointment(true);
  }

  function handleLeadChange(lead: LeadOption | null) {
    if (!lead) {
      setSelectedLeadId(NO_LEAD_VALUE);
      return;
    }

    setSelectedLeadId(lead.id);
    setClientName(lead.name);
    if (!title.trim()) setTitle(`Retornar contato com ${lead.name}`);
  }

  async function handleAdd() {
    if (!title.trim() || !dueDate) return;

    setSaving(true);

    try {
      const due = new Date(dueDate).toISOString();
      await onAdd({
        title: title.trim(),
        client_name: clientName.trim() || selectedLead?.name || null,
        lead_name: selectedLead?.name || clientName.trim() || null,
        lead_id: selectedLead?.id || null,
        lead_phone: selectedLead?.phone || null,
        lead_email: selectedLead?.email || null,
        company_name: selectedLead?.company || null,
        notes: notes.trim() || null,
        channel,
        priority,
        due_date: due,
        status: "pending",
        business_id: getBusinessId(),
        source: "followup_center",
        create_appointment: createAppointment,
      });

      resetForm();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-cyan-400 text-black hover:bg-cyan-300">
          <Plus className="h-4 w-4" />
          Novo Follow-up
        </Button>
      </DialogTrigger>

      <DialogContent className="z-[9998] max-h-[92vh] overflow-y-auto overflow-x-hidden border-cyan-500/20 bg-background p-0 sm:max-w-3xl">
        <div className="sticky top-0 z-10 border-b border-white/10 bg-background/95 px-5 py-4 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-cyan-300" />
              Agendar follow-up integrado
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-5 py-5">
          <LeadPicker leads={leads} value={selectedLeadId} onChange={handleLeadChange} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Cliente / empresa</label>
              <Input
                placeholder="Nome do cliente ou empresa"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Resumo</p>
              <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                <span>Origem: <strong className="text-white">{selectedLead ? "Lead salvo" : "Manual"}</strong></span>
                <span className="truncate">Contato: <strong className="text-white">{selectedLead?.phone || selectedLead?.email || "Não informado"}</strong></span>
                <span className="truncate">CRM: <strong className="text-white">{selectedLead?.status || "Sem status"}</strong></span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Ação comercial</label>
            <Input
              placeholder="Ex: Retornar orçamento, confirmar proposta, reativar lead..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <AdvancedSelect label="Canal" value={channel} onChange={setChannel} options={CHANNEL_OPTIONS} />
            <AdvancedSelect label="Prioridade" value={priority} onChange={setPriority} options={PRIORITY_OPTIONS} />

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Data e hora</label>
              <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <Textarea
            placeholder="Notas, contexto da conversa, roteiro de abordagem ou próximo passo..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />

          <label className="flex items-start gap-3 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 accent-cyan-400"
              checked={createAppointment}
              onChange={(e) => setCreateAppointment(e.target.checked)}
            />
            <span>
              <strong>Sincronizar com agenda interna.</strong>
              <span className="block text-muted-foreground">Também cria um registro em appointments com origem followup.</span>
            </span>
          </label>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={handleAdd}
              className="bg-cyan-400 text-black hover:bg-cyan-300"
              disabled={!title.trim() || !dueDate || saving}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarPlus className="mr-2 h-4 w-4" />}
              {saving ? "Agendando..." : "Agendar e sincronizar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Followup() {
  const [followups, setFollowups] = React.useState<any[]>([]);
  const [leads, setLeads] = React.useState<LeadOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [syncingId, setSyncingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const { toast } = useToast();

  const businessId = getBusinessId();

  async function getSessionUserId() {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id || null;
  }

  async function selectWithFallback(table: string, userId: string | null, limit = 300) {
    const attempts: Array<() => any> = [
      () => supabase.from(table).select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(limit),
      () => (userId ? supabase.from(table).select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit) : null),
      () => supabase.from(table).select("*").order("created_at", { ascending: false }).limit(limit),
    ];

    let lastError: any = null;

    for (const attempt of attempts) {
      const query = attempt();
      if (!query) continue;
      const { data, error } = await query;
      if (!error) return data || [];
      lastError = error;
      const missingColumn = parseMissingColumn(error);
      if (!missingColumn) break;
    }

    throw lastError;
  }

  async function loadLeads(userId?: string | null) {
    try {
      const data = await selectWithFallback("leads", userId || null, 250);
      setLeads(Array.isArray(data) ? data.map(normalizeLead).filter((lead) => lead.id) : []);
    } catch (error) {
      console.warn("Não foi possível carregar leads para o follow-up:", error);
      setLeads([]);
    }
  }

  async function loadFollowups() {
    setLoading(true);

    try {
      const userId = await getSessionUserId();
      await loadLeads(userId);

      const data = await selectWithFallback("followups", userId, 500);
      const sorted = (Array.isArray(data) ? data : []).sort((a, b) => {
        const ad = new Date(getDateValue(a)).getTime() || 0;
        const bd = new Date(getDateValue(b)).getTime() || 0;
        return ad - bd;
      });

      setFollowups(sorted);
    } catch (error: any) {
      console.error("Erro ao carregar follow-ups:", error);
      toast({
        title: "Erro ao carregar follow-ups",
        description: error?.message || "Verifique a tabela followups no Supabase.",
        variant: "destructive",
      });
      setFollowups([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadFollowups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createAppointmentFromFollowup(item: any, followupId?: string) {
    const userId = await getSessionUserId();
    const dueDate = getDateValue(item);
    const scheduled = dueDate && isValidDate(dueDate) ? new Date(dueDate) : new Date();
    const scheduledDate = scheduled.toISOString().slice(0, 10);
    const scheduledTime = scheduled.toTimeString().slice(0, 8);

    const appointmentPayload = {
      user_id: userId,
      created_by: userId,
      business_id: item.business_id || businessId,
      followup_id: followupId || item.id || null,
      lead_id: item.lead_id || null,
      client_id: item.client_id || null,
      lead_name: item.lead_name || item.client_name || item.name || null,
      client_name: getClientName(item),
      lead_phone: item.lead_phone || item.phone || null,
      lead_email: item.lead_email || item.email || null,
      company_name: item.company_name || null,
      title: item.title || "Follow-up comercial",
      notes: item.notes || null,
      description: item.notes || null,
      scheduled_at: scheduled.toISOString(),
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      date: scheduledDate,
      time: scheduledTime,
      status: "scheduled",
      source: "followup",
      channel: item.channel || "whatsapp",
      created_at: new Date().toISOString(),
    };

    const { error } = await insertWithSchemaFallback("appointments", appointmentPayload);
    if (error) throw error;
  }

  async function createFollowup(payload: FollowupPayload) {
    try {
      const userId = await getSessionUserId();
      const shouldCreateAppointment = Boolean(payload.create_appointment);
      const { create_appointment, ...restPayload } = payload;
      const due = restPayload.due_date;
      const dateObj = new Date(due);

      const followupPayload = {
        ...restPayload,
        user_id: userId,
        created_by: userId,
        business_id: businessId,
        due_date: due,
        dueDate: due,
        scheduled_at: due,
        scheduled_date: !Number.isNaN(dateObj.getTime()) ? dateObj.toISOString().slice(0, 10) : null,
        date: !Number.isNaN(dateObj.getTime()) ? dateObj.toISOString().slice(0, 10) : null,
        time: !Number.isNaN(dateObj.getTime()) ? dateObj.toTimeString().slice(0, 8) : null,
        appointment_synced: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await insertWithSchemaFallback("followups", followupPayload);
      if (error) throw error;

      const createdFollowup = data || { ...followupPayload, id: crypto.randomUUID() };

      if (shouldCreateAppointment) {
        try {
          await createAppointmentFromFollowup({ ...createdFollowup, ...followupPayload }, createdFollowup?.id);
          await updateWithSchemaFallback("followups", createdFollowup.id, {
            appointment_synced: true,
            updated_at: new Date().toISOString(),
          });
          createdFollowup.appointment_synced = true;
        } catch (appointmentError: any) {
          toast({
            title: "Follow-up criado, mas a agenda não sincronizou",
            description: appointmentError?.message || "Verifique a tabela appointments no Supabase.",
            variant: "destructive",
          });
        }
      }

      setFollowups((prev) => [createdFollowup, ...prev]);
      toast({ title: "Follow-up agendado com sucesso!" });
      await loadFollowups();
    } catch (error: any) {
      toast({
        title: "Erro ao criar follow-up",
        description: error?.message || "Não foi possível salvar no Supabase.",
        variant: "destructive",
      });
      throw error;
    }
  }

  async function toggleStatus(item: any) {
    const nextStatus = (item.status || "pending") === "done" ? "pending" : "done";

    try {
      const { error } = await updateWithSchemaFallback("followups", item.id, {
        status: nextStatus,
        completed_at: nextStatus === "done" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setFollowups((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: nextStatus, completed_at: nextStatus === "done" ? new Date().toISOString() : null } : f))
      );

      toast({ title: nextStatus === "done" ? "Follow-up concluído." : "Follow-up reaberto." });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar follow-up",
        description: error?.message,
        variant: "destructive",
      });
    }
  }

  async function syncAppointment(item: any) {
    setSyncingId(item.id);

    try {
      await createAppointmentFromFollowup(item, item.id);
      await updateWithSchemaFallback("followups", item.id, {
        appointment_synced: true,
        updated_at: new Date().toISOString(),
      });

      setFollowups((prev) => prev.map((f) => (f.id === item.id ? { ...f, appointment_synced: true } : f)));
      toast({ title: "Follow-up sincronizado com a agenda." });
    } catch (error: any) {
      toast({
        title: "Erro ao sincronizar agenda",
        description: error?.message,
        variant: "destructive",
      });
    } finally {
      setSyncingId(null);
    }
  }

  async function rescheduleTomorrow(item: any) {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    next.setHours(9, 0, 0, 0);

    try {
      const iso = next.toISOString();
      const { error } = await updateWithSchemaFallback("followups", item.id, {
        due_date: iso,
        dueDate: iso,
        scheduled_at: iso,
        scheduled_date: iso.slice(0, 10),
        date: iso.slice(0, 10),
        time: "09:00:00",
        status: "pending",
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setFollowups((prev) => prev.map((f) => (f.id === item.id ? { ...f, due_date: iso, dueDate: iso, scheduled_at: iso, status: "pending" } : f)));
      toast({ title: "Follow-up reagendado para amanhã às 09:00." });
    } catch (error: any) {
      toast({ title: "Erro ao reagendar", description: error?.message, variant: "destructive" });
    }
  }

  async function deleteFollowup(id: string) {
    const confirmed = window.confirm("Remover este follow-up? Essa ação não pode ser desfeita.");
    if (!confirmed) return;

    try {
      const { error } = await supabase.from("followups").delete().eq("id", id);
      if (error) throw error;
      setFollowups((prev) => prev.filter((f) => f.id !== id));
      toast({ title: "Follow-up removido." });
    } catch (error: any) {
      toast({
        title: "Erro ao remover follow-up",
        description: error?.message,
        variant: "destructive",
      });
    }
  }

  const enrichedFollowups = React.useMemo(() => {
    return followups.map((item) => {
      const lead = item.lead_id ? leads.find((leadItem) => leadItem.id === String(item.lead_id)) : null;
      return {
        ...item,
        client_name: item.client_name || item.lead_name || lead?.name || item.name,
        lead_phone: item.lead_phone || lead?.phone,
        lead_email: item.lead_email || lead?.email,
        company_name: item.company_name || lead?.company,
        lead_status: item.lead_status || lead?.status,
      };
    });
  }, [followups, leads]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return enrichedFollowups;

    return enrichedFollowups.filter((item) =>
      [
        item.title,
        item.client_name,
        item.lead_name,
        item.company_name,
        item.lead_phone,
        item.lead_email,
        item.notes,
        item.channel,
        item.status,
        item.priority,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [enrichedFollowups, search]);

  const pending = filtered.filter((f) => (f.status || "pending") !== "done");
  const done = filtered.filter((f) => f.status === "done");
  const overdue = pending.filter((f) => isOverdue(getDateValue(f)));
  const today = pending.filter((f) => isToday(getDateValue(f)));
  const upcoming = pending.filter((f) => {
    const date = getDateValue(f);
    return !isOverdue(date) && !isToday(date);
  });
  const highIntent = pending.filter((f) => ["high", "urgent"].includes(f.priority || ""));

  function openContact(item: any) {
    const phone = onlyDigits(item.lead_phone || item.phone || "");
    if (item.channel === "whatsapp" && phone) {
      window.open(`https://wa.me/${phone}`, "_blank");
      return;
    }
    if (item.channel === "email" && item.lead_email) {
      window.location.href = `mailto:${item.lead_email}`;
      return;
    }
    if (phone) {
      window.location.href = `tel:${phone}`;
      return;
    }
    toast({ title: "Contato não encontrado", description: "Este follow-up não possui telefone ou e-mail salvo." });
  }

  function renderCard(item: any) {
    const status = item.status || "pending";
    const dueDate = getDateValue(item);
    const priority = item.priority || "normal";
    const synced = Boolean(item.appointment_synced || item.appointment_id);

    return (
      <Card key={item.id} className={`border-white/10 bg-white/[0.03] transition hover:bg-white/[0.055] ${status === "done" ? "opacity-60" : ""}`}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <button
                type="button"
                onClick={() => toggleStatus(item)}
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                  status === "done" ? "border-emerald-400 bg-emerald-400/20" : "border-muted-foreground hover:border-cyan-300"
                }`}
                title={status === "done" ? "Reabrir follow-up" : "Marcar como concluído"}
              >
                {status === "done" ? <Check className="h-4 w-4 text-emerald-400" /> : <CircleDot className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={`text-sm font-bold ${status === "done" ? "line-through text-muted-foreground" : ""}`}>
                    {item.title || "Follow-up sem título"}
                  </p>
                  {priority !== "normal" && (
                    <Badge variant="secondary" className={priority === "urgent" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"}>
                      {PRIORITY_LABELS[priority] || priority}
                    </Badge>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-cyan-300">{getClientName(item)}</span>
                  {item.company_name && <span>• {item.company_name}</span>}
                  {item.lead_phone && <span>• {item.lead_phone}</span>}
                  {item.lead_status && <span>• CRM: {item.lead_status}</span>}
                </div>

                {item.notes && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{item.notes}</p>}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    {getChannelIcon(item.channel)}
                    {CHANNEL_LABELS[item.channel] || "Outro"}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(dueDate)}
                  </span>
                  {synced && <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10">Agenda sincronizada</Badge>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => openContact(item)} className="gap-1">
                <ExternalLink className="h-3.5 w-3.5" />
                Contato
              </Button>

              <Button type="button" variant="outline" size="sm" onClick={() => rescheduleTomorrow(item)} className="gap-1">
                <RotateCcw className="h-3.5 w-3.5" />
                Amanhã
              </Button>

              <Button type="button" variant="outline" size="sm" onClick={() => syncAppointment(item)} disabled={syncingId === item.id} className="gap-1">
                {syncingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarPlus className="h-3.5 w-3.5" />}
                Agendar
              </Button>

              <Button type="button" variant={status === "done" ? "outline" : "default"} size="sm" onClick={() => toggleStatus(item)} className="gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {status === "done" ? "Reabrir" : "Concluir"}
              </Button>

              <button type="button" onClick={() => deleteFollowup(item.id)} className="rounded-md p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400" title="Remover follow-up">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  function renderGroup(title: string, items: any[], icon: React.ReactNode, color: string) {
    if (!items.length) return null;

    return (
      <div className="space-y-3">
        <div className={`flex items-center gap-2 font-bold ${color}`}>
          {icon}
          {title}
          <span className="text-xs text-muted-foreground">({items.length})</span>
        </div>
        <div className="grid gap-3">{items.map(renderCard)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="overflow-hidden rounded-3xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/10 via-white/[0.03] to-transparent p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
              <CalendarCheck className="h-4 w-4" />
              NXA Follow-up Center
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Follow-ups comerciais</h1>
            <p className="mt-1 text-sm text-muted-foreground">Central integrada com Leads, CRM e Agenda para não perder nenhum retorno.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadFollowups} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <AddFollowupDialog leads={leads} onAdd={createFollowup} />
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Building2 className="h-3.5 w-3.5 text-cyan-300" />Leads disponíveis</div>
            <p className="mt-1 text-2xl font-black">{leads.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-yellow-300" />Alta prioridade</div>
            <p className="mt-1 text-2xl font-black">{highIntent.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><CircleDot className="h-3.5 w-3.5 text-emerald-300" />Pipeline ativo</div>
            <p className="mt-1 text-2xl font-black">{pending.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="border-red-500/20 bg-red-500/10"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Em atraso</p><p className="mt-1 text-3xl font-black text-red-400">{overdue.length}</p></CardContent></Card>
        <Card className="border-yellow-500/20 bg-yellow-500/10"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Hoje</p><p className="mt-1 text-3xl font-black text-yellow-400">{today.length}</p></CardContent></Card>
        <Card className="border-cyan-500/20 bg-cyan-500/10"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Próximos</p><p className="mt-1 text-3xl font-black text-cyan-300">{upcoming.length}</p></CardContent></Card>
        <Card className="border-emerald-500/20 bg-emerald-500/10"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Concluídos</p><p className="mt-1 text-3xl font-black text-emerald-400">{done.length}</p></CardContent></Card>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {search && <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"><X className="h-4 w-4" /></button>}
        <Input placeholder="Buscar follow-up, lead, telefone, canal, prioridade, notas..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-black/20 pl-10 pr-10" />
      </div>

      {loading ? (
        <Card className="border-white/10 bg-white/[0.03]"><CardContent className="flex items-center justify-center gap-3 py-14 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Carregando e sincronizando dados...</CardContent></Card>
      ) : (
        <div className="space-y-8">
          {renderGroup("Em atraso", overdue, <AlertCircle className="h-4 w-4" />, "text-red-400")}
          {renderGroup("Hoje", today, <CalendarCheck className="h-4 w-4" />, "text-yellow-400")}
          {renderGroup("Próximos", upcoming, <Clock className="h-4 w-4" />, "text-cyan-300")}
          {renderGroup("Concluídos", done, <Check className="h-4 w-4" />, "text-muted-foreground")}

          {!filtered.length && (
            <Card className="border-dashed border-white/10 bg-white/[0.03]">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarCheck className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <p className="font-bold">Nenhum follow-up encontrado.</p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">Crie uma ação comercial, vincule a um lead existente e sincronize com a agenda interna.</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-cyan-300"><ArrowUpRight className="h-3.5 w-3.5" />Dica: use o botão Novo Follow-up no topo.</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default Followup;
