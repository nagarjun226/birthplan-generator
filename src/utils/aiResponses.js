import OpenAI from 'openai';

// OpenAI API Handler for Birth Plan Generation
export class AIResponseHandler {
  constructor(apiKey) {
    // Initialize OpenAI client with provided API key
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Note: In production, use a backend server
    });

    this.model = 'gpt-4'; // Can be changed to gpt-3.5-turbo for cheaper option
    
    this.systemPrompt = `You are a warm, supportive birth plan assistant helping expecting parents prepare for their delivery. You should guide them through creating a comprehensive birth plan by asking relevant questions about their preferences.

CRITICAL RULES:
1. Ask ONLY ONE question at a time - never multiple questions in the same response
2. Be thorough - ask follow-up questions to get complete details
3. Keep responses conversational, warm, and supportive
4. ONLY discuss topics related to pregnancy, labor, delivery, birth plans, and newborn care
5. If the user asks about anything unrelated, politely redirect them back to birth plan topics

Topics to cover comprehensively:
- Personal information (emergency contacts, medical history, allergies)
- Support team and communication preferences
- Labor environment preferences
- Pain management options (be thorough about different methods)
- Labor interventions (monitoring, IV, movement, eating/drinking)
- Labor augmentation (Pitocin, breaking water, internal monitoring)
- Delivery preferences (positions, who catches baby, episiotomy, assisted delivery)
- Cord and placenta (delayed clamping timing, who cuts, banking, placenta plans)
- Immediate postpartum (skin-to-skin duration, first feeding timing, baby exams location)
- Newborn procedures (Vitamin K, eye ointment, Hep B, screening, bath timing, circumcision)
- Emergency plans (C-section preferences, NICU preferences, partner's role)
- Feeding plans (method, support needs, pacifier use, supplementation)
- Special requests, cultural/religious needs, photography rules
- Additional notes that don't fit elsewhere

When the user seems ready to generate their birth plan (they say things like "I'm ready", "let's create it", "generate the plan"), respond with exactly this format:
{"action": "GENERATE_PLAN", "message": "Great! I'll generate your personalized birth plan now."}

For normal conversation, respond with:
{"action": "CONTINUE", "message": "Your conversational response with ONE question"}

If they ask about non-birth topics, respond with:
{"action": "REDIRECT", "message": "I'm specifically designed to help you create a birth plan. Let's focus on your preferences for labor, delivery, and newborn care. [Then ask ONE relevant birth plan question]"}

ALWAYS respond with a valid JSON object containing "action" and "message" fields.`;

    this.birthPlanPrompt = `Based on the following conversation, generate a comprehensive, well-formatted birth plan document.

Generate a complete birth plan in the following JSON format:
{
  "personalInfo": {
    "parentNames": "Names of expecting parents",
    "dueDate": "Expected due date",
    "provider": "Healthcare provider/practice name",
    "hospital": "Planned birth location",
    "emergencyContacts": "Emergency contact names and numbers",
    "medicalHistory": "Relevant medical history, allergies, previous births",
    "bloodType": "Blood type if known"
  },
  "supportTeam": {
    "supportPeople": "Who will be present during labor and delivery",
    "doula": "Doula information if applicable",
    "communicationPreferences": "Who answers questions during labor",
    "visitors": "Visitor policy during labor and after birth",
    "photography": "Photo/video preferences and restrictions",
    "studentObservers": "Preferences about medical students/residents"
  },
  "laborPreferences": {
    "environment": "Room environment (lighting, music, aromatherapy, temperature)",
    "atmosphere": "Specific music playlists, essential oils, etc.",
    "movement": "Freedom to move, walk, change positions",
    "laborPositions": "Preferred positions for laboring",
    "hydrotherapy": "Use of shower, tub, birthing pool",
    "eatingDrinking": "Preferences for eating/drinking during labor",
    "clothing": "What to wear during labor",
    "encouragement": "How you want to be coached/encouraged"
  },
  "painManagement": {
    "preferredMethods": "Natural methods, epidural, IV meds, nitrous oxide, etc.",
    "naturalComfort": "Massage, breathing, hypnobirthing, TENS unit, etc.",
    "avoidMethods": "Pain relief methods to avoid",
    "epiduralTiming": "When to offer epidural if desired",
    "backupPlan": "If first choice isn't available"
  },
  "medicalInterventions": {
    "monitoring": "Continuous vs intermittent fetal monitoring",
    "cervicalChecks": "Frequency of cervical exams",
    "ivFluids": "IV vs heparin lock preferences",
    "induction": "Preferences if induction needed",
    "augmentation": "Pitocin use preferences",
    "amniotomy": "Breaking water preferences",
    "internalMonitoring": "Internal monitoring preferences",
    "catheter": "Catheter preferences"
  },
  "deliveryPreferences": {
    "positions": "Preferred delivery positions",
    "pushing": "Directed vs spontaneous pushing",
    "perinealCare": "Episiotomy, perineal massage preferences",
    "assistedDelivery": "Forceps/vacuum preferences",
    "whoCatchesBaby": "Who catches the baby",
    "whoAnnouncesSex": "Who announces baby's sex",
    "mirror": "Use mirror to see birth"
  },
  "cordAndPlacenta": {
    "delayedCordClamping": "How long to delay (specific time)",
    "cordCutting": "Who cuts the cord",
    "cordBloodBanking": "Banking or donation plans",
    "placenta": "Delivery method and disposal/keeping preferences",
    "lotus": "Lotus birth preferences if applicable"
  },
  "immediatePostpartum": {
    "skinToSkin": "Immediate skin-to-skin duration and preferences",
    "firstFeed": "When to initiate first feeding",
    "babyExams": "Where exams happen (on chest, in room, warmer)",
    "weight": "When to weigh baby",
    "familyTime": "Uninterrupted bonding time preferences"
  },
  "newbornProcedures": {
    "vitaminK": "Shot vs oral drops, timing",
    "eyeOintment": "Yes/no, timing preferences",
    "hepatitisB": "At birth or delay preferences",
    "newbornScreening": "Standard screening acceptance",
    "hearing": "Hearing test preferences",
    "firstBath": "Timing (immediate, 24hr, 48hr delay)",
    "circumcision": "Decision and timing if applicable",
    "vaccinations": "Any specific vaccination preferences"
  },
  "emergencyPreferences": {
    "cesareanPreferences": "Music, drape type, partner present, immediate skin-to-skin",
    "cesareanDetails": "Arms free, delayed cord clamping if possible",
    "nicuPreferences": "Parent accompaniment, bonding before transfer",
    "unexpectedSituations": "General preferences for emergencies",
    "decisionMaker": "Who makes decisions if you cannot"
  },
  "postpartumCare": {
    "rooming": "Baby rooming-in vs nursery preferences",
    "motherCare": "Preferences for your own care",
    "circumcisionTiming": "If applicable, when to perform",
    "jaundiceProtocol": "Preferences if baby has jaundice"
  },
  "feedingPlan": {
    "method": "Breastfeeding, formula, or combination",
    "firstFeed": "Timing and assistance preferences",
    "lactationSupport": "When to see consultant",
    "pacifiers": "Yes/no and timing",
    "bottles": "Introduction preferences",
    "supplements": "Formula supplementation preferences",
    "donorMilk": "Preferences if needed"
  },
  "culturalReligious": {
    "practices": "Specific cultural or religious practices",
    "dietary": "Dietary restrictions for meals",
    "rituals": "Birth rituals or blessings",
    "naming": "Naming ceremony preferences",
    "placenta": "Cultural placenta practices"
  },
  "additionalNotes": "Any other preferences, concerns, or notes that don't fit in above categories"
}

Fill in the plan based on what was discussed. For any topics not explicitly covered, use reasonable defaults that prioritize safety and patient choice, or indicate "To be discussed with healthcare team".

IMPORTANT: Respond ONLY with the JSON object. Do not include any other text, markdown formatting, or backticks.`;
  }

  async processMessage(conversationHistory) {
    try {
      // Build messages array for OpenAI
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      ];

      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      });

      const responseContent = completion.choices[0].message.content;
      
      // Parse the JSON response
      try {
        const parsedResponse = JSON.parse(responseContent);
        return parsedResponse;
      } catch (parseError) {
        // If response isn't valid JSON, wrap it in the expected format
        console.error('Failed to parse AI response as JSON:', parseError);
        return {
          action: 'CONTINUE',
          message: responseContent
        };
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async generateBirthPlan(conversationHistory) {
    try {
      // Build conversation summary for birth plan generation
      const messages = [
        { 
          role: 'system', 
          content: this.birthPlanPrompt 
        },
        {
          role: 'user',
          content: `Here is the conversation history:\n${JSON.stringify(conversationHistory)}`
        }
      ];

      // Call OpenAI API to generate birth plan
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.3, // Lower temperature for more consistent formatting
        max_tokens: 3000 // Increased for comprehensive plan
      });

      const planContent = completion.choices[0].message.content;
      
      // Parse the birth plan JSON
      try {
        const birthPlan = JSON.parse(planContent);
        return birthPlan;
      } catch (parseError) {
        console.error('Failed to parse birth plan JSON:', parseError);
        // Return a default plan structure if parsing fails
        return this.getDefaultBirthPlan();
      }
    } catch (error) {
      console.error('OpenAI API error generating birth plan:', error);
      throw error;
    }
  }

  getDefaultBirthPlan() {
    return {
      personalInfo: {
        parentNames: "To be provided",
        dueDate: "To be provided",
        provider: "To be provided",
        hospital: "To be provided",
        emergencyContacts: "To be provided",
        medicalHistory: "None specified",
        bloodType: "Unknown"
      },
      supportTeam: {
        supportPeople: "Partner and selected support people",
        doula: "Not specified",
        communicationPreferences: "Partner can answer questions",
        visitors: "Limited during labor, welcome after birth",
        photography: "Photos allowed, no video during delivery",
        studentObservers: "To be discussed"
      },
      laborPreferences: {
        environment: "Calm, quiet, dimmed lights",
        atmosphere: "Soft music allowed",
        movement: "Freedom to move and change positions",
        laborPositions: "Various positions as comfortable",
        hydrotherapy: "Would like shower/tub available",
        eatingDrinking: "Clear liquids and light snacks if allowed",
        clothing: "Hospital gown or own clothes",
        encouragement: "Calm, supportive encouragement"
      },
      painManagement: {
        preferredMethods: "Open to options, will decide during labor",
        naturalComfort: "Breathing, massage, position changes",
        avoidMethods: "None specified",
        epiduralTiming: "When requested if desired",
        backupPlan: "Open to alternatives if needed"
      },
      medicalInterventions: {
        monitoring: "Intermittent if possible",
        cervicalChecks: "Minimize when possible",
        ivFluids: "Heparin lock preferred",
        induction: "Only if medically necessary",
        augmentation: "Discuss before starting",
        amniotomy: "Only if necessary",
        internalMonitoring: "Only if necessary",
        catheter: "Only with epidural"
      },
      deliveryPreferences: {
        positions: "Choice of position",
        pushing: "Follow body's urges",
        perinealCare: "Prefer to avoid episiotomy",
        assistedDelivery: "Only if necessary",
        whoCatchesBaby: "Provider catches baby",
        whoAnnouncesSex: "Partner announces",
        mirror: "Optional"
      },
      cordAndPlacenta: {
        delayedCordClamping: "Delay at least 60 seconds",
        cordCutting: "Partner cuts cord",
        cordBloodBanking: "Not planned",
        placenta: "Standard disposal",
        lotus: "No"
      },
      immediatePostpartum: {
        skinToSkin: "Immediate for at least an hour",
        firstFeed: "Within first hour",
        babyExams: "On chest when possible",
        weight: "After bonding time",
        familyTime: "At least one hour uninterrupted"
      },
      newbornProcedures: {
        vitaminK: "Yes, injection",
        eyeOintment: "Yes, after bonding",
        hepatitisB: "Yes, within 24 hours",
        newbornScreening: "Yes, standard screening",
        hearing: "Yes",
        firstBath: "Delay 24 hours",
        circumcision: "To be decided",
        vaccinations: "Follow standard schedule"
      },
      emergencyPreferences: {
        cesareanPreferences: "Partner present, see baby immediately",
        cesareanDetails: "Arms free, immediate skin-to-skin if possible",
        nicuPreferences: "Parent to accompany baby",
        unexpectedSituations: "Keep us informed, prioritize safety",
        decisionMaker: "Partner if unable"
      },
      postpartumCare: {
        rooming: "Baby rooms in",
        motherCare: "Standard postpartum care",
        circumcisionTiming: "If chosen, before discharge",
        jaundiceProtocol: "Follow medical recommendations"
      },
      feedingPlan: {
        method: "Planning to breastfeed",
        firstFeed: "Within first hour with support",
        lactationSupport: "Yes, please",
        pacifiers: "No pacifiers in hospital",
        bottles: "No bottles unless medically necessary",
        supplements: "Only if medically necessary",
        donorMilk: "Prefer over formula if needed"
      },
      culturalReligious: {
        practices: "None specified",
        dietary: "No restrictions",
        rituals: "None specified",
        naming: "No ceremony planned",
        placenta: "No special requests"
      },
      additionalNotes: "We appreciate the support of our healthcare team and trust their judgment for the safety of mother and baby."
    };
  }
}
