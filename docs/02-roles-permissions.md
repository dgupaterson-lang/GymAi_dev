# 02 — Rôles & permissions

## Rôles

| Rôle | Description |
|---|---|
| `member` | Sportif : programme, séances, groupes, coach IA, progression |
| `coach` | Encadrant : groupes, séances collectives, suivi membres, messagerie |
| `manager` | Gérant de salle : coachs, créneaux, groupes, stats de la salle |
| `admin` | Super-utilisateur (Django admin), support, octroi Premium |

Le rôle est porté par `User.role`. Les permissions DRF s'appuient dessus + sur
l'appartenance (ownership) aux objets.

## Matrice de permissions (CRUD/action)

Légende : ✅ autorisé · 🟡 sous condition (ownership/appartenance) · ❌ interdit

| Ressource / action | member | coach | manager | admin |
|---|:---:|:---:|:---:|:---:|
| Son profil (lire/éditer) | ✅ | ✅ | ✅ | ✅ |
| Profil d'un autre membre | ❌ | 🟡 *(ses membres, lecture)* | 🟡 *(sa salle, lecture)* | ✅ |
| Programme — générer/voir le sien | ✅ | — | — | ✅ |
| Programme d'un membre — ajuster | ❌ | 🟡 *(ses membres)* | ❌ | ✅ |
| Séance loggée — créer/logger | 🟡 *(la sienne)* | ❌ | ❌ | ✅ |
| Mesures / photos | 🟡 *(les siennes, R/W)* | 🟡 *(ses membres, lecture)* | ❌ | ✅ |
| Groupe — créer/éditer | ❌ | 🟡 *(propriétaire)* | 🟡 *(sa salle)* | ✅ |
| Groupe — rejoindre | 🟡 *(salle active)* | — | — | ✅ |
| Séance collective — planifier | ❌ | 🟡 *(ses groupes)* | 🟡 *(sa salle)* | ✅ |
| Séance collective — s'inscrire | 🟡 *(membre du groupe)* | — | — | ✅ |
| Présence — valider | ❌ | 🟡 *(ses séances)* | 🟡 *(sa salle)* | ✅ |
| Chat groupe — lire/écrire | 🟡 *(membre du groupe)* | 🟡 *(propriétaire)* | 🟡 *(sa salle)* | ✅ |
| Chat coach IA | 🟡 *(le sien)* | 🟡 *(le sien)* | 🟡 | ✅ |
| Abonnement — voir | ✅ *(le sien)* | ✅ | ✅ | ✅ |
| Premium — octroyer | ❌ | ❌ | 🟡 *(sa salle)* | ✅ |
| Stats salle | ❌ | 🟡 *(agrégées)* | ✅ *(sa salle)* | ✅ |

## Permissions DRF (implémentation prévue)

- `IsAuthenticated` global.
- `IsOwner` — l'objet appartient à `request.user` (séances, mesures, programme, conversation IA).
- `IsCoachOfMember` — `CoachAssignment(coach=request.user, member=obj.member)` existe.
- `IsGroupOwnerOrManager` — coach propriétaire du groupe **ou** gérant de la salle du groupe.
- `IsGroupMember` — appartenance au groupe (chat, inscription).
- `IsSameGym` — l'objet est rattaché à une salle de l'utilisateur.
- `RolePermission(roles=[...])` — restreint par rôle.
- **Object-level** activé (`get_object` + `check_object_permissions`).

## Authentification

- **JWT** (SimpleJWT) : `access` (court, 15 min) + `refresh` (long, 7 j, rotation + blacklist).
- Stockage mobile : `expo-secure-store`. Intercepteur axios : refresh auto sur 401.
- Vérification compte : e-mail (lien) ou **OTP** SMS (selon dispo) avant onboarding (RG-05).
- WebSocket : token JWT passé en query/Sec-WebSocket-Protocol, validé dans le `AuthMiddleware` Channels.
