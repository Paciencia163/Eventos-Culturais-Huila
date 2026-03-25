import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Send, X, FileText } from "lucide-react";
import { logAudit } from "@/lib/auditLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

const NewEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventType, setEventType] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    participants: "",
  });

  const generateProtocol = () => {
    const year = new Date().getFullYear();
    const rand = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
    return `SGEC-${year}-${rand}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid: File[] = [];

    for (const file of selected) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: "Tipo não permitido", description: `${file.name}: apenas PDF, JPG e PNG.`, variant: "destructive" });
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "Arquivo muito grande", description: `${file.name}: máximo 10MB.`, variant: "destructive" });
        continue;
      }
      valid.push(file);
    }

    setFiles((prev) => [...prev, ...valid]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (eventId: string): Promise<string[]> => {
    const paths: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const filePath = `${user?.id}/${eventId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("event-documents").upload(filePath, file);
      if (!error) {
        paths.push(filePath);
      }
    }
    return paths;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventType) {
      toast({ title: "Erro", description: "Selecione o tipo de evento.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const protocol = generateProtocol();

    const { data: newEvent, error } = await supabase
      .from("events")
      .insert({
        name: formData.name.trim(),
        type: eventType as "cultural" | "social",
        location: formData.location.trim(),
        description: formData.description.trim(),
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        estimated_participants: parseInt(formData.participants) || 0,
        protocol_number: protocol,
        organizer_id: user?.id || null,
        organizer_name: profile?.full_name || user?.email || "Organizador",
        organizer_email: user?.email || "",
        status: "submetido",
        documents: [],
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Erro ao submeter", description: error.message, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    // Upload documents and update event
    if (files.length > 0) {
      const docPaths = await uploadFiles(newEvent.id);
      if (docPaths.length > 0) {
        await supabase.from("events").update({ documents: docPaths }).eq("id", newEvent.id);
      }
    }

    // Create initial timeline entry
    await supabase.from("event_timeline").insert({
      event_id: newEvent.id,
      status: "submetido",
      description: "Solicitação submetida",
      actor_id: user?.id || null,
      actor_name: profile?.full_name || user?.email || "Organizador",
    });

    // Audit log
    await logAudit({
      userId: user?.id,
      userName: profile?.full_name || user?.email || "Organizador",
      action: "event_created",
      entityType: "event",
      entityId: newEvent.id,
      details: { protocol, name: formData.name.trim() },
    });

    setIsSubmitting(false);
    toast({
      title: "Solicitação submetida!",
      description: `Protocolo: ${protocol}. Acompanhe o status na sua lista de eventos.`,
    });
    navigate("/events");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6 animate-fade-in">
        <button onClick={() => navigate("/events")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Nova Solicitação de Evento</h1>
          <p className="text-muted-foreground mt-1">Preencha os dados do evento para submeter a solicitação</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Informações do Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do evento *</Label>
                <Input id="name" placeholder="Ex: Festival de Música Tradicional" required className="h-11" value={formData.name} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de evento *</Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Local *</Label>
                  <Input id="location" placeholder="Ex: Luanda" required className="h-11" value={formData.location} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição detalhada *</Label>
                <Textarea id="description" placeholder="Descreva o evento, objetivos, público-alvo..." required rows={4} value={formData.description} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input id="date" type="date" required className="h-11" value={formData.date} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Hora início *</Label>
                  <Input id="startTime" type="time" required className="h-11" value={formData.startTime} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Hora fim *</Label>
                  <Input id="endTime" type="time" required className="h-11" value={formData.endTime} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="participants">Número estimado de participantes *</Label>
                <Input id="participants" type="number" placeholder="Ex: 500" required className="h-11" value={formData.participants} onChange={handleChange} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card mt-6">
            <CardHeader>
              <CardTitle className="text-base">Documentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const dt = e.dataTransfer;
                  if (dt?.files) {
                    const fakeEvent = { target: { files: dt.files } } as React.ChangeEvent<HTMLInputElement>;
                    handleFileSelect(fakeEvent);
                  }
                }}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              >
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Arraste arquivos ou clique para selecionar</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — Máx. 10MB por arquivo</p>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(i)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => navigate("/events")}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submetendo..." : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submeter Solicitação
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewEvent;
