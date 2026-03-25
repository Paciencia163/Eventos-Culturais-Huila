import { useState } from "react";
import { Eye, EyeOff, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    const { error } = await signUp(email, password, { full_name: name, phone, organization });
    setIsLoading(false);

    if (error) {
      toast({ title: "Erro no registo", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Conta criada com sucesso!", description: "Faça login para continuar." });
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero text-primary-foreground flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <span className="font-display text-xl font-bold">SGEC Angola</span>
        </div>
        
        <div className="space-y-6 animate-fade-in">
          <h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight">
            Registre-se como<br />Organizador
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md leading-relaxed">
            Crie sua conta para submeter solicitações de eventos culturais e sociais de forma digital e transparente.
          </p>
        </div>

        <p className="text-sm text-primary-foreground/40">
          © 2026 República de Angola — Ministério da Cultura
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6 animate-slide-up">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">SGEC Angola</span>
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">Criar Conta</h2>
            <p className="mt-2 text-muted-foreground">Preencha os dados para se registrar</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" placeholder="Seu nome completo" value={name} onChange={(e) => setName(e.target.value)} required className="h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input id="reg-email" type="email" placeholder="seu.email@exemplo.ao" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="+244 9XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org">Organização</Label>
                <Input id="org" placeholder="Nome da entidade" value={organization} onChange={(e) => setOrganization(e.target.value)} className="h-11" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password">Senha</Label>
              <div className="relative">
                <Input id="reg-password" type={showPassword ? "text" : "password"} placeholder="Mín. 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar senha</Label>
              <Input id="confirm-password" type="password" placeholder="Repita a senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-11" />
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
              {isLoading ? "Criando conta..." : "Criar Conta"}
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-muted-foreground">
              Já tem uma conta?{" "}
              <button onClick={() => navigate("/login")} className="text-primary font-semibold hover:underline">Entrar</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
