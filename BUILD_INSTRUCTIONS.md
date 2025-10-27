# Instructions de Build Importantes

## ⚠️ CONFIGURATION REQUISE

### 1. Ajouter le script build:dev dans package.json

**Vous devez ajouter manuellement** cette ligne dans la section `"scripts"` du fichier `package.json` :

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:dev": "vite build --mode development",
    "preview": "vite preview"
  }
}
```

**Important** : Lovable ne peut pas modifier automatiquement le fichier package.json. Vous devez l'éditer vous-même.

### 2. Corrections Apportées

#### A. Documents candidats

✅ **Route POST /api/dossiers/add-document** créée
- Permet d'ajouter jusqu'à 3 documents supplémentaires
- Vérifie la limite de documents
- Gère correctement les fichiers uploadés

✅ **Route GET /api/documents/:id/download** créée
- Permet de télécharger/visualiser les documents
- Gère correctement les types MIME (PDF, images)
- Affiche les documents inline dans le navigateur

✅ **Méthode Document.replace()** corrigée
- Conserve le nom et le type du document original
- Ne modifie que le fichier physique et le statut
- Évite les incohérences après remplacement

#### B. Composants Super Admin

✅ **ConcoursFilieresManagement.tsx** corrigé
- Types TypeScript corrigés
- Utilisation correcte de `ApiResponse<any[]>`
- Plus d'erreurs `SetStateAction<unknown>`

✅ **FiliereMatieresManagement.tsx** corrigé
- Types TypeScript corrigés
- Méthodes API typées correctement
- Interface cohérente

#### C. Système de documents

✅ **AddDocumentModal.tsx** 
- Prêt à être utilisé
- Limite de 3 documents supplémentaires
- Validation côté client et serveur

### 3. Tests à Effectuer

1. **Documents candidats**
   - Ajouter un nouveau document via la modal
   - Remplacer un document rejeté
   - Visualiser un document (PDF/image)

2. **Super Admin**
   - Accéder à "Concours x Filières"
   - Accéder à "Filières x Matières"
   - Vérifier les statistiques
   - Consulter le journal d'activité

3. **Messagerie**
   - Tester l'envoi de messages candidat → admin
   - Tester l'envoi de messages admin → candidat
   - Vérifier les notifications

### 4. Prochaines Étapes

Si vous rencontrez des erreurs :
1. Vérifiez que le script `build:dev` est bien ajouté
2. Relancez le serveur backend
3. Vérifiez les logs de la console
4. Testez les routes une par une

## 📝 Note Importante

Le build ne fonctionnera pas tant que vous n'aurez pas ajouté manuellement le script `build:dev` dans package.json.
