import { useState } from "react";
import { Eye, EyeOff, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({ title: "Erro no login", description: "Email ou senha incorretos.", variant: "destructive" });
      return;
    }

    toast({ title: "Login realizado com sucesso", description: "Bem-vindo ao sistema." });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero text-primary-foreground flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <span className="font-display text-xl font-bold">SGEC Angola</span>
        </div>
        
        <div className="space-y-6 animate-fade-in">
          <h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight">
            Sistema de Gestão de<br />Eventos Culturais
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md leading-relaxed">
            Plataforma digital para solicitação e aprovação de eventos culturais e sociais na República de Angola.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <div className="text-3xl font-bold">2.400+</div>
              <div className="text-sm text-primary-foreground/60">Eventos processados</div>
            </div>
            <div>
              <div className="text-3xl font-bold">98%</div>
              <div className="text-sm text-primary-foreground/60">Taxa de aprovação</div>
            </div>
            <div>
              <div className="text-3xl font-bold">48h</div>
              <div className="text-sm text-primary-foreground/60">Tempo médio</div>
            </div>
          </div>
        </div>

        <p className="text-sm text-primary-foreground/40">
          © 2026 República de Angola — Ministério da Cultura
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">SGEC Angola</span>
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">Entrar</h2>
            <p className="mt-2 text-muted-foreground">
              Acesse a plataforma de gestão de eventos
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email institucional</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.gov.ao"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button type="button" onClick={() => navigate("/forgot-password")} className="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-muted-foreground">
              Não tem uma conta?{" "}
              <button onClick={() => navigate("/register")} className="text-primary font-semibold hover:underline">
                Registrar-se
              </button>
            </p>
          </div>

          <div className="pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Ao entrar, você concorda com os Termos de Uso e Política de Privacidade do sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
