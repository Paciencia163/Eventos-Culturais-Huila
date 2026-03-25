
-- Tighten insert policies: only authenticated users can insert
DROP POLICY "System can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);
