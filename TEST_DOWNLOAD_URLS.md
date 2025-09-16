# Test des URLs de téléchargement

## Format d'URL
```
https://office.mhcomm.fr/exchg/scratch/certs_mg_app_{nom_certificat}.tar.gz
```

## Exemples de transformation

### Certificat SSL/TLS
- **Nom original** : `logsvc_aural`
- **Nom transformé** : `logsvc_aural`
- **URL générée** : `https://office.mhcomm.fr/exchg/scratch/certs_mg_app_logsvc_aural.tar.gz`

### Certificat de tablette
- **Nom original** : `tab_aural_000729313851`
- **Nom transformé** : `tab_aural_000729313851`
- **URL générée** : `https://office.mhcomm.fr/exchg/scratch/certs_mg_app_tab_aural_000729313851.tar.gz`

### Certificat avec caractères spéciaux
- **Nom original** : `Site Web Principal (MHComm)`
- **Nom transformé** : `site_web_principal_mhcomm`
- **URL générée** : `https://office.mhcomm.fr/exchg/scratch/certs_mg_app_site_web_principal_mhcomm.tar.gz`

### Certificat avec espaces et tirets
- **Nom original** : `Code-Signing Certificate`
- **Nom transformé** : `code_signing_certificate`
- **URL générée** : `https://office.mhcomm.fr/exchg/scratch/certs_mg_app_code_signing_certificate.tar.gz`

## Logique de transformation

1. **Conversion en minuscules** : `toLowerCase()`
2. **Suppression de "mhcomm"** : `mhcomm` → `` (supprimé)
3. **Remplacement des caractères spéciaux** : `[^a-z0-9]` → `_`
4. **Suppression des underscores multiples** : `_+` → `_`
5. **Suppression des underscores en début/fin** : `^_|_$` → ``

## Test en JavaScript

```javascript
function generateDownloadUrl(certificateName) {
  const fileName = certificateName
    .toLowerCase()
    .replace(/mhcomm/g, '') // Supprimer "mhcomm"
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  return `https://office.mhcomm.fr/exchg/scratch/certs_mg_app_${fileName}.tar.gz`;
}

// Tests
console.log(generateDownloadUrl("logsvc_aural"));
// → https://office.mhcomm.fr/exchg/scratch/certs_mg_app_logsvc_aural.tar.gz

console.log(generateDownloadUrl("tab_aural_000729313851"));
// → https://office.mhcomm.fr/exchg/scratch/certs_mg_app_tab_aural_000729313851.tar.gz

console.log(generateDownloadUrl("Site Web Principal (MHComm)"));
// → https://office.mhcomm.fr/exchg/scratch/certs_mg_app_site_web_principal_.tar.gz

console.log(generateDownloadUrl("tab_aural_000729313851_mhcomm"));
// → https://office.mhcomm.fr/exchg/scratch/certs_mg_app_tab_aural_000729313851_.tar.gz
```

## Vérification des URLs

Pour tester si une URL fonctionne, vous pouvez :

1. **Copier l'URL** générée
2. **L'ouvrir dans un navigateur** (nouvel onglet)
3. **Vérifier** que le téléchargement commence

## Gestion des erreurs

Si une URL ne fonctionne pas, cela peut être dû à :
- **Nom de fichier incorrect** : Le nom généré ne correspond pas au fichier réel
- **Certificat non disponible** : Le fichier n'existe pas sur le serveur
- **Problème de permissions** : Accès refusé au fichier
- **Problème de réseau** : Connexion au serveur impossible

## Améliorations possibles

1. **Vérification de l'existence** : Tester l'URL avant de l'ouvrir
2. **Gestion des erreurs** : Afficher un message si le téléchargement échoue
3. **Cache des URLs** : Mémoriser les URLs qui fonctionnent
4. **Fallback** : Essayer différentes variantes du nom de fichier
