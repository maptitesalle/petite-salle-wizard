
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Définir la structure d'une réponse de menu pour la nutrition
interface NutritionMenuItem {
  title: string;
  description: string;
  ingredients: string[];
  preparation: string;
  calories: number;
  macros: {
    proteins: string;
    carbs: string;
    fats: string;
  };
}

interface NutritionDay {
  day: string;
  meals: {
    breakfast: NutritionMenuItem;
    lunch: NutritionMenuItem;
    snack: NutritionMenuItem;
    dinner: NutritionMenuItem;
  };
  totalCalories: number;
  macros: {
    proteins: string;
    carbs: string;
    fats: string;
  };
}

interface NutritionPlan {
  disclaimer: string;
  alert: string | null;
  days: NutritionDay[];
  shoppingList: {
    categories: {
      [category: string]: string[];
    }
  };
}

// Définir la structure pour les compléments alimentaires
interface Supplement {
  name: string;
  dosage: string;
  benefits: string[];
  precautions: string;
  timing: string;
}

interface SupplementsPlan {
  disclaimer: string;
  supplements: Supplement[];
}

// Définir la structure pour les exercices de souplesse
interface FlexibilityExercise {
  name: string;
  targetArea: string;
  description: string;
  benefits: string;
  frequency: string;
  duration: string;
  precautions: string | null;
  equipment: string[] | null;
}

