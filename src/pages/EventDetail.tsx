import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Calendar, Clock, Users, FileText, Download, CheckCircle, XCircle, PlayCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import EventApprovalDialog from "@/components/EventApprovalDialog";
import { statusLabels, statusColors, EventStatus } from "@/types/events";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { generateEventPDF } from "@/lib/generateEventPDF";

type ActionType = "aprovar" | "rejeitar" | "em_analise" | "pendente_documentacao";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<ActionType>("aprovar");

  const canEvaluate = role === "avaliador" || role === "admin";

  const fetchEvent = async () => {
    setLoading(true);
    const [{ data: ev }, { data: tl }] = await Promise.all([
      supabase.from("events").select("*").eq("id", id).single(),
      supabase.from("event_timeline").select("*").eq("event_id", id).order("created_at", { ascending: true }),
    ]);
    setEvent(ev);
    setTimeline(tl || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvent(); }, [id]);

  const openAction = (action: ActionType) => {
    setCurrentAction(action);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Evento não encontrado</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/events")}>Voltar</Button>
        </div>
      </DashboardLayout>
    );
  }

  const status = event.status as EventStatus;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <button onClick={() => navigate("/events")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar aos eventos
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>
              <span className="text-sm text-muted-foreground">{event.protocol_number}</span>
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">{event.name}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => generateEventPDF(event, timeline)}>
              <Download className="w-4 h-4 mr-1" /> Comprovativo PDF
            </Button>
          </div>
        </div>

        {/* Avaliador Action Buttons */}
        {canEvaluate && status !== "aprovado" && status !== "rejeitado" && (
          <Card className="shadow-card border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-3">Ações do Avaliador</p>
              <div className="flex flex-wrap gap-2">
                {status === "submetido" && (
                  <Button size="sm" variant="outline" onClick={() => openAction("em_analise")}>
                    <PlayCircle className="w-4 h-4 mr-1" /> Iniciar Análise
                  </Button>
                )}
                {(status === "em_analise" || status === "pendente_documentacao") && (
                  <>
                    <Button size="sm" onClick={() => openAction("aprovar")} className="bg-success hover:bg-success/90 text-success-foreground">
                      <CheckCircle className="w-4 h-4 mr-1" /> Aprovar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => openAction("rejeitar")}>
                      <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openAction("pendente_documentacao")}>
                      <AlertTriangle className="w-4 h-4 mr-1" /> Solicitar Documentação
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: MapPin, label: "Local", value: event.location },
            { icon: Calendar, label: "Data", value: new Date(event.date).toLocaleDateString("pt-AO") },
            { icon: Clock, label: "Horário", value: `${event.start_time} - ${event.end_time}` },
            { icon: Users, label: "Participantes", value: event.estimated_participants?.toLocaleString() },
          ].map((item) => (
            <Card key={item.label} className="shadow-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Description */}
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Descrição</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p></CardContent>
        </Card>

        {/* Documents */}
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Documentos</CardTitle></CardHeader>
          <CardContent>
            {(event.documents || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum documento anexado.</p>
            ) : (
              <div className="space-y-2">
                {(event.documents || []).map((docPath: string) => {
                  const fileName = docPath.split("/").pop() || docPath;
                  const { data: urlData } = supabase.storage.from("event-documents").getPublicUrl(docPath);
                  return (
                    <div key={docPath} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm flex-1 truncate">{fileName}</span>
                      <a href={urlData.publicUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm"><Download className="w-3 h-3" /></Button>
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Linha do Tempo</CardTitle></CardHeader>
          <CardContent>
            <div className="relative">
              {timeline.map((entry, i) => {
                const entryStatus = entry.status as EventStatus;
                return (
                  <div key={entry.id} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-3 h-3 rounded-full shrink-0 ring-4 ring-background",
                        entryStatus === "aprovado" ? "bg-success" :
                        entryStatus === "rejeitado" ? "bg-destructive" :
                        entryStatus === "pendente_documentacao" ? "bg-warning" :
                        "bg-primary"
                      )} />
                      {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="pb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{statusLabels[entryStatus]}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleDateString("pt-AO")}</span>
                      </div>
                      <p className="text-sm mt-1">{entry.description}</p>
                      {entry.justification && (
                        <p className="text-sm mt-1 text-muted-foreground italic">Justificativa: {entry.justification}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">por {entry.actor_name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <EventApprovalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        eventId={event.id}
        eventName={event.name}
        action={currentAction}
        onSuccess={fetchEvent}
      />
    </DashboardLayout>
  );
};

export default EventDetail;
