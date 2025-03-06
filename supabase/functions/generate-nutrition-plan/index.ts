
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { OpenAI } from "https://esm.sh/openai@4.0.0/index.js";

// Create a OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

interface NutritionPlan {
  breakfast: {
    description: string;
    examples: string[];
    timing: string;
  };
  lunch: {
    description: string;
    examples: string[];
    timing: string;
  };
  dinner: {
    description: string;
    examples: string[];
    timing: string;
  };
  snacks: {
    description: string;
    examples: string[];
    timing: string;
  };
  hydration: string;
  disclaimer: string;
}

const defaultNutritionPlan: NutritionPlan = {
  breakfast: {
    description: "Repas équilibré riche en protéines et fibres",
    examples: ["Œufs brouillés avec des légumes", "Porridge aux fruits rouges"],
    timing: "7h-9h"
  },
  lunch: {
    description: "Repas complet avec protéines, légumes et glucides complexes",
    examples: ["Salade composée avec poulet grillé", "Bol de quinoa aux légumes"],
    timing: "12h-14h"
  },
  dinner: {
    description: "Repas léger et équilibré",
    examples: ["Poisson grillé avec légumes vapeur", "Soupe de légumes avec tofu"],
    timing: "19h-21h"
  },
  snacks: {
    description: "Collations saines pour maintenir l'énergie",
    examples: ["Fruits frais", "Poignée d'amandes", "Yaourt nature"],
    timing: "10h30 et 16h"
  },
  hydration: "Boire au moins 2L d'eau par jour, répartis tout au long de la journée",
  disclaimer: "Ces recommandations sont générales. Consultez un professionnel de santé pour des conseils personnalisés."
};

