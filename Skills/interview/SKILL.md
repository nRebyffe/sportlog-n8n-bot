---
name: Interview
description: "Conduis un entretien de cadrage avec l'utilisateur : une question à la fois, chacune avec ta meilleure hypothèse en face, jusqu'à ~95 % de confiance sur ce qu'il veut vraiment. Utilise ce skill dès que l'utilisateur demande d'être interrogé ou qu'il demande qu'on lui pose des questions avant de commencer (« interroge-moi », « grille-moi », « pose-moi les questions d'abord », « fais-moi l'entretien »), et aussi quand la demande est si floue qu'il faut la clarifier avant d'écrire quoi que ce soit."
---

# Interview — l'entretien de cadrage

## En bref

Tu ne codes pas encore. Tu poses **une question à la fois** à l'utilisateur, et chaque question porte ta propre prédiction. Tu t'arrêtes quand tu peux prédire sa réponse aux trois prochaines questions (~95 % de confiance). Livrable : un énoncé d'intention qu'il a validé.

## Quand

**Utilise ce skill :**

- L'utilisateur demande explicitement d'être interrogé : « interroge-moi », « grille-moi », « pose-moi les questions d'abord », « fais-moi l'entretien ».
- La demande est si floue qu'il faut la clarifier avant de coder.
- Un choix d'orientation est à trancher (quelle feature, quel écran, quel ordre).

**Ne l'utilise pas :**

- demande claire et autonome (« renomme cette variable ») ;
- question purement informationnelle (« comment marche X ? ») ;
- opération mécanique (renommage, formatage, déplacement) ;
- l'utilisateur a explicitement demandé d'aller vite plutôt que de vérifier.

## Ce que tu fais

### 1. Dis où tu en es — une phrase et un chiffre

```
HYPOTHÈSE : tu veux un moyen de répondre à "comment on va ?" au daily ; "dashboard" est la convention qui t'est venue.
CONFIANCE : ~30 % — il manque : pour qui, ce que "métriques" veut dire ici, et à quoi ressemble le succès
```

Le chiffre te force à l'honnêteté : si tu écris 80 % mais ne peux pas prédire ses réactions aux trois prochaines questions, le chiffre est faux. Commence au niveau que tu peux défendre.

En dessous de ~70 %, ajoute la raison sur la même ligne : ce qui reste flou. Il voit alors exactement ce que l'entretien doit faire remonter.

### 2. Une question, avec ta devine

```
Q : <une question ciblée>
DEVINE : <ta prédiction, et le raisonnement qui l'a produite>
```

Attends sa réaction avant la question suivante.

- **Une par une** : il ne peut pas réagir à tes hypothèses si tu les noies dans une liste ; les lots favorisent le survol et la 3ᵉ question découle souvent de la 1ʳᵉ.
- **Avec une devine** : on corrige plus vite une hypothèse fausse qu'une question à vide, et ça expose tes propres suppositions — exactement l'objet de l'entretien.

Risque : un utilisateur poli qui valide par politesse. Compense en étant visiblement prêt à avoir tort, et mise parfois sur une direction contre laquelle tu t'attends à le voir pousser.

### 3. Traque le « je veux » derrière le « je devrais vouloir »

Les réponses les plus dangereuses sont celles qui sonnent comme une *bonne* réponse. Repère :

- discours de bonne pratique sans specifics (« je veux que ce soit scalable », « clean architecture ») ;
- délégation à la convention (« comme le font la plupart des apps ») ;
- « je devrais probablement… », « les bonnes pratiques disent… » ;
- mots-clés employés comme objectifs (« moderne », « robuste ») au lieu d'un résultat observable.

Question à poser alors :

> « Si tu n'avais rien à justifier à personne, qu'est-ce que tu veux vraiment ? »

Cette seule question fait souvent plus de travail que les cinq précédentes.

### 4. Reformule avec ses mots

```
Voici ce que je comprends de ce que tu veux :

- Résultat :            <une ligne>
- Utilisateur :         <qui en bénéficie>
- Pourquoi maintenant : <ce qui a changé>
- Succès :              <comment on saura que ça marche>
- Contrainte :          <la limite bloquante>
- Hors périmètre :      <ce qu'on ne fait pas>

Oui / non / à préciser ?
```

La ligne « Hors périmètre » est obligatoire : la moitié des désalignements, c'est un désaccord silencieux sur ce qu'on ne construit pas.

### 5. Exige un oui explicite

« Ça me va », « Allez on y va » et le silence ne sont pas des oui — ce sont des sorties polies. « Fais comme tu veux » est une délégation, pas une décision : reformule en choix entre deux options concrètes.

S'il corrige, intègre et reformule. Boucle jusqu'au oui.

### 6. Livre, propose, arrête ton tour

À la confirmation : livre l'énoncé d'intention, propose les suites possibles (l'enregistrer dans `docs/intent/[sujet].md`, rédiger la spec, découper en tâches) et **arrête ton tour**. Aucun outil, aucun travail aval dans ce tour : rends la main.

## La condition d'arrêt

Tu as fini quand tu peux répondre oui à :

> « Puis-je prédire la réaction de l'utilisateur aux trois prochaines questions que je poserais ? »

C'est un test vérifiable, pas une impression. Si après plusieurs rounds tu n'y arrives toujours pas, c'est une information sur la demande, pas une raison de continuer : dis-le et propose de reculer.

## Red flags

- Trois questions d'un coup = questionnaire, pas entretien.
- Question sans devine = sondage, pas engagement.
- Accepter « fais comme tu veux » comme réponse terminale.
- Produire une spec, un plan ou des tâches avant le oui explicite.
- Appeler un outil ou démarrer du travail dans le tour de confirmation.
- Poser « quelle est la bonne pratique ? » au lieu de « qu'est-ce que tu veux vraiment ? ».
- Accepter une réponse de parcours (« scalable », « propre », « moderne ») sans vérifier.
- Trois rounds sans que la confiance monte visiblement : tu poses les mauvaises questions, change de cadre.
- Confiance < 70 % sans raison : il ne peut pas t'aider à fermer l'écart s'il ignore ce qui manque.
- Écrire le doc d'intention avant la confirmation.
- Sauter la ligne « Hors périmètre ».

## Vérification

- [ ] Une hypothèse avec un numéro de confiance a été posée dès le premier tour
- [ ] Chaque confiance < 70 % s'accompagnait d'une raison
- [ ] Les questions ont été posées une par une, chacune avec ta devine
- [ ] Au moins une question « si tu n'avais rien à justifier ? » a été posée à une réponse de parcours
- [ ] Une reformulation concrète a été écrite (Résultat / Utilisateur / Pourquoi maintenant / Succès / Contrainte / Hors périmètre)
- [ ] La confirmation est un « oui » explicite
- [ ] Au moment de l'arrêt, tu pouvais prédire les trois prochaines questions
- [ ] Après confirmation, le tour s'est arrêté sans appel d'outil
- [ ] Toute suite proposée partait de l'intention confirmée

---

# Backup analytique

## Rationalisations — le piège et la réalité

| Rationalisation | Réalité |
|---|---|
| « La demande est claire » | Si tu ne peux pas écrire le résultat voulu en une phrase maintenant, elle n'est pas claire. Fais l'étape 1 avant de décider. |
| « Trop de questions lui font perdre du temps » | 4 à 6 questions ciblées coûtent peu. Construire la mauvaise chose coûte enormously, et c'est lui qui paie. |
| « Je verrai bien en construisant » | Après du code, changer coûte 10× plus. Découvrir en cours d'implémentation, c'est du rework. |
| « Il a dit 'fais comme tu veux', donc je décide » | C'est une délégation, pas une décision. Reformule en choix entre deux options concrètes. |
| « Mieux vaut lui proposer plusieurs options » | Les options servent quand on sait ce qu'on veut et qu'on arbitre. Sinon elles élargissent la recherche au lieu de la resserrer. |
| « En attachant ma devine, je l'influence » | Influencer est le but. Réagir est plus rapide que générer. Le risque est la flatterie, pas l'influence. |
| « On a assez parlé, j'ai compris » | Teste : peux-tu prédire ses trois prochaines réactions ? Si non, tu n'as pas encore compris. |
| « Il a dit oui, c'est bon » | Un « oui » après une reformulation vague est creux. Reformule concrètement et re-confirme. |
| « Le code parlera, je verrai dans les tests » | Les tests prouvent que le code fait ce qu'il fait, pas que c'est ce qu'on voulait. |

## Exemple complet

**Sans interview :**

```
User:  build me a dashboard for our metrics
Agent: <propose des librairies de graphiques et des layouts>
```

L'agent a supposé : pour qui, quelles métriques, ce que « notre équipe » veut dire, à quoi ressemble le succès. Aucune supposition n'est énoncée. Chacune est un endroit où l'utilisateur peut dire « c'est pas ce que je voulais ».

**Avec interview :**

```
User: build me a dashboard for our metrics

Agent:
HYPOTHÈSE : tu veux un moyen de répondre à "comment on va ?" au daily ; "dashboard" est la convention qui t'est venue.
CONFIANCE : ~30 % — il manque : pour qui, quelles métriques, à quoi ressemble le succès

Q :     Quand tu dis "comment on va ?", qui pose la question — toi seul, l'équipe au daily, ou au-dessus (manager, CTO, comité) ?
DEVINE : l'équipe au daily, parce que "on" scope généralement comme ça et que le daily est l'endroit où ça se pose. Si c'est pour des dirigeants, les métriques et le cadrage changent complètement.

User: En fait c'est pour moi. Je perds le fil de quelles experiments tournent et à quoi ressemble leur signal early.

Agent:
Lecture mise à jour : ce n'est pas un dashboard d'équipe, c'est un tracker d'experiments. Confiance : ~60 % — il manque encore : ce que "signal early" veut dire et à quoi ressemble "fini".

Q :     Le problème, c'est que tu ne sais pas quelles experiments existent, ou que tu ne vois pas leurs résultats au même endroit ?
DEVINE : le second. Tu as une liste quelque part, mais les résultats vivent dans cinq outils différents, et c'est le rapprochement à la main qui te saoule.

User: Le premier en fait. Je n'ai littéralement pas de liste. Ils sont éparpillés dans des docs.

Agent: <continue>
```

Deux questions plus tard, la demande n'est plus « un dashboard » mais « une liste ». Autre artefact, autre périmètre, autre travail. Le dashboard aurait été faux.

## Nuances de fin d'entretien

- **Sauvegarde** : si l'utilisateur veut que l'intention survive (projet multi-sessions, passation), propose `docs/intent/[sujet].md` — mais n'écris le fichier qu'après confirmation.
- **Question piège** : « Si tu n'avais pas à le justifier à personne, qu'est-ce que tu wanting réellement ? » (version courte : « qu'est-ce que tu veux vraiment ? ») — celle-ci fait le plus de travail.
- **Non-interactif** : en CI, en tâche planifiée ou en boucle autonome, ce skill n'a pas d'interlocuteur. Signale le blocage au lieu de deviner.

## Interaction avec les autres skills

- **`doubt-driven-dev`** : l'un extrait l'intention (avant décision), l'autre met la décision à l'épreuve (après décision).
- **Spec / planification** : en aval. Ils consomment l'énoncé d'intention.
