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
    totalReferrals: 0,
    totalConversions: 0,
    totalEarnings: 0,
    referralCode: "nxa",
  };

  const conversions: any[] = [];

  const refUrl = `https://nxa-growth-engine.vercel.app/ref/${affiliate.referralCode}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(refUrl);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <LinkIcon className="h-7 w-7 text-primary" />
          Programa de Afiliados
        </h1>

        <p className="text-muted-foreground mt-1">
          Indique clientes e acompanhe suas comissões.
        </p>
      </div>

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
                  {affiliate.totalReferrals}
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
                  {affiliate.totalConversions}
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
                  {formatCurrency(affiliate.totalEarnings)}
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
                {refUrl}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                step: "1",
                title: "Compartilhe",
                desc: "Envie seu link para empresas interessadas.",
              },
              {
                step: "2",
                title: "Cliente contrata",
                desc: "A indicação é vinculada ao seu código.",
              },
              {
                step: "3",
                title: "Você ganha",
                desc: "A comissão será registrada no painel.",
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
                Compartilhe seu link para começar a ganhar.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}