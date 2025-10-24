
import React, { useState } from 'react';
import { documentService } from '@/services/documentService.ts';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { toast } from '@/hooks/use-toast.ts';
import { Loader2, Save, Upload } from 'lucide-react';

interface DocumentEditFormProps {
    document: any; // document à modifier
    onUpdated?: () => void; // callback pour recharger les données après modification
    onCancel?: () => void; // retour ou fermeture du modal
}

const DocumentEditForm: React.FC<DocumentEditFormProps> = ({ document, onUpdated, onCancel }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!file) {
            toast({
                title: 'Aucun fichier',
                description: 'Veuillez sélectionner un fichier à uploader',
                variant: 'destructive'
            });
            return;
        }

        // ✅ Le candidat peut uniquement remplacer le fichier, pas changer le statut
        if (document.document_statut !== 'rejete') {
            toast({
                title: 'Action non autorisée',
                description: 'Seuls les documents rejetés peuvent être remplacés',
                variant: 'destructive'
            });
            return;
        }
        
        setIsSubmitting(true);

        try {
            // Remplacement du fichier uniquement
            await documentService.replaceDocument(document.id, file);

            toast({ 
                title: 'Succès', 
                description: 'Le document a été remplacé avec succès. Il est maintenant en attente de validation.' 
            });

            if (onUpdated) onUpdated();
            if (onCancel) onCancel();
        } catch (error: any) {
            console.error('Erreur remplacement document:', error);
            toast({
                title: 'Erreur',
                description: error.message || 'Impossible de remplacer le document',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ℹ️ Vous ne pouvez remplacer que les documents rejetés. Le nouveau fichier sera soumis pour validation.
                </p>
            </div>

            {/* Informations du document (lecture seule) */}
            <div>
                <Label>Nom du document</Label>
                <Input
                    value={document.nomdoc}
                    disabled
                    className="bg-muted"
                />
            </div>

            <div>
                <Label>Statut actuel</Label>
                <Input
                    value={document.document_statut === 'rejete' ? 'Rejeté' : 
                           document.document_statut === 'valide' ? 'Validé' : 'En attente'}
                    disabled
                    className="bg-muted"
                />
                {document.commentaire_validation && (
                    <p className="text-sm text-destructive mt-2">
                        Raison du rejet: {document.commentaire_validation}
                    </p>
                )}
            </div>

            {/* Fichier à uploader */}
            <div>
                <Label htmlFor="file">Nouveau fichier *</Label>
                <Input
                    id="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    required
                />
                {file && (
                    <p className="text-sm text-muted-foreground mt-2">
                        ✅ Fichier sélectionné : {file.name}
                    </p>
                )}
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" type="button" onClick={onCancel}>
                    Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting || !file}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Remplacement en cours...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            Remplacer le document
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};

export default DocumentEditForm;