interface FlexibilityPlan {
  disclaimer: string;
  introduction: string;
  exercises: FlexibilityExercise[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    const { userData, contentType } = await req.json()
    console.log(`Generating ${contentType} content for user data:`, JSON.stringify(userData))

    // Créer le prompt approprié en fonction du type de contenu demandé
    let systemPrompt = ""
    let userPrompt = ""
    let outputFormat = {}

    switch(contentType) {
      case 'nutrition':
        systemPrompt = "Tu es un expert en nutrition sportive, spécialisé dans l'élaboration de plans nutritionnels personnalisés qui tiennent compte des dernières avancées scientifiques."
        systemPrompt += constructNutritionUserContext(userData)
        
        userPrompt = `Fournis un plan nutritionnel complet pour 7 jours, adapté au profil de l'utilisateur. 
        Inclus une liste de courses organisée par catégories (fruits, légumes, protéines, etc.).
        Organise les données au format JSON suivant:
        {
          "disclaimer": "Texte d'avertissement sur les conseils nutritionnels",
          "alert": "Alerte spécifique si conditions médicales (null si aucune)",
          "days": [
            {
              "day": "Jour 1",
              "meals": {
                "breakfast": {
                  "title": "Petit-déjeuner",
                  "description": "Description détaillée",
                  "ingredients": ["Liste", "des", "ingrédients"],
                  "preparation": "Instructions de préparation",
                  "calories": 450
                },
                "lunch": { ... },
                "snack": { ... },
                "dinner": { ... }
              },
              "totalCalories": 1850,
              "macros": {
                "proteins": "25%",
                "carbs": "45%",
                "fats": "30%"
              }
            }
          ],
          "shoppingList": {
            "categories": {
              "Fruits": ["pommes", "bananes"],
              "Légumes": ["carottes", "brocoli"],
              "Protéines": ["poulet", "oeufs"],
              "Céréales": ["riz", "avoine"],
              "Produits laitiers": ["lait", "fromage"],
              "Épices et condiments": ["sel", "poivre"],
              "Autres": ["huile d'olive", "miel"]
            }
          }
        }
        Assure-toi que le JSON est valide et suit exactement cette structure.`;
        break;
        
      case 'supplements':
        systemPrompt = "Tu es un expert en compléments alimentaires et micronutrition."
        systemPrompt += constructSupplementsUserContext(userData)
        
        userPrompt = `Indique quels compléments pourraient être intéressants pour soutenir l'objectif de l'utilisateur.
        Fournis les données au format JSON suivant:
        {
          "disclaimer": "Texte d'avertissement sur la consultation médicale",
          "supplements": [
            {
              "name": "Nom du complément",
              "dosage": "Dosage recommandé",
              "benefits": ["Bénéfice 1", "Bénéfice 2"],
              "precautions": "Précautions d'usage",
              "timing": "Moment de prise recommandé"
            }
          ]
        }
        Assure-toi que le JSON est valide et suit exactement cette structure.`;
        break;
        
      case 'flexibility':
        systemPrompt = "Tu es un kinésithérapeute / coach en flexibilité."
        systemPrompt += constructFlexibilityUserContext(userData)
        
        userPrompt = `Propose une routine d'étirements ciblée, adaptée aux mesures de flexibilité indiquées.
        Fournis les données au format JSON suivant:
        {
          "disclaimer": "Texte d'avertissement sur la consultation médicale",
          "introduction": "Introduction générale sur l'importance de la souplesse",
          "exercises": [
            {
              "name": "Nom de l'exercice",
              "targetArea": "Zone ciblée",
              "description": "Description détaillée de l'exercice",
              "benefits": "Bénéfices spécifiques",
              "frequency": "Fréquence recommandée",
              "duration": "Durée recommandée",
              "precautions": "Précautions à prendre ou null",
              "equipment": ["Équipement nécessaire"] ou null
            }
          ]
        }
        Assure-toi que le JSON est valide et suit exactement cette structure.`;
        break;
        
      default:
        throw new Error(`Type de contenu non pris en charge: ${contentType}`);
    }

    console.log("System prompt:", systemPrompt)
    console.log("User prompt:", userPrompt)

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    console.log("OpenAI response received")
    
    // Extract and parse the JSON content from the response
    try {
      const content = data.choices[0].message.content
      const parsedContent = JSON.parse(content)
      
      return new Response(JSON.stringify({ 
        content: parsedContent,
        contentType 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (parseError) {
      console.error('Error parsing JSON from OpenAI response:', parseError)
      return new Response(JSON.stringify({ 
        error: 'Failed to parse content', 
        content: data.choices[0].message.content 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }
  } catch (error) {
    console.error('Error in generate-ai-content function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// Fonctions pour construire les contextes utilisateur selon le type de contenu
function constructNutritionUserContext(userData) {
  let context = "\n\nContexte :\n"
  
  // Ajouter les objectifs
  if (userData.objectives) {
    context += "Objectif principal : "
    if (userData.objectives.priseDeMasse) context += "prise de masse musculaire, "
    if (userData.objectives.perteDePoids) context += "perte de poids, "
    if (userData.objectives.ameliorationSouplesse) context += "amélioration de la souplesse, "
    if (userData.objectives.ameliorationCardio) context += "amélioration du cardio, "
    if (userData.objectives.maintienForme) context += "maintien de la forme, "
    context = context.slice(0, -2) + ".\n"
  }
  
  // Ajouter les restrictions alimentaires
  if (userData.dietaryRestrictions) {
    context += "Régime alimentaire : "
    if (userData.dietaryRestrictions.sansGluten) context += "sans gluten, "
    if (userData.dietaryRestrictions.vegan) context += "vegan, "
    if (userData.dietaryRestrictions.sansOeuf) context += "sans œuf, "
    if (userData.dietaryRestrictions.sansProduitLaitier) context += "sans produit laitier, "
    context = context.slice(0, -2) + ".\n"
  }
  
  // Ajouter les pathologies
  if (userData.healthConditions) {
    context += "Pathologies ou précautions : "
    if (userData.healthConditions.insuffisanceCardiaque) context += "insuffisance cardiaque, "
    if (userData.healthConditions.arthrose) context += "arthrose, "
    if (userData.healthConditions.problemesRespiratoires) context += "problèmes respiratoires, "
    if (userData.healthConditions.obesite) context += "obésité, "
    if (userData.healthConditions.hypothyroidie) context += "hypothyroïdie, "
    if (userData.healthConditions.autresInfoSante) context += userData.healthConditions.autresInfoSante + ", "
    context = context.slice(0, -2) + ".\n"
  }
  
  // Ajouter les données corporelles
  if (userData.eGymData && userData.eGymData.metabolique) {
    context += "Données corporelles : "
    if (userData.eGymData.metabolique.poids) context += `poids ${userData.eGymData.metabolique.poids}kg, `
    if (userData.eGymData.metabolique.masseGraisseuse) context += `masse graisseuse ${userData.eGymData.metabolique.masseGraisseuse}%, `
    if (userData.eGymData.metabolique.masseMusculaire) context += `masse musculaire ${userData.eGymData.metabolique.masseMusculaire}%, `
    context = context.slice(0, -2) + ".\n"
  }
  
  return context;
}

function constructSupplementsUserContext(userData) {
  let context = "\n\nContexte :\n"
  
  // Ajouter les objectifs
  if (userData.objectives) {
    context += "Objectif principal : "
    if (userData.objectives.priseDeMasse) context += "prise de masse musculaire, "
    if (userData.objectives.perteDePoids) context += "perte de poids, "
    if (userData.objectives.ameliorationSouplesse) context += "amélioration de la souplesse, "
    if (userData.objectives.ameliorationCardio) context += "amélioration du cardio, "
    if (userData.objectives.maintienForme) context += "maintien de la forme, "
    context = context.slice(0, -2) + ".\n"
  }
  
  // Ajouter les restrictions alimentaires
  if (userData.dietaryRestrictions) {
    context += "Régime : "
    if (userData.dietaryRestrictions.sansGluten) context += "sans gluten, "
    if (userData.dietaryRestrictions.vegan) context += "vegan, "
    if (userData.dietaryRestrictions.sansOeuf) context += "sans œuf, "
    if (userData.dietaryRestrictions.sansProduitLaitier) context += "sans produit laitier, "
    context = context.slice(0, -2) + ".\n"
  }
  
  // Ajouter les pathologies
  if (userData.healthConditions) {
    context += "Pathologies ou contraintes : "
    if (userData.healthConditions.insuffisanceCardiaque) context += "insuffisance cardiaque, "
    if (userData.healthConditions.arthrose) context += "arthrose, "
    if (userData.healthConditions.problemesRespiratoires) context += "problèmes respiratoires, "
    if (userData.healthConditions.obesite) context += "obésité, "
    if (userData.healthConditions.hypothyroidie) context += "hypothyroïdie, "
    if (userData.healthConditions.autresInfoSante) context += userData.healthConditions.autresInfoSante + ", "
    context = context.slice(0, -2) + ".\n"
  }
  
  return context;
}

function constructFlexibilityUserContext(userData) {
  let context = "\n\nContexte :\n"
  
  // Ajouter les résultats de flexibilité
  if (userData.eGymData && userData.eGymData.flexibilite) {
    context += "Résultats eGym de flexibilité :\n"
    if (userData.eGymData.flexibilite.cou !== undefined) 
      context += `Cou : ${userData.eGymData.flexibilite.cou < 50 ? 'faible' : 'normal'}\n`
    if (userData.eGymData.flexibilite.epaules !== undefined) 
      context += `Épaules : ${userData.eGymData.flexibilite.epaules < 50 ? 'faible' : 'normal'}\n`
    if (userData.eGymData.flexibilite.lombaires !== undefined) 
      context += `Lombaires : ${userData.eGymData.flexibilite.lombaires < 50 ? 'faible' : 'normal'}\n`
    if (userData.eGymData.flexibilite.ischios !== undefined) 
      context += `Ischios : ${userData.eGymData.flexibilite.ischios < 50 ? 'faible' : 'normal'}\n`
    if (userData.eGymData.flexibilite.hanches !== undefined) 
      context += `Hanches : ${userData.eGymData.flexibilite.hanches < 50 ? 'faible' : 'normal'}\n`
  }
  
  // Ajouter les pathologies
  if (userData.healthConditions) {
    context += "Pathologies éventuelles : "
    if (userData.healthConditions.insuffisanceCardiaque) context += "insuffisance cardiaque, "
    if (userData.healthConditions.arthrose) context += "arthrose, "
    if (userData.healthConditions.problemesRespiratoires) context += "problèmes respiratoires, "
    if (userData.healthConditions.obesite) context += "obésité, "
    if (userData.healthConditions.hypothyroidie) context += "hypothyroïdie, "
    if (userData.healthConditions.autresInfoSante) context += userData.healthConditions.autresInfoSante + ", "
    context = context.slice(0, -2) + ".\n"
  }
  
  context += "Objectif : améliorer la mobilité et réduire d'éventuelles douleurs.\n"
  
  return context;
}
