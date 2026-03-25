import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { logAudit } from "@/lib/auditLog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type ActionType = "aprovar" | "rejeitar" | "em_analise" | "pendente_documentacao";

interface EventApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventName: string;
  action: ActionType;
  onSuccess: () => void;
}

const actionConfig: Record<ActionType, { title: string; description: string; icon: typeof CheckCircle; requiresJustification: boolean; statusValue: string }> = {
  aprovar: {
    title: "Aprovar Evento",
    description: "Confirma a aprovação deste evento?",
    icon: CheckCircle,
    requiresJustification: false,
    statusValue: "aprovado",
  },
  rejeitar: {
    title: "Rejeitar Evento",
    description: "A justificativa é obrigatória para rejeições.",
    icon: XCircle,
    requiresJustification: true,
    statusValue: "rejeitado",
  },
  em_analise: {
    title: "Iniciar Análise",
    description: "Marcar este evento como em análise?",
    icon: AlertTriangle,
    requiresJustification: false,
    statusValue: "em_analise",
  },
  pendente_documentacao: {
    title: "Solicitar Documentação",
    description: "Informe quais documentos são necessários.",
    icon: AlertTriangle,
    requiresJustification: true,
    statusValue: "pendente_documentacao",
  },
};

const statusDescriptions: Record<string, string> = {
  aprovado: "Evento aprovado",
  rejeitado: "Evento rejeitado",
  em_analise: "Evento em análise",
  pendente_documentacao: "Documentação adicional solicitada",
};

const EventApprovalDialog = ({ open, onOpenChange, eventId, eventName, action, onSuccess }: EventApprovalDialogProps) => {
  const [justification, setJustification] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const config = actionConfig[action];
  const Icon = config.icon;

  const handleSubmit = async () => {
    if (config.requiresJustification && !justification.trim()) {
      toast({ title: "Justificativa obrigatória", description: "Por favor, forneça uma justificativa.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Update event status
      const { error: updateError } = await supabase
        .from("events")
        .update({ status: config.statusValue as any })
        .eq("id", eventId);

      if (updateError) throw updateError;

      // Add timeline entry
      const actorName = profile?.full_name || profile?.email || "Avaliador";
      const { error: timelineError } = await supabase
        .from("event_timeline")
        .insert({
          event_id: eventId,
          status: config.statusValue as any,
          description: justification.trim() || statusDescriptions[config.statusValue],
          justification: justification.trim() || null,
          actor_id: profile?.id || null,
          actor_name: actorName,
        } as any);

      if (timelineError) throw timelineError;

      // Audit log
      await logAudit({
        userId: profile?.id,
        userName: actorName,
        action: config.statusValue === "aprovado" ? "event_approved" : config.statusValue === "rejeitado" ? "event_rejected" : "event_status_changed",
        entityType: "event",
        entityId: eventId,
        details: { status: config.statusValue, justification: justification.trim() || null },
      });

      toast({ title: "Sucesso", description: `Evento ${config.statusValue === "aprovado" ? "aprovado" : config.statusValue === "rejeitado" ? "rejeitado" : "atualizado"} com sucesso.` });
      setJustification("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${action === "aprovar" ? "text-success" : action === "rejeitar" ? "text-destructive" : "text-warning"}`} />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            <strong>{eventName}</strong>
            <br />
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="justification">
              {config.requiresJustification ? "Justificativa *" : "Observações (opcional)"}
            </Label>
            <Textarea
              id="justification"
              placeholder={
                action === "rejeitar"
                  ? "Descreva o motivo da rejeição..."
                  : action === "pendente_documentacao"
                  ? "Informe quais documentos são necessários..."
                  : "Adicione uma observação (opcional)..."
              }
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant={action === "rejeitar" ? "destructive" : "default"}
          >
            {loading ? "Processando..." : config.title}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventApprovalDialog;
