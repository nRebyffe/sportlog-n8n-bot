# SportLog Workout Bot

Un bot Telegram qui transforme une phrase en séance de musculation enregistrée.

## Le problème

Noter ses séries dans une app de muscu prend plus de temps que la série elle-même.
SportLog part d'une idée simple : tu écris ce que tu viens de faire, en français,
comme tu le dirais à un pote. Le bot comprend, structure et enregistre.

## Ce que ça fait

- **Enregistrer une séance** — `S2 : tractions 3x8 @ 10kg de lest, dips 3x10`
  → une ligne par série dans la base.
- **Corriger** — `en fait c'était 12 reps` met à jour la dernière entrée.
- **Demander un conseil** — `conseil 2` renvoie un briefing de la séance 2 :
  charges et répétitions cibles, calculées sur ton historique (surcharge progressive).
- **Demander une précision** — si une info manque, le bot pose une question
  au lieu d'inventer.

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

## Structure du repo

- `/Workflow` — le workflow n8n en TypeScript (SDK n8n, compatible `n8ncli`)
- `/Skills` — les skills utilisés pour concevoir et relire le projet
- `/Video` — la démo

## Installation

1. Importer `Workflow/workflow.ts` dans n8n (ou `n8ncli push`).
2. Renseigner les credentials Telegram et Google Gemini.
3. Créer la Data Table `workout_logs` : `exercise`, `reps`, `load`, `load_type`,
   `session_date`, `session_type`, `rpe_feeling`.
4. Activer le workflow et écrire au bot.

## Limites

- Un seul utilisateur autorisé (contrôle par ID Telegram).
- Les noms d'exercices sont normalisés en français.
- La recherche d'historique (`dernière séance`, `record`) n'est pas encore fiable :
  le chemin abouti aujourd'hui, c'est la demande de conseil.
- Trois modèles de séance (1, 2, 3).
