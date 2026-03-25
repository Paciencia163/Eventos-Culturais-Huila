import { supabase } from "@/integrations/supabase/client";

export const logAudit = async (params: {
  userId?: string | null;
  userName: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any>;
}) => {
  await supabase.from("audit_logs").insert({
    user_id: params.userId || null,
    user_name: params.userName,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId || null,
    details: params.details || {},
  } as any);
};
