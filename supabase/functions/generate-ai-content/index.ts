
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { OpenAI } from "https://esm.sh/openai@4.28.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface UserForceData {
  hautDuCorps: number;
  milieuDuCorps: number;
  basDuCorps: number;
}

interface UserFlexibiliteData {
  cou: number;
  epaules: number;
  lombaires: number;
  ischios: number;
  hanches: number;
}

interface UserMetaboliqueData {
  poids: number;
  masseGraisseuse: number;
  masseMusculaire: number;
  ageMetabolique: number;
}

interface UserCardioData {
  vo2max: number;
  ageCardio: number;
}

interface PersonalInfo {
  sex: string;
  age: number;
}

interface UserData {
  personalInfo: PersonalInfo;
  force: UserForceData;
  flexibilite: UserFlexibiliteData;
  metabolique: UserMetaboliqueData;
  cardio: UserCardioData;
  objectives: {
    priseDeMasse: boolean;
    perteDePoids: boolean;
    ameliorationSouplesse: boolean;
    ameliorationCardio: boolean;
    maintienForme: boolean;
  };
  dietaryRestrictions: {
    sansGluten: boolean;
    vegan: boolean;
    sansOeuf: boolean;
    sansProduitLaitier: boolean;
  };
  healthConditions: {
    insuffisanceCardiaque: boolean;
    arthrose: boolean;
    problemesRespiratoires: boolean;
    obesite: boolean;
    hypothyroidie: boolean;
    autresInfoSante: string;
  };
}

interface RequestData {
  userData: {
    personalInfo: PersonalInfo;
    eGymData: {
      force: UserForceData;
      flexibilite: UserFlexibiliteData;
      metabolique: UserMetaboliqueData;
      cardio: UserCardioData;
    };
    objectives: {
      priseDeMasse: boolean;
      perteDePoids: boolean;
      ameliorationSouplesse: boolean;
      ameliorationCardio: boolean;
      maintienForme: boolean;
    };
    dietaryRestrictions: {
      sansGluten: boolean;
      vegan: boolean;
      sansOeuf: boolean;
      sansProduitLaitier: boolean;
    };
    healthConditions: {
      insuffisanceCardiaque: boolean;
      arthrose: boolean;
      problemesRespiratoires: boolean;
      obesite: boolean;
      hypothyroidie: boolean;
      autresInfoSante: string;
    };
  };
  contentType: "nutrition" | "supplements" | "flexibility";
}

serve(async (req) => {
  // CORS pre-flight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Parse request
    const { userData, contentType } = await req.json() as RequestData;
    
    // Transform userData to fit our internal format
    const transformedUserData: UserData = {
      personalInfo: userData.personalInfo,
      force: userData.eGymData.force,
      flexibilite: userData.eGymData.flexibilite,
      metabolique: userData.eGymData.metabolique,
      cardio: userData.eGymData.cardio,
      objectives: userData.objectives,
      dietaryRestrictions: userData.dietaryRestrictions,
      healthConditions: userData.healthConditions
    };
    
    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY")
    });
    
    let content;
    let systemMessage = "";
    let userMessage = "";
    
    const sexStr = transformedUserData.personalInfo.sex ? 
      `Sexe: ${transformedUserData.personalInfo.sex}` : 
      "Sexe: Non spécifié";
    
    const ageStr = transformedUserData.personalInfo.age ? 
      `Âge: ${transformedUserData.personalInfo.age} ans` : 
      "Âge: Non spécifié";
    
    // Common profile information string for all content types
    const userProfile = `
PROFIL DE L'UTILISATEUR:
${sexStr}
${ageStr}

Force:
- Haut du corps: ${transformedUserData.force.hautDuCorps || "Non spécifié"}
- Milieu du corps: ${transformedUserData.force.milieuDuCorps || "Non spécifié"}
- Bas du corps: ${transformedUserData.force.basDuCorps || "Non spécifié"}

Flexibilité (1-5):
- Cou: ${transformedUserData.flexibilite.cou || "Non spécifié"}
- Épaules: ${transformedUserData.flexibilite.epaules || "Non spécifié"}
- Lombaires: ${transformedUserData.flexibilite.lombaires || "Non spécifié"}
- Ischios: ${transformedUserData.flexibilite.ischios || "Non spécifié"}
- Hanches: ${transformedUserData.flexibilite.hanches || "Non spécifié"}

Métabolique:
- Poids: ${transformedUserData.metabolique.poids || "Non spécifié"} kg
- Masse graisseuse: ${transformedUserData.metabolique.masseGraisseuse || "Non spécifié"}%
- Masse musculaire: ${transformedUserData.metabolique.masseMusculaire || "Non spécifié"}%
- Âge métabolique: ${transformedUserData.metabolique.ageMetabolique || "Non spécifié"} ans

Cardio:
- VO2max: ${transformedUserData.cardio.vo2max || "Non spécifié"}
- Âge cardio: ${transformedUserData.cardio.ageCardio || "Non spécifié"} ans

Objectifs:
- Prise de masse musculaire: ${transformedUserData.objectives.priseDeMasse ? "Oui" : "Non"}
- Perte de poids: ${transformedUserData.objectives.perteDePoids ? "Oui" : "Non"}
- Amélioration de la souplesse: ${transformedUserData.objectives.ameliorationSouplesse ? "Oui" : "Non"}
- Amélioration de la capacité cardio: ${transformedUserData.objectives.ameliorationCardio ? "Oui" : "Non"}
- Maintien du niveau de forme actuel: ${transformedUserData.objectives.maintienForme ? "Oui" : "Non"}

Restrictions alimentaires:
- Sans gluten: ${transformedUserData.dietaryRestrictions.sansGluten ? "Oui" : "Non"}
- Vegan: ${transformedUserData.dietaryRestrictions.vegan ? "Oui" : "Non"}
- Sans œuf: ${transformedUserData.dietaryRestrictions.sansOeuf ? "Oui" : "Non"}
- Sans produit laitier: ${transformedUserData.dietaryRestrictions.sansProduitLaitier ? "Oui" : "Non"}

Conditions de santé:
- Insuffisance cardiaque: ${transformedUserData.healthConditions.insuffisanceCardiaque ? "Oui" : "Non"}
- Arthrose: ${transformedUserData.healthConditions.arthrose ? "Oui" : "Non"}
- Problèmes respiratoires: ${transformedUserData.healthConditions.problemesRespiratoires ? "Oui" : "Non"}
- Obésité: ${transformedUserData.healthConditions.obesite ? "Oui" : "Non"}
- Hypothyroïdie: ${transformedUserData.healthConditions.hypothyroidie ? "Oui" : "Non"}
- Autres infos santé: ${transformedUserData.healthConditions.autresInfoSante || "Aucune"}
`;
    
    // Generate appropriate content based on contentType
    switch (contentType) {
      case "nutrition":
        systemMessage = `Tu es un nutritionniste expert spécialisé en nutrition sportive. Ta mission est de créer un plan alimentaire personnalisé pour un client, basé sur ses données physiques, ses objectifs, et ses contraintes médicales et alimentaires. Tes recommandations doivent être scientifiquement fondées et adaptées au profil spécifique du client.`;
        
        userMessage = `${userProfile}

Génère un plan alimentaire personnalisé pour ce client sous le format JSON suivant:
{
  "disclaimer": "Un avertissement important concernant ce plan alimentaire et la nécessité de consulter un professionnel",
  "introduction": "Un bref paragraphe d'introduction expliquant les principes généraux du plan adapté au profil",
  "macronutriments": {
    "calories": "Nombre approximatif de calories recommandées par jour",
    "proteines": "Quantité en grammes et pourcentage de l'apport calorique total",
    "lipides": "Quantité en grammes et pourcentage de l'apport calorique total",
    "glucides": "Quantité en grammes et pourcentage de l'apport calorique total"
  },
  "repas": [
    {
      "type": "Petit déjeuner/Déjeuner/Dîner/Collation",
      "description": "Description générale de ce repas",
      "aliments": [
        {
          "nom": "Nom de l'aliment",
          "quantite": "Quantité recommandée",
          "benefices": "Bénéfices nutritionnels spécifiques pour cet aliment"
        }
      ],
      "conseils": "Conseils spécifiques pour ce repas"
    }
  ],
  "hydratation": "Recommandations concernant l'hydratation",
  "conseils_supplementaires": [
    "Conseil supplémentaire 1",
    "Conseil supplémentaire 2"
  ]
}

Assure-toi que tes recommandations soient réellement personnalisées en fonction de toutes les caractéristiques du profil fourni, en particulier l'âge, le sexe, les objectifs (prise de masse, perte de poids, etc.) et les contraintes alimentaires.`;
        break;
        
      case "supplements":
        systemMessage = `Tu es un expert en nutrition sportive et compléments alimentaires. Ta mission est de recommander les compléments alimentaires les plus appropriés pour un client, en fonction de son profil physique, ses objectifs, et ses contraintes médicales. Tes recommandations doivent être scientifiquement fondées et répondre aux besoins spécifiques du client.`;
        
        userMessage = `${userProfile}

Génère des recommandations de compléments alimentaires pour ce client sous le format JSON suivant:
{
  "disclaimer": "Un avertissement important concernant l'utilisation de compléments et la nécessité de consulter un professionnel",
  "supplements": [
    {
      "name": "Nom du complément",
      "dosage": "Dosage recommandé avec timing",
      "benefits": ["Bénéfice 1", "Bénéfice 2", "Bénéfice 3"],
      "precautions": "Précautions d'usage spécifiques",
      "timing": "Moment optimal de prise"
    }
  ]
}

Assure-toi que tes recommandations tiennent compte de l'âge, du sexe, des objectifs spécifiques (prise de masse, perte de poids, etc.) et des contraintes de santé. Ne recommande pas plus de 5 compléments au total.`;
        break;
        
      case "flexibility":
        systemMessage = `Tu es un expert en préparation physique et kinésithérapie. Ta mission est de créer un programme personnalisé d'exercices de souplesse pour un client, basé sur ses données physiques, ses objectifs, et ses contraintes médicales. Tes recommandations doivent être scientifiquement fondées et adaptées au profil spécifique du client.`;
        
        userMessage = `${userProfile}

Génère un programme d'exercices de souplesse pour ce client sous le format JSON suivant:
{
  "disclaimer": "Un avertissement important concernant la pratique de ces exercices et la nécessité de consulter un professionnel",
  "introduction": "Un bref paragraphe d'introduction expliquant l'importance de la souplesse et les principes généraux du programme",
  "exercises": [
    {
      "name": "Nom de l'exercice",
      "targetArea": "Zone ciblée (ex: lombaires, épaules, etc.)",
      "description": "Description détaillée de l'exécution de l'exercice",
      "benefits": "Bénéfices spécifiques de cet exercice pour le client",
      "frequency": "Fréquence recommandée (ex: 3 fois par semaine)",
      "duration": "Durée recommandée (ex: tenir 30 secondes, 3 répétitions)",
      "precautions": "Précautions particulières ou contre-indications si applicable",
      "equipment": ["Équipement nécessaire 1", "Équipement nécessaire 2"] 
    }
  ]
}

Assure-toi que tes recommandations tiennent bien compte de l'âge, du sexe, des valeurs de flexibilité indiquées dans le profil, et des contraintes de santé. Propose entre 5 et 8 exercices bien ciblés.`;
        break;
        
      default:
        throw new Error(`Type de contenu non pris en charge: ${contentType}`);
    }
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" }
    });
    
    const responseText = completion.choices[0].message.content;
    
    if (!responseText) {
      throw new Error("Réponse AI vide");
    }
    
    try {
      // Parse the JSON response
      content = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      // Return raw text if JSON parsing fails
      content = { error: "Failed to parse AI response", rawResponse: responseText };
    }
    
    // Return the generated content
    return new Response(
      JSON.stringify({ content }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
    
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});
