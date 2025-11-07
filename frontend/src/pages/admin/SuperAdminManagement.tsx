import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CrudManager from '@/components/admin/CrudManager';
import GestionNiveaux from "@/pages/admin/GestionNiveaux.tsx";
import Concours from "@/pages/admin/Concours.tsx";

const SuperAdminManagement: React.FC = () => {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Gestion Globale</h1>
                <p className="text-muted-foreground">
                    Gérer les concours, établissements, filières et matières
                </p>
            </div>

            <Tabs defaultValue="matieres" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                
                    <TabsTrigger value="matieres">Matières</TabsTrigger>
                   
                    
                </TabsList>

              

                <TabsContent value="matieres">
                    <CrudManager entity="matieres" title="Matières" />
                </TabsContent>

              
            </Tabs>
        </div>
    );
};

export default SuperAdminManagement;
