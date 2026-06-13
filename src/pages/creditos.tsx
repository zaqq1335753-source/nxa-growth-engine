import * as React from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Zap,
  Crown,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Rocket,
  Repeat,
  Wallet,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Target,
  Infinity,
} from "lucide-react";

/**
 * IMPORTANTE:
 * Os links reais da InfinitePay devem ser configurados no backend / Supabase Function
 * ou substituídos nos campos checkoutUrl abaixo, caso você queira usar link direto.
 *
 * Modelo recomendado:
 * - Mensalidade como produto principal.
 * - Créditos inclusos todo mês.
 * - Recargas avulsas como upsell quando o cliente precisar de mais volume.
 *
 * Assim o NXA não vira apenas "venda de lista".
 * Ele vira uma plataforma recorrente de inteligência comercial.
 */

type CreditProduct = {
  id: string;
  label: string;
  subtitle: string;
  credits: number;
  price: string;
  amountCents: number;
  billing: "monthly" | "one_time";
  type: "subscription" | "topup";
  cta: string;
  icon: React.ReactNode;
  color: string;
  popular: boolean;
  badge?: string;
  checkoutUrl?: string;
  benefits: string[];
  bestFor: string;
  unitLabel: string;
};

const SUBSCRIPTION_PLANS: CreditProduct[] = [
  {
    id: "founder",
    label: "Fundador",
    subtitle: "Oferta especial para os primeiros clientes",
    credits: 500,
    price: "R$ 97",
    amountCents: 9700,
    billing: "monthly",
    type: "subscription",
    cta: "Assinar Plano Fundador",
    icon: <Zap className="h-5 w-5" />,
    color: "border-primary/50 bg-primary/[0.06] hover:border-primary",
    popular: true,
    badge: "Melhor para vender hoje",
    checkoutUrl: "", // Cole aqui o link da InfinitePay do plano R$97/mês, se quiser link direto.
    benefits: [
      "500 créditos mensais",
      "Busca Inteligente liberada",
      "Radar de oportunidades",
      "Lead Profile com IA",
      "CRM e Follow-up inclusos",
      "Preço especial enquanto permanecer assinante",
    ],
    bestFor: "Primeiros clientes, autônomos e pequenos times comerciais.",
    unitLabel: "mensais",
  },
  {
    id: "growth_monthly",
    label: "Growth",
    subtitle: "Para quem prospecta toda semana",
    credits: 1500,
    price: "R$ 197",
    amountCents: 19700,
    billing: "monthly",
    type: "subscription",
    cta: "Assinar Growth",
    icon: <Sparkles className="h-5 w-5" />,
    color: "hover:border-primary/60",
    popular: false,
    checkoutUrl: "", // Cole aqui o link da InfinitePay do plano R$197/mês.
    benefits: [
      "1.500 créditos mensais",
      "Score avançado por oferta",
      "IA Insights Premium",
      "Priorização de leads quentes",
      "Mensagens comerciais sugeridas",
      "Histórico e análises por usuário",
    ],
    bestFor: "Agências, SDRs e vendedores com rotina ativa de prospecção.",
    unitLabel: "mensais",
  },
  {
    id: "scale_monthly",
    label: "Scale",
    subtitle: "Volume alto para operação comercial",
    credits: 5000,
    price: "R$ 397",
    amountCents: 39700,
    billing: "monthly",
    type: "subscription",
    cta: "Assinar Scale",
    icon: <Crown className="h-5 w-5" />,
    color: "hover:border-primary/60",
    popular: false,
    checkoutUrl: "", // Cole aqui o link da InfinitePay do plano R$397/mês.
    benefits: [
      "5.000 créditos mensais",
      "Tudo liberado na plataforma",
      "Análises de compatibilidade em escala",
      "Carteira comercial com CRM",
      "Follow-up estruturado",
      "Melhor custo por crédito",
    ],
    bestFor: "Times comerciais, infoprodutores, consultorias e operações B2B.",
    unitLabel: "mensais",
  },
];

const TOPUP_PACKS: CreditProduct[] = [
  {
    id: "topup_100",
    label: "Recarga 100",
    subtitle: "Para testar mais uma campanha",
    credits: 100,
    price: "R$ 29",
    amountCents: 2900,
    billing: "one_time",
    type: "topup",
    cta: "Comprar 100 créditos",
    icon: <Wallet className="h-5 w-5" />,
    color: "hover:border-primary/60",
    popular: false,
    checkoutUrl: "", // Cole aqui o link da InfinitePay da recarga R$29.
    benefits: [
      "100 créditos extras",
      "Uso imediato após confirmação",
      "Ideal para completar uma busca",
    ],
    bestFor: "Cliente que acabou os créditos e quer continuar prospectando.",
    unitLabel: "extras",
  },
  {
    id: "topup_500",
    label: "Recarga 500",
    subtitle: "Mais volume para uma campanha completa",
    credits: 500,
    price: "R$ 97",
    amountCents: 9700,
    billing: "one_time",
    type: "topup",
    cta: "Comprar 500 créditos",
    icon: <Rocket className="h-5 w-5" />,
    color: "border-primary/40 hover:border-primary",
    popular: true,
    badge: "Upsell recomendado",
    checkoutUrl: "", // Cole aqui o link da InfinitePay da recarga R$97.
    benefits: [
      "500 créditos extras",
      "Perfeito para uma lista segmentada",
      "Mantém o cliente usando sem mudar de plano",
    ],
    bestFor: "Cliente que já validou a plataforma e quer rodar mais buscas.",
    unitLabel: "extras",
  },
  {
    id: "topup_1000",
    label: "Recarga 1.000",
    subtitle: "Melhor custo para acelerar prospecção",
    credits: 1000,
    price: "R$ 167",
    amountCents: 16700,
    billing: "one_time",
    type: "topup",
    cta: "Comprar 1.000 créditos",
    icon: <TrendingUp className="h-5 w-5" />,
    color: "hover:border-primary/60",
    popular: false,
    checkoutUrl: "", // Cole aqui o link da InfinitePay da recarga R$167.
    benefits: [
      "1.000 créditos extras",
      "Melhor custo por crédito avulso",
      "Ideal para operação comercial mais agressiva",
    ],
    bestFor: "Cliente que quer prospectar várias cidades ou nichos.",
    unitLabel: "extras",
  },
];

const ALL_PRODUCTS = [...SUBSCRIPTION_PLANS, ...TOPUP_PACKS];

const CREDIT_USAGE_RULES = [
  {
    icon: <Target className="h-4 w-4" />,
    title: "Lead encontrado",
    cost: "1 crédito",
    description: "Cada empresa encontrada e salva na busca inteligente.",
  },
  {
    icon: <Brain className="h-4 w-4" />,
    title: "Lead Profile IA",
    cost: "2 créditos",
    description: "Análise de compatibilidade entre a oferta e o perfil do lead.",
  },
  {
    icon: <Sparkles className="h-4 w-4" />,
    title: "Mensagem pronta",
    cost: "1 crédito",
    description: "Sugestão de abordagem comercial personalizada por IA.",
  },
  {
    icon: <Infinity className="h-4 w-4" />,
    title: "Enriquecimento premium",
    cost: "3 créditos",
    description: "Busca avançada por sinais digitais, site, redes e oportunidades.",
  },
];

function formatDate(date: any) {
  if (!date) return "Data não informada";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Data não informada";

  return parsed.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getTransactionLabel(type: string) {
  if (type === "credit") return "Recarga";
  if (type === "debit") return "Uso";
  if (type === "subscription") return "Mensalidade";
  if (type === "topup") return "Recarga avulsa";
  return type || "Movimento";
}

function getTransactionIcon(type: string) {
  if (type === "credit" || type === "subscription" || type === "topup") {
    return <ArrowDownLeft className="h-3.5 w-3.5" />;
  }

  return <ArrowUpRight className="h-3.5 w-3.5" />;
}

function getCreditHealth(credits: number) {
  if (credits <= 0) {
    return {
      label: "Sem créditos",
      description: "Faça uma recarga ou assine um plano para continuar prospectando.",
      tone: "text-red-400",
      icon: <AlertTriangle className="h-4 w-4" />,
    };
  }

  if (credits < 100) {
    return {
      label: "Saldo baixo",
      description: "Você está próximo de ficar sem créditos. Recomendamos uma recarga.",
      tone: "text-amber-400",
      icon: <AlertTriangle className="h-4 w-4" />,
    };
  }

  return {
    label: "Operação ativa",
    description: "Você tem créditos disponíveis para buscar, analisar e priorizar leads.",
    tone: "text-emerald-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
  };
}

function getCostPerCredit(product: CreditProduct) {
  if (!product.credits) return "R$ 0,00";
  const value = product.amountCents / 100 / product.credits;

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getBillingLabel(product: CreditProduct) {
  if (product.billing === "monthly") return "por mês";
  return "pagamento único";
}

export function Creditos() {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [credits, setCredits] = React.useState(0);
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [buyingPlan, setBuyingPlan] = React.useState<string | null>(null);

  const { toast } = useToast();

  const creditHealth = React.useMemo(() => getCreditHealth(credits), [credits]);

  async function loadCredits() {
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setUserId(null);
        setCredits(0);
        setTransactions([]);
        return;
      }

      setUserId(user.id);

      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle();

      if (walletError) throw walletError;

      if (!walletData) {
        const { error: insertError } = await supabase.from("wallets").insert({
          user_id: user.id,
          credits: 0,
        });

        if (insertError) throw insertError;
        setCredits(0);
      } else {
        setCredits(Number(walletData.credits || 0));
      }

      const { data: txData, error: txError } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (txError) throw txError;

      setTransactions(Array.isArray(txData) ? txData : []);
    } catch (error: any) {
      console.error("Erro ao carregar créditos:", error);

      toast({
        title: "Erro ao carregar créditos",
        description: error?.message || "Erro ao buscar carteira.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadCredits();
  }, []);

  async function handleBuyPlan(product: CreditProduct) {
    if (!userId) {
      toast({
        title: "Login necessário",
        description: "Entre na sua conta antes de comprar créditos.",
        variant: "destructive",
      });
      return;
    }

    setBuyingPlan(product.id);

    try {
      /**
       * Se você quiser usar links diretos da InfinitePay no front, preencha
       * checkoutUrl nos produtos acima. Enquanto estiver vazio, o código usa
       * a Supabase Function rapid-handler para criar/retornar o checkout.
       */
      if (product.checkoutUrl) {
        window.location.href = product.checkoutUrl;
        return;
      }

      const { data, error } = await supabase.functions.invoke("rapid-handler", {
        body: {
          plan_id: product.id,
          product_id: product.id,
          product_type: product.type,
          billing: product.billing,
          credits: product.credits,
          amount_cents: product.amountCents,
          label: product.label,
        },
      });

      if (error) {
        console.error("Erro Supabase Function:", error);
        throw new Error(error.message || "Erro ao criar checkout.");
      }

      if (!data?.checkout_url) {
        throw new Error(
          data?.error ||
            data?.details ||
            "A função respondeu, mas não retornou checkout_url."
        );
      }

      window.location.href = data.checkout_url;
    } catch (error: any) {
      console.error("Erro ao criar checkout InfinitePay:", error);

      toast({
        title: "Erro ao criar checkout",
        description: error?.message || "Não foi possível iniciar o pagamento.",
        variant: "destructive",
      });
    } finally {
      setBuyingPlan(null);
    }
  }

  function renderProductCard(product: CreditProduct) {
    return (
      <Card
        key={product.id}
        className={`relative overflow-hidden bg-card/50 border-card-border transition ${product.color}`}
      >
        {product.popular && (
          <Badge className="absolute top-4 right-4">
            {product.badge || "Mais escolhido"}
          </Badge>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              {product.icon}
            </div>

            <div className="pr-24">
              <CardTitle className="leading-tight">{product.label}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {product.subtitle}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black">{product.price}</p>
              <span className="text-xs text-muted-foreground mb-1.5">
                {getBillingLabel(product)}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mt-1">
              {product.credits.toLocaleString("pt-BR")} créditos{" "}
              {product.unitLabel}
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              Aproximadamente {getCostPerCredit(product)} por crédito
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs font-bold text-muted-foreground mb-2">
              Indicado para:
            </p>
            <p className="text-sm leading-relaxed">{product.bestFor}</p>
          </div>

          <div className="space-y-2">
            {product.benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <Button
            className="w-full"
            variant={product.popular ? "default" : "outline"}
            onClick={() => handleBuyPlan(product)}
            disabled={buyingPlan === product.id || !userId}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {buyingPlan === product.id ? "Abrindo..." : product.cta}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-3 border-primary/30 text-primary">
            Modelo recomendado: mensalidade + créditos extras
          </Badge>

          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Coins className="h-7 w-7 text-primary" />
            Créditos
          </h1>

          <p className="text-muted-foreground mt-1 max-w-3xl">
            Gerencie créditos, mensalidades e recargas para buscas, IA,
            enriquecimento e análises comerciais. A assinatura mantém o acesso
            ativo e as recargas permitem escalar campanhas quando precisar.
          </p>
        </div>

        <Button variant="outline" onClick={loadCredits} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <Card className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-primary/20 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
              <div>
                <p className="text-sm text-muted-foreground">Saldo disponível</p>

                <div className="flex items-end gap-3 mt-2">
                  <span className="text-6xl font-black text-primary">
                    {loading ? "..." : credits}
                  </span>
                  <span className="text-muted-foreground mb-2">créditos</span>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Usuário: {userId || "não autenticado"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-4 md:max-w-sm">
                <div className={`flex items-center gap-2 font-bold ${creditHealth.tone}`}>
                  {creditHealth.icon}
                  {creditHealth.label}
                </div>

                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {creditHealth.description}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                  Cada usuário visualiza apenas a própria carteira.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Estratégia comercial
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              A assinatura gera receita recorrente e mantém o cliente dentro da
              plataforma todos os meses.
            </p>
            <p>
              As recargas funcionam como upsell quando o cliente aumenta o
              volume de buscas e campanhas.
            </p>
            <p className="text-foreground font-semibold">
              Venda o NXA como inteligência comercial por IA, não como lista de
              contatos.
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-3">
          <div>
            <h2 className="text-xl font-bold">Planos mensais</h2>
            <p className="text-sm text-muted-foreground">
              Melhor opção para criar previsibilidade e retenção.
            </p>
          </div>

          <Badge variant="secondary" className="w-fit">
            <Repeat className="h-3.5 w-3.5 mr-1" />
            Créditos renovados mensalmente
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {SUBSCRIPTION_PLANS.map(renderProductCard)}
        </div>
      </div>

      <div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-3">
          <div>
            <h2 className="text-xl font-bold">Recargas extras</h2>
            <p className="text-sm text-muted-foreground">
              Upsell para clientes que acabarem os créditos do plano.
            </p>
          </div>

          <Badge variant="outline" className="w-fit border-primary/30 text-primary">
            Compra avulsa
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {TOPUP_PACKS.map(renderProductCard)}
        </div>
      </div>

      <Card className="bg-card/50 border-card-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Como os créditos são consumidos
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            {CREDIT_USAGE_RULES.map((rule) => (
              <div
                key={rule.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  {rule.icon}
                </div>

                <p className="font-bold">{rule.title}</p>
                <p className="text-sm font-black text-primary mt-1">
                  {rule.cost}
                </p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {rule.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-card-border">
        <CardHeader>
          <CardTitle>Histórico de créditos</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Carregando histórico...
            </p>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma movimentação encontrada.
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((item) => {
                const isCredit =
                  item.type === "credit" ||
                  item.type === "subscription" ||
                  item.type === "topup";

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                          isCredit
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {getTransactionIcon(item.type)}
                      </div>

                      <div>
                        <p className="text-sm font-bold">
                          {item.description || getTransactionLabel(item.type)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`font-black ${
                        isCredit ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {Number(item.amount) > 0 ? "+" : ""}
                      {item.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Creditos;
