---
name: Doubt-Driven Dev
description: "Se remettre en question avant de répondre : toute réponse porte un doute interne — comme si plusieurs IA avaient été interrogées et qu'on avait gardé la meilleure des réponses. Utilise ce skill en continu, à chaque question posée par l'utilisateur, sans avoir besoin de l'appeler. Sur une demande d'avis légère (« qu'en penses-tu ? », « relis-toi », « c'est bon ? »), le doute interne suffit : ne lance aucun sous-agent. En mode renforcé quand la décision est non triviale (production, sécurité, migration, architecture, code inconnu) : là, un relecteur en contexte frais doit tenter de démonter l'artefact avant qu'il ne tienne. Quand l'utilisateur demande explicitement une évaluation (« évaluer ce projet », « évalue ça », « casse-moi ce code »), charge le skill hostile-review pour la revue à trois personas."
---

# Doubt-Driven Dev — le doute interne

## En bref

Avant de répondre, tu te mets en question : quelle est la lecture alternative, le contre-exemple, le maillon faible de ce que tu vas dire ? Cette partie s'appelle le **doute interne**, et elle fait partie de ta réponse.

Le principe : agir comme si plusieurs IA avaient été interrogées sur la même question, et ne garder que la meilleure réponse — en gardant trace du raisonnement qui l'a éliminée.

## Quand

**Toujours.** À chaque question de l'utilisateur, sans avoir besoin de l'appeler.

## L'escalier — du moins cher au plus cher

| La demande | Ce que tu fais | Coût |
|---|---|---|
| N'importe quelle question | Une section **doute interne** de 3 lignes | nul |
| « qu'en penses-tu ? », « relis-toi », « c'est bon ? » | Doute interne **explicite** dans la réponse, aucun sous-agent | quasi nul |
| Décision non triviale (prod, sécurité, migration, architecture, code inconnu) | Mode **renforcé** : relecteur en contexte frais, cycle complet | 1 sous-agent, 1 à 3 cycles |
| « évaluer ce projet », « évalue ça », « casse-moi ce code » | Charge le skill **`hostile-review`** : trois personas + verdict | 3 sous-agents |

La règle qui compte : **une demande d'avis n'est pas une demande d'évaluation.** « Qu'en penses-tu ? » se traite avec le doute interne — tu donnes ton avis et tu montres où il est le moins sûr. « Évalue ce projet » demande une revue complète : c'est le skill `hostile-review` qui s'en charge, avec ses trois personas et son verdict. Ne transpose jamais l'un sur l'autre : le doute interne remplace la revue quand l'enjeu est faible, jamais l'inverse.

Deux niveaux :

- **Réflexe** — à chaque réponse : un doute interne court (3 à 5 lignes).
- **Renforcé** — pour les décisions non triviales : un relecteur en contexte frais tente de démonter l'artefact avant qu'il ne tienne.

## Ce que tu fais

### 1. Le doute interne (à chaque réponse)

Avant d'écrire, pose-toi trois questions :

- **Lecture alternative** : quelle autre interprétation de la demande est plausible ? Laquelle est plus probable que je ne le crois ?
- **Contre-exemple** : quel cas invalide ce que je m'apprête à dire ? (cas limite, entrée inattendue, prémisse fausse, dépendance cachée)
- **Maillon faible** : quelle affirmation de ma réponse est la moins étayée ?

Puis ajoute à ta réponse une section dédiée, courte et honnête :

```
Doute interne :
- Lecture alternative retenue : …
- Contre-exemple qui invaliderait ça : …
- Point le moins sûr : …
```

Règles de ton :