serve(async (req) => {
  try {
    console.log('Nutrition plan generator called');
    
    // Parse request body
    const body = await req.json();
    const { userData } = body;
    
    if (!userData) {
      console.error('Missing userData in request');
      return new Response(
        JSON.stringify({ 
          error: 'Données utilisateur manquantes',
          content: defaultNutritionPlan
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }
    
    console.log('User data received:', JSON.stringify(userData).substring(0, 300) + '...');
    
    // Construct a prompt with the user's data
    let prompt = `Génère un plan nutritionnel quotidien personnalisé pour une personne en fonction des informations suivantes:

- Sexe: ${userData.personalInfo?.sex || 'Non spécifié'}
- Âge: ${userData.personalInfo?.age || 'Non spécifié'} ans
- Poids: ${userData.eGymData?.metabolique?.poids || 'Non spécifié'} kg
- % Masse graisseuse: ${userData.eGymData?.metabolique?.masseGraisseuse || 'Non spécifié'}
- % Masse musculaire: ${userData.eGymData?.metabolique?.masseMusculaire || 'Non spécifié'}

Objectifs:
- Prise de masse: ${userData.objectives?.priseDeMasse ? 'Oui' : 'Non'}
- Perte de poids: ${userData.objectives?.perteDePoids ? 'Oui' : 'Non'}
- Amélioration souplesse: ${userData.objectives?.ameliorationSouplesse ? 'Oui' : 'Non'}
- Amélioration cardio: ${userData.objectives?.ameliorationCardio ? 'Oui' : 'Non'}
- Maintien forme: ${userData.objectives?.maintienForme ? 'Oui' : 'Non'}

Restrictions alimentaires:
- Sans gluten: ${userData.dietaryRestrictions?.sansGluten ? 'Oui' : 'Non'}
- Vegan: ${userData.dietaryRestrictions?.vegan ? 'Oui' : 'Non'}
- Sans œuf: ${userData.dietaryRestrictions?.sansOeuf ? 'Oui' : 'Non'}
- Sans produit laitier: ${userData.dietaryRestrictions?.sansProduitLaitier ? 'Oui' : 'Non'}

Problèmes de santé:
- Insuffisance cardiaque: ${userData.healthConditions?.insuffisanceCardiaque ? 'Oui' : 'Non'}
- Arthrose: ${userData.healthConditions?.arthrose ? 'Oui' : 'Non'}
- Problèmes respiratoires: ${userData.healthConditions?.problemesRespiratoires ? 'Oui' : 'Non'}
- Obésité: ${userData.healthConditions?.obesite ? 'Oui' : 'Non'}
- Hypothyroïdie: ${userData.healthConditions?.hypothyroidie ? 'Oui' : 'Non'}

Le plan nutritionnel doit être structuré exactement avec le format JSON suivant:
{
  "breakfast": {
    "description": "Description du petit-déjeuner recommandé",
    "examples": ["Exemple 1", "Exemple 2", "Exemple 3"],
    "timing": "Horaire recommandé"
  },
  "lunch": {
    "description": "Description du déjeuner recommandé",
    "examples": ["Exemple 1", "Exemple 2", "Exemple 3"],
    "timing": "Horaire recommandé"
  },
  "dinner": {
    "description": "Description du dîner recommandé",
    "examples": ["Exemple 1", "Exemple 2", "Exemple 3"],
    "timing": "Horaire recommandé"
  },
  "snacks": {
    "description": "Description des collations recommandées",
    "examples": ["Exemple 1", "Exemple 2", "Exemple 3"],
    "timing": "Horaires recommandés"
  },
  "hydration": "Recommandations d'hydratation",
  "disclaimer": "Avertissement précisant que ces conseils sont généraux et qu'un professionnel de santé devrait être consulté"
}

Le plan doit être adapté aux objectifs et restrictions alimentaires spécifiques de la personne. Réponds uniquement avec le JSON, sans aucun texte avant ou après.`;

    console.log('Sending request to OpenAI');
    
    // Call OpenAI API with failsafe timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 seconds timeout
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: [
          { role: "system", content: "Tu es un nutritionniste spécialisé en nutrition sportive. Tu dois générer un plan nutritionnel personnalisé basé sur les données fournies." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }, { signal: controller.signal });
      
      clearTimeout(timeoutId);
      
      let nutritionPlan: NutritionPlan;
      
      try {
        // Clean up response
        const responseText = completion.choices[0].message.content?.trim() || '{}';
        let cleanedText = responseText;
        
        // Remove markdown code fences if present
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/```json\n/g, '').replace(/\n```/g, '');
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/```\n/g, '').replace(/\n```/g, '');
        }
        
        console.log('Raw response text (truncated):', cleanedText.substring(0, 300) + '...');
        
        // Parse the JSON response
        nutritionPlan = JSON.parse(cleanedText) as NutritionPlan;
        
        // Validate nutrition plan structure
        const isValid = nutritionPlan && 
                         nutritionPlan.breakfast && 
                         nutritionPlan.lunch && 
                         nutritionPlan.dinner && 
                         nutritionPlan.snacks &&
                         typeof nutritionPlan.hydration === 'string' &&
                         typeof nutritionPlan.disclaimer === 'string';
        
        if (!isValid) {
          console.error('Invalid nutrition plan structure, using default');
          nutritionPlan = defaultNutritionPlan;
        }
        
        // Make sure all required fields exist and have correct types
        ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(meal => {
          const mealData = nutritionPlan[meal as keyof NutritionPlan] as any;
          
          if (!mealData || typeof mealData !== 'object') {
            nutritionPlan[meal as keyof NutritionPlan] = defaultNutritionPlan[meal as keyof NutritionPlan];
            return;
          }
          
          if (!mealData.description || typeof mealData.description !== 'string') {
            mealData.description = defaultNutritionPlan[meal as keyof NutritionPlan].description;
          }
          
          if (!mealData.examples || !Array.isArray(mealData.examples) || mealData.examples.length === 0) {
            mealData.examples = defaultNutritionPlan[meal as keyof NutritionPlan].examples;
          }
          
          if (!mealData.timing || typeof mealData.timing !== 'string') {
            mealData.timing = defaultNutritionPlan[meal as keyof NutritionPlan].timing;
          }
        });
        
        if (!nutritionPlan.hydration || typeof nutritionPlan.hydration !== 'string') {
          nutritionPlan.hydration = defaultNutritionPlan.hydration;
        }
        
        if (!nutritionPlan.disclaimer || typeof nutritionPlan.disclaimer !== 'string') {
          nutritionPlan.disclaimer = defaultNutritionPlan.disclaimer;
        }
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        nutritionPlan = defaultNutritionPlan;
      }
      
      return new Response(
        JSON.stringify({ content: nutritionPlan }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error calling OpenAI:', error);
      
      // Return a default nutrition plan in case of API error
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la génération du plan nutritionnel',
          content: defaultNutritionPlan
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }
  } catch (error) {
    console.error('Unexpected error in nutrition plan generator:', error);
    
    // Return a default nutrition plan for any uncaught errors
    return new Response(
      JSON.stringify({ 
        error: 'Erreur inattendue lors de la génération du plan nutritionnel',
        content: defaultNutritionPlan
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }
})
