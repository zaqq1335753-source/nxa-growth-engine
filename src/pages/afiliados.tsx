import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Link as LinkIcon,
  Copy,
  Check,
  Users,
  DollarSign,
  TrendingUp,
  Gift,
  Wallet,
  Target,
  MousePointerClick,
  Sparkles,
  QrCode,
  Trophy,
  Building2,
  CalendarDays,
  ArrowUpRight,
  CircleDollarSign,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

export default function Afiliados() {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const affiliate = {
    code: "NXA-HEBERTT",
    link: "https://app.nxa.ai/ref/nxa-hebertt",
    monthCommission: 1247,
    availableBalance: 840,
    nextPayment: "15/07/2026",
    clicks: 245,
    leads: 34,
    demos: 12,
    clients: 5,
    conversionRate: 8.4,
    goal: 10,
    goalCurrent: 7,
    level: "Ouro",
    nextLevel: "Diamond",
  };

  const pipeline = [
    {
      company: "Clínica Estética Prime",
      status: "Negociando",
      chance: 80,
      plan: "Premium",
      value: 147,
    },
    {
      company: "Barbearia Alpha",
      status: "Demonstração marcada",
      chance: 65,
      plan: "Standard",
      value: 97,
    },
    {
      company: "Studio Bella",
      status: "Interessado",
      chance: 45,
      plan: "Premium",
      value: 147,
    },
  ];

  const commissions = [
    {
      company: "Clínica Luna",
      plan: "Premium",
      date: "24/06",
      value: 147,
      status: "Confirmada",
    },
    {
      company: "Barbearia Prime",
      plan: "Standard",
      date: "22/06",
      value: 97,
      status: "Pendente",
    },
    {
      company: "Studio Bella",
      plan: "Premium",
      date: "20/06",
      value: 147,
      status: "Confirmada",
    },
  ];

  const suggestions = [
    "15 clínicas na sua cidade com baixa presença digital",
    "8 barbearias que ainda atendem manualmente pelo WhatsApp",
    "12 empresas com alto potencial para automação de agenda",
  ];

  const progress = Math.min(
    100,
    Math.round((affiliate.goalCurrent / affiliate.goal) * 100)
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(affiliate.link);
      setCopied(true);
      toast({ title: "Link copiado!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-background p-6">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
              Centro de Receita
            </Badge>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <LinkIcon className="h-8 w-8 text-primary" />
              Programa de Afiliados
            </h1>

            <p className="text-muted-foreground mt-2 max-w-2xl">
              Indique empresas para a NXA, acompanhe o funil de vendas e veja
              suas comissões em tempo real.
            </p>
          </div>

          <Button className="gap-2 w-fit">
            <Zap className="h-4 w-4" />
            Gerar lista com IA
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/15 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Comissão do mês</p>
            <p className="text-3xl font-black text-primary mt-1">
              {formatCurrency(affiliate.monthCommission)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Próximo pagamento: {affiliate.nextPayment}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-card-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Saldo disponível</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">
              {formatCurrency(affiliate.availableBalance)}
            </p>
            <Button variant="outline" size="sm" className="mt-3 gap-2">
              <Wallet className="h-4 w-4" />
              Solicitar PIX
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-card-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nível atual</p>
                <p className="text-3xl font-black text-yellow-400 mt-1">
                  {affiliate.level}
                </p>
              </div>
              <Trophy className="h-10 w-10 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Faltam 3 clientes para o nível {affiliate.nextLevel}.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {[
          {
            label: "Cliques",
            value: affiliate.clicks,
            icon: MousePointerClick,
            color: "text-blue-400",
          },
          {
            label: "Leads",
            value: affiliate.leads,
            icon: Users,
            color: "text-primary",
          },
          {
            label: "Demos",
            value: affiliate.demos,
            icon: CalendarDays,
            color: "text-purple-400",
          },
          {
            label: "Clientes",
            value: affiliate.clients,
            icon: Building2,
            color: "text-emerald-400",
          },
          {
            label: "Conversão",
            value: `${affiliate.conversionRate}%`,
            icon: TrendingUp,
            color: "text-yellow-400",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="bg-card/50 border-card-border">
              <CardContent className="pt-5">
                <Icon className={`h-5 w-5 ${item.color}`} />
                <p className="text-xs text-muted-foreground mt-3">
                  {item.label}
                </p>
                <p className={`text-2xl font-black ${item.color}`}>
                  {item.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="bg-card/50 backdrop-blur border-card-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              Link inteligente de indicação
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-4 py-3">
                <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-mono text-primary truncate">
                  {affiliate.link}
                </span>
              </div>

              <Button
                onClick={copyLink}
                variant="outline"
                className="gap-2 shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copiado!" : "Copiar"}
              </Button>

              <Button variant="outline" className="gap-2 shrink-0">
                <QrCode className="h-4 w-4" />
                QR Code
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Código</p>
                <p className="text-lg font-black text-primary">
                  {affiliate.code}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Cliques</p>
                <p className="text-lg font-black">{affiliate.clicks}</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Conversão</p>
                <p className="text-lg font-black text-emerald-400">
                  {affiliate.conversionRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-card-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Meta do mês
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-black">
                  {affiliate.goalCurrent}/{affiliate.goal}
                </p>
                <p className="text-xs text-muted-foreground">
                  clientes ativados
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {progress}%
              </Badge>
            </div>

            <div className="mt-4 h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Você está perto de bater a meta e liberar um bônus extra.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur border-card-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              IA de indicações
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {suggestions.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4"
              >
                <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}

            <Button className="w-full gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Gerar oportunidades agora
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-card-border">
          <CardHeader>
            <CardTitle className="text-base">Pipeline de afiliados</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {pipeline.map((item) => (
              <div
                key={item.company}
                className="rounded-xl border border-border bg-muted/30 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.company}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.status} • Plano {item.plan}
                    </p>
                  </div>

                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    {item.chance}%
                  </Badge>
                </div>

                <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${item.chance}%` }}
                  />
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  Comissão prevista: {formatCurrency(item.value)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-card-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-yellow-400" />
            Histórico de comissões
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {commissions.map((item) => (
              <div
                key={`${item.company}-${item.date}`}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-border bg-muted/30 p-4"
              >
                <div>
                  <p className="font-semibold">{item.company}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.date} • Plano {item.plan}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      item.status === "Confirmada"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    }
                  >
                    {item.status}
                  </Badge>

                  <p className="text-lg font-black text-yellow-400">
                    + {formatCurrency(item.value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur border-card-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Como ganhar mais
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                step: "1",
                title: "Compartilhe",
                desc: "Envie seu link para clínicas, salões, barbearias e empresas locais.",
              },
              {
                step: "2",
                title: "Acompanhe o funil",
                desc: "Veja quem clicou, virou lead, agendou demonstração e contratou.",
              },
              {
                step: "3",
                title: "Receba comissão",
                desc: "Quando o cliente ativar o plano, sua comissão entra no saldo.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center p-5 rounded-xl bg-muted/30 border border-border"
              >
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}