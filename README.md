# SportLog Workout Bot

Un bot Telegram qui transforme une phrase en séance de musculation enregistrée.

## Démo

[Regarder la démo (6 min 52)](https://nrebyffe.github.io/sportlog-n8n-bot/) · [télécharger la vidéo](Video/demo.mp4)

## Le problème

Noter ses séries dans une application de musculation prend plus de temps que la série elle-même.
SportLog part d'une idée simple : tu écris ce que tu viens de faire, le bot comprend, structure et enregistre.

## Ce que ça fait

- **Enregistrer une séance** — `S2 : tractions 3x8 @ 10kg de lest, dips 3x10`
  → une ligne par série dans la base.
- **Corriger** — `en fait c'était 12 reps` met à jour la dernière entrée.
- **Demander un conseil** — `conseil 2` renvoie un briefing de la séance 2 :
  charges et répétitions cibles, calculées sur ton historique (surcharge progressive).

## Comment ça marche

```
Telegram → n8n → Gemini (parsing JSON) → Data Table → réponse Telegram
```

1. Un message Telegram déclenche le workflow.
2. Un agent Gemini classe l'intention (log / correction / question / ambigu)
   et extrait les séries en JSON strict.
3. Un nœud Code éclate chaque série en une entrée.
4. Les séries sont écrites dans une Data Table n8n, puis résumées en **une seule**
   réponse Telegram.
5. Pour un conseil, l'historique de la séance part vers un second agent qui joue
   le rôle de coach.

## Stack

- **n8n** (cloud) — orchestration
- **Google Gemini** — parsing et coaching
- **Telegram Bot API** — interface
- **n8n Data Table** — stockage

## Limites

- Un seul utilisateur autorisé (contrôle par ID Telegram).
- Les noms d'exercices sont normalisés en français.
- La recherche d'historique (`dernière séance`, `record`) n'est pas encore fiable :
  le chemin abouti aujourd'hui, c'est la demande de conseil.
- Trois modèles de séance (1, 2, 3).
