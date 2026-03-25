import { FileText, ArrowRight, Shield, Clock, BarChart3, CheckCircle, MapPin, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, type Easing } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: Clock, title: "Processo Ágil", desc: "Reduza o tempo de aprovação de semanas para dias com fluxos digitais inteligentes" },
  { icon: Shield, title: "Segurança", desc: "Dados protegidos com criptografia de ponta e controlo de acesso por perfis" },
  { icon: BarChart3, title: "Transparência", desc: "Acompanhe cada etapa do processo em tempo real com linha do tempo detalhada" },
  { icon: CheckCircle, title: "100% Digital", desc: "Sem burocracia em papel — submeta, acompanhe e receba aprovações online" },
];

const stats = [
  { value: "18", label: "Províncias", icon: MapPin },
  { value: "2.400+", label: "Eventos processados", icon: FileText },
  { value: "98%", label: "Taxa de aprovação", icon: CheckCircle },
  { value: "48h", label: "Tempo médio", icon: Clock },
];

const easeOut: Easing = [0.0, 0.0, 0.2, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: easeOut },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: easeOut },
  },
};

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border/50"
      >
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-institutional">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">SGEC Angola</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="hidden sm:inline-flex">
              Entrar
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
              <Shield className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Área Reservada</span>
            </Button>
            <Button size="sm" onClick={() => navigate("/register")}>
              Registrar-se <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero with background image */}
      <section className="relative pt-16 min-h-[85vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src={heroBg}
            alt="Vista panorâmica da cidade do Lubango, Angola, com o Cristo Rei e a Serra da Chela"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(155,82%,12%)/0.85] via-[hsl(155,60%,8%)/0.9] to-[hsl(0,0%,4%)/0.95]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>

        <div className="relative container mx-auto px-4 py-20 lg:py-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm text-sm text-primary-foreground/90 mb-8 border border-primary-foreground/10">
              <Sparkles className="w-3.5 h-3.5" />
              Plataforma Digital Oficial
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-primary-foreground">
              Sistema de Gestão de{" "}
              <span className="text-gradient-institutional bg-gradient-to-r from-[hsl(155,72%,50%)] to-[hsl(155,82%,70%)] bg-clip-text text-transparent">
                Eventos Culturais
              </span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mt-6 text-lg lg:text-xl text-primary-foreground/70 max-w-xl leading-relaxed">
              Plataforma oficial para solicitação e aprovação de eventos culturais e sociais na República de Angola. Transparente, digital, eficiente.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <Button size="lg" onClick={() => navigate("/register")} className="text-base px-8 h-13 shadow-institutional">
                Começar Agora <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/10 h-13"
                onClick={() => navigate("/login")}
              >
                Já tenho conta
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mt-16 lg:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-4xl"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                custom={i + 4}
                className="flex items-center gap-3 p-4 rounded-xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center shrink-0">
                  <s.icon className="w-5 h-5 text-primary-foreground/80" />
                </div>
                <div>
                  <p className="text-xl font-bold text-primary-foreground">{s.value}</p>
                  <p className="text-xs text-primary-foreground/50">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.div variants={scaleIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3" /> Funcionalidades
            </motion.div>
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl lg:text-4xl font-bold">Transformação Digital</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Modernizando o processo de gestão de eventos com tecnologia e transparência
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:shadow-institutional transition-all duration-300">
                  <f.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={staggerContainer}
        className="py-20 lg:py-24 bg-gradient-institutional text-primary-foreground"
      >
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl lg:text-4xl font-bold">Pronto para começar?</motion.h2>
          <motion.p variants={fadeUp} custom={1} className="mt-4 text-primary-foreground/70 text-lg">
            Registe-se gratuitamente e submeta a sua primeira solicitação de evento em minutos.
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" onClick={() => navigate("/register")} className="text-base px-8">
              Criar Conta Gratuita <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="ghost" className="text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/10" onClick={() => navigate("/login")}>
              Entrar na plataforma
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="border-t border-border py-8 bg-background"
      >
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 República de Angola — Ministério da Cultura</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Contacto</a>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
