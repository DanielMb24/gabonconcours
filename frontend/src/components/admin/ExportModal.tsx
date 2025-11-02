// src/components/admin/ExportModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { exportService } from '@/services/exportService';
import { Loader2 } from 'lucide-react';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  concoursList: any[];
}

const ExportModal: React.FC<ExportModalProps> = ({ open, onClose, concoursList }) => {
  const [selectedConcours, setSelectedConcours] = useState<number | null>(null);
  const [selectedFiliere, setSelectedFiliere] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel');

  // TODO : Si tu veux charger les filières par concours :
  const filieres = [
    { id: 1, nom: 'Informatique' },
    { id: 2, nom: 'Gestion' },
    { id: 3, nom: 'Droit' },
  ];

  const handleExport = async () => {
    if (!selectedConcours) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner un concours.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      if (exportType === 'excel') {
        await exportService.exportCandidatesExcel(selectedConcours, selectedFiliere || undefined);
      } else {
        await exportService.exportCandidatesPDF(selectedConcours, selectedFiliere || undefined);
      }

      toast({
        title: 'Export réussi',
        description: `Fichier ${exportType.toUpperCase()} généré avec succès.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: `Échec de l'export ${exportType.toUpperCase()}.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exporter les candidats</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Choix du type d’export */}
          <div>
            <label className="block text-sm font-medium mb-2">Format</label>
            <Select value={exportType} onValueChange={(v: any) => setExportType(v)}>
              <SelectTrigger><SelectValue placeholder="Choisir un format" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="pdf">PDF (.pdf)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Choix du concours */}
          <div>
            <label className="block text-sm font-medium mb-2">Concours</label>
            <Select
              value={selectedConcours?.toString() || ''}
              onValueChange={(v: any) => setSelectedConcours(Number(v))}
            >
              <SelectTrigger><SelectValue placeholder="Sélectionner un concours" /></SelectTrigger>
              <SelectContent>
                {concoursList.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.libcnc} ({c.sescnc})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Choix de la filière */}
          <div>
            <label className="block text-sm font-medium mb-2">Filière</label>
            <Select
              value={selectedFiliere?.toString() || ''}
              onValueChange={(v: any) => setSelectedFiliere(Number(v))}
            >
              <SelectTrigger><SelectValue placeholder="Toutes les filières" /></SelectTrigger>
              <SelectContent>
                {filieres.map((f) => (
                  <SelectItem key={f.id} value={f.id.toString()}>
                    {f.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleExport} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
            Exporter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
