# 06 — Temps réel (Django Channels)

Transport : **Django Channels** + **channels-redis** (couche Redis pub/sub).
Serveur ASGI (Daphne/Uvicorn). Auth WebSocket via JWT.

## Authentification WebSocket
- Le client ouvre la connexion avec le token : `wss://…/ws/…?token=<access>`
  (ou via sous-protocole `Sec-WebSocket-Protocol`).
- Un `JWTAuthMiddleware` (custom) valide le token → `scope["user"]`.
- Rejet (`close 4001`) si non authentifié ou non autorisé sur le canal.

## Canaux (routing)

| Route WS | Consumer | Accès |
|---|---|---|
| `/ws/coach-ai/` | `CoachAIConsumer` | le membre (sa conversation privée, RG-30) |
| `/ws/groups/{group_id}/` | `GroupChatConsumer` | membre du groupe (RG-28) |
| `/ws/sessions/{session_id}/` | `LiveSessionConsumer` | inscrits + coach (séance live) |
| `/ws/notifications/` | `NotificationConsumer` | l'utilisateur (push in-app) |

Groupes Channels : `coachai_{user_id}`, `group_{group_id}`, `session_{session_id}`,
`user_{user_id}`.

## Événements — Coach IA (`/ws/coach-ai/`)

Client → serveur :
```json
{ "type": "message", "text": "Génère mon programme" }
```
Serveur → client (séquence) :
```json
{ "type": "typing", "value": true }
{ "type": "message", "role": "ai", "text": "Voilà ton programme…",
  "card": { "title": "Programme généré", "rows": [["Lundi","Pectoraux & Triceps"]] },
  "source": "claude" }      // ou "simulated" si repli (RG-32)
{ "type": "typing", "value": false }
```
Erreur quota (RG-31) :
```json
{ "type": "error", "code": "ai_quota", "detail": "Quota IA quotidien atteint", "reset_at": "…" }
```

Pipeline : message reçu → persistance `Message(user)` → vérif quota → tâche Celery
appelle le service IA (doc 07) → `typing` puis `message(ai)` diffusés → persistance.

## Événements — Chat de groupe (`/ws/groups/{id}/`)
Client → serveur : `{ "type":"message", "text":"…" }` · `{ "type":"typing" }`
Serveur → groupe :
```json
{ "type":"message", "id":123, "sender":{"id":7,"name":"Coach Awa","role":"coach"},
  "text":"Séance demain 18h, soyez à l'heure 💪", "created_at":"…" }
{ "type":"presence", "online":[7,12,45] }
{ "type":"read", "message_id":123, "user_id":12 }
```

## Événements — Séance live (`/ws/sessions/{id}/`)
- `{ "type":"status", "value":"live" }` (coach démarre)
- `{ "type":"attendance", "member_id":12, "present":true }` (RG-27)
- `{ "type":"status", "value":"done" }`

## Événements — Notifications (`/ws/notifications/`)
Diffusion in-app temps réel (doublée d'un push Expo si app en arrière-plan) :
```json
{ "type":"notification", "kind":"session_reminder", "title":"Séance dans 2 h",
  "body":"Pectoraux & Triceps — GymAI Plateau", "data":{ "session_id":42 } }
```

## Robustesse
- **Reconnexion** auto côté mobile (backoff exponentiel) ; au reconnect, on récupère
  l'historique manquant via REST (`?before=`).
- **Idempotence** : chaque message porte un `client_id` (uuid) pour dédoublonner.
- **Repli REST** : si le WebSocket échoue, l'app envoie via les endpoints REST
  équivalents (doc 05) et rafraîchit par polling léger.
- **Backpressure** : limites de taille de message et anti-spam (throttle par user).
