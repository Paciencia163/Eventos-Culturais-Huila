import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { FileText, CheckCircle, XCircle, Clock, TrendingUp, Calendar, Download, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { statusLabels, statusColors, EventStatus } from "@/types/events";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Dashboard = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });
      setAllEvents(data || []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // Apply filters
  const now = new Date();
  const filtered = allEvents.filter((e) => {
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    if (locationFilter !== "all" && e.location !== locationFilter) return false;
    if (periodFilter !== "all") {
      const created = new Date(e.created_at);
      if (periodFilter === "7d" && now.getTime() - created.getTime() > 7 * 86400000) return false;
      if (periodFilter === "30d" && now.getTime() - created.getTime() > 30 * 86400000) return false;
      if (periodFilter === "90d" && now.getTime() - created.getTime() > 90 * 86400000) return false;
    }
    return true;
  });

  const approved = filtered.filter((e) => e.status === "aprovado").length;
  const rejected = filtered.filter((e) => e.status === "rejeitado").length;
  const pending = filtered.filter((e) => !["aprovado", "rejeitado"].includes(e.status)).length;

  const locations = [...new Set(allEvents.map((e) => e.location))].sort();

  // Monthly data
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const monthlyMap: Record<string, { total: number; aprovados: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyMap[key] = { total: 0, aprovados: 0 };
  }
  filtered.forEach((e) => {
    const d = new Date(e.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthlyMap[key]) {
      monthlyMap[key].total++;
      if (e.status === "aprovado") monthlyMap[key].aprovados++;
    }
  });
  const monthlyData = Object.entries(monthlyMap).map(([key, val]) => {
    const [, m] = key.split("-");
    return { month: months[parseInt(m)], ...val };
  });

  const statusData = [
    { name: "Aprovados", value: approved, fill: "hsl(155, 72%, 40%)" },
    { name: "Em análise", value: filtered.filter((e) => e.status === "em_analise").length, fill: "hsl(38, 92%, 50%)" },
    { name: "Pendentes", value: filtered.filter((e) => ["submetido", "pendente_documentacao"].includes(e.status)).length, fill: "hsl(210, 80%, 52%)" },
    { name: "Rejeitados", value: rejected, fill: "hsl(0, 72%, 51%)" },
  ];

  const metrics = [
    { label: "Total de Eventos", value: filtered.length, icon: FileText, color: "text-primary" },
    { label: "Aprovados", value: approved, icon: CheckCircle, color: "text-success" },
    { label: "Rejeitados", value: rejected, icon: XCircle, color: "text-destructive" },
    { label: "Pendentes", value: pending, icon: Clock, color: "text-warning" },
  ];

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("SGEC Angola - Relatório de Eventos", 14, 22);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-AO")}`, 14, 30);
    doc.text(`Total: ${filtered.length} | Aprovados: ${approved} | Rejeitados: ${rejected} | Pendentes: ${pending}`, 14, 37);

    autoTable(doc, {
      startY: 44,
      head: [["Protocolo", "Nome", "Tipo", "Local", "Data", "Status"]],
      body: filtered.map((e) => [
        e.protocol_number,
        e.name,
        e.type === "cultural" ? "Cultural" : "Social",
        e.location,
        new Date(e.date).toLocaleDateString("pt-AO"),
        statusLabels[e.status as EventStatus] || e.status,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [21, 128, 61] },
    });

    doc.save("relatorio-eventos-sgec.pdf");
  };

  const exportCSV = () => {
    const header = "Protocolo,Nome,Tipo,Local,Data,Status,Participantes,Organizador\n";
    const rows = filtered.map((e) =>
      `"${e.protocol_number}","${e.name}","${e.type}","${e.location}","${e.date}","${e.status}",${e.estimated_participants},"${e.organizer_name}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio-eventos-sgec.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Visão geral do sistema de eventos</p>
          </div>
          {(role === "admin" || role === "avaliador") && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportPDF}>
                <Download className="w-4 h-4 mr-1" /> PDF
              </Button>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="w-4 h-4 mr-1" /> CSV
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Período" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o período</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
              <SelectItem value="social">Social</SelectItem>
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Província" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as províncias</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <Card key={m.label} className="shadow-card hover:shadow-card-hover transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{m.label}</p>
                    <p className="text-2xl font-bold mt-1">{m.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${m.color}`}>
                    <m.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Eventos por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                  <Line type="monotone" dataKey="aprovados" stroke="hsl(var(--success))" strokeWidth={2} dot={{ fill: "hsl(var(--success))" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Status dos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Eventos Recentes</CardTitle>
            <button onClick={() => navigate("/events")} className="text-sm text-primary font-medium hover:underline">Ver todos</button>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum evento registrado ainda.</p>
            ) : (
              <div className="space-y-3">
                {filtered.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{event.name}</p>
                        <p className="text-xs text-muted-foreground">{event.protocol_number} · {event.location}</p>
                      </div>
                    </div>
                    <Badge className={`${statusColors[event.status as EventStatus]} text-xs shrink-0`}>
                      {statusLabels[event.status as EventStatus]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
