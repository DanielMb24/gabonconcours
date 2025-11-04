import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { 
  BookOpen, Users, Building2, TrendingUp, CheckCircle, 
  Clock, Shield, Zap, ChevronDown, Search, GraduationCap,
  ArrowRight, Star, UserCheck, FileCheck, CreditCard, Headphones,
  School, Award, Bell, ChevronLeft, ChevronRight
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useTranslation } from '@/i18n';

// Typage API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface StatisticsResponse {
  candidats?: { total: number };
  etablissements?: number;
}

const NewHomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchNupcan, setSearchNupcan] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const controls = useAnimation();

  // Animation hero
  useEffect(() => {
    controls.start({
      scale: [1, 1.05, 1],
      rotate: [0, 2, -2, 0],
      transition: { duration: 12, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
    });
  }, [controls]);

  // --- API QUERIES ---
  const { data: concoursApi } = useQuery<ApiResponse<any[]>>({
    queryKey: ['concours'],
    queryFn: () => apiService.getConcours<any[]>(),
  });
  const concours = concoursApi?.data || [];

  const { data: etablissementsApi } = useQuery<ApiResponse<any[]>>({
    queryKey: ['etablissements'],
    queryFn: () => apiService.getEtablissements<any[]>(),
  });
  const etablissementsCount = etablissementsApi?.data?.length || 0;

  const { data: statsApi } = useQuery<ApiResponse<StatisticsResponse>>({
    queryKey: ['statistics'],
    queryFn: () => apiService.getStatistics<StatisticsResponse>(),
  });
  const stats = statsApi?.data;
  const candidatsTotal = stats?.candidats?.total || 0;

  const concoursActifs = concours.filter((c: any) => c.stacnc === '1').length;

  // --- Bande d’annonces dynamiques ---
  const marqueeItems = concours
    .filter((c: any) => c.stacnc === '1')
    .map((c: any) => ({
      icon: Bell,
      text: `${c.libcnc} - Inscriptions ouvertes jusqu'au ${new Date(c.fincnc).toLocaleDateString('fr-FR')}`,
      color: "bg-blue-100 text-blue-700"
    }));

  const fallbackMarquee = [
    { icon: Bell, text: "Aucun concours ouvert pour le moment", color: "bg-gray-100 text-gray-700" }
  ];
  const announcements = marqueeItems.length > 0 ? marqueeItems : fallbackMarquee;

  // --- Compteur animé ---
  const AnimatedNumber = ({ value }: { value: number }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplay(value);
          clearInterval(timer);
        } else {
          setDisplay(Math.floor(current));
        }
      }, 2000 / steps);
      return () => clearInterval(timer);
    }, [value]);
    return <>{display.toLocaleString()}</>;
  };

  // --- Données statiques ---
  const faqs = [
    { 
      question: "Comment créer une candidature ?", 
      answer: "Choisissez un concours, remplissez le formulaire en ligne, téléversez vos documents requis et effectuez le paiement. Vous recevrez votre NUPCAN par email pour suivre votre candidature." 
    },
    { 
      question: "Quels documents sont obligatoires ?", 
      answer: "Généralement : CNI, acte de naissance, diplôme ou attestation, et certificat médical. Les documents spécifiques dépendent du concours choisi." 
    },
    { 
      question: "Comment suivre ma candidature ?", 
      answer: "Utilisez votre NUPCAN reçu par email pour vous connecter à votre dashboard et suivre en temps réel l'état de votre dossier, documents et paiement." 
    },
    { 
      question: "Que faire si un document est rejeté ?", 
      answer: "Connectez-vous avec votre NUPCAN, consultez le commentaire de rejet, et remplacez le document directement depuis votre dashboard. Il sera renvoyé en validation automatiquement." 
    },
    { 
      question: "Les paiements sont-ils sécurisés ?", 
      answer: "Oui, tous les paiements sont cryptés et sécurisés. Vous recevrez un reçu officiel après chaque paiement validé." 
    },
    { 
      question: "Puis-je modifier ma candidature après soumission ?", 
      answer: "Vous pouvez remplacer les documents rejetés et compléter les paiements en attente via votre dashboard. Pour d'autres modifications, contactez le support." 
    }
  ];

  const testimonials = [
    { name: "Aïcha D.", role: "Admise à l'ENSP", text: "Grâce à cette plateforme, j'ai pu suivre mon dossier en temps réel. Tout était clair et sécurisé.", rating: 5 },
    { name: "Jean-Paul M.", role: "Candidat ENS", text: "Le support est réactif et les paiements sont simples. Je recommande vivement !", rating: 5 },
    { name: "Fatima K.", role: "Admise à l'ENSET", text: "Interface intuitive, documents validés rapidement. Une expérience fluide du début à la fin.", rating: 5 }
  ];

  const steps = [
    { icon: UserCheck, title: "Inscription", desc: "Créez votre compte en 2 minutes" },
    { icon: FileCheck, title: "Soumission", desc: "Téléversez vos documents en un clic" },
    { icon: CreditCard, title: "Paiement", desc: "Règlement sécurisé en ligne" },
    { icon: Headphones, title: "Suivi", desc: "Dashboard en temps réel" }
  ];

  const featuredContests = concours
    .filter((c: any) => c.stacnc === '1')
    .slice(0, 4)
    .map((c: any) => ({
      title: c.libcnc,
      places: c.nbrcnc || 100,
      deadline: new Date(c.fincnc).toLocaleDateString('fr-FR'),
      badge: 'Ouvert',
      id: c.id
    }));

  const partners = [
    { name: "ENAM", logo: <School className="w-8 h-8" /> },
    { name: "ENS", logo: <GraduationCap className="w-8 h-8" /> },
    { name: "ENSP", logo: <Building2 className="w-8 h-8" /> },
    { name: "IRIC", logo: <Award className="w-8 h-8" /> },
    { name: "MINESUP", logo: <Shield className="w-8 h-8" /> },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchNupcan.trim()) {
      navigate(`/connexion?nupcan=${searchNupcan.trim()}`);
    }
  };

  return (
    <Layout>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-24 md:py-36">
        <div className="absolute inset-0 bg-grid-primary/5 bg-[size:60px_60px] animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 rounded-full text-primary text-sm font-semibold backdrop-blur-sm">
                <GraduationCap className="w-5 h-5" />
                {t('heroTitle')}
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient">
                  {t('heroMainTitle')}
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button 
                    onClick={() => navigate('/concours')}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 shadow-xl hover:shadow-primary/20"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    {t('contests')}
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button 
                    onClick={() => navigate('/connexion')}
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 border-2 backdrop-blur-sm"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    {t('searchCandidate')}
                  </Button>
                </motion.div>
              </div>

              <div className="flex gap-8 pt-6 text-sm">
                <div>
                  <div className="font-bold text-3xl text-primary"><AnimatedNumber value={candidatsTotal} />+</div>
                  <div className="text-muted-foreground">Candidats</div>
                </div>
                <div>
                  <div className="font-bold text-3xl text-primary"><AnimatedNumber value={concoursActifs} /></div>
                  <div className="text-muted-foreground">Concours actifs</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative flex justify-center"
            >
              <motion.div
                animate={controls}
                className="relative w-96 h-96"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl animate-pulse" />
                <div className="relative w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl p-12 shadow-2xl backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <GraduationCap className="w-48 h-48 text-primary/50" />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
                </div>
              </motion.div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-bounce" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-bounce" style={{ animationDelay: '1s' }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* BANDE D'ANNONCES */}
      <section className="bg-gradient-to-r from-primary to-accent py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...announcements, ...announcements].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 mx-6 ${item.color} px-5 py-2 rounded-full text-sm font-medium flex-shrink-0`}
              whileHover={{ scale: 1.05 }}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* STATISTIQUES */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, value: concoursActifs, label: "Concours actifs", color: 'from-blue-500 to-cyan-500' },
              { icon: Users, value: candidatsTotal, label: "Candidats inscrits", color: 'from-emerald-500 to-teal-500' },
              { icon: Building2, value: etablissementsCount, label: "Établissements", color: 'from-purple-500 to-pink-500' },
              { icon: TrendingUp, value: '89%', label: "Taux de réussite", color: 'from-orange-500 to-red-500' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <stat.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-4xl font-bold text-foreground mb-2">
                      {typeof stat.value === 'number' ? <AnimatedNumber value={stat.value} /> : stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONCOURS EN VEDETTE */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold">Concours en vedette</h2>
              <p className="text-muted-foreground mt-2">Inscrivez-vous avant la date limite !</p>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline"><ChevronLeft className="w-5 h-5" /></Button>
              <Button size="icon" variant="outline"><ChevronRight className="w-5 h-5" /></Button>
            </div>
          </div>

          {featuredContests.length > 0 ? (
            <div className="grid md:grid-cols-4 gap-6">
              {featuredContests.map((contest, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Card className="h-full overflow-hidden border-2 border-transparent group-hover:border-primary/50 transition-all">
                    <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg line-clamp-2">{contest.title}</h3>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{contest.badge}</span>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>{contest.places}</strong> places disponibles</p>
                        <p>Date limite : <strong className="text-destructive">{contest.deadline}</strong></p>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Button 
                          className="w-full mt-4" 
                          size="sm"
                          onClick={() => navigate(`/candidature/${contest.id}`)}
                        >
                          S'inscrire
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p>Aucun concours en vedette pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ÉTAPES */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <h2 className="text-4xl font-bold mb-4">Votre candidature en 4 étapes</h2>
            <p className="text-lg text-muted-foreground">Simple, rapide et 100% en ligne</p>
          </motion.div>

          <div className="relative grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 40 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-20 h-0.5 bg-gradient-to-r from-primary/30 to-transparent transform -translate-x-1/2" />
                )}
                <div className="text-center group">
                  <motion.div 
                    className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent p-0.5"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                      <step.icon className="w-9 h-9 text-primary" />
                    </div>
                  </motion.div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <h2 className="text-4xl font-bold mb-4">Pourquoi nous choisir ?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Une plateforme pensée pour vous simplifier la vie</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Inscription simplifiée", desc: "Créez votre compte et postulez en moins de 5 minutes", gradient: 'from-blue-500 to-cyan-500' },
              { icon: Clock, title: "Suivi en temps réel", desc: "Dashboard intuitif avec notifications instantanées", gradient: 'from-purple-500 to-pink-500' },
              { icon: Shield, title: "Paiement sécurisé", desc: "Transactions cryptées et reçus officiels", gradient: 'from-green-500 to-emerald-500' },
              { icon: CheckCircle, title: "Support 24/7", desc: "Équipe dédiée pour vous accompagner", gradient: 'from-orange-500 to-red-500' },
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.1 }} 
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="h-full p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 bg-white/90 backdrop-blur relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 hover:opacity-5 transition-opacity" style={{ backgroundImage: `linear-gradient(to bottom right, ${feature.gradient})` }} />
                  <motion.div 
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-3 mb-4 flex items-center justify-center`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <feature.icon className="w-full h-full text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3 relative z-10">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed relative z-10">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ - AVEC NUMÉROS 01, 02... */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <h2 className="text-4xl font-bold mb-4">Questions fréquentes</h2>
            <p className="text-lg text-muted-foreground">Tout ce que vous devez savoir avant de commencer</p>
          </motion.div>

          <div className="space-y-8">
            {faqs.map((faq, index) => {
              const isLeft = index % 2 === 0;
              const number = `${index + 1}`.padStart(2, '0');

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 items-start`}
                >
                  {/* NUMÉRO 01, 02... */}
                  <div className="hidden md:flex items-center justify-center w-24">
                    <motion.span
                      className="text-7xl font-bold text-primary/10 select-none"
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 100 }}
                      viewport={{ once: true }}
                    >
                      {number}
                    </motion.span>
                  </div>

                  {/* CARTE FAQ */}
                  <div className="flex-1 w-full">
                    <motion.div
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="cursor-pointer"
                    >
                      <Card className="overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between p-6 bg-gradient-to-r from-primary/5 to-transparent">
                          <CardTitle className="text-lg font-semibold pr-4 flex-1">
                            {faq.question}
                          </CardTitle>
                          <motion.div
                            animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-5 h-5 text-primary" />
                          </motion.div>
                        </CardHeader>

                        <motion.div
                          initial={false}
                          animate={{ 
                            height: expandedFaq === index ? 'auto' : 0,
                            opacity: expandedFaq === index ? 1 : 0
                          }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <CardContent className="px-6 pb-6 pt-2">
                            <p className="text-muted-foreground leading-relaxed pl-4 border-l-4 border-primary bg-primary/5 rounded-r p-3">
                              {faq.answer}
                            </p>
                          </CardContent>
                        </motion.div>
                      </Card>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <h2 className="text-4xl font-bold mb-4">Ils nous font confiance</h2>
            <p className="text-lg text-muted-foreground">Des milliers de candidats admis grâce à notre plateforme</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary">
                  <div className="flex mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic mb-4 leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold"
                      whileHover={{ scale: 1.1 }}
                    >
                      {t.name[0]}
                    </motion.div>
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTENAIRES */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <h2 className="text-4xl font-bold mb-4">Nos partenaires officiels</h2>
            <p className="text-lg text-muted-foreground">{etablissementsCount} institutions publiques reconnues</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
            {partners.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-6 bg-muted/30 rounded-2xl hover:bg-primary/5 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-3">
                  {p.logo}
                </div>
                <span className="font-semibold text-sm">{p.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-28 bg-gradient-to-br from-primary via-primary/90 to-accent/80 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:50px_50px] animate-pulse" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-5xl md:text-7xl font-bold">
              Prêt à réussir votre concours ?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Rejoignez les {candidatsTotal.toLocaleString()} candidats qui ont déjà fait confiance à notre plateforme sécurisée et intuitive.
            </p>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button 
                onClick={() => navigate('/concours')}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 px-12 py-8 text-xl font-semibold shadow-2xl hover:shadow-white/20 transition-all"
              >
                <BookOpen className="w-7 h-7 mr-3" />
                Découvrir les concours
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ANIMATIONS CSS */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 6s ease infinite;
        }
      `}</style>
    </Layout>
  );
};

export default NewHomePage;