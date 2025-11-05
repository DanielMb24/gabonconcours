import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalContent } from '@/components/ui/modal';
import { FileText, Upload, CheckCircle, XCircle, Clock, Trash2, Eye, RefreshCw } from 'lucide-react';
import { documentService } from '@/services/documentService';
import ErrorModal from '@/components/modals/ErrorModal';
import SuccessModal from '@/components/modals/SuccessModal';

interface DocumentsManagerProps {
    nupcan: string;
}

const DOCUMENTS_OBLIGATOIRES = [
    { nom: 'Acte de naissance', code: 'acte_naissance' },
    { nom: 'Carte d\'identité', code: 'carte_identite' },
    { nom: 'Diplôme', code: 'diplome' },
    { nom: 'Bulletin de notes', code: 'bulletin' },
];

const DocumentsManager: React.FC<DocumentsManagerProps> = ({ nupcan }) => {
    const queryClient = useQueryClient();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showReplaceModal, setShowReplaceModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [uploadData, setUploadData] = useState({
        nomdoc: '',
        file: null as File | null
    });
    const [errorModal, setErrorModal] = useState({ show: false, message: '' });
    const [successModal, setSuccessModal] = useState({ show: false, message: '' });

    // Récupérer les documents
    const { data: documents, refetch } = useQuery({
        queryKey: ['documents', nupcan],
        queryFn: () => documentService.getDocumentsByNupcan(nupcan),
    });

    // Upload de document
    const uploadMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            return await documentService.uploadDocument(formData);
        },
        onSuccess: () => {
            setSuccessModal({ show: true, message: 'Document ajouté avec succès !' });
            setShowUploadModal(false);
            setUploadData({ nomdoc: '', file: null });
            refetch();
        },
        onError: (error: any) => {
            setErrorModal({ 
                show: true, 
                message: error.message || 'Erreur lors de l\'ajout du document' 
            });
        }
    });

    // Remplacement de document
    const replaceMutation = useMutation({
        mutationFn: async ({ id, formData }: { id: string, formData: FormData }) => {
            return await documentService.replaceDocument(id, formData);
        },
        onSuccess: () => {
            setSuccessModal({ show: true, message: 'Document remplacé avec succès !' });
            setShowReplaceModal(false);
            setSelectedDocument(null);
            setUploadData({ nomdoc: '', file: null });
            refetch();
        },
        onError: (error: any) => {
            setErrorModal({ 
                show: true, 
                message: error.message || 'Erreur lors du remplacement du document' 
            });
        }
    });

    // Suppression de document
    const deleteMutation = useMutation({
        mutationFn: async (documentId: string) => {
            await documentService.deleteDocument(nupcan, documentId);
        },
        onSuccess: () => {
            setSuccessModal({ show: true, message: 'Document supprimé avec succès' });
            refetch();
        },
        onError: () => {
            setErrorModal({ show: true, message: 'Erreur lors de la suppression' });
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const extension = file.name.split('.').pop()?.toLowerCase();
            
            // Vérifier l'extension
            if (!['pdf', 'jpg', 'jpeg', 'png'].includes(extension || '')) {
                setErrorModal({ 
                    show: true, 
                    message: 'Format non accepté. Utilisez: PDF, JPG, PNG' 
                });
                return;
            }

            // Extraire le nom du document depuis le nom de fichier
            const fileName = file.name.replace(/\.[^/.]+$/, ""); // Enlever l'extension
            setUploadData({ 
                nomdoc: fileName,
                file 
            });
        }
    };

    const handleUpload = () => {
        if (!uploadData.file || !uploadData.nomdoc) {
            setErrorModal({ show: true, message: 'Veuillez remplir tous les champs' });
            return;
        }

        // Vérifier si le document existe déjà
        const exists = documents?.some(doc => 
            doc.nomdoc.toLowerCase() === uploadData.nomdoc.toLowerCase()
        );
        
        if (exists) {
            setErrorModal({ 
                show: true, 
                message: 'Un document avec ce nom existe déjà' 
            });
            return;
        }

        const formData = new FormData();
        formData.append('file', uploadData.file);
        formData.append('nomdoc', uploadData.nomdoc);
        formData.append('nupcan', nupcan);
        formData.append('type', uploadData.file.type);

        uploadMutation.mutate(formData);
    };

    const handleReplace = () => {
        if (!uploadData.file || !selectedDocument) {
            setErrorModal({ show: true, message: 'Veuillez sélectionner un fichier' });
            return;
        }

        const formData = new FormData();
        formData.append('file', uploadData.file);
        if (uploadData.nomdoc) {
            formData.append('nomdoc', uploadData.nomdoc);
        }

        replaceMutation.mutate({ 
            id: selectedDocument.id, 
            formData 
        });
    };

    const handleDelete = (documentId: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
            deleteMutation.mutate(documentId);
        }
    };

    const getStatutBadge = (statut: string) => {
        const badges: any = {
            'valide': <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Validé</Badge>,
            'rejete': <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejeté</Badge>,
            'en_attente': <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />En attente</Badge>,
        };
        return badges[statut] || badges['en_attente'];
    };

    return (
        <div className="space-y-6">
            {/* Indication */}
            <Card className="border-blue-200 bg-blue-50 animate-fade-in">
                <CardContent className="p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Important :</strong> Veuillez nommer vos fichiers avec le nom du document demandé. 
                        Par exemple : <code>Acte de naissance.pdf</code>
                    </p>
                </CardContent>
            </Card>

            {/* Liste des documents */}
            <Card className="animate-fade-in">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Mes Documents ({documents?.length || 0})</span>
                        <Button onClick={() => setShowUploadModal(true)} size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Ajouter
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {documents && documents.length > 0 ? (
                        <div className="space-y-4">
                            {documents.map((doc: any) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all animate-fade-in"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <FileText className="h-8 w-8 text-primary" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{doc.nomdoc}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {doc.type || 'N/A'}
                                            </p>
                                        </div>
                                        {getStatutBadge(doc.document_statut)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(documentService.getDocumentPreviewUrl(doc.id), '_blank')}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        {doc.document_statut === 'rejete' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedDocument(doc);
                                                        setShowReplaceModal(true);
                                                    }}
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(doc.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Aucun document téléversé</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal Upload */}
            <Modal open={showUploadModal} onOpenChange={setShowUploadModal}>
                <ModalContent>
                    <div className="p-6 space-y-4">
                        <h2 className="text-2xl font-bold">Ajouter un Document</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Nom du document</label>
                                <Input
                                    value={uploadData.nomdoc}
                                    onChange={(e) => setUploadData({ ...uploadData, nomdoc: e.target.value })}
                                    placeholder="Ex: Acte de naissance"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Fichier</label>
                                <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
                                Ajouter
                            </Button>
                            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                                Annuler
                            </Button>
                        </div>
                    </div>
                </ModalContent>
            </Modal>

            {/* Modal Remplacement */}
            <Modal open={showReplaceModal} onOpenChange={setShowReplaceModal}>
                <ModalContent>
                    <div className="p-6 space-y-4">
                        <h2 className="text-2xl font-bold">Remplacer le Document</h2>
                        <p className="text-sm text-muted-foreground">
                            Document actuel: <strong>{selectedDocument?.nomdoc}</strong>
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Nouveau nom (optionnel)</label>
                                <Input
                                    value={uploadData.nomdoc}
                                    onChange={(e) => setUploadData({ ...uploadData, nomdoc: e.target.value })}
                                    placeholder="Laisser vide pour garder le même nom"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Nouveau fichier</label>
                                <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={handleReplace} disabled={replaceMutation.isPending}>
                                Remplacer
                            </Button>
                            <Button variant="outline" onClick={() => setShowReplaceModal(false)}>
                                Annuler
                            </Button>
                        </div>
                    </div>
                </ModalContent>
            </Modal>

            {/* Modales de résultat */}
            <ErrorModal
                isOpen={errorModal.show}
                onClose={() => setErrorModal({ show: false, message: '' })}
                message={errorModal.message}
            />
            <SuccessModal
                isOpen={successModal.show}
                onClose={() => setSuccessModal({ show: false, message: '' })}
                message={successModal.message}
            />
        </div>
    );
};

export default DocumentsManager;
