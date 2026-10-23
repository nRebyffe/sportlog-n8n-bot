---
name: Hostile Review
description: "Évalue le travail (code, diff, projet, document) avec une posture hostile : trois personas (le Saboteur, le Nouveau venu, l'Auditeur sécurité) qui doivent chacun trouver un vrai problème, puis un verdict BLOCK / CONCERNS / CLEAN. Utilise ce skill uniquement sur demande d'évaluation explicite — « évaluer ce projet », « évalue ça », « évalue ce code », « casse-moi ce code », « relis ce projet », « note ce projet », revue de code, diff ou PR avant merge. Ne te déclenche PAS sur « qu'en penses-tu ? », « relis-toi » ou « c'est bon ? » : ces demandes-là relèvent du doute interne (skill doubt-driven-dev), qui ne coûte aucun sous-agent."
---

# Hostile Review — la relecture qui attaque

## En bref

Quand l'utilisateur demande ton avis, tu ne réponds pas « ça a l'air bien ». Tu passes la demande au crible : **trois personas hostiles**, lancés en parallèle, aucun ne voit les constats des autres, puis un verdict.

Le but : casser la monoculture de l'auto-revue. Une IA qui relit son propre code partage le modèle mental de l'auteur — d'où les « LGTM » sur du code qu'un relecteur humain frais aurait signalé immédiatement.

## Quand

**Utilise ce skill — demande d'évaluation explicite :**

- « Évaluer ce projet », « évalue ça », « évalue ce code », « relis ce projet », « casse-moi ce code », « note ce projet ».
- Revue de code, diff ou PR avant merge.
- Un changement touche de la surface sensible : auth, données, concurrence, migrations, permissions.

**Ne l'utilise pas :**

- Sur « qu'en penses-tu ? », « relis-toi », « c'est bon ? » : demande d'avis **légère** → **doute interne** (skill `doubt-driven-dev`), aucun sous-agent. Le doute suffit, il ne coûte rien. Le passage à la revue à trois personas doit être demandé, pas déduit.
- Sur un changement trivial (doc, commentaire, typo) : le rapport coûte plus cher que le risque.

**Coût de ce skill :** trois sous-agents + une passe de lecture complète. C'est pourquoi il ne se déclenche que sur demande explicite.

## Ce que tu fais

### 1. Rassembler la matière

- Sans argument : `git diff` + `git diff --cached`. Si les deux sont vides : `git diff HEAD~1`.
- Sur un chemin de fichier : lis le fichier entier.
- Sur une référence de diff : `git diff <ref>`.

Si rien à relire, arrête et dis-le : « Rien à relire. »

### 2. Lire le contexte complet

Pour chaque fichier touché : lis le **fichier entier**, pas seulement les lignes modifiées — les bugs vivent dans l'interaction entre le nouveau code et l'existant. Relève l'intention du changement (correctif, feature, refactor, config, test) et les conventions du projet (`AGENTS.md`, `CLAUDE.md`, `.editorconfig`, config de lint, patterns voisins).

### 3. Trois personas en parallèle

Lance-les en parallèle, dans des **sous-agents séparés** (un par persona, lancés dans le même message). L'isolation est ce qui casse la monoculture : chaque persona ne voit pas les conclusions des autres.

- **Le Saboteur** — « je veux casser ça en production ».
- **Le Nouveau venu** — « je reprends ce code dans six mois, sans contexte ».
- **L'Auditeur sécurité** — « ce code va être attaqué ».

Chacun **doit** produire au moins un constat. Si un persona ne trouve rien, il n'a pas assez creusé : qu'il note l'hypothèse la plus fragile du code.

Donne-leur les **faits** (diff, fichiers, intention du changement en une ligne factuelle, conventions), jamais ton verdict ni ton avis : un persona qui sait que l'auteur est confiant devient complaisant. Ne les laisse pas adoucir : « ça pourrait être un problème mais… » n'est pas un constat.

### 4. Fusionner, promouvoir, trancher

- **Fusionne** les constats qui décrivent le même problème (même fichier, même symptôme, même cause), même formulés différemment.
- **Promeus** d'un cran tout constat vu par 2 personas ou plus (NOTE → WARNING → CRITICAL).
- **Ne downgrade pas** en silence un CRITICAL : garde sa sévérité et ajoute une note. Le persona a vu quelque chose que tu n'as pas vu.
- **Rends un verdict** : BLOCK (1+ CRITICAL), CONCERNS (0 critical mais 2+ warnings), CLEAN (que des notes).

## Red flags

- « LGTM, rien à signaler » : si tu n'as rien trouvé, tu n'as pas assez cherché.
- Ne relire que les lignes modifiées : les bugs vivent dans l'interaction avec l'existant.
- Des constats purement cosmétiques pendant qu'un déréférencement null passe.
- Tirer à couvert (« peut-être un souci mineur ») au lieu d'être direct sur le scénario de panne.
- Reformuler le diff au lieu de dire ce qui est faux dedans.
- Ignorer le manque de tests sur du nouveau code.
- Lancer les trois personas dans le même contexte : ils se contaminent et le doute disparaît.
- Passer ton verdict aux personas : ils ne sont plus indépendants.
- Downgrader un constat en synthèse pour que le verdict soit plus doux.
- Appliquer la revue à un typo : rapport hors proportion.

## Vérification

- [ ] Le périmètre réellement revu est identifié (diff, fichier ou cible)
- [ ] Chaque fichier touché a été lu en entier, pas seulement le diff
- [ ] Les trois personas ont été lancés séparément et en parallèle, sans voir les constats des autres
- [ ] Les personas ont reçu les faits, pas ton verdict
- [ ] Chaque persona a produit au moins un constat
- [ ] Les doublons sont fusionnés et les constats vus par 2+ personas sont promus d'un cran
- [ ] Chaque constat cite un emplacement précis et un scénario de défaillance
- [ ] Aucun constat n'a été adouci en synthèse
- [ ] Un verdict BLOCK / CONCERNS / CLEAN est émis, avec le risque global en 2-3 phrases

---

# Backup analytique

## Persona 1 — Le Saboteur

**État d'esprit :** « je vais casser ce code en production. »

**Cherche :** entrées jamais validées ; état qui peut devenir incohérent ; accès concurrent sans synchronisation ; chemins d'erreur qui avalent les exceptions ou renvoient un résultat trompeur ; hypothèses sur le format, la taille ou la disponibilité des données ; off-by-one, dépassement d'entier, déréférencement null/undefined ; fuites de ressources (fichiers, connexions, abonnements, listeners).

**Processus :**

1. Pour chaque fonction modifiée : « quelle est la pire entrée possible ? »
2. Pour chaque appel externe : « et s'il échoue, expire ou renvoie n'importe quoi ? »
3. Pour chaque mutation d'état : « et si ça s'exécute deux fois ? en parallèle ? jamais ? »
4. Pour chaque condition : « et si aucune branche n'est correcte ? »

**Si le code est réellement blindé** : note l'hypothèse la plus fragile sur laquelle il repose.

## Persona 2 — Le Nouveau venu

**État d'esprit :** « je rejoins l'équipe ; dans six mois, sans contexte de l'auteur d'origine, je dois comprendre et modifier ce code. »

**Cherche :** noms qui ne communiquent pas l'intention (`data`, `process()`, `handle()`) ; logique qui exige de lire 3+ autres fichiers ; nombres et chaînes magiques ; fonctions qui font plusieurs choses sous un nom unique ; informations de type absentes ; incohérences avec le style du projet ; tests qui testent l'implémentation plutôt que le comportement ; commentaires qui décrivent le *quoi* au lieu du *pourquoi*.

**Processus :**

1. Lis chaque fonction modifiée comme si tu n'avais jamais vu le repo : comprends-tu ce qu'elle fait à partir du nom, des paramètres et du corps ?
2. Trace un chemin de bout en bout : combien de fichiers faut-il ouvrir ?
3. Un nouveau contributeur saurait-il où ajouter une fonctionnalité similaire ?
4. Cherche la connaissance implicite : « l'auteur savait quelque chose que le lecteur ne saura pas ».

**Si le code est limpide** : note le point de confusion le plus probable pour un nouveau venu.

## Persona 3 — L'Auditeur sécurité

**État d'esprit :** « ce code va être attaqué ; mon travail est de trouver la faille avant l'attaquant. »

| Catégorie | Ce qu'on cherche |
|---|---|
| **Injection** | SQL, NoSQL, commande OS, LDAP : toute entrée utilisateur qui atteint une requête ou une commande sans paramétrage |
| **Auth cassée** | identifiants en dur, contrôle d'accès manquant sur un nouvel endpoint, token de session dans l'URL ou les logs |
| **Exposition de données** | données sensibles dans les erreurs, les logs ou les réponses ; pas de chiffrement au repos ou en transit |
| **Défauts par défaut** | mode debug activé, CORS permissif, permissions en wildcard, mots de passe par défaut |
| **Contrôle d'accès manquant** | IDOR (A accède-t-il aux données de B ?), manque de contrôle de rôle, chemins d'escalade de privilèges |
| **Risque de dépendances** | nouvelles dépendances avec CVE connues, versions épinglées vulnérables, transitives inutiles |
| **Secrets** | clés API, tokens, mots de passe dans le code, la config ou les commentaires — même « temporaires » |

**Processus :**

1. Identifie chaque frontière de confiance traversée (entrée utilisateur, appel API, base, système de fichiers, variables d'environnement).
2. Pour chaque frontière : l'entrée est-elle validée ? la sortie est-elle échappée ? le moindre privilège est-il respecté ?
3. Un utilisateur authentifié peut-il escalader ses privilèges via ce changement ?
4. Ce changement expose-t-il une nouvelle surface d'attaque ?

**Si le code n'a aucune surface sécurité** : note l'hypothèse la plus proche d'un enjeu sécurité.

## Sévérités

| Sévérité | Définition | Action |
|---|---|---|
| **CRITICAL** | perte de données, brèche sécurité ou outage en production | bloque le merge |
| **WARNING** | bugs probables en cas limite, dégradation de perf, confusion des mainteneurs | à corriger, ou risque explicitement accepté |
| **NOTE** | style, petite amélioration, trou de documentation | à l'appréciation de l'auteur |

**Promotion :** un constat vu par 2 personas ou plus est promu d'un niveau.

## Format de sortie

```markdown
## Revue hostile : [ce qui a été revu]

**Portée :** [fichiers revus, lignes changées, type de changement]
**Verdict :** BLOCK / CONCERNS / CLEAN

### Constats critiques
[Ceux qui bloquent le merge]

### Warnings
[À corriger]

### Notes
[Optionnel]

### Synthèse
[2-3 phrases : quel est le profil de risque global ? Quelle est la chose la plus
importante à corriger ?]
```

## Anti-patterns de revue

| Anti-pattern | Pourquoi c'est faux |
|---|---|
| « LGTM, rien à signaler » | Tout changement a au moins un risque, une hypothèse ou une amélioration possible. |
| Uniquement des constats cosmétiques | Signaler l'espacement pendant qu'on rate un déréférencement null est pire que pas de revue. |
| Ne pas tirer à couvert | « Ici `user` peut être undefined et ça lève. » |
| Reformuler le diff | « Cette fonction gère l'authentification » n'est pas un constat : qu'est-ce qui est *faux* dans sa gestion ? |
| Ignorer le manque de tests | Du nouveau code sans test est un constat. Toujours. |
| Ne relire que les lignes changées | Lis le fichier entier. |

## Le piège de l'auto-revue

Tu relis très probablement du code que tu viens d'écrire : ton modèle mental a produit ce code, il te semblera donc naturellement correct.

Pour casser ce réflexe :

1. Relis **de bas en haut** (commence par la dernière fonction, remonte).
2. Pour chaque fonction, énonce son **contrat** *avant* de lire le corps : le corps respecte-t-il le contrat ?
3. Suppose chaque variable nullable/undefined jusqu'à preuve du contraire.
4. Fais lire les fichiers par un sous-agent qui n'a pas écrit le code : un regard neuf n'a pas les mêmes angles morts.

## Interaction avec les autres skills

- **`doubt-driven-dev`** : le doute teste une affirmation en vol ; la revue hostile audite un artefact terminé.
- **`doubt-driven-dev` (doute interne)** : avant de rendre un verdict, passe ton propre verdict au crible de la section « doute interne ».
- **Revue de code classique / `/review`** : variante à trois personas, orientée « et si ça cassait ? ».
