# 🚨 ACTION REQUISE - Configuration Build

## Problème
Le script `build:dev` est manquant dans votre `package.json`.

## Solution
Vous devez **ajouter manuellement** ce script à votre fichier `package.json` :

### Étapes :
1. Ouvrez le fichier `package.json` à la racine du projet
2. Dans la section `"scripts"`, ajoutez la ligne suivante :
   ```json
   "build:dev": "vite build --mode development"
   ```

### Exemple de configuration complète :
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

3. Sauvegardez le fichier

## Après avoir ajouté le script
- Redémarrez le serveur backend : `cd backend && npm start`
- Le build devrait maintenant fonctionner correctement

---
**Note**: Je ne peux pas modifier directement le fichier `package.json` - vous devez le faire manuellement.
