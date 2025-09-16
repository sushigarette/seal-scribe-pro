# Fonctionnalités de MHCerts

## Surveillance et monitoring

**MHCerts surveille automatiquement tous vos certificats numériques en temps réel.** L'application se connecte à votre API MHComm pour récupérer la liste complète des certificats et les analyser continuellement. Elle détecte instantanément les certificats qui ont expiré ou qui vont expirer dans les 60 prochains jours, vous permettant d'agir avant qu'il ne soit trop tard.

**Le système utilise une authentification par certificat client pour garantir la sécurité de vos données.** Vos certificats client (.crt et .key) sont utilisés pour s'authentifier auprès de l'API, assurant que seules les personnes autorisées peuvent accéder à vos informations sensibles.

## Tableau de bord intelligent

**Le tableau de bord affiche quatre cartes statistiques qui donnent une vue d'ensemble immédiate de l'état de vos certificats.** Vous pouvez voir en un coup d'œil le nombre total de certificats, combien sont encore valides, combien expirent bientôt, et combien ont déjà expiré. Ces cartes sont interactives : cliquez dessus pour filtrer automatiquement la liste des certificats correspondants.

**Un bouton d'actualisation permet de forcer la mise à jour des données à tout moment.** L'application se met à jour automatiquement toutes les 5 minutes, mais vous pouvez également déclencher une actualisation manuelle si vous avez besoin des données les plus récentes.

## Classification automatique des certificats

**MHCerts analyse intelligemment chaque certificat pour déterminer son type et son usage.** L'application examine le Distinguished Name (DN) de chaque certificat pour identifier s'il s'agit d'un certificat SSL/TLS pour un site web, d'un certificat de signature de code, d'un certificat email, d'un certificat client, ou d'un autre type spécialisé.

**Le système génère des noms lisibles à partir des données techniques.** Au lieu de voir des chaînes cryptiques, vous obtenez des noms clairs comme "Site Web Principal (MHComm)" ou "Certificat Tablette AURAL" qui vous permettent d'identifier immédiatement l'usage de chaque certificat.

## Gestion des certificats traités

**MHCerts vous permet de marquer les certificats comme "traités" une fois que vous avez effectué les actions nécessaires.** Cette fonctionnalité évite de retraiter les mêmes certificats plusieurs fois et vous aide à vous concentrer sur ceux qui nécessitent encore une attention.

**L'interface est organisée en deux onglets distincts : "En attente" et "Traités".** L'onglet "En attente" affiche tous les certificats qui nécessitent une action de votre part, tandis que l'onglet "Traités" montre l'historique des certificats que vous avez déjà mis à jour, avec la date et l'heure du traitement.

**Vous pouvez remettre un certificat en attente si vous vous êtes trompé.** Un bouton "Remettre en attente" permet de dé-marquer un certificat traité, avec une confirmation pour éviter les erreurs. Le certificat réapparaîtra alors dans la liste des certificats en attente.

## Recherche et filtrage avancés

**La barre de recherche vous permet de trouver rapidement un certificat spécifique.** Vous pouvez rechercher par nom de certificat, par émetteur, par numéro de série, ou par toute autre information visible dans la liste.

**Les filtres par statut vous permettent de vous concentrer sur les certificats qui nécessitent une action.** Filtrez pour voir seulement les certificats valides, ceux qui expirent bientôt, ou ceux qui ont déjà expiré, selon vos besoins du moment.

**Les filtres par type vous aident à organiser votre travail par catégorie.** Affichez seulement les certificats SSL/TLS, les certificats de signature de code, les certificats email, ou tout autre type spécifique selon votre planification.

**Tous les filtres peuvent être combinés pour une recherche très précise.** Vous pouvez par exemple rechercher tous les certificats SSL/TLS qui expirent bientôt et qui contiennent "production" dans leur nom, pour vous concentrer sur les certificats les plus critiques.

## Pagination performante

