import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  Brain,
  Building2,
  CheckCircle2,
  Cpu,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Play,
  Radar,
  Sparkles,
  User,
  Users,
  Zap,
} from "lucide-react";

type AuthMode = "login" | "register";
type LoginTheme = "neon" | "deep" | "ice";

type OnboardingData = {
  fullName: string;
  companyName: string;
  phone: string;
  segment: string;
  city: string;
};

const initialOnboarding: OnboardingData = {
  fullName: "",
  companyName: "",
  phone: "",
  segment: "",
  city: "",
};

const activityFeed = [
  "IA analisando oportunidades comerciais...",
  "Radar identificando empresas ativas na região...",
  "Score de prioridade sendo calculado...",
  "Leads qualificados enviados ao CRM...",
  "Follow-ups inteligentes sendo preparados...",
];

const rotatingStats = [
  { label: "Leads rastreados", value: "+12.480" },
  { label: "Análises IA", value: "+3.920" },
  { label: "Empresas monitoradas", value: "24/7" },
];

const modules = [
  "Busca Inteligente",
  "Radar Comercial",
  "Lead Profile IA",
  "CRM Pipeline",
  "Follow-up",
  "Sistema de Créditos",
];

const benefits = [
  {
    icon: Radar,
    title: "Radar Inteligente",
    description: "Encontre empresas por nicho, cidade e oportunidade comercial.",
  },
  {
    icon: Brain,
    title: "IA Comercial",
    description: "Analise temperatura, argumentos, dores e próximos passos.",
  },
  {
    icon: Users,
    title: "CRM Integrado",
    description: "Organize prospecção, follow-up, pipeline e conversões.",
  },
];

const themeConfig = {
  neon: {
    name: "Neon",
    overlay: "from-[#020617]/92 via-[#06162a]/72 to-[#12051f]/58",
    card: "bg-[#061322]/76 border-cyan-300/24 shadow-[0_0_90px_rgba(0,217,255,0.20)]",
    accent: "from-[#00d9ff] via-[#7c4dff] to-[#ff2bd6]",
    softAccent: "from-cyan-400/18 via-violet-500/18 to-fuchsia-400/12",
    text: "text-cyan-200",
    glow: "shadow-[0_0_34px_rgba(0,217,255,0.22)]",
  },
  deep: {
    name: "Deep",
    overlay: "from-[#020617]/95 via-[#040816]/82 to-[#10051d]/62",
    card: "bg-[#070816]/82 border-violet-300/24 shadow-[0_0_90px_rgba(124,77,255,0.22)]",
    accent: "from-[#2563eb] via-[#7c3aed] to-[#a855f7]",
    softAccent: "from-blue-500/16 via-violet-500/18 to-fuchsia-500/10",
    text: "text-violet-200",
    glow: "shadow-[0_0_34px_rgba(124,77,255,0.22)]",
  },
  ice: {
    name: "Ice",
    overlay: "from-[#02111f]/95 via-[#082f49]/76 to-[#0f172a]/60",
    card: "bg-[#061827]/80 border-sky-300/25 shadow-[0_0_90px_rgba(56,189,248,0.22)]",
    accent: "from-[#22d3ee] via-[#38bdf8] to-[#818cf8]",
    softAccent: "from-cyan-300/18 via-sky-400/18 to-indigo-400/12",
    text: "text-sky-200",
    glow: "shadow-[0_0_34px_rgba(56,189,248,0.22)]",
  },
};

export default function Login() {
  const [, navigate] = useLocation();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [mode, setMode] = useState<AuthMode>("login");
  const [theme, setTheme] = useState<LoginTheme>("neon");
  const [showPassword, setShowPassword] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [feedIndex, setFeedIndex] = useState(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [onboarding, setOnboarding] =
    useState<OnboardingData>(initialOnboarding);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const currentTheme = themeConfig[theme];
  const isRegister = mode === "register";

  const progress = useMemo(() => {
    if (!isRegister) return 40;

    const fields = [
      email,
      password,
      onboarding.fullName,
      onboarding.companyName,
      onboarding.phone,
      onboarding.segment,
      onboarding.city,
    ];

    const filled = fields.filter((item) => item.trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [email, password, onboarding, isRegister]);

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
      if (session) navigate("/");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFeedIndex((current) => (current + 1) % activityFeed.length);
    }, 2800);

    return () => window.clearInterval(timer);
  }, []);

  const validateLoginFields = () => {
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

  const validateRegisterFields = () => {
    if (!validateLoginFields()) return false;

    if (!onboarding.fullName.trim()) {
      setMessage("Informe seu nome completo.");
      return false;
    }

    if (!onboarding.companyName.trim()) {
      setMessage("Informe o nome da empresa.");
      return false;
    }

    if (!onboarding.phone.trim()) {
      setMessage("Informe seu WhatsApp.");
      return false;
    }

    if (!onboarding.segment.trim()) {
      setMessage("Informe seu segmento de atuação.");
      return false;
    }

    if (!onboarding.city.trim()) {
      setMessage("Informe sua cidade principal.");
      return false;
    }

    return true;
  };

  const upsertUserProfile = async (userId: string) => {
    await supabase.from("user_profiles").upsert(
      {
        user_id: userId,
        full_name: onboarding.fullName.trim(),
        company_name: onboarding.companyName.trim(),
        phone: onboarding.phone.trim(),
        segment: onboarding.segment.trim(),
        city: onboarding.city.trim(),
        email: email.trim().toLowerCase(),
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  };

  const handleLogin = async () => {
    if (!validateLoginFields()) return;

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
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
    if (!validateRegisterFields()) return;

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: onboarding.fullName.trim(),
          company_name: onboarding.companyName.trim(),
          phone: onboarding.phone.trim(),
          segment: onboarding.segment.trim(),
          city: onboarding.city.trim(),
        },
      },
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    if (data.user?.id) await upsertUserProfile(data.user.id);

    setLoading(false);

    if (data.session) {
      navigate("/");
      return;
    }

    setMessage(
      "Conta criada. Confirme seu e-mail, se necessário, e depois faça login."
    );
  };

  const replayVideo = async () => {
    if (!videoRef.current) return;

    setVideoEnded(false);
    videoRef.current.currentTime = 0;

    try {
      await videoRef.current.play();
    } catch {
      setVideoEnded(true);
    }
  };

  const updateOnboarding = (field: keyof OnboardingData, value: string) => {
    setOnboarding((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <style>{`
        @keyframes nxaCircuit {
          0% { background-position: 0 0; }
          100% { background-position: 180px 180px; }
        }

        @keyframes nxaLine {
          0% { transform: translateX(-100%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }

        @keyframes nxaScan {
          0% { transform: translateY(-130%); opacity: 0; }
          18% { opacity: .38; }
          100% { transform: translateY(190%); opacity: 0; }
        }

        @keyframes nxaShine {
          0% { transform: translateX(-140%) rotate(12deg); opacity: 0; }
          30% { opacity: .55; }
          100% { transform: translateX(250%) rotate(12deg); opacity: 0; }
        }

        @keyframes nxaFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes nxaPulse {
          0%, 100% { opacity: .38; transform: scale(1); }
          50% { opacity: .9; transform: scale(1.08); }
        }

        @keyframes nxaDataFlow {
          0% { stroke-dashoffset: 360; opacity: 0; }
          18% { opacity: .9; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }

        @keyframes nxaCardGlow {
          0%, 100% { opacity: .45; }
          50% { opacity: .95; }
        }

        .nxa-grid {
          background-image:
            linear-gradient(rgba(0, 217, 255, .045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124, 77, 255, .045) 1px, transparent 1px);
          background-size: 42px 42px;
          animation: nxaCircuit 24s linear infinite;
        }

        .nxa-micro-grid {
          background-image:
            linear-gradient(rgba(0, 217, 255, .04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124, 77, 255, .035) 1px, transparent 1px);
          background-size: 18px 18px;
        }

        .nxa-chip::before,
        .nxa-chip::after {
          content: "";
          position: absolute;
          width: 46px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,217,255,.72), transparent);
        }

        .nxa-chip::before {
          left: -46px;
          top: 36%;
        }

        .nxa-chip::after {
          right: -46px;
          bottom: 34%;
        }
      `}</style>

      <div
        className="absolute inset-0 scale-105 bg-cover bg-center opacity-35 blur-[2px] transition-all duration-700"
        style={{ backgroundImage: "url('/nxa-hardware-bg.png')" }}
      />

      <div className="absolute inset-0 bg-[#020617]/70" />

      <div
        className={`absolute inset-0 bg-gradient-to-r ${currentTheme.overlay} transition-all duration-700`}
      />

      <div className="nxa-grid absolute inset-0 opacity-35" />

      <div className="absolute left-[-180px] top-[-160px] h-[560px] w-[560px] rounded-full bg-cyan-400/14 blur-3xl" />
      <div className="absolute right-[-180px] top-[-140px] h-[560px] w-[560px] rounded-full bg-blue-500/14 blur-3xl" />
      <div className="absolute bottom-[-260px] right-[-180px] h-[680px] w-[680px] rounded-full bg-violet-600/20 blur-3xl" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-[39%] hidden w-px bg-gradient-to-b from-transparent via-cyan-300/25 to-transparent lg:block" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
        <div className="absolute left-8 top-20 text-[180px] font-black tracking-[-0.12em] text-white lg:text-[270px]">
          NXA
        </div>
      </div>

      <svg
        className="pointer-events-none absolute inset-0 hidden h-full w-full opacity-35 lg:block"
        viewBox="0 0 1440 900"
        fill="none"
      >
        <path
          d="M92 690 H280 C330 690 330 620 380 620 H560 C610 620 610 550 660 550 H820"
          stroke="url(#nxaData1)"
          strokeWidth="1"
          strokeDasharray="12 18"
          style={{ animation: "nxaDataFlow 7s linear infinite" }}
        />
        <path
          d="M1020 120 H1160 C1200 120 1200 210 1240 210 H1370"
          stroke="url(#nxaData2)"
          strokeWidth="1"
          strokeDasharray="10 16"
          style={{ animation: "nxaDataFlow 8s linear infinite" }}
        />
        <path
          d="M760 780 H920 C970 780 970 700 1020 700 H1330"
          stroke="url(#nxaData3)"
          strokeWidth="1"
          strokeDasharray="14 18"
          style={{ animation: "nxaDataFlow 9s linear infinite" }}
        />

        <defs>
          <linearGradient id="nxaData1" x1="92" y1="690" x2="820" y2="550">
            <stop stopColor="#00d9ff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#00d9ff" />
            <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="nxaData2" x1="1020" y1="120" x2="1370" y2="210">
            <stop stopColor="#8b5cf6" stopOpacity="0" />
            <stop offset="0.5" stopColor="#00d9ff" />
            <stop offset="1" stopColor="#ff2bd6" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="nxaData3" x1="760" y1="780" x2="1330" y2="700">
            <stop stopColor="#00d9ff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#7c4dff" />
            <stop offset="1" stopColor="#00d9ff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div
        className="absolute left-[8%] top-[18%] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(0,217,255,.9)]"
        style={{ animation: "nxaPulse 3s ease-in-out infinite" }}
      />
      <div
        className="absolute left-[48%] top-[12%] h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_18px_rgba(139,92,246,.9)]"
        style={{ animation: "nxaPulse 4s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-[18%] right-[18%] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(0,217,255,.9)]"
        style={{ animation: "nxaPulse 3.7s ease-in-out infinite" }}
      />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.12fr_0.88fr]">
        <section className="hidden flex-col justify-between p-8 xl:p-10 lg:flex">
          <div>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/5 px-4 py-2 text-xs font-semibold text-cyan-100 shadow-[0_0_42px_rgba(0,217,255,0.16)] backdrop-blur-xl">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                NXA Growth Engine
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/35 p-1 backdrop-blur-xl">
                {(Object.keys(themeConfig) as LoginTheme[]).map((themeKey) => (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => setTheme(themeKey)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-black transition ${
                      theme === themeKey
                        ? `bg-gradient-to-r ${themeConfig[themeKey].accent} text-white shadow-[0_0_24px_rgba(0,217,255,.22)]`
                        : "text-white/45 hover:text-white"
                    }`}
                  >
                    {themeConfig[themeKey].name}
                  </button>
                ))}
              </div>
            </div>

            <h1 className="mt-8 max-w-3xl text-5xl font-black leading-[0.96] tracking-tight xl:text-6xl">
              Encontre clientes antes da concorrência.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 xl:text-lg">
              A NXA utiliza IA para localizar empresas, analisar oportunidades,
              organizar leads e transformar prospecção em uma operação comercial
              inteligente.
            </p>

            <div className="relative mt-8 h-[2px] max-w-xl overflow-hidden rounded-full bg-white/10">
              <div
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
                style={{ animation: "nxaLine 3.2s linear infinite" }}
              />
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              {rotatingStats.map((item) => (
                <div
                  key={item.label}
                  className={`group relative overflow-hidden rounded-2xl border border-cyan-300/18 bg-black/35 p-4 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/45 ${currentTheme.glow}`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${currentTheme.softAccent} opacity-35 transition group-hover:opacity-80`}
                  />

                  <div className="nxa-micro-grid pointer-events-none absolute inset-0 opacity-25" />

                  <div className="relative z-10">
                    <p
                      className={`bg-gradient-to-r ${currentTheme.accent} bg-clip-text text-2xl font-black text-transparent`}
                    >
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs text-white/58">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="nxa-chip relative mt-7 max-w-2xl overflow-hidden rounded-3xl border border-cyan-300/18 bg-black/40 p-4 shadow-[0_0_38px_rgba(0,217,255,0.08)] backdrop-blur-xl">
              <div className="nxa-micro-grid pointer-events-none absolute inset-0 rounded-3xl opacity-35" />

              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-cyan-300/10 to-transparent"
                style={{ animation: "nxaScan 4.5s linear infinite" }}
              />

              <div className="relative z-10 flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br ${currentTheme.softAccent} text-cyan-100`}
                >
                  <Cpu className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                    Núcleo de processamento
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white/88">
                    {activityFeed[feedIndex]}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 grid max-w-2xl grid-cols-3 gap-2">
              {modules.map((module) => (
                <div
                  key={module}
                  className="rounded-2xl border border-cyan-300/14 bg-black/30 px-3 py-2.5 text-xs font-semibold text-white/68 backdrop-blur-xl transition hover:border-cyan-300/50 hover:bg-cyan-400/10 hover:text-cyan-100"
                >
                  {module}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {benefits.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="relative overflow-hidden rounded-3xl border border-cyan-300/14 bg-black/32 p-5 shadow-[0_0_44px_rgba(0,217,255,0.07)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/36 hover:bg-black/45"
                  style={{
                    animation: `nxaFloat ${6 + index}s ease-in-out infinite`,
                  }}
                >
                  <div className="nxa-micro-grid pointer-events-none absolute inset-0 opacity-25" />

                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${currentTheme.softAccent} opacity-25`}
                  />

                  <div className="relative z-10">
                    <div
                      className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${currentTheme.softAccent} text-cyan-100 shadow-[0_0_28px_rgba(0,217,255,0.12)]`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="font-bold">{item.title}</h3>

                    <p className="mt-2 text-sm leading-6 text-white/58">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-[510px]">
            <div
              className="group relative mb-5 overflow-hidden rounded-[2rem] border border-cyan-300/25 bg-black/30 p-2 shadow-[0_0_90px_rgba(0,217,255,0.18)] backdrop-blur-xl"
              onMouseEnter={() => {
                if (videoEnded) replayVideo();
              }}
            >
              <div
                className={`pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br ${currentTheme.softAccent}`}
              />

              <video
                ref={videoRef}
                src="/nxa-intro.mp4"
                autoPlay
                muted
                playsInline
                preload="metadata"
                onEnded={() => setVideoEnded(true)}
                className="relative aspect-video w-full rounded-[1.45rem] object-cover"
              />

              {videoEnded && (
                <button
                  type="button"
                  onClick={replayVideo}
                  className="absolute inset-2 flex items-center justify-center rounded-[1.45rem] bg-black/35 opacity-0 backdrop-blur-[2px] transition group-hover:opacity-100"
                >
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white shadow-2xl">
                    <Play className="h-4 w-4" />
                    Reproduzir novamente
                  </span>
                </button>
              )}
            </div>

            <div
              className={`relative overflow-hidden rounded-[2rem] border p-6 backdrop-blur-2xl transition-all duration-700 sm:p-8 ${currentTheme.card}`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${currentTheme.softAccent} opacity-55`}
              />
              <div className="nxa-micro-grid pointer-events-none absolute inset-0 opacity-30" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-cyan-300 to-transparent" />

              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-300/10 to-transparent"
                style={{ animation: "nxaScan 5s linear infinite" }}
              />

              <div
                className="pointer-events-none absolute -top-20 h-40 w-20 bg-white/10 blur-xl"
                style={{ animation: "nxaShine 9s ease-in-out infinite" }}
              />

              <div className="relative z-10">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <div
                      className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${currentTheme.accent} font-black text-white shadow-[0_0_35px_rgba(0,217,255,0.18)]`}
                    >
                      NXA
                    </div>

                    <h2 className="text-3xl font-black tracking-tight">
                      {isRegister ? "Criar acesso" : "Acesse sua central"}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-white/62">
                      {isRegister
                        ? "Preencha seus dados para preparar sua operação dentro do NXA."
                        : "Entre para continuar sua operação comercial com IA."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-cyan-300/18 bg-black/32 px-3 py-2 text-right">
                    <p className="text-xs text-white/45">Setup</p>
                    <p className={`text-sm font-black ${currentTheme.text}`}>
                      {progress}%
                    </p>
                  </div>
                </div>

                <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${currentTheme.accent} transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {message && (
                  <div className="mb-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50">
                    {message}
                  </div>
                )}

                <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-cyan-300/14 bg-black/30 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setMessage("");
                    }}
                    className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                      !isRegister
                        ? "bg-white text-slate-950"
                        : "text-white/55 hover:text-white"
                    }`}
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setMessage("");
                    }}
                    className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                      isRegister
                        ? "bg-white text-slate-950"
                        : "text-white/55 hover:text-white"
                    }`}
                  >
                    Criar conta
                  </button>
                </div>

                <div className="space-y-3">
                  {isRegister && (
                    <>
                      <InputBox
                        icon={<User className="h-4 w-4" />}
                        placeholder="Nome completo"
                        value={onboarding.fullName}
                        onChange={(value) => updateOnboarding("fullName", value)}
                      />

                      <InputBox
                        icon={<Building2 className="h-4 w-4" />}
                        placeholder="Nome da empresa"
                        value={onboarding.companyName}
                        onChange={(value) =>
                          updateOnboarding("companyName", value)
                        }
                      />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <InputBox
                          icon={<Phone className="h-4 w-4" />}
                          placeholder="WhatsApp"
                          value={onboarding.phone}
                          onChange={(value) => updateOnboarding("phone", value)}
                        />

                        <InputBox
                          icon={<Zap className="h-4 w-4" />}
                          placeholder="Segmento"
                          value={onboarding.segment}
                          onChange={(value) =>
                            updateOnboarding("segment", value)
                          }
                        />
                      </div>

                      <InputBox
                        icon={<Radar className="h-4 w-4" />}
                        placeholder="Cidade principal de atuação"
                        value={onboarding.city}
                        onChange={(value) => updateOnboarding("city", value)}
                      />
                    </>
                  )}

                  <InputBox
                    icon={<Mail className="h-4 w-4" />}
                    placeholder="E-mail"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={setEmail}
                  />

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full rounded-2xl border border-cyan-300/14 bg-black/35 px-11 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/70"
                      placeholder="Senha"
                      autoComplete={
                        isRegister ? "new-password" : "current-password"
                      }
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          isRegister ? handleRegister() : handleLogin();
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={isRegister ? handleRegister : handleLogin}
                    disabled={loading}
                    className={`group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${currentTheme.accent} px-4 py-4 text-sm font-black text-white shadow-[0_0_32px_rgba(0,217,255,0.24)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        {isRegister ? "Criar minha conta" : "Entrar na central"}
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>

                {isRegister && (
                  <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                    <div className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                      <p className="text-sm leading-6 text-emerald-50/80">
                        Esses dados serão usados para personalizar seu painel,
                        preparar sua operação comercial e organizar suas buscas
                        por região e segmento.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-5 text-center text-xs leading-6 text-white/40">
              NXA Growth Engine • Inteligência comercial, prospecção e CRM com
              IA.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function InputBox({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  icon: ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
        {icon}
      </div>

      <input
        className="w-full rounded-2xl border border-cyan-300/14 bg-black/35 px-11 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/70"
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}