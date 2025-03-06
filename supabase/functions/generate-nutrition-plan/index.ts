
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
        },
        ... (7 jours)
      ]
    }
    Assure-toi que le JSON est valide et suit exactement cette structure.`;

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
      const nutritionPlan = JSON.parse(content)
      
      return new Response(JSON.stringify({ nutritionPlan }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (parseError) {
      console.error('Error parsing JSON from OpenAI response:', parseError)
      // If JSON parsing fails, return the raw content
      return new Response(JSON.stringify({ 
        error: 'Failed to parse nutrition plan', 
        content: data.choices[0].message.content 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }
  } catch (error) {
    console.error('Error in generate-nutrition-plan function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
