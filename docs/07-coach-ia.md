# 07 — Coach IA (Claude + repli simulé)

App `ai` : un **service** unique exposant des fonctions métier, appelées par l'API REST
et les consumers WebSocket (toujours via Celery pour ne pas bloquer).

## Stratégie : Claude réel avec repli simulé (RG-32)

```
appel service IA
 ├─ clé ANTHROPIC_API_KEY présente ? quota membre OK (RG-31) ? service up ?
 │     OUI → appel API Anthropic → réponse "source=claude"
 │     NON / erreur / timeout / 429 → moteur SIMULÉ → réponse "source=simulated"
 └─ journalise AIRequestLog (modèle, tokens, coût, source) (RG-33)
```

Le moteur **simulé** réutilise la logique de la maquette (mots-clés → réponse + carte)
pour : perte de poids, programme, analyse hebdo, prévision, repas. Il garantit une UX
fonctionnelle **sans clé** et en mode dégradé.

## Modèles Anthropic

| Fonction | Modèle | Pourquoi |
|---|---|---|
| Chat coach (réponses courtes, cartes) | `claude-sonnet-4-6` | rapide, économique, suffisant |
| Génération / recalibrage de programme | `claude-opus-4-8` | raisonnement structuré, qualité |
| Analyse repas (photo → macros) | `claude-sonnet-4-6` (vision) | multimodal, rapide |

Appels via le **SDK Python `anthropic`**. **Sorties structurées** imposées par *tool use*
(JSON schema) pour fiabiliser le parsing (programme, carte, macros).

## Fonctions du service

### `generate_program(profile) -> ProgramDraft`
Entrée : objectif, niveau, fréquence (2..6), blessures.
Sortie (outil `emit_program`) :
```json
{ "summary": "…",
  "days": [ { "weekday": 1, "title": "Pectoraux & Triceps",
      "exercises": [ { "exercise_id": 12, "sets": 4, "reps": 10, "charge": "60 kg", "rest_s": 90 } ] } ] }
```
Contrainte : n'inclure que des exercices **compatibles** avec les blessures (RG-12),
choisis dans le catalogue (on fournit la liste d'IDs autorisés au modèle).

### `coach_reply(member, text, history) -> { text, card?, source }`
Réponse conversationnelle. *System prompt* : rôle de coach sportif francophone,
ton motivant, concis ; peut émettre une **carte** (titre + lignes clé/valeur) via l'outil
`emit_card`. Mémoire = derniers messages de la conversation.

### `analyze_meal(image) -> { calories, protein_g, carbs_g, fat_g, items[], source }`
Vision → estimation des macros. Premium (RG-34).

### `forecast(member) -> card`
Prévision d'atteinte d'objectif à partir de l'historique (assiduité, tonnage, poids).

## Garde-fous
- **Quota** vérifié avant tout appel (RG-31) ; `429` si dépassé (Free).
- **Timeout** (ex. 20 s) + **retry** limité ; au-delà → repli simulé.
- **Coût** estimé et cumulé par `AIRequestLog` ; alertes admin si seuil.
- **Sécurité prompt** : les entrées utilisateur sont traitées comme **données**, jamais
  comme instructions système (anti prompt-injection). Aucune donnée d'un autre membre
  n'est jamais incluse dans le contexte (RG-40).
- **Confidentialité** : on n'envoie au modèle que le strict nécessaire (profil agrégé,
  pas d'identifiants personnels superflus).

## Variables d'environnement
```
ANTHROPIC_API_KEY=...           # absente → mode simulé permanent
AI_CHAT_MODEL=claude-sonnet-4-6
AI_PROGRAM_MODEL=claude-opus-4-8
AI_TIMEOUT_S=20
AI_FREE_DAILY_QUOTA=10
```

## Schéma d'appel (résumé)
```
WS coach-ai / POST coach-ai/messages
        │
        ▼
   Celery task ── service ai.coach_reply()
        │              ├─ try Claude (sonnet-4-6, tool=emit_card)
        │              └─ except → simulated_reply()
        ▼
  persistance Message(ai, source) → diffusion WS "message"
```
