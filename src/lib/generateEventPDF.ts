import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { statusLabels, EventStatus } from "@/types/events";

interface EventData {
  protocol_number: string;
  name: string;
  type: string;
  location: string;
  date: string;
  start_time: string;
  end_time: string;
  estimated_participants: number;
  organizer_name: string;
  organizer_email: string;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface TimelineEntry {
  status: string;
  description: string;
  actor_name: string;
  justification?: string;
  created_at: string;
}

export function generateEventPDF(event: EventData, timeline: TimelineEntry[] = []) {
  const doc = new jsPDF();
  const status = event.status as EventStatus;
  const statusLabel = statusLabels[status] || event.status;
  const now = new Date().toLocaleString("pt-AO");

  // Header bar
  doc.setFillColor(21, 128, 61);
  doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("SGEC Angola", 14, 15);
  doc.setFontSize(10);
  doc.text("Sistema de Gestão de Eventos Culturais e Sociais", 14, 22);
  doc.text(`Comprovativo gerado em: ${now}`, 14, 28);

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text(`Comprovativo — ${statusLabel}`, 14, 42);

  // Protocol badge
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Protocolo: ${event.protocol_number}`, 14, 50);

  // Event details table
  const details = [
    ["Nome do Evento", event.name],
    ["Tipo", event.type === "cultural" ? "Cultural" : "Social"],
    ["Província / Local", event.location],
    ["Data", new Date(event.date).toLocaleDateString("pt-AO")],
    ["Horário", `${event.start_time} — ${event.end_time}`],
    ["Participantes estimados", String(event.estimated_participants)],
    ["Organizador", event.organizer_name],
    ["E-mail", event.organizer_email],
    ["Status atual", statusLabel],
    ["Submetido em", new Date(event.created_at).toLocaleDateString("pt-AO")],
    ["Última atualização", new Date(event.updated_at).toLocaleDateString("pt-AO")],
  ];

  autoTable(doc, {
    startY: 56,
    head: [["Campo", "Valor"]],
    body: details,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [21, 128, 61] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
    theme: "grid",
  });

  // Description
  let currentY = (doc as any).lastAutoTable?.finalY || 120;
  if (event.description) {
    currentY += 8;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Descrição", 14, currentY);
    currentY += 6;
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const descLines = doc.splitTextToSize(event.description, 180);
    doc.text(descLines, 14, currentY);
    currentY += descLines.length * 4.5 + 4;
  }

  // Timeline
  if (timeline.length > 0) {
    currentY += 6;
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Histórico de Tramitação", 14, currentY);

    autoTable(doc, {
      startY: currentY + 4,
      head: [["Data", "Status", "Descrição", "Responsável", "Justificativa"]],
      body: timeline.map((t) => [
        new Date(t.created_at).toLocaleString("pt-AO"),
        statusLabels[t.status as EventStatus] || t.status,
        t.description,
        t.actor_name,
        t.justification || "—",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [21, 128, 61] },
      theme: "grid",
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `SGEC Angola — Documento oficial | Página ${i} de ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }

  doc.save(`comprovativo-${event.protocol_number}-${status}.pdf`);
}
