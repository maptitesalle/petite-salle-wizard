
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { userData } = await req.json()
    console.log("Received user data:", JSON.stringify(userData))

    // Create system prompt based on user data
    let systemPrompt = "Tu es un nutritionniste expert. "
    systemPrompt += "Crée un plan nutritionnel pour 7 jours basé sur les données suivantes du client: "
    
    // Add dietary restrictions
    if (userData.dietaryRestrictions) {
      if (userData.dietaryRestrictions.sansGluten) systemPrompt += "Régime sans gluten. "
      if (userData.dietaryRestrictions.vegan) systemPrompt += "Régime vegan. "
      if (userData.dietaryRestrictions.sansOeuf) systemPrompt += "Régime sans œuf. "
      if (userData.dietaryRestrictions.sansProduitLaitier) systemPrompt += "Régime sans produit laitier. "
    }

    // Add objectives
    if (userData.objectives) {
      if (userData.objectives.priseDeMasse) systemPrompt += "Objectif: prise de masse. "
      if (userData.objectives.perteDePoids) systemPrompt += "Objectif: perte de poids. "
      if (userData.objectives.ameliorationSouplesse) systemPrompt += "Objectif: amélioration de la souplesse. "
      if (userData.objectives.ameliorationCardio) systemPrompt += "Objectif: amélioration du cardio. "
      if (userData.objectives.maintienForme) systemPrompt += "Objectif: maintien de la forme. "
    }

    // Add health conditions
    if (userData.healthConditions) {
      if (userData.healthConditions.insuffisanceCardiaque) systemPrompt += "Condition: insuffisance cardiaque. "
      if (userData.healthConditions.arthrose) systemPrompt += "Condition: arthrose. "
      if (userData.healthConditions.problemesRespiratoires) systemPrompt += "Condition: problèmes respiratoires. "
      if (userData.healthConditions.obesite) systemPrompt += "Condition: obésité. "
      if (userData.healthConditions.hypothyroidie) systemPrompt += "Condition: hypothyroïdie. "
      if (userData.healthConditions.autresInfoSante) systemPrompt += `Autres infos santé: ${userData.healthConditions.autresInfoSante}. `
    }

    // User prompt to specify format
    const userPrompt = `Génère un plan nutritionnel pour 7 jours avec le format suivant en JSON:
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
              "calories": 450,
              "ingredients": ["Ingrédient 1", "Ingrédient 2"],
              "preparation": "Instructions de préparation"
            },
            "lunch": { 
              "title": "Déjeuner",
              "description": "Description détaillée",
              "calories": 650,
              "ingredients": ["Ingrédient 1", "Ingrédient 2"],
              "preparation": "Instructions de préparation"
            },
            "snack": { 
              "title": "Collation",
              "description": "Description détaillée",
              "calories": 250,
              "ingredients": ["Ingrédient 1", "Ingrédient 2"],
              "preparation": "Instructions de préparation"
            },
            "dinner": { 
              "title": "Dîner",
              "description": "Description détaillée",
              "calories": 550,
              "ingredients": ["Ingrédient 1", "Ingrédient 2"],
              "preparation": "Instructions de préparation"
            }
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
          "Fruits et Légumes": ["Pommes", "Bananes", "Carottes"],
          "Protéines": ["Poulet", "Oeufs", "Tofu"],
          "Céréales": ["Riz", "Pâtes", "Pain complet"]
        }
      }
    }
    Assure-toi que le JSON est valide et suit exactement cette structure. N'oublie pas d'inclure les ingrédients et les instructions de préparation pour chaque repas.`;

    console.log("System prompt:", systemPrompt)

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
      console.log("Raw content from OpenAI:", content)
      
      // Ensure we have a valid JSON by doing more intensive processing
      let jsonString = content
      
      // Remove markdown code blocks if present
      if (content.includes("```json")) {
        jsonString = content.split("```json")[1].split("```")[0].trim()
      } else if (content.includes("```")) {
        jsonString = content.split("```")[1].split("```")[0].trim()
      }
      
      // Try to find JSON object if there's text before or after
      if (!jsonString.startsWith("{")) {
        const startIndex = jsonString.indexOf("{")
        if (startIndex !== -1) {
          jsonString = jsonString.substring(startIndex)
        }
      }
      
      if (!jsonString.endsWith("}")) {
        const endIndex = jsonString.lastIndexOf("}")
        if (endIndex !== -1) {
          jsonString = jsonString.substring(0, endIndex + 1)
        }
      }
      
      console.log("Processed JSON string:", jsonString)
      
      // Now parse the cleaned JSON
      const nutritionPlan = JSON.parse(jsonString)
      
      // Validate the structure to ensure it has all required properties
      if (!nutritionPlan.days || !Array.isArray(nutritionPlan.days) || nutritionPlan.days.length === 0) {
        throw new Error("Invalid nutrition plan structure: 'days' array is missing or empty")
      }
      
      // Make sure each day has meals
      nutritionPlan.days.forEach((day, index) => {
        if (!day.meals) {
          day.meals = {
            breakfast: { 
              title: "Petit-déjeuner", 
              description: "Plan par défaut - données manquantes", 
              calories: 0,
              ingredients: ["Information non disponible"],
              preparation: "Information non disponible"
            },
            lunch: { 
              title: "Déjeuner", 
              description: "Plan par défaut - données manquantes", 
              calories: 0,
              ingredients: ["Information non disponible"],
              preparation: "Information non disponible"
            },
            snack: { 
              title: "Collation", 
              description: "Plan par défaut - données manquantes", 
              calories: 0,
              ingredients: ["Information non disponible"],
              preparation: "Information non disponible"
            },
            dinner: { 
              title: "Dîner", 
              description: "Plan par défaut - données manquantes", 
              calories: 0,
              ingredients: ["Information non disponible"],
              preparation: "Information non disponible"
            }
          }
        }
        
        // Make sure each meal has all required fields
        ['breakfast', 'lunch', 'snack', 'dinner'].forEach(mealType => {
          const meal = day.meals[mealType]
          if (!meal) {
            day.meals[mealType] = {
              title: mealType === 'breakfast' ? "Petit-déjeuner" : 
                     mealType === 'lunch' ? "Déjeuner" : 
                     mealType === 'snack' ? "Collation" : "Dîner",
              description: "Plan par défaut - données manquantes",
              calories: 0,
              ingredients: ["Information non disponible"],
              preparation: "Information non disponible"
            }
          } else {
            // Ensure ingredients are present
            if (!meal.ingredients || !Array.isArray(meal.ingredients)) {
              meal.ingredients = ["Information non disponible"]
            }
            
            // Ensure preparation is present
            if (!meal.preparation) {
              meal.preparation = "Information non disponible"
            }
          }
        })
        
        // Ensure macros are present
        if (!day.macros) {
          day.macros = { proteins: "0%", carbs: "0%", fats: "0%" }
        }
        
        // Ensure totalCalories is present
        if (!day.totalCalories) {
          day.totalCalories = 0
        }
      })
      
      // Ensure shoppingList is present
      if (!nutritionPlan.shoppingList || !nutritionPlan.shoppingList.categories) {
        nutritionPlan.shoppingList = {
          categories: {
            "Fruits et Légumes": ["Information non disponible"],
            "Protéines": ["Information non disponible"],
            "Céréales": ["Information non disponible"]
          }
        }
      }
      
      // Ensure disclaimer is present
      if (!nutritionPlan.disclaimer) {
        nutritionPlan.disclaimer = "Ces recommandations nutritionnelles sont générées automatiquement et doivent être validées par un professionnel de santé."
      }
      
      console.log("Validated nutrition plan structure")
      
      return new Response(JSON.stringify({ nutritionPlan }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (parseError) {
      console.error('Error parsing JSON from OpenAI response:', parseError)
      console.error('Raw content:', data.choices[0].message.content)
      
      // Return a default nutrition plan structure instead of failing
      const defaultPlan = {
        disclaimer: "Ces recommandations nutritionnelles sont des valeurs par défaut suite à une erreur de génération. Veuillez régénérer ou consulter un professionnel.",
        alert: "Une erreur est survenue lors de la génération de votre plan nutritionnel. Voici un plan par défaut.",
        days: Array(7).fill(null).map((_, i) => ({
          day: `Jour ${i+1}`,
          meals: {
            breakfast: { 
              title: "Petit-déjeuner", 
              description: "Plan par défaut suite à une erreur de génération", 
              calories: 0,
              ingredients: ["Veuillez régénérer le plan"],
              preparation: "Veuillez régénérer le plan"
            },
            lunch: { 
              title: "Déjeuner", 
              description: "Plan par défaut suite à une erreur de génération", 
              calories: 0,
              ingredients: ["Veuillez régénérer le plan"],
              preparation: "Veuillez régénérer le plan"
            },
            snack: { 
              title: "Collation", 
              description: "Plan par défaut suite à une erreur de génération", 
              calories: 0,
              ingredients: ["Veuillez régénérer le plan"],
              preparation: "Veuillez régénérer le plan"
            },
            dinner: { 
              title: "Dîner", 
              description: "Plan par défaut suite à une erreur de génération", 
              calories: 0,
              ingredients: ["Veuillez régénérer le plan"],
              preparation: "Veuillez régénérer le plan"
            }
          },
          totalCalories: 0,
          macros: {
            proteins: "0%",
            carbs: "0%",
            fats: "0%"
          }
        })),
        shoppingList: {
          categories: {
            "Fruits et Légumes": ["Veuillez régénérer le plan"],
            "Protéines": ["Veuillez régénérer le plan"],
            "Céréales": ["Veuillez régénérer le plan"]
          }
        }
      };
      
      return new Response(JSON.stringify({ 
        nutritionPlan: defaultPlan,
        error: "Erreur lors de la génération du plan nutritionnel personnalisé. Un plan par défaut a été généré."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 with default plan instead of 500
      })
    }
  } catch (error) {
    console.error('Error in generate-nutrition-plan function:', error)
    
    // Return a default nutrition plan even on serious errors
    const defaultPlan = {
      disclaimer: "Ces recommandations nutritionnelles sont des valeurs par défaut suite à une erreur. Veuillez régénérer ou consulter un professionnel.",
      alert: "Une erreur est survenue lors de la génération de votre plan nutritionnel. Voici un plan par défaut.",
      days: Array(7).fill(null).map((_, i) => ({
        day: `Jour ${i+1}`,
        meals: {
          breakfast: { 
            title: "Petit-déjeuner", 
            description: "Plan par défaut suite à une erreur", 
            calories: 0,
            ingredients: ["Veuillez régénérer le plan"],
            preparation: "Veuillez régénérer le plan"
          },
          lunch: { 
            title: "Déjeuner", 
            description: "Plan par défaut suite à une erreur", 
            calories: 0,
            ingredients: ["Veuillez régénérer le plan"],
            preparation: "Veuillez régénérer le plan"
          },
          snack: { 
            title: "Collation", 
            description: "Plan par défaut suite à une erreur", 
            calories: 0,
            ingredients: ["Veuillez régénérer le plan"],
            preparation: "Veuillez régénérer le plan"
          },
          dinner: { 
            title: "Dîner", 
            description: "Plan par défaut suite à une erreur", 
            calories: 0,
            ingredients: ["Veuillez régénérer le plan"],
            preparation: "Veuillez régénérer le plan"
          }
        },
        totalCalories: 0,
        macros: {
          proteins: "0%",
          carbs: "0%",
          fats: "0%"
        }
      })),
      shoppingList: {
        categories: {
          "Fruits et Légumes": ["Veuillez régénérer le plan"],
          "Protéines": ["Veuillez régénérer le plan"],
          "Céréales": ["Veuillez régénérer le plan"]
        }
      }
    };
    
    return new Response(JSON.stringify({ 
      nutritionPlan: defaultPlan,
      error: error.message || "Une erreur inconnue s'est produite"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 // Return 200 with default plan instead of 500
    })
  }
})