**La pagination intelligente améliore considérablement les performances de l'application.** Au lieu d'afficher des centaines de certificats d'un coup, l'application les répartit sur plusieurs pages, rendant l'interface beaucoup plus rapide et réactive.

**Vous pouvez personnaliser le nombre d'éléments affichés par page.** Choisissez entre 5, 10, 20, 50, ou 100 certificats par page selon vos préférences et la puissance de votre ordinateur.

**La navigation entre les pages est intuitive et informative.** Des boutons précédent/suivant, des numéros de pages, et un compteur d'éléments vous permettent de naviguer facilement dans vos données et de savoir exactement où vous vous trouvez.

**La pagination se réinitialise automatiquement lors des filtres.** Quand vous appliquez un nouveau filtre, l'application retourne automatiquement à la première page des résultats, vous évitant de rester bloqué sur une page vide.

## Export de données

**L'export CSV vous permet de sauvegarder et partager vos données facilement.** Vous pouvez exporter tous les certificats visibles (selon les filtres appliqués) dans un fichier CSV compatible avec Excel, LibreOffice, ou tout autre tableur.

**Le nom du fichier est généré intelligemment selon vos filtres.** Si vous filtrez par statut "expiré", le fichier s'appellera "certificats_expired_2024-01-15.csv", vous permettant d'identifier facilement le contenu de chaque export.

**L'export inclut toutes les informations importantes de chaque certificat.** Nom, émetteur, date d'expiration, statut, type, numéro de série, et nom distingué sont tous inclus dans le fichier CSV pour une documentation complète.

## Vue détaillée des certificats

**Chaque certificat peut être consulté en détail dans une popup élégante.** Cliquez sur "Voir détails" pour accéder à toutes les informations techniques d'un certificat dans une interface claire et organisée.

**La vue détaillée affiche toutes les informations techniques importantes.** Numéro de série, nom distingué complet, dates de validité, et autres métadonnées sont présentées de manière structurée et lisible.

**Vous pouvez effectuer des actions directement depuis la vue détaillée.** Télécharger le certificat ou le marquer comme traité sans avoir à revenir à la liste principale.

## Synchronisation et persistance des données

**Vos données sont sauvegardées localement et synchronisées avec le serveur.** Même en cas de problème de connexion, vos actions sont conservées localement et seront synchronisées dès que la connexion sera rétablie.

**Le système de certificats traités est persistant entre les sessions.** Les certificats que vous marquez comme traités restent marqués même après avoir fermé et rouvert l'application.

**La synchronisation se fait automatiquement en arrière-plan.** Chaque fois que vous marquez un certificat comme traité, l'information est immédiatement sauvegardée localement et synchronisée avec le serveur pour être disponible sur tous vos appareils.

## Interface utilisateur moderne

**L'interface est conçue pour être intuitive et agréable à utiliser.** Des couleurs cohérentes, des icônes claires, et une mise en page soignée rendent l'utilisation de l'application plaisante et efficace.

**L'application est entièrement responsive et s'adapte à tous les écrans.** Que vous utilisiez un ordinateur de bureau, une tablette, ou un smartphone, l'interface s'ajuste automatiquement pour offrir la meilleure expérience possible.

**Les actions importantes sont confirmées avant exécution.** Des popups de confirmation vous protègent contre les erreurs accidentelles, particulièrement lors du dé-marquage des certificats traités.

## Gestion des erreurs et notifications

**L'application gère gracieusement les erreurs de connexion et les problèmes techniques.** Des messages clairs vous informent de ce qui se passe et vous guident pour résoudre les problèmes.

**Des notifications toast vous tiennent informé des actions effectuées.** Chaque fois que vous marquez un certificat comme traité, exportez des données, ou effectuez toute autre action, une notification confirme que l'opération s'est bien déroulée.

**Les erreurs sont loggées et peuvent être consultées pour le débogage.** Si un problème persiste, les logs détaillés vous aident à identifier la cause et à la résoudre rapidement.
