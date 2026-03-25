
-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Function to create notification when event status changes
CREATE OR REPLACE FUNCTION public.notify_on_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  status_label TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.organizer_id IS NOT NULL THEN
    CASE NEW.status
      WHEN 'aprovado' THEN status_label := 'aprovado';
      WHEN 'rejeitado' THEN status_label := 'rejeitado';
      WHEN 'em_analise' THEN status_label := 'em análise';
      WHEN 'pendente_documentacao' THEN status_label := 'pendente de documentação';
      ELSE status_label := NEW.status;
    END CASE;

    INSERT INTO public.notifications (user_id, title, message, event_id)
    VALUES (
      NEW.organizer_id,
      'Status atualizado: ' || NEW.name,
      'O evento "' || NEW.name || '" foi marcado como ' || status_label || '.',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_event_status_change
  AFTER UPDATE OF status ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_status_change();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
