import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, User, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

const LoginCandidat = () => {
  const [nupcan, setNupcan] = useState('');
  const [showNupcan, setShowNupcan] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nupcan.trim()) {
      toast({
        title: "NUPCAN requis",
        description: "Veuillez saisir votre numéro de candidature",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.makeRequest(`/candidats/nupcan/${nupcan.trim()}`, 'GET');
      
      if (response.success && response.data) {
        localStorage.setItem('nupcan', nupcan.trim());
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${response.data.prncan} ${response.data.nomcan}`,
        });
        navigate('/candidat/dashboard');
      } else {
        throw new Error('Candidat non trouvé');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast({
        title: "Erreur de connexion",
        description: "NUPCAN introuvable. Vérifiez votre numéro de candidature.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center py-12 px-4">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Illustration & Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden md:block space-y-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-12 flex items-center justify-center">
                <GraduationCap className="w-48 h-48 text-primary/40" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Bienvenue sur GABConcours</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Accédez à votre espace candidat pour suivre votre candidature en temps réel,
                gérer vos documents et consulter vos résultats.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Suivi en temps réel</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Documents sécurisés</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Notifications instantanées</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="shadow-2xl border-2 border-primary/10">
              <CardHeader className="space-y-1 pb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <LogIn className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">
                  Connexion Candidat
                </CardTitle>
                <p className="text-center text-muted-foreground">
                  Saisissez votre NUPCAN pour accéder à votre dashboard
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nupcan" className="text-base font-medium">
                      Numéro de candidature (NUPCAN)
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="nupcan"
                        type={showNupcan ? 'text' : 'password'}
                        value={nupcan}
                        onChange={(e) => setNupcan(e.target.value)}
                        placeholder="Ex: 20250128-1"
                        className="pl-10 pr-10 py-6 text-base"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNupcan(!showNupcan)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNupcan ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Format: 2025moisjour-numéro (reçu par email après inscription)
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-6 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 mr-2" />
                        Se connecter
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-8 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-muted" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Pas encore inscrit ?
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full py-6"
                    onClick={() => navigate('/concours')}
                  >
                    Découvrir les concours disponibles
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6 bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-primary" />
                  Informations importantes
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Conservez précieusement votre NUPCAN, c'est votre identifiant unique</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>En cas de perte, contactez le support avec vos informations d'inscription</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Consultez régulièrement votre dashboard pour les mises à jour</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginCandidat;
