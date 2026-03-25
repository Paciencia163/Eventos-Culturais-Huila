import { useState } from "react";
import { FileText, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsLoading(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">SGEC Angola</span>
        </div>

        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">Recuperar Senha</h2>
          <p className="mt-2 text-muted-foreground">
            {sent ? "Verifique a sua caixa de email" : "Insira o seu email para receber um link de recuperação"}
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm text-foreground">
                Enviámos um link de recuperação para <strong>{email}</strong>. Verifique a sua caixa de entrada e spam.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.ao"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
              {isLoading ? "Enviando..." : (<><Send className="w-4 h-4 mr-2" /> Enviar Link de Recuperação</>)}
            </Button>
            <button type="button" onClick={() => navigate("/login")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto">
              <ArrowLeft className="w-4 h-4" /> Voltar ao login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
