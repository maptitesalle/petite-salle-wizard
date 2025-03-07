
import { UserData } from './types';

export const defaultUserData: UserData = {
  personalInfo: {
    sex: '',
    age: 0
  },
  eGymData: {
    force: {
      hautDuCorps: 0,
      milieuDuCorps: 0,
      basDuCorps: 0
    },
    flexibilite: {
      cou: 0,
      epaules: 0,
      lombaires: 0,
      ischios: 0,
      hanches: 0
    },
    metabolique: {
      poids: 0,
      masseGraisseuse: 0,
      masseMusculaire: 0,
      ageMetabolique: 0
    },
    cardio: {
      vo2max: 0,
      ageCardio: 0
    }
  },
  objectives: {
    priseDeMasse: false,
    perteDePoids: false,
    ameliorationSouplesse: false,
    ameliorationCardio: false,
    maintienForme: false
  },
  dietaryRestrictions: {
    sansGluten: false,
    vegan: false,
    sansOeuf: false,
    sansProduitLaitier: false
  },
  healthConditions: {
    insuffisanceCardiaque: false,
    arthrose: false,
    problemesRespiratoires: false,
    obesite: false,
    hypothyroidie: false,
    autresInfoSante: ''
  },
  lastUpdated: ''
};
