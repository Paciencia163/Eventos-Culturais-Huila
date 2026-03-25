import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users as UsersIcon, Shield, UserCheck, UserX } from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  organization: string | null;
  is_active: boolean;
  created_at: string;
  role?: string;
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  avaliador: "Avaliador",
  organizador: "Organizador",
};

const roleBadgeColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive",
  avaliador: "bg-warning/10 text-warning-foreground",
  organizador: "bg-primary/10 text-primary",
};

const UsersPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro", description: "Não foi possível carregar utilizadores.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const roleMap = new Map((roles || []).map((r: any) => [r.user_id, r.role]));

    setUsers(
      (profiles || []).map((p: any) => ({
        ...p,
        role: (roleMap.get(p.id) as string) || "organizador",
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleActive = async (userId: string, currentActive: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !currentActive })
      .eq("id", userId);
    if (!error) {
      toast({ title: currentActive ? "Conta desativada" : "Conta ativada" });
      fetchUsers();
    }
  };

  const changeRole = async (userId: string, newRole: string) => {
    const { data: existing } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existing) {
      await supabase.from("user_roles").update({ role: newRole as any }).eq("user_id", userId);
    } else {
      await supabase.from("user_roles").insert([{ user_id: userId, role: newRole as any }]);
    }
    toast({ title: "Papel atualizado", description: `Alterado para ${roleLabels[newRole]}` });
    fetchUsers();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Gestão de Utilizadores</h1>
            <p className="text-muted-foreground mt-1">Gerir contas e permissões do sistema</p>
          </div>
          <Badge variant="outline" className="gap-1">
            <UsersIcon className="w-3 h-3" /> {users.length} utilizadores
          </Badge>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((u) => (
              <Card key={u.id} className="shadow-card">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                        {(u.full_name || u.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{u.full_name || "Sem nome"}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                        {u.organization && <p className="text-xs text-muted-foreground">{u.organization}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className={roleBadgeColors[u.role || "organizador"]}>
                        <Shield className="w-3 h-3 mr-1" />
                        {roleLabels[u.role || "organizador"]}
                      </Badge>

                      <Badge variant={u.is_active ? "default" : "destructive"} className="gap-1">
                        {u.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {u.is_active ? "Ativo" : "Inativo"}
                      </Badge>

                      {u.id !== currentUser?.id && (
                        <>
                          <Select value={u.role} onValueChange={(v) => changeRole(u.id, v)}>
                            <SelectTrigger className="w-36 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="organizador">Organizador</SelectItem>
                              <SelectItem value="avaliador">Avaliador</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant={u.is_active ? "destructive" : "default"}
                            size="sm"
                            onClick={() => toggleActive(u.id, u.is_active)}
                          >
                            {u.is_active ? "Desativar" : "Ativar"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UsersPage;
