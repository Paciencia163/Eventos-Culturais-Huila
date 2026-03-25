
-- Ensure helper functions exist
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1 $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- Event enums
DO $$ BEGIN CREATE TYPE public.event_status AS ENUM ('submetido', 'em_analise', 'pendente_documentacao', 'aprovado', 'rejeitado'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.event_type AS ENUM ('cultural', 'social'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type event_type NOT NULL DEFAULT 'cultural',
  description TEXT,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  estimated_participants INTEGER NOT NULL DEFAULT 0,
  status event_status NOT NULL DEFAULT 'submetido',
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organizer_name TEXT NOT NULL,
  organizer_email TEXT NOT NULL,
  documents TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Event timeline
CREATE TABLE public.event_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status event_status NOT NULL,
  description TEXT NOT NULL,
  justification TEXT,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View events" ON public.events FOR SELECT USING (auth.uid() = organizer_id OR public.has_role(auth.uid(), 'avaliador'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Insert events" ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Update events" ON public.events FOR UPDATE USING (public.has_role(auth.uid(), 'avaliador'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = organizer_id);

CREATE POLICY "View timeline" ON public.event_timeline FOR SELECT USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(), 'avaliador'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))));
CREATE POLICY "Insert timeline" ON public.event_timeline FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'avaliador'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = actor_id);

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed data
INSERT INTO public.events (id, protocol_number, name, type, description, location, date, start_time, end_time, estimated_participants, status, organizer_name, organizer_email, documents, created_at, updated_at) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'SGEC-2026-0001', 'Festival de Música Tradicional de Luanda', 'cultural', 'Festival anual celebrando a rica herança musical angolana.', 'Luanda', '2026-04-15', '14:00', '22:00', 5000, 'aprovado', 'Maria Fernanda', 'maria@cultura.ao', ARRAY['plano_evento.pdf', 'seguranca.pdf'], '2026-01-10', '2026-01-18'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'SGEC-2026-0002', 'Conferência de Empreendedorismo Social', 'social', 'Conferência reunindo líderes comunitários.', 'Benguela', '2026-05-20', '09:00', '18:00', 800, 'em_analise', 'Carlos Mendes', 'carlos@social.ao', ARRAY['proposta.pdf'], '2026-02-01', '2026-02-05'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'SGEC-2026-0003', 'Exposição de Arte Contemporânea', 'cultural', 'Exposição de artistas emergentes angolanos.', 'Huambo', '2026-03-10', '10:00', '20:00', 1200, 'pendente_documentacao', 'Sofia Neto', 'sofia@arte.ao', ARRAY['catalogo.pdf'], '2026-01-25', '2026-02-02'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'SGEC-2026-0004', 'Maratona Solidária de Cabinda', 'social', 'Corrida beneficente para escolas rurais.', 'Cabinda', '2026-06-01', '06:00', '12:00', 3000, 'rejeitado', 'Pedro Santos', 'pedro@social.ao', ARRAY['proposta.pdf', 'orcamento.pdf'], '2026-01-15', '2026-01-22'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'SGEC-2026-0005', 'Festival Gastronômico do Namibe', 'cultural', 'Celebração da culinária costeira angolana.', 'Namibe', '2026-07-12', '11:00', '23:00', 2000, 'submetido', 'Ana Luísa', 'ana@gastronomia.ao', ARRAY['plano.pdf'], '2026-02-10', '2026-02-10');

INSERT INTO public.event_timeline (event_id, status, description, actor_name, created_at) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'submetido', 'Solicitação submetida', 'Maria Fernanda', '2026-01-10'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'em_analise', 'Avaliação iniciada', 'João Silva', '2026-01-12'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'aprovado', 'Evento aprovado com sucesso', 'João Silva', '2026-01-18'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'submetido', 'Solicitação submetida', 'Carlos Mendes', '2026-02-01'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'em_analise', 'Em processo de avaliação', 'Ana Costa', '2026-02-05'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'submetido', 'Solicitação submetida', 'Sofia Neto', '2026-01-25'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'em_analise', 'Em avaliação', 'João Silva', '2026-01-28'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'pendente_documentacao', 'Documentação de segurança necessária', 'João Silva', '2026-02-02'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'submetido', 'Solicitação submetida', 'Pedro Santos', '2026-01-15'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'em_analise', 'Em avaliação', 'Ana Costa', '2026-01-18'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'rejeitado', 'Falta de plano de segurança adequado', 'Ana Costa', '2026-01-22'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'submetido', 'Solicitação submetida', 'Ana Luísa', '2026-02-10');
