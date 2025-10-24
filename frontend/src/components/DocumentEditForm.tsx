
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
    const [formData, setFormData] = useState({
        nomdoc: document.nomdoc || '',
        file : document.files,
        type: document.type || 'pdf',
        statut: document.document_statut || 'en_attente',
        commentaire: document.commentaire || '',
    });
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // ✅ Étape 1 : mise à jour du statut ou des infos
            await documentService.updateDocumentStatus(document.id, formData.statut, formData.commentaire);

            // ✅ Étape 2 : remplacement du fichier si un nouveau est choisi
            if (file) {
                await documentService.replaceDocument(document.id, formData.file);
            }

            toast({ title: 'Succès', description: 'Le document a été modifié avec succès.' });

            if (onUpdated) onUpdated();
            if (onCancel) onCancel();
        } catch (error: any) {
            console.error('Erreur modification document:', error);
            toast({
                title: 'Erreur',
                description: error.message || 'Impossible de modifier le document',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom du document */}
            <div>
                <Label htmlFor="nomdoc">Nom du document</Label>
                <Input
                    id="nomdoc"
                    name="nomdoc"
                    value={formData.nomdoc}
                    onChange={handleChange}
                    placeholder="Ex: Relevé de notes"
                />
            </div>

            {/* Type */}
            <div>
                <Label htmlFor="type">Type</Label>
                <Select
                    onValueChange={value => setFormData(prev => ({ ...prev, type: value }))}
                    value={formData.type}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Statut */}
            <div>
                <Label htmlFor="statut">Statut</Label>
                <Select
                    onValueChange={value => setFormData(prev => ({ ...prev, statut: value }))}
                    value={formData.statut}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Choisir un statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en_attente">En attente</SelectItem>
                        <SelectItem value="valide">Validé</SelectItem>
                        <SelectItem value="rejete">Rejeté</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Commentaire */}
            <div>
                <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
                <Textarea
                    id="commentaire"
                    name="commentaire"
                    value={formData.commentaire}
                    onChange={handleChange}
                    placeholder="Raison du rejet, remarques administratives, etc."
                />
            </div>

            {/* Fichier */}
            <div>
                <Label htmlFor="file">Remplacer le fichier (facultatif)</Label>
                <Input
                    id="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                />
                {file && <p className="text-sm text-muted-foreground mt-1">Nouveau fichier : {file.name}</p>}
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" type="button" onClick={onCancel}>
                    Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enregistrement...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};

export default DocumentEditForm;
