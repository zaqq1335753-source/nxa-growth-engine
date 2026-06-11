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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
} from "lucide-react";

const DEFAULT_BUSINESS_ID = "NEXA_PROD_01";

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  email: "E-mail",
  phone: "Telefone",
  visit: "Visita",
  other: "Outro",
};

function getBusinessId() {
  return localStorage.getItem("nxa_business_id") || DEFAULT_BUSINESS_ID;
}

function getDateValue(item: any) {
  return (
    item?.due_date ||
    item?.dueDate ||
    item?.date ||
    item?.scheduled_at ||
    item?.scheduledAt ||
    ""
  );
}

function isValidDate(date: string) {
  const d = new Date(date);
  return !Number.isNaN(d.getTime());
}

function isOverdue(date: string) {
  if (!date || !isValidDate(date)) return false;
  const now = new Date();
  const d = new Date(date);
  return d < now && d.toDateString() !== now.toDateString();
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

function getChannelIcon(channel: string) {
  if (channel === "whatsapp") return <MessageCircle className="h-3.5 w-3.5" />;
  if (channel === "phone") return <Phone className="h-3.5 w-3.5" />;
  if (channel === "email") return <Mail className="h-3.5 w-3.5" />;
  return <User className="h-3.5 w-3.5" />;
}

function AddFollowupDialog({ onAdd }: { onAdd: (data: any) => Promise<void> }) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [channel, setChannel] = React.useState("whatsapp");
  const [dueDate, setDueDate] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleAdd() {
    if (!title.trim() || !dueDate) return;

    setSaving(true);

    await onAdd({
      title: title.trim(),
      client_name: clientName.trim() || null,
      notes: notes.trim() || null,
      channel,
      due_date: new Date(dueDate).toISOString(),
      status: "pending",
      business_id: getBusinessId(),
    });

    setTitle("");
    setClientName("");
    setNotes("");
    setChannel("whatsapp");
    setDueDate("");
    setSaving(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Follow-up
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar follow-up</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <Input
            placeholder="Título do follow-up"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <Input
            placeholder="Nome do cliente ou empresa"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {Object.entries(CHANNEL_LABELS).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <Textarea
            placeholder="Notas ou roteiro de abordagem..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          <Button
            onClick={handleAdd}
            className="w-full"
            disabled={!title.trim() || !dueDate || saving}
          >
            {saving ? "Agendando..." : "Agendar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Followup() {
  const [followups, setFollowups] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const { toast } = useToast();

  const businessId = getBusinessId();

  async function loadFollowups() {
    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        setFollowups([]);
        return;
      }

      const { data, error } = await supabase
        .from("followups")
        .select("*")
        .eq("business_id", businessId)
        .order("due_date", { ascending: true });

      if (error) throw error;

      setFollowups(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Erro ao carregar follow-ups:", error);

      toast({
        title: "Erro ao carregar follow-ups",
        description:
          error?.message ||
          "Verifique se a tabela followups existe no Supabase.",
        variant: "destructive",
      });

      setFollowups([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadFollowups();
  }, []);

  async function createFollowup(payload: any) {
    try {
      const { error } = await supabase.from("followups").insert(payload);

      if (error) throw error;

      toast({ title: "Follow-up agendado!" });
      await loadFollowups();
    } catch (error: any) {
      toast({
        title: "Erro ao criar follow-up",
        description: error?.message,
        variant: "destructive",
      });
    }
  }

  async function toggleStatus(item: any) {
    const nextStatus = (item.status || "pending") === "done" ? "pending" : "done";

    try {
      const { error } = await supabase
        .from("followups")
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) throw error;

      setFollowups((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: nextStatus } : f
        )
      );
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar follow-up",
        description: error?.message,
        variant: "destructive",
      });
    }
  }

  async function deleteFollowup(id: string) {
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

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return followups;

    return followups.filter((item) =>
      [
        item.title,
        item.client_name,
        item.notes,
        item.channel,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [followups, search]);

  const pending = filtered.filter((f) => (f.status || "pending") === "pending");
  const done = filtered.filter((f) => f.status === "done");

  const overdue = pending.filter((f) => isOverdue(getDateValue(f)));
  const today = pending.filter((f) => isToday(getDateValue(f)));
  const upcoming = pending.filter((f) => {
    const date = getDateValue(f);
    return !isOverdue(date) && !isToday(date);
  });

  function renderCard(item: any) {
    const status = item.status || "pending";
    const dueDate = getDateValue(item);

    return (
      <Card
        key={item.id}
        className={`border-white/10 bg-white/[0.03] hover:bg-white/[0.055] transition ${
          status === "done" ? "opacity-60" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <button
                type="button"
                onClick={() => toggleStatus(item)}
                className={`mt-0.5 h-6 w-6 rounded-full border flex items-center justify-center shrink-0 ${
                  status === "done"
                    ? "border-emerald-400 bg-emerald-400/20"
                    : "border-muted-foreground hover:border-cyan-300"
                }`}
              >
                {status === "done" && (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                )}
              </button>

              <div className="min-w-0">
                <p
                  className={`font-bold text-sm ${
                    status === "done"
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {item.title || "Follow-up sem título"}
                </p>

                {item.client_name && (
                  <p className="text-xs text-cyan-300 mt-1">
                    {item.client_name}
                  </p>
                )}

                {item.notes && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {item.notes}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant="secondary" className="gap-1">
                    {getChannelIcon(item.channel)}
                    {CHANNEL_LABELS[item.channel] || "Outro"}
                  </Badge>

                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(dueDate)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => deleteFollowup(item.id)}
              className="text-muted-foreground hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
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
      <div className="rounded-3xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/10 via-white/[0.03] to-transparent p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-[0.25em]">
              <CalendarCheck className="h-4 w-4" />
              NXA Follow-up Center
            </div>

            <h1 className="text-3xl font-black tracking-tight mt-2">
              Follow-ups comerciais
            </h1>

            <p className="text-sm text-muted-foreground mt-1">
              Organize retornos, contatos pendentes e próximas ações.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={loadFollowups} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>

            <AddFollowupDialog onAdd={createFollowup} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Em atraso</p>
            <p className="text-3xl font-black text-red-400 mt-1">
              {overdue.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Hoje</p>
            <p className="text-3xl font-black text-yellow-400 mt-1">
              {today.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-cyan-500/10 border-cyan-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Próximos</p>
            <p className="text-3xl font-black text-cyan-300 mt-1">
              {upcoming.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Concluídos</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">
              {done.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Input
        placeholder="Buscar follow-up, cliente, canal, notas..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-black/20"
      />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Carregando follow-ups...
        </div>
      ) : (
        <div className="space-y-8">
          {renderGroup(
            "Em atraso",
            overdue,
            <AlertCircle className="h-4 w-4" />,
            "text-red-400"
          )}

          {renderGroup(
            "Hoje",
            today,
            <CalendarCheck className="h-4 w-4" />,
            "text-yellow-400"
          )}

          {renderGroup(
            "Próximos",
            upcoming,
            <Clock className="h-4 w-4" />,
            "text-cyan-300"
          )}

          {renderGroup(
            "Concluídos",
            done,
            <Check className="h-4 w-4" />,
            "text-muted-foreground"
          )}

          {!filtered.length && (
            <Card className="bg-white/[0.03] border-white/10 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarCheck className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="font-bold">Nenhum follow-up encontrado.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Crie seu primeiro follow-up no botão acima.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default Followup;