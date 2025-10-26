import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@mui/material";
import {
    Globe2,
    Laptop,
    CheckCircle,
    FileText,
    Users,
    Shield,
    Calendar,
    Award,
    ArrowRight,
    Smartphone,
} from "lucide-react";

const APropos = () => {
    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-white text-gray-800 overflow-hidden">

                {/* SECTION 1 : HERO INTRO */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6"
                        >
                            <h1 className="text-5xl font-extrabold leading-tight text-primary">
                                GABConcours : La plateforme numérique dédiée aux concours au Gabon
                            </h1>
                            <p className="text-lg text-gray-700 leading-relaxed text-justify">
                                <strong>GABConcours</strong> est une solution innovante conçue pour moderniser et
                                simplifier le processus de dépôt et de suivi des candidatures aux concours
                                gabonais. En s’appuyant sur la technologie, elle apporte transparence,
                                rapidité et accessibilité à tous les citoyens, quel que soit leur lieu de résidence.
                            </p>
                            <Button
                                size="lg"
                                className="px-8 py-4 bg-primary text-white hover:bg-primary/90"
                                onClick={() => handleNavigation("/concours")}
                            >
                                Explorer les concours
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 }}
                            className="flex justify-center"
                        >
                            <img
                                src="../../public/télécharger.webp"
                                alt="Illustration numérique"
                                className="w-full max-w-lg drop-shadow-lg"
                            />
                        </motion.div>
                    </div>
                </section>

                {/* SECTION 2 : PROBLÉMATIQUE */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-6 text-center">
                        <motion.h2
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.6 }}
                            className="text-3xl font-bold text-primary mb-8"
                        >
                            Pourquoi un système numérique pour les concours ?
                        </motion.h2>
                        <p className="text-lg text-gray-700 text-justify leading-relaxed mb-8 max-w-5xl mx-auto">
                            Avant la mise en place de <strong>GABConcours</strong>, les candidatures se faisaient
                            manuellement : déplacement physique, remplissage de formulaires papier, dépôt en
                            centre, attente de validation, etc. Ce processus engendrait des pertes de temps,
                            des erreurs administratives et de nombreuses inégalités d’accès.
                        </p>
                        <p className="text-lg text-gray-700 text-justify leading-relaxed max-w-5xl mx-auto">
                            Aujourd’hui, grâce à la digitalisation, chaque candidat peut effectuer
                            l’ensemble de ses démarches depuis un ordinateur ou un smartphone, en toute sécurité.
                            C’est une avancée majeure pour le système éducatif et administratif gabonais.
                        </p>
                    </div>
                </section>

                {/* SECTION 3 : OBJECTIFS DU PROJET */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-6">
                        <motion.h2
                            initial={{ opacity: 0, y: -20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="text-3xl font-bold text-primary text-center mb-12"
                        >
                            Les objectifs de GABConcours
                        </motion.h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <FileText className="h-10 w-10 text-primary" />,
                                    title: "Simplifier le dépôt des dossiers",
                                    desc: "Faciliter la soumission des candidatures en ligne via un formulaire unique et intuitif.",
                                },
                                {
                                    icon: <Shield className="h-10 w-10 text-primary" />,
                                    title: "Garantir la sécurité des données",
                                    desc: "Assurer la protection et la confidentialité des informations des candidats.",
                                },
                                {
                                    icon: <Calendar className="h-10 w-10 text-primary" />,
                                    title: "Automatiser le suivi des candidatures",
                                    desc: "Permettre aux candidats de suivre en temps réel l’état de leur dossier via leur NUPCAN.",
                                },
                                {
                                    icon: <Users className="h-10 w-10 text-primary" />,
                                    title: "Améliorer la communication",
                                    desc: "Renforcer le lien entre les institutions et les candidats grâce à des notifications instantanées.",
                                },
                                {
                                    icon: <Laptop className="h-10 w-10 text-primary" />,
                                    title: "Favoriser l’accessibilité numérique",
                                    desc: "Offrir un accès équitable aux concours depuis toutes les régions du Gabon.",
                                },
                                {
                                    icon: <Globe2 className="h-10 w-10 text-primary" />,
                                    title: "Contribuer à la modernisation nationale",
                                    desc: "S’inscrire dans la stratégie du Plan Gabon Numérique 2025 pour une administration dématérialisée.",
                                },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
                                        <CardContent className="space-y-4 text-center">
                                            <div className="flex justify-center">{item.icon}</div>
                                            <h3 className="font-bold text-lg text-primary">{item.title}</h3>
                                            <p className="text-gray-600 text-sm text-justify">{item.desc}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECTION 4 : LES ATOUTS */}
                <section className="py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <motion.h2
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.7 }}
                            className="text-3xl font-bold text-primary mb-16"
                        >
                            Les atouts majeurs de la plateforme
                        </motion.h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <CheckCircle className="h-10 w-10 text-green-600" />,
                                    title: "Rapidité",
                                    desc: "Les candidatures sont traitées plus vite grâce à l’automatisation des tâches.",
                                },
                                {
                                    icon: <Award className="h-10 w-10 text-yellow-500" />,
                                    title: "Fiabilité",
                                    desc: "Toutes les opérations sont tracées, horodatées et consultables à tout moment.",
                                },
                                {
                                    icon: <Smartphone className="h-10 w-10 text-blue-600" />,
                                    title: "Mobilité",
                                    desc: "Compatible sur ordinateur, tablette et mobile pour un usage fluide partout au Gabon.",
                                },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.2 }}
                                >
                                    <Card className="p-6 border-0 shadow-md hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                                        <CardContent className="space-y-4 text-center">
                                            <div className="flex justify-center">{item.icon}</div>
                                            <h3 className="font-bold text-lg text-primary">{item.title}</h3>
                                            <p className="text-gray-600 text-sm text-justify">{item.desc}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECTION 5 : IMPACT */}
                <section className="py-24">
                    <div className="max-w-6xl mx-auto px-6 text-center">
                        <motion.h2
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.7 }}
                            className="text-3xl font-bold text-primary mb-8"
                        >
                            Un impact réel pour la digitalisation du Gabon
                        </motion.h2>
                        <p className="text-lg text-gray-700 leading-relaxed text-justify mb-8 max-w-5xl mx-auto">
                            <strong>GABConcours</strong> n’est pas qu’un simple outil : c’est un symbole
                            de la transformation numérique en marche au Gabon. Il démontre qu’une administration
                            connectée peut être efficace, inclusive et transparente.
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed text-justify max-w-5xl mx-auto">
                            En facilitant l’accès à l’information et en réduisant les déplacements physiques,
                            cette plateforme soutient les objectifs du <strong>Plan Gabon Émergent</strong> et
                            du programme <strong>Gabon Numérique 2025</strong>, qui visent à faire du pays
                            un modèle de gouvernance électronique en Afrique centrale.
                        </p>
                    </div>
                </section>

                {/* SECTION 6 : ENGAGEMENT */}
                <section className="py-24 bg-primary text-white text-center">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.7 }}
                        className="text-3xl font-bold mb-4"
                    >
                        Notre engagement
                    </motion.h2>
                    <p className="text-lg text-primary-foreground/90 max-w-4xl mx-auto text-justify leading-relaxed mb-10">
                        L’équipe derrière <strong>GABConcours</strong> s’engage à maintenir une plateforme fiable,
                        performante et évolutive. En collaborant avec les institutions publiques et privées,
                        nous participons activement à la modernisation des processus éducatifs et administratifs du pays.
                    </p>
                    <Button
                        size="lg"
                        variant="secondary"
                        className="px-8 py-4 text-lg bg-white text-primary hover:bg-gray-100"
                        onClick={() => handleNavigation("/connexion")}
                    >
                        Accéder à mon espace
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </section>
            </div>
        </Layout>
    );
};

export default APropos;
