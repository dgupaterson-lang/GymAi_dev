export type Exercise = {
  name: string;
  sets: number;
  reps: number;
  charge: string;
  muscle: string;
  rest: number;
  muscles: string[];
  tips: string[];
};

export type Gym = {
  name: string;
  addr: string;
  dist: string;
  rating: string;
  open: boolean;
};

export type Card = { title: string; rows: [string, string][] };
export type Message = { role: 'coach' | 'user'; text: string; card?: Card };

export const exercises: Exercise[] = [
  {
    name: 'Développé couché',
    sets: 4,
    reps: 10,
    charge: '60 kg',
    muscle: 'Pectoraux',
    rest: 90,
    muscles: ['Grand pectoral', 'Triceps', 'Deltoïde antérieur'],
    tips: [
      'Garde les omoplates serrées et stables.',
      'Ne décolle pas les fessiers du banc.',
      'Descends la barre au niveau des tétons, coudes à 45°.',
    ],
  },
  {
    name: 'Écarté à la poulie',
    sets: 3,
    reps: 12,
    charge: '15 kg',
    muscle: 'Pectoraux',
    rest: 75,
    muscles: ['Grand pectoral', 'Deltoïde antérieur'],
    tips: [
      'Conserve un léger fléchissement des coudes.',
      'Contrôle la phase négative, ne relâche pas.',
    ],
  },
  {
    name: 'Dips lestés',
    sets: 3,
    reps: 8,
    charge: '+10 kg',
    muscle: 'Triceps',
    rest: 90,
    muscles: ['Triceps', 'Pectoral inférieur', 'Deltoïde antérieur'],
    tips: [
      'Penche légèrement le buste vers l’avant.',
      'Va chercher l’amplitude complète sans à-coups.',
    ],
  },
  {
    name: 'Extension triceps poulie',
    sets: 3,
    reps: 14,
    charge: '25 kg',
    muscle: 'Triceps',
    rest: 60,
    muscles: ['Triceps'],
    tips: ['Garde les coudes fixes, collés au corps.', 'Évite de balancer les épaules.'],
  },
];

export const gymList: Gym[] = [
  { name: 'GymAI Plateau', addr: '12 Bd de la République', dist: '0,8 km', rating: '4,9', open: true },
  { name: 'GymAI Cocody Riviera', addr: 'Rue des Jardins, Cocody', dist: '2,3 km', rating: '4,7', open: true },
  { name: 'GymAI Marcory Zone 4', addr: 'Bd Valéry Giscard d’Estaing', dist: '4,1 km', rating: '4,8', open: false },
];

/** Réponse contextuelle du coach IA selon le message reçu. */
export function coachReply(t: string): Message {
  const s = t.toLowerCase();
  if (/perdre|maigrir|kilo|kg|poids|gras/.test(s))
    return {
      role: 'coach',
      text: 'Compris — perte de 8 kg. Je recalibre tout ton plan pour un déficit progressif et sans perte de muscle.',
      card: {
        title: 'Plan ajusté',
        rows: [
          ['Fréquence', '4 séances / sem.'],
          ['Cardio', '40 min · 3×/sem.'],
          ['Calories', '2 200 kcal / jour'],
          ['Déficit', '−500 kcal / jour'],
        ],
      },
    };
  if (/programme|génère|genere|plan|planning|semaine type/.test(s))
    return {
      role: 'coach',
      text: 'Voilà ton programme hebdomadaire, équilibré entre force, hypertrophie et récupération.',
      card: {
        title: 'Programme généré',
        rows: [
          ['Lundi', 'Pectoraux & Triceps'],
          ['Mercredi', 'Dos & Biceps'],
          ['Vendredi', 'Jambes & Fessiers'],
          ['Dimanche', 'Cardio + Gainage'],
        ],
      },
    };
  if (/analyse|progress|stagne|jambe|évolu|evolu|bilan/.test(s))
    return {
      role: 'coach',
      text: "J'ai analysé ta semaine. Très bonne assiduité, mais tes jambes progressent moins vite que le haut du corps.",
      card: {
        title: 'Analyse hebdo',
        rows: [
          ['Assiduité', '4 / 5 séances'],
          ['Tonnage', '+8 % vs S-1'],
          ['Point faible', 'Quadriceps'],
          ['Reco', '+1 séance jambes'],
        ],
      },
    };
  if (/prévo|prevo|résultat|resultat|jour|objectif|quand|combien de temps/.test(s))
    return {
      role: 'coach',
      text: 'Au rythme actuel et avec le plan ajusté, voici ma prévision pour ton objectif.',
      card: {
        title: 'Prévision des résultats',
        rows: [
          ['Objectif', '−8 kg'],
          ['Échéance estimée', '≈ 67 jours'],
          ['Indice de confiance', '82 %'],
        ],
      },
    };
  if (/repas|photo|nutri|manger|calorie|prot/.test(s))
    return {
      role: 'coach',
      text: "Envoie-moi une photo de ton assiette et j'estime les macros instantanément. Exemple de ton dernier repas :",
      card: {
        title: 'Repas analysé',
        rows: [
          ['Riz · poulet · salade', ''],
          ['Calories', '540 kcal'],
          ['Protéines', '42 g'],
          ['Glucides', '58 g'],
          ['Lipides', '12 g'],
        ],
      },
    };
  return {
    role: 'coach',
    text: 'Je peux générer ton programme, analyser ta semaine, estimer tes résultats ou décoder un repas en photo. Choisis ci-dessous.',
  };
}