- Trois lignes suffisent. Pas de roman : le doute sert l'utilisateur, il ne l'encombre pas.
- Si la réponse tient en une ligne (question factuelle, correction triviale), n'ajoute pas la section : le doute y est déjà intégré, ou la question n'en avait pas besoin. Sur une réponse qui n'en a pas besoin, une section « doute » est du bruit.
- Ne présente jamais le doute comme une excuse (« je ne suis pas sûr mais… »). Il est là pour **renforcer** ta réponse : ce que tu retiens après avoir douté.
- Si le doute change quelque chose (une nuance importante, une limite que tu n'avais pas vue), ne le cache pas dans la section : il doit apparaître dans la réponse elle-même.

### 2. Le doute renforcé (décisions non triviales)

Une décision est **non triviale** si au moins un de ces points est vrai :

- elle introduit ou modifie de la logique de branchement ;
- elle franchit une frontière de module ou de service ;
- elle affirme une propriété que le compilateur ne peut pas vérifier (thread-safety, idempotence, ordre, invariants) ;
- sa justesse dépend d'un contexte que le futur lecteur ne verra pas ;
- sa portée est irréversible (déploiement prod, migration de données, changement d'API publique).

Dans ce cas, le cycle complet s'applique : **AFFIRMATION → EXTRACTION → DOUTE → RÉCONCILIATION → ARRÊT** (détail dans le backup ci-dessous).

Le point non négociable : **le relecteur reçoit l'artefact et le contrat, jamais ta conclusion.** Transmettre ta conclusion biaise le relecteur vers l'accord ; il doit déterminer lui-même si l'artefact satisfait le contrat.

Pour lancer le relecteur en contexte frais dans OpenCode/OpenChamber : outil `subagent`, agent `general`, prompt adversarial ci-dessous, et il doit lire les fichiers lui-même plutôt que de se fier à ton résumé.

```
Revue adversarial. Trouve ce qui est faux dans cet artefact.
Suppose l'auteur trop confiant. Cherche :
- des hypothèses non énoncées
- des cas limites non traités
- du couplage caché ou de l'état partagé
- des façons de violer le contrat
- des conventions existantes que ça casse
- des modes d'échec sur entrée inattendue

Ne VALIDE pas. Ne résume pas. Trouve des problèmes, ou dis explicitement
qu'à examen approfondi tu n'en as trouvé aucun.

ARTEFACT : <artefact>
CONTRAT : <contrat>
```

### 3. Réconcilie, puis arrête

La sortie du relecteur est une donnée, pas un verdict. Tu restes l'orchestrateur : relis l'artefact et classe chaque constat (contrat mal lu / actionnable / compromis assumé / bruit). Détail et ordre de priorité dans le backup.

Arrête quand le cycle suivant ne remonte que des constats triviaux, ou après 3 cycles (escalade vers l'utilisateur), ou quand l'utilisateur dit « livre ».

### 4. Second avis multi-modèles : propose, ne saute pas

Un relecteur du même modèle que l'auteur partage ses angles morts. Un modèle différent les attrape.

- **Session interactive** : propose toujours le choix après la revue mono-modèle. L'utilisateur décide.
- **Contexte non interactif** : omis, et **annonce l'omission** dans la sortie.

## Red flags

- Répondre sans aucune trace de doute à une question non triviale.
- Transformer le doute en théâtre : des constats de fond, zéro constat actionnable, et on continue.
- Sauter silencieusement le second avis multi-modèles en session interactive.
- Passer l'affirmation ou ta conclusion au relecteur.
- Boucler plus de 3 cycles sans escalader.
- Relancer un relecteur sur un artefact inchangé (tu obtiendras les mêmes constats).
- Douter seulement après le commit — c'est une revue finale, pas du doute.
- Lancer trois sous-agents (revue hostile) sur une simple demande d'avis : le doute interne suffisait.
- Demander au relecteur « c'est bon ? » au lieu de « trouve les problèmes ».
- Une section « doute » qui n'apporte rien : du bruit qui simule la rigueur.
- Traiter la sortie du relecteur comme autoritaire sans relire l'artefact.

## Vérification

- [ ] Chaque réponse non triviale porte un doute interne (lecture alternative, contre-exemple, maillon faible)
- [ ] Le doute est court, utile, et ne sert pas d'excuse
- [ ] Les réponses d'une ligne ne portent pas de section de doute inutile
- [ ] Sur une demande d'avis légère (« qu'en penses-tu ? », « relis-toi »), aucun sous-agent n'a été lancé
- [ ] Sur une demande d'évaluation explicite (« évalue ce projet »), le skill `hostile-review` a été chargé
- [ ] Toute affirmation non triviale a été nommée comme AFFIRMATION avant de tenir
- [ ] Le relecteur a reçu l'artefact + le contrat, pas ta conclusion
- [ ] Le prompt du relecteur était adversarial (« trouve les problèmes »), pas validant
- [ ] Chaque constat a été classé contre le texte de l'artefact, pas validé d'office
- [ ] Une condition d'arrêt a été atteinte (constats triviaux, 3 cycles, ou « livre »)
- [ ] En mode interactif, le second avis multi-modèles a été proposé et la réponse a été prise en compte
- [ ] En mode non interactif, l'omission a été annoncée

---

# Backup analytique

## Le cycle complet, étape par étape

### Étape 1 — AFFIRMATION : ce qui doit tenir

Nomme la décision en deux ou trois lignes :

```
AFFIRMATION : "La nouvelle couche de cache est thread-safe sous la charge
              lecture-intensive décrite dans la spec."
ENJEU       : une race ici corrompt les données utilisateur et passe inaperçue
              en QA.
```

Si tu n'arrives pas à l'écrire de façon compacte, tu as une intuition, pas une décision. Sors-la avant de la disséquer.

### Étape 2 — EXTRACTION : la plus petite unité révisable

Le relecteur a besoin de **l'artefact** et du **contrat**, pas du chemin parcouru.

- Code : le diff ou la fonction — pas le fichier entier.
- Décision : la proposition en 3 à 5 phrases, plus les contraintes à respecter.
- Affirmation : l'affirmation plus les éléments qui semblent la soutenir (distincts du bloc AFFIRMATION, qui est ton hypothèse sous examen).

Retire ton raisonnement : si tu transmets tes conclusions, tu recevras la validation de tes conclusions. Si l'artefact fait 500 lignes, décompose-le : l'unité doit tenir dans une seule lecture.

### Étape 3 — DOUTE : le relecteur en contexte frais

Le cadrage décide de la réponse. Utilise le prompt adversarial ci-dessus, verbatim, en écrasant la forme de réponse par défaut d'un agent spécialisé (ces agents produisent spontanément un verdict équilibré ; le doute exige des constats sans complaisance).

Un sous-agent part avec un contexte vierge : c'est tout l'intérêt. Ne lui colle pas ton historique.

### Étape 4 — RÉCONCILIATION : replier les constats

Relis le texte de l'artefact avant de classer. Pour chaque constat, première classe qui matche :

1. **Contrat mal lu** — le constat vient de ce que ton contrat était flou ou incomplet. Corrige le contrat, reclasse au cycle suivant.
2. **Valide et actionnable** — vrai problème qui demande un changement. Change, reboucle.
3. **Compromis assumé** — le problème est réel mais le coût de le corriger dépasse celui de l'accepter. Documente-le pour l'utilisateur.
4. **Bruit** — le relecteur a signalé un truc correct dans un contexte qu'il n'avait pas. Note-le, puis demande : quel contexte dans le contrat aurait évité ce faux positif ?

Un relecteur frais peut avoir tort par manque de contexte. Ne te range pas automatiquement.

### Étape 5 — ARRÊT : boucle bornée, pas récursion

Arrête quand : le cycle suivant ne renvoie que des constats triviaux ou déjà vus ; ou 3 cycles sont terminés (remonte à l'utilisateur) ; ou l'utilisateur dit « livre ».

Si après 3 cycles le relecteur remonte encore des problèmes de fond, l'artefact n'est pas prêt : dis-le. Trois cycles non résolus sont une information sur l'artefact, pas une raison de continuer.

Si 3 cycles semblent « évidemment insuffisants » parce que l'artefact est gros, l'artefact est trop gros : retour à l'étape 2, décomposition. Ne lève pas la borne.

## Rationalisations — le piège et la réalité

| Rationalisation | Réalité |
|---|---|
| « Je suis confiant, saute l'étape doute » | La confiance corrèle mal avec la justesse sur un sujet neuf. Les moments de certitude sont exactement ceux où l'angle mort se cache. |
| « Lancer un relecteur coûte cher » | Déboguer un mauvais commit en prod coûte plus cher. La vérification est bornée ; le bug ne l'est pas. |
| « Le relecteur va juste chipoter » | Seulement si la revue est mal cadrée : « trouve ce qui casserait ça sous le contrat », rien d'autre. |
| « Je ferai le doute à la fin avec /review » | Une revue finale est une porte. Le doute attrape les mauvaises directions tôt, quand corriger coûte peu. |
| « Si je doute de tout, je ne livre rien » | Le skill ne vise que les décisions non triviales. Relis la définition. |
| « Deux avis valent toujours mieux qu'un » | Pas si le second a moins de contexte et produit du bruit. Réconcilie, ne te range pas. |
| « Le relecteur a tort, donc j'ai raison » | Il te manque le contexte, pas la vérité : le désaccord est une information, pas un verdict. |
| « Le multi-modèles est toujours mieux » | Il attrape des angles morts mais ajoute du coût et de la fragilité. Propose-le ; l'utilisateur décide. |
| « L'utilisateur a dit oui une fois, je peux réinvoquer » | Chaque invocation est une autorisation distincte. L'artefact, le prompt et les drapeaux changent : re-confirme à chaque fois. |
| « Le relecteur a trouvé un bug, donc il est bon » | Un seul constat ne prouve pas la couverture. Continue jusqu'au seuil d'arrêt. |

## Escalade multi-modèles — règles

- Vérifie que l'outil existe (PATH), teste qu'il fonctionne, confirme la syntaxe exacte avec l'utilisateur, puis transmets **artefact + contrat + prompt adversarial uniquement**, par stdin (jamais d'artefact interpolé dans un argument shell : backticks, `$(...)` et quotes s'y exécutent).
- En contexte non interactif : omis et annonce « Multi-modèles sauté : contexte non interactif ».
- Jamais d'invocation externe sans autorisation explicite, et jamais de fallback silencieux quand un outil échoue : remonte l'échec, laisse l'utilisateur rediriger.

## Contraintes de chargement

- Le doute renforcé orchestre depuis la **session principale**, seule capable de lancer un relecteur en contexte frais.
- **Ne l'invoque pas depuis un sous-agent** : un sous-agent qui en invoque un autre est un anti-pattern d'orchestration.
- Sans possibilité de lancer un sous-agent : auto-revue dégradée (réécrire l'artefact et le contrat comme un prompt frais, avec une séparation mentale nette) — et signale que c'est **dégradé**, pas une vraie revue en contexte frais.

## Interaction avec les autres skills

- **`hostile-review`** : le doute teste *une* affirmation en vol ; la revue hostile audite *un artefact terminé* avec trois personas.
- **`interview`** : l'un extrait l'intention, l'autre met la décision à l'épreuve.
- **TDD** : l'étape RED (test rouge) est un doute rendu concret — un test qui échoue est une tentative de disproof. Quand TDD s'applique, ce test en échec *est* l'étape doute pour les affirmations comportementales.
- **Debugging** : quand le relecteur fait apparaître un vrai mode d'échec, bascule en debugging pour localiser et corriger.
