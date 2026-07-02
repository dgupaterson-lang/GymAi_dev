# 04 — Flux utilisateur

## A. Parcours membre — première fois

```
1. Splash / Welcome
   └─ choix d'ambiance (Dark/Rose) — mémorisé localement
2. Inscription (email, mot de passe, nom)  →  POST /auth/register
   └─ Vérification e-mail/OTP (RG-05)        →  POST /auth/verify
3. Connexion                                →  POST /auth/login  (access+refresh)
4. Choix de la salle                         →  GET /gyms  →  POST /memberships
5. Onboarding IA
   a. Objectif        (Perdre du poids…)
   b. Profil          (niveau, fréquence 2..6, blessures)
   c. Génération      →  POST /programs/generate  (Celery + IA, RG-10/12)
      └─ écran "L'IA construit ton programme…" (Lottie) → "Programme prêt"
6. Découvrir mon espace → Dashboard
```

## B. Parcours membre — usage quotidien

```
Dashboard
 ├─ Programme du jour → "Commencer la séance"
 │    Vue d'ensemble (exercices) → Détail exercice → "Commencer l'exercice"
 │    └─ Set actif :
 │         work  : afficher reps/charge → "Valider la série"  (SetLog)
 │         rest  : chrono animé, ±15s, passer ; fin → voix + haptique (RG-16)
 │         done  : bilan exercice → "Prochain exercice" / "Retour séance"
 │    Fin de séance → récap (volume, kcal, durée)  →  PATCH /workouts/{id} status=done
 │
 ├─ Groupes
 │    Liste de mes groupes / découvrir → Détail groupe
 │    └─ Séances collectives à venir → "S'inscrire" (RG-24) / liste d'attente (RG-24)
 │    └─ Chat de groupe (WebSocket, RG-28)
 │
 ├─ Coach IA (chat privé, WebSocket)
 │    chips (perte de poids, programme, analyse, prévision, repas)
 │    → réponse Claude (repli simulé) + carte (RG-30/32)
 │
 ├─ Nutrition → photo repas (Premium, RG-34) → macros estimées (IA)
 │
 └─ Profil → mesures (R/W), photos avant/après, abonnement, thème, déconnexion
```

## C. Inscription à une séance collective (détail RG-24/25/26)

```
Membre clique "S'inscrire" sur une GroupSession
 ├─ si maintenant > start_at - 30min            → refus (inscriptions closes)
 ├─ si chevauchement avec une autre inscription → refus (RG-26)
 ├─ si places disponibles                       → status=enrolled (+ notif rappel T-2h)
 └─ sinon                                        → status=waitlist (position affichée)

Membre annule son inscription
 └─ si une place se libère et waitlist non vide  → 1ʳᵉ personne promue enrolled
                                                   + notification "Place confirmée" (RG-25/41)
```

## D. Parcours coach

```
Connexion → Tableau coach
 ├─ Mes groupes
 │    Créer / éditer un groupe (nom, capacité, niveau, salle)   (RG-22)
 │    Planifier une séance collective (titre, créneau, capacité) (RG-23)
 │    Liste des membres, inscrits, liste d'attente
 │    Pendant/après la séance : valider les présences (RG-27)
 ├─ Membre → progression (lecture), programme → ajuster (RG-11) → nouvelle version
 ├─ Messagerie : chat de groupe (RG-28) + (option) message privé membre
 └─ Coach IA pro (aide à la programmation) — optionnel V1
```

## E. Recalibrage de programme (IA ou coach)

```
Déclencheur : membre via chat ("je veux perdre 8 kg") OU coach via "ajuster"
 → POST /programs/{id}/recalibrate  (Celery)
 → IA propose nouveaux paramètres → création Program version+1, is_active=True
 → ancienne version archivée (is_active=False)  (RG-11)
 → notification "Ton programme a été mis à jour"
```

## F. États d'une séance collective (machine à états)

```
scheduled ──(start_at atteint / coach démarre)──► live ──(end_at / coach clôt)──► done
    │
    └──(coach annule)──► cancelled   (toutes inscriptions notifiées)
```

## G. Cycle de vie du token

```
login → access(15min) + refresh(7j)
appel API 401 → tente refresh → nouveau access ; si refresh invalide → logout
refresh rotation : ancien refresh blacklisté
```
