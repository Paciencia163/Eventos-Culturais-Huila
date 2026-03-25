import { useState, useEffect } from "react";
import { Shield, Search, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";

interface AuditLog {
  id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
}

const actionLabels: Record<string, string> = {
  event_created: "Evento criado",
  event_approved: "Evento aprovado",
  event_rejected: "Evento rejeitado",
  event_status_changed: "Status alterado",
  user_role_changed: "Papel alterado",
  user_activated: "Utilizador ativado",
  user_deactivated: "Utilizador desativado",
  user_login: "Login",
  profile_updated: "Perfil atualizado",
};

const actionColors: Record<string, string> = {
  event_approved: "bg-success/10 text-success",
  event_rejected: "bg-destructive/10 text-destructive",
  event_created: "bg-primary/10 text-primary",
  event_status_changed: "bg-warning/10 text-warning-foreground",
  user_role_changed: "bg-info/10 text-info-foreground",
  user_login: "bg-muted text-muted-foreground",
};

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setLogs((data as AuditLog[]) || []);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.user_name.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" /> Logs de Auditoria
          </h1>
          <p className="text-muted-foreground mt-1">Histórico de todas as ações do sistema</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar por utilizador ou ação..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Nenhum registo encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((log) => (
              <Card key={log.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Badge className={actionColors[log.action] || "bg-muted text-muted-foreground"}>
                        {actionLabels[log.action] || log.action}
                      </Badge>
                      <span className="text-sm font-medium">{log.user_name || "Sistema"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="capitalize">{log.entity_type}</span>
                      {log.entity_id && <span>#{log.entity_id.substring(0, 8)}</span>}
                      <span>{new Date(log.created_at).toLocaleString("pt-AO")}</span>
                    </div>
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {JSON.stringify(log.details)}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
