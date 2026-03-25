export type EventStatus = "submetido" | "em_analise" | "pendente_documentacao" | "aprovado" | "rejeitado";
export type EventType = "cultural" | "social";
export type UserRole = "organizador" | "avaliador" | "admin";

export interface EventRequest {
  id: string;
  protocolNumber: string;
  name: string;
  type: EventType;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  estimatedParticipants: number;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  organizerName: string;
  organizerEmail: string;
  documents: string[];
  timeline: TimelineEntry[];
}

export interface TimelineEntry {
  id: string;
  date: string;
  status: EventStatus;
  description: string;
  actor: string;
}

export interface DashboardMetrics {
  totalEvents: number;
  approved: number;
  rejected: number;
  pending: number;
  avgAnalysisTime: string;
}

export const statusLabels: Record<EventStatus, string> = {
  submetido: "Submetido",
  em_analise: "Em Análise",
  pendente_documentacao: "Pendente de Documentação",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

export const statusColors: Record<EventStatus, string> = {
  submetido: "bg-info text-info-foreground",
  em_analise: "bg-warning text-warning-foreground",
  pendente_documentacao: "bg-warning text-warning-foreground",
  aprovado: "bg-success text-success-foreground",
  rejeitado: "bg-destructive text-destructive-foreground",
};
