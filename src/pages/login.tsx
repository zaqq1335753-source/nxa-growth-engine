import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (mounted && data.session) {
        navigate("/");
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const validateFields = () => {
    if (!email.trim()) {
      setMessage("Informe seu e-mail.");
      return false;
    }

    if (!password.trim()) {
      setMessage("Informe sua senha.");
      return false;
    }

    if (password.length < 6) {
      setMessage("A senha precisa ter pelo menos 6 caracteres.");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateFields()) return;

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setMessage("E-mail ou senha inválidos.");
      return;
    }

    navigate("/");
  };

  const handleRegister = async () => {
    if (!validateFields()) return;

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.session) {
      navigate("/");
      return;
    }

    setMessage("Conta criada. Faça login ou confirme seu e-mail, se necessário.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/70 backdrop-blur p-8 shadow-2xl">
        <div className="mb-8">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold mb-4">
            NX
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Entrar</h1>

          <p className="text-sm text-muted-foreground mt-2">
            Acesse o NXA Growth Engine para gerenciar leads, CRM e buscas inteligentes.
          </p>
        </div>

        {message && (
          <div className="mb-4 rounded-xl border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
            {message}
          </div>
        )}

        <div className="space-y-3">
          <input
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            placeholder="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <input
            type="password"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            placeholder="Senha"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleLogin();
              }
            }}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm font-bold hover:bg-muted disabled:opacity-60"
          >
            {loading ? "Processando..." : "Criar conta"}
          </button>
        </div>
      </div>
    </div>
  );
}