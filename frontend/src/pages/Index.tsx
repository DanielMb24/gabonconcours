
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, CheckCircle, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import StatsSection from '@/components/StatsSection';
import WhyChooseSection from '@/components/WhyChooseSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import {Card, CardContent} from "@mui/material";

const Index = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
      <Layout>
        <div className="min-h-screen">





          {/* FAQ Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-primary mb-4">A propos</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Retrouvez les réponses aux questions les plus fréquentes sur GABConcours
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="hover:shadow-lg transition-all p-6 border-0 bg-white">
                  <CardContent className="space-y-4">
                    <h3 className="font-bold text-lg text-primary">Comment obtenir mon NUPCAN ?</h3>
                    <p className="text-muted-foreground text-sm">
                      Vous recevez votre numéro de candidature (NUPCAN) après avoir rempli le formulaire d'inscription et effectué le paiement requis, le cas échéant.
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all p-6 border-0 bg-white">
                  <CardContent className="space-y-4">
                    <h3 className="font-bold text-lg text-primary">Quels documents dois-je fournir ?</h3>
                    <p className="text-muted-foreground text-sm">
                      Les documents requis varient selon le concours. Généralement, il faut une copie de votre pièce d'identité, diplômes et un justificatif de paiement.
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all p-6 border-0 bg-white">
                  <CardContent className="space-y-4">
                    <h3 className="font-bold text-lg text-primary">Comment puis-je suivre ma candidature ?</h3>
                    <p className="text-muted-foreground text-sm">
                      Entrez votre NUPCAN dans la barre de recherche sur la page d'accueil pour accéder à votre tableau de bord et vérifier l'état de votre dossier.
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all p-6 border-0 bg-white">
                  <CardContent className="space-y-4">
                    <h3 className="font-bold text-lg text-primary">Que faire si mon paiement échoue ?</h3>
                    <p className="text-muted-foreground text-sm">
                      Contactez notre support 24/7 via l'email gabconcours@gmail.com ou appelez le +24174604327 pour assistance.
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all p-6 border-0 bg-white">
                  <CardContent className="space-y-4">
                    <h3 className="font-bold text-lg text-primary">Les concours sont-ils gratuits ?</h3>
                    <p className="text-muted-foreground text-sm">
                      Grâce au programme NGori, certains concours sont gratuits cette année. Vérifiez les détails de chaque concours pour les frais applicables.
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all p-6 border-0 bg-white">
                  <CardContent className="space-y-4">
                    <h3 className="font-bold text-lg text-primary">Comment contacter le support ?</h3>
                    <p className="text-muted-foreground text-sm">
                      Vous pouvez nous joindre par email à support@gabconcours.com ou par téléphone au +24174604327, disponible 24/7.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="text-center mt-8">
                <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleNavigation('/support')}
                    className="px-8"
                >
                  Plus de questions ?
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 bg-primary text-white">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl font-bold mb-4">
                Qu'avons-nous aujourd'hui ?

              </h2>
              <p className="text-xl mb-8 text-primary-foreground/80">
                Rejoignez nous pour votre reussite
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                    size="lg"
                    variant="secondary"
                    className="px-8 py-4 text-lg"
                    onClick={() => handleNavigation('/concours')}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Voir concours
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-4 text-lg border-white text-black hover:bg-white hover:text-primary"
                    onClick={() => handleNavigation('/connexion')}
                >
                  Acceder à mon espace
                </Button>
              </div>
            </div>
          </section>
        </div>
      </Layout>
  );
};

export default Index;
