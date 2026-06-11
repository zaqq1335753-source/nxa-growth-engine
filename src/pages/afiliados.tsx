import * as React from "react";
import {
  useGetAffiliateProfile,
  useListConversions,
} from "@workspace/api-client-react";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function toArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.conversions)) return value.conversions;
  return [];
}

function getObject(value: any) {
  if (!value) return {};
  if (value?.data && !Array.isArray(value.data)) return value.data;
  if (value?.profile) return value.profile;
  if (value?.affiliate) return value.affiliate;
  return value;
}

function formatCurrency(value: any) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function formatDate(value: any) {
  const date = new Date(value || Date.now());

  if (Number.isNaN(date.getTime())) {
    return "Data não informada";
  }

  return date.toLocaleDateString("pt-BR");
}

export default function Afiliados() {
  const { data: affiliateRaw, isLoading } = useGetAffiliateProfile();
  const { data: conversionsRaw } = useListConversions();
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const affiliate = React.useMemo(() => getObject(affiliateRaw), [affiliateRaw]);
  const conversions = React.useMemo(() => toArray(conversionsRaw), [conversionsRaw]);

  const totalEarnings = React.useMemo(() => {
    const fromProfile =
      affiliate?.totalEarnings ??
      affiliate?.total_earnings ??
      affiliate?.earnings ??
      null;

    if (fromProfile !== null && fromProfile !== undefined) {
      return Number(fromProfile || 0);
    }

    return conversions.reduce(
      (sum: number, conversion: any) =>
        sum + Number(conversion.commission || conversion.amount || 0),
      0
    );
  }, [affiliate, conversions]);

  const totalReferrals =
    affiliate?.totalReferrals ??
    affiliate?.total_referrals ??
    affiliate?.referrals ??
    0;

  const totalConversions =
    affiliate?.conversions ??
    affiliate?.totalConversions ??
    affiliate?.total_conversions ??
    conversions.length;

  const referralCode =
    affiliate?.referralCode ||
    affiliate?.referral_code ||
    affiliate?.code ||
    "";

  const refUrl = referralCode ? `https://nxa.com.br/ref/${referralCode}` : "";

  async function copyLink() {
    if (!refUrl) {
      toast({ title: "Link de indicação ainda não disponível." });
      return;
    }

    await navigator.clipboard.writeText(refUrl);
    setCopied(true);
    toast({ title: "Link copiado!" });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <LinkIcon className="h-7 w-7 text-primary" />
          Programa de Afiliados
        </h1>

        <p className="text-muted-foreground mt-1">
          Indique amigos e ganhe comissões recorrentes.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Carregando...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Indicações</p>
                    <p className="text-2xl font-black text-primary">
                      {totalReferrals}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-card-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Conversões</p>
                    <p className="text-2xl font-black text-emerald-400">
                      {totalConversions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-card-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Comissões</p>
                    <p className="text-2xl font-black text-yellow-400">
                      {formatCurrency(totalEarnings)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 backdrop-blur border-card-border">
            <CardHeader>
              <CardTitle className="text-base">Seu Link de Indicação</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-4 py-2.5">
                  <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-mono text-primary truncate">
                    {refUrl || "nxa.com.br/ref/..."}
                  </span>
                </div>

                <Button onClick={copyLink} variant="outline" className="gap-2 shrink-0">
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    step: "1",
                    title: "Compartilhe",
                    desc: "Envie seu link para amigos e conhecidos",
                  },
                  {
                    step: "2",
                    title: "Eles se cadastram",
                    desc: "Cada indicado acessa com seu link único",
                  },
                  {
                    step: "3",
                    title: "Você ganha",
                    desc: "30% de comissão recorrente por cada plano pago",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="text-center p-3 rounded-xl bg-muted/30 border border-border"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center mx-auto mb-2">
                      {item.step}
                    </div>
                    <p className="text-xs font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-card-border">
            <CardHeader>
              <CardTitle className="text-base">Histórico de Conversões</CardTitle>
            </CardHeader>

            <CardContent>
              {conversions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Gift className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma conversão ainda.
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Compartilhe seu link para começar a ganhar!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversions.map((conversion: any, index: number) => {
                    const status = conversion.status || "pending";
                    const referredUserName =
                      conversion.referredUserName ||
                      conversion.referred_user_name ||
                      conversion.userName ||
                      conversion.user_name ||
                      "Usuário";

                    const commission = conversion.commission || conversion.amount || 0;

                    const createdAt =
                      conversion.createdAt ||
                      conversion.created_at ||
                      conversion.date;

                    return (
                      <div
                        key={conversion.id || index}
                        className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium">{referredUserName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(createdAt)}
                            {conversion.plan && ` · Plano ${conversion.plan}`}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-400">
                            +{formatCurrency(commission)}
                          </p>

                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              status === "paid"
                                ? "text-emerald-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {status === "paid" ? "Pago" : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}