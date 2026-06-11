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
} from "lucide-react";

const PLANS = [
  {
    id: "starter",
    label: "Starter",
    credits: 500,
    price: "R$ 97",
    icon: <Zap className="h-5 w-5" />,
    color: "hover:border-primary/60",
    popular: false,
  },
  {
    id: "growth",
    label: "Growth",
    credits: 2000,
    price: "R$ 297",
    icon: <Sparkles className="h-5 w-5" />,
    color: "border-primary/40 hover:border-primary",
    popular: true,
  },
  {
    id: "scale",
    label: "Scale",
    credits: 10000,
    price: "R$ 997",
    icon: <Crown className="h-5 w-5" />,
    color: "hover:border-primary/60",
    popular: false,
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
  return type || "Movimento";
}

function getTransactionIcon(type: string) {
  if (type === "credit") return <ArrowDownLeft className="h-3.5 w-3.5" />;
  return <ArrowUpRight className="h-3.5 w-3.5" />;
}

export function Creditos() {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [credits, setCredits] = React.useState(0);
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [buyingPlan, setBuyingPlan] = React.useState<string | null>(null);

  const { toast } = useToast();

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

  async function handleBuyPlan(plan: any) {
    if (!userId) {
      toast({
        title: "Login necessário",
        description: "Entre na sua conta antes de comprar créditos.",
        variant: "destructive",
      });
      return;
    }

    setBuyingPlan(plan.id);

    try {
      const { data, error } = await supabase.functions.invoke("rapid-handler", {
        body: {
          plan_id: plan.id,
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

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Coins className="h-7 w-7 text-primary" />
            Créditos
          </h1>

          <p className="text-muted-foreground mt-1">
            Gerencie seus créditos para buscas, IA e análises comerciais.
          </p>
        </div>

        <Button variant="outline" onClick={loadCredits} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-6">
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
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-3">Comprar créditos</h2>

        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative bg-card/50 border-card-border transition ${plan.color}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-4">
                  Mais escolhido
                </Badge>
              )}

              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan.icon}
                  {plan.label}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-black">{plan.price}</p>
                  <p className="text-sm text-muted-foreground">
                    {plan.credits.toLocaleString("pt-BR")} créditos
                  </p>
                </div>

                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleBuyPlan(plan)}
                  disabled={buyingPlan === plan.id || !userId}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {buyingPlan === plan.id ? "Abrindo..." : "Comprar créditos"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
                const isCredit = item.type === "credit";

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