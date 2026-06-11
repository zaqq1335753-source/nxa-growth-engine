import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Bell, Shield, Key, Save, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Configuracoes() {
  const { toast } = useToast();
  const [saved, setSaved] = React.useState(false);

  const [profile, setProfile] = React.useState({
    name: "Vendedor Elite",
    email: "vendedor@nxa.com.br",
    company: "NXA Growth",
    phone: "(11) 99999-9999",
  });

  const [notifications, setNotifications] = React.useState({
    followupReminder: true,
    newLead: true,
    creditLow: true,
    weeklyReport: false,
  });

  function handleSave() {
    setSaved(true);
    toast({ title: "Configurações salvas com sucesso!" });
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-7 w-7 text-primary" />
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">Gerencie sua conta e preferências.</p>
      </div>

      <Card className="bg-card/50 backdrop-blur border-card-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={profile.company}
                onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur border-card-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "followupReminder", label: "Lembretes de follow-up", desc: "Notificar quando um follow-up estiver pendente" },
            { key: "newLead", label: "Novo lead capturado", desc: "Notificar quando leads são adicionados via busca" },
            { key: "creditLow", label: "Créditos baixos", desc: "Alertar quando saldo cair abaixo de 20 créditos" },
            { key: "weeklyReport", label: "Relatório semanal", desc: "Receber resumo de performance toda segunda-feira" },
          ].map((item, i, arr) => (
            <React.Fragment key={item.key}>
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <Switch
                  checked={notifications[item.key as keyof typeof notifications]}
                  onCheckedChange={(v) => setNotifications((n) => ({ ...n, [item.key]: v }))}
                />
              </div>
              {i < arr.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur border-card-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            Integrações de API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Google Places API", status: "Conectado", color: "text-emerald-400" },
            { label: "OpenAI API", status: "Conectado", color: "text-emerald-400" },
            { label: "WhatsApp Business", status: "Não configurado", color: "text-muted-foreground" },
          ].map((api) => (
            <div key={api.label} className="flex items-center justify-between py-1">
              <span className="text-sm">{api.label}</span>
              <span className={`text-xs font-medium ${api.color}`}>{api.status}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur border-card-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nova senha</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-1.5">
            <Label>Confirmar nova senha</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button variant="outline" size="sm">Alterar senha</Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2 min-w-32">
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Salvo!" : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}
