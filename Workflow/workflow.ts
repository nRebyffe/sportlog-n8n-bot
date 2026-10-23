const google_Gemini_Chat_Model = languageModel({ type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini', version: 1.2, config: { name: 'Google Gemini Chat Model', parameters: { options: {} }, credentials: { googlePalmApi: newCredential('SportLog (nrebyffe@eugenia.school.com)', 'uoF9WXKdVGpf0uV5') }, position: [448, 160] } });
const google_Gemini_Chat_Model_1 = languageModel({ type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini', version: 1.2, config: { name: 'Google Gemini Chat Model (1)', parameters: { options: {} }, credentials: { googlePalmApi: newCredential('SportLog (nrebyffe@eugenia.school.com)', 'uoF9WXKdVGpf0uV5') }, position: [1648, 272] } });

const error_Trigger = trigger({
  type: 'n8n-nodes-base.errorTrigger',
  version: 1,
  config: { name: 'Error Trigger', position: [0, 416] }
});

const send_Error_Alert = node({
  type: 'n8n-nodes-base.telegram',
  version: 1.2,
  config: { name: 'Send Error Alert', parameters: { chatId: '8125535238', text: expr('⚠️ ALERTE BOT SPORTLOG : Une erreur est survenue !\nDétail : {{ $json.execution.error.message }}'), additionalFields: { appendAttribution: false, parse_mode: 'HTML' } }, credentials: { telegramApi: newCredential('Telegram account', 'NslFTPROM5ZV37ip') }, position: [224, 416], webhookId: '67b826e6-87e6-4e8f-9945-6d02ca59c13a' }
});

const telegram_Trigger = trigger({
  type: 'n8n-nodes-base.telegramTrigger',
  version: 1.5,
  config: { name: 'Telegram Trigger', parameters: { updates: ['message'], additionalFields: {} }, credentials: { telegramApi: newCredential('Telegram account', 'NslFTPROM5ZV37ip') }, position: [0, -96], webhookId: '85a42fef-e213-48d4-9f60-7e70fe7050f6' }
});

const security_Check_User_ID = node({
  type: 'n8n-nodes-base.if',
  version: 2.4,
  config: { name: 'Security Check (User ID)', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 4 }, conditions: [{ id: '3361028b-f9d4-46c6-a8ba-95d9c4db769a', leftValue: expr('{{ $json.message.from.id }}'), rightValue: 8125535238, operator: { type: 'number', operation: 'equals' } }], combinator: 'and' }, options: {} }, position: [224, -96] }
});

const aI_Workout_Parser = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 3.1,
  config: { name: 'AI Workout Parser', parameters: { promptType: 'define', text: expr('{{ $(\'Telegram Trigger\').item.json.message.text }}'), options: { systemMessage: expr('Tu es l\'analyseur strict d\'un carnet de musculation. L\'utilisateur a 3 programmes d\'entraînement : Séance 1, Séance 2, Séance 3.\n\nAujourd\'hui, nous sommes le {{ $now.format(\'YYYY-MM-DD\') }}.\n\nTu dois répondre UNIQUEMENT avec un JSON valide suivant cette structure :\n{\n  "intent": "NEW_EXERCISE" | "CORRECTION" | "QUERY" | "AMBIGUOUS",\n  "query_type": "ADVICE" | "LAST_SESSION" | "PROGRESSION" | "RECORD" | null,\n  "session_type": "1" | "2" | "3" | null,\n  "session_date": "YYYY-MM-DD",\n  "exercises": [\n    {\n      "exercise_name": "string",\n      "sets": [\n        {\n          "reps": number ou null,\n          "load_value": number (0 si PDC),\n          "load_type": "bodyweight" | "weighted" | "machine" | "dumbbell_bar" | "band"\n        }\n      ],\n      "rpe_feeling": "string" ou null\n    }\n  ],\n  "exercise_name": "string" | null,\n  "sets": [ { "reps": number ou null, "load_value": number, "load_type": "..." } ],\n  "rpe_feeling": "string" ou null,\n  "clarification_question": "string" ou null\n}\n\nRÈGLES D\'EXTRACTION :\n0. MESSAGES MULTI-EXERCICES : Pour l\'intent "NEW_EXERCISE", un même message peut contenir PLUSIEURS exercices (souvent une séance complète). Tu DOIS mettre CHAQUE exercice mentionné dans le tableau "exercises", dans l\'ordre du message, avec toutes ses séries (une entrée dans "sets" par série, ex: "8 - 8 - 5" = 3 séries). N\'en oublie aucun et ne demande pas de confirmation pour les autres exercices. La charge indiquée pour un exercice (ex: "Dips 10kg", "(52kg)") s\'applique à toutes ses séries. Les remarques entre parenthèses vont dans "rpe_feeling" de l\'exercice concerné (texte brut, sans balises HTML). Dans ce cas, laisse "exercise_name" et "sets" au niveau racine à null / []. Pour l\'intent "CORRECTION", utilise uniquement "exercise_name" et "sets" au niveau racine ("exercises" = []).\n1. "session_type" : Identifie si l\'utilisateur mentionne la séance 1, 2 ou 3 (ex: "S1", "séance 1", "push" -> 1). S\'il ne précise pas, mets "1" par défaut.\n2. "session_date" : Si le message contient une date explicite (ex: "23/10/2026", format JJ/MM/AAAA), utilise-la au format YYYY-MM-DD. Si l\'utilisateur dit "hier", calcule la date d\'hier, sinon mets la date du jour {{ $now.format(\'YYYY-MM-DD\') }}.\n3. "rpe_feeling" : Note les sensations si mentionnées (ex: "facile", "échec à la dernière", "RPE 8", "dur").\n4. "QUERY" avec "ADVICE" : Si l\'utilisateur demande des conseils ou des objectifs (ex: "Conseil séance 1", "Quoi faire pour la séance 2 ?", "Objectif séance 3").\n\nPour mettre du texte en gras, utilise les balises HTML : <b>mon texte en gras</b>. N\'utilise jamais de syntaxe Markdown (** ou *).\n\nNORMALISATION DES NOMS D\'EXERCICES ET CORRECTION DES FAUTES :\nTu dois impérativement corriger les fautes de frappe et traduire les abréviations courantes en leur nom standard complet :\n- Fautes de frappe phonétiques : ex: "travion", "tractio", "trac" -> "Tractions"\n- Abréviations standard :\n  * "dc", "bench" -> "Développé couché barre"\n  * "dch", "dc halteres" -> "Développé couché haltères"\n  * "di", "dih" -> "Développé incliné"\n  * "dm", "ohp", "militaire" -> "Développé militaire"\n  * "dips" -> "Dips"\n  * "el" -> "Élévations latérales"\n  * "rowing barre", "rowing" -> "Rowing"\n  * "curl", "curl barre", "curl halteres" -> "Curl biceps"\n  * "barre au front", "triceps poulie" -> selon le contexte.\n\nRègle d\'or : Retourne TOUJOURS le nom standard officiel dans le champ "exercise_name". N\'invente jamais un nom d\'exercice farfelu.') } }, position: [448, -96], subnodes: { model: google_Gemini_Chat_Model } }
});

const parse_Validate_JSON = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Parse Validate JSON', parameters: { jsCode: 'const outputItems = [];\nfor (const item of $input.all()) {\n  let rawText = item.json.output || item.json.text || \'\';\n  rawText = rawText.replace(/```json/gi, \'\').replace(/```/g, \'\').trim();\n  try {\n    const parsedData = JSON.parse(rawText);\n    let exercises = Array.isArray(parsedData.exercises) ? parsedData.exercises.filter(e => e && Array.isArray(e.sets) && e.sets.length > 0) : [];\n    if (exercises.length === 0 && Array.isArray(parsedData.sets) && parsedData.sets.length > 0) {\n      exercises = [{ exercise_name: parsedData.exercise_name, sets: parsedData.sets, rpe_feeling: parsedData.rpe_feeling }];\n    }\n    if (exercises.length > 0 && parsedData.intent === \'NEW_EXERCISE\') {\n      for (const ex of exercises) {\n        for (const set of ex.sets) {\n          outputItems.push({\n            json: {\n              ...item.json,\n              ...parsedData,\n              exercise_name: ex.exercise_name,\n              rpe_feeling: ex.rpe_feeling || parsedData.rpe_feeling || null,\n              reps: set.reps,\n              load: set.load_value,\n              load_type: set.load_type,\n              rest_time: parsedData.rest_time || null,\n              exercises: undefined,\n              sets: undefined\n            }\n          });\n        }\n      }\n    } else {\n      outputItems.push({\n        json: {\n          ...item.json,\n          ...parsedData\n        }\n      });\n    }\n  } catch (error) {\n    outputItems.push({\n      json: {\n        ...item.json,\n        intent: \'AMBIGUOUS\',\n        clarification_question: "Je n\'ai pas bien compris la saisie. Peux-tu reformuler ?"\n      }\n    });\n  }\n}\nreturn outputItems;' }, position: [768, -80], notes: 'Parse JSON from AI output and expand multiple sets into individual items.' }
});

const intent_Router = node({
  type: 'n8n-nodes-base.switch',
  version: 3.5,
  config: { name: 'Intent Router', parameters: { rules: { values: [{ conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 4 }, conditions: [{ leftValue: expr('{{ $json.intent }}'), rightValue: 'NEW_EXERCISE', operator: { type: 'string', operation: 'equals' }, id: 'dd0972d1-b295-4d15-af88-4d55fa3a4ab2' }], combinator: 'and' } }, { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 4 }, conditions: [{ id: 'e483fe39-97bc-4094-89e4-ee101d8e6351', leftValue: expr('{{ $json.intent }}'), rightValue: 'CORRECTION', operator: { type: 'string', operation: 'equals', name: 'filter.operator.equals' } }], combinator: 'and' } }, { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 4 }, conditions: [{ id: '232531cb-29b3-487b-9a29-ec4a75203c23', leftValue: expr('{{ $json.intent }}'), rightValue: 'QUERY', operator: { type: 'string', operation: 'equals', name: 'filter.operator.equals' } }], combinator: 'and' } }, { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 4 }, conditions: [{ id: 'f052c2bd-ab82-4b49-a7a5-2cde26718edc', leftValue: expr('{{ $json.intent }}'), rightValue: 'AMBIGUOUS', operator: { type: 'string', operation: 'equals', name: 'filter.operator.equals' } }], combinator: 'and' } }] }, options: { fallbackOutput: 'extra' } }, position: [1008, -144] }
});

const save_Exercise_to_Table = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: { name: 'Save Exercise to Table', parameters: { dataTableId: { __rl: true, value: 'pSeG713j55pssDgc', mode: 'list', cachedResultName: 'workout_logs', cachedResultUrl: '/projects/m8AUVRIh2CTOZ4J2/datatables/pSeG713j55pssDgc' }, columns: { mappingMode: 'defineBelow', value: { exercise: expr('{{ $json.exercise_name }}'), reps: expr('{{ $json.reps }}'), load: expr('{{ $json.load }}'), load_type: expr('{{ $json.load_type }}'), session_date: expr('{{ $json.session_date }}'), session_type: expr('{{ $json.session_type }}'), rpe_feeling: expr('{{ $json.rpe_feeling }}') }, matchingColumns: [], schema: [{ id: 'exercise', displayName: 'exercise', required: false, defaultMatch: false, display: true, type: 'string', readOnly: false, removed: false }, { id: 'reps', displayName: 'reps', required: false, defaultMatch: false, display: true, type: 'number', readOnly: false, removed: false }, { id: 'load', displayName: 'load', required: false, defaultMatch: false, display: true, type: 'number', readOnly: false, removed: false }, { id: 'load_type', displayName: 'load_type', required: false, defaultMatch: false, display: true, type: 'string', readOnly: false, removed: false }, { id: 'session_date', displayName: 'session_date', required: false, defaultMatch: false, display: true, type: 'dateTime', readOnly: false, removed: false }, { id: 'session_type', displayName: 'session_type', required: false, defaultMatch: false, display: true, type: 'string', readOnly: false, removed: false }, { id: 'rpe_feeling', displayName: 'rpe_feeling', required: false, defaultMatch: false, display: true, type: 'string', readOnly: false, removed: false }], attemptToConvertTypes: false, convertFieldsToString: false }, options: {} }, position: [1600, -752] }
});

const format_Exercise_Summary = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Format Exercise Summary', parameters: { assignments: { assignments: [{ id: 'a534f5bf-ed7d-448b-b155-fcbce7a86cfe', name: 'replyText', value: expr('✅ <b>Séance enregistrée</b> ({{ $input.all().length }} séries)\n{{ (() => { const groups = {}; const order = []; $input.all().forEach(i => { const r = i.json; if (!groups[r.exercise]) { groups[r.exercise] = []; order.push(r.exercise); } groups[r.exercise].push(r); }); return order.map(ex => \'• <b>\' + ex + \'</b> : \' + groups[ex].map(r => r.reps + (r.load ? \' @ \' + r.load + \'kg\' : \'\')).join(\' - \')).join(\'\\n\'); })() }}'), type: 'string' }] }, options: {} }, position: [1856, -752], executeOnce: true }
});

const send_Telegram_Reply = node({
  type: 'n8n-nodes-base.telegram',
  version: 1.2,
  config: { name: 'Send Telegram Reply', parameters: { chatId: expr('{{ $(\'Telegram Trigger\').item.json.message.chat.id }}'), text: expr('{{ $json.replyText }}'), replyMarkup: 'forceReply', forceReply: {}, additionalFields: { appendAttribution: false, parse_mode: 'HTML' } }, credentials: { telegramApi: newCredential('Telegram account', 'NslFTPROM5ZV37ip') }, position: [2688, -176], webhookId: 'f082b637-12c5-4cbe-8aca-a9b7ed73fb95' }
});

const get_Last_Log = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: { name: 'Get Last Log', parameters: { operation: 'get', dataTableId: { __rl: true, value: 'pSeG713j55pssDgc', mode: 'list', cachedResultName: 'workout_logs', cachedResultUrl: '/projects/m8AUVRIh2CTOZ4J2/datatables/pSeG713j55pssDgc' }, limit: 1, orderBy: true }, position: [1536, -448] }
});

const update_Last_Log = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: { name: 'Update Last Log', parameters: { operation: 'update', dataTableId: { __rl: true, value: 'pSeG713j55pssDgc', mode: 'list', cachedResultName: 'workout_logs', cachedResultUrl: '/projects/m8AUVRIh2CTOZ4J2/datatables/pSeG713j55pssDgc' }, filters: { conditions: [{ keyValue: expr('{{ $json.id }}') }] }, columns: { mappingMode: 'defineBelow', value: { reps: expr('{{ $(\'Parse Validate JSON\').item.json.sets[0].reps || $json.reps }}\n'), load: expr('{{ $(\'Parse Validate JSON\').item.json.sets[0].load_value || $json.load }}') }, matchingColumns: [], schema: [{ id: 'exercise', displayName: 'exercise', required: false, defaultMatch: false, display: true, type: 'string', readOnly: false, removed: false }, { id: 'reps', displayName: 'reps', required: false, defaultMatch: false, display: true, type: 'number', readOnly: false, removed: false }, { id: 'load', displayName: 'load', required: false, defaultMatch: false, display: true, type: 'number', readOnly: false, removed: false }, { id: 'load_type', displayName: 'load_type', required: false, defaultMatch: false, display: true, type: 'string', readOnly: false, removed: false }, { id: 'session_date', displayName: 'session_date', required: false, defaultMatch: false, display: true, type: 'dateTime', readOnly: false, removed: false }, { id: 'session_type', displayName: 'session_type', required: false, defaultMatch: false, display: true, type: 'string', readOnly: false, removed: false }, { id: 'rpe_feeling', displayName: 'rpe_feeling', required: false, defaultMatch: false, display: true, type: 'string', readOnly: false, removed: false }], attemptToConvertTypes: false, convertFieldsToString: false }, options: {} }, position: [1760, -448] }
});

const format_Correction_Summary = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Format Correction Summary', parameters: { assignments: { assignments: [{ id: 'c46413a7-6452-441c-846e-7cc34f45a604', name: 'replyText', value: expr('✏️ <b>Correction appliquée !</b>\nExercice : {{ $json.exercise }}\nNouvelle valeur : {{ $json.reps }} reps @ {{ $json.load }}kg'), type: 'string' }] }, options: {} }, position: [1984, -448] }
});

const fetch_Session_History = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: { name: 'Fetch Session History', parameters: { operation: 'get', dataTableId: { __rl: true, value: 'pSeG713j55pssDgc', mode: 'list', cachedResultName: 'workout_logs', cachedResultUrl: '/projects/m8AUVRIh2CTOZ4J2/datatables/pSeG713j55pssDgc' }, filters: { conditions: [{ keyName: 'session_type', keyValue: expr('{{ $json.session_type }}') }] }, limit: 20 }, position: [1200, 112] }
});

const aggregate_History = node({
  type: 'n8n-nodes-base.aggregate',
  version: 1,
  config: { name: 'Aggregate History', parameters: { aggregate: 'aggregateAllItemData', destinationFieldName: 'history', options: {} }, position: [1424, 112] }
});

const aI_Strength_Coach = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 3.1,
  config: { name: 'AI Strength Coach', parameters: { promptType: 'define', text: expr('Voici mon historique pour la séance : {{ JSON.stringify($json.history) }}'), options: { systemMessage: 'Tu es un préparateur physique expert en musculation et surcharge progressive.\nL\'utilisateur te fournit l\'historique de sa séance. Ton rôle est d\'analyser ses performances passées et de lui prescrire la stratégie exacte pour sa prochaine séance.\n\nPour chaque exercice présent dans l\'historique :\n1. Résume la dernière performance (Date, Séries, Répétitions, Charge, Ressenti).\n2. Applique la loi de la double progression :\n   - Si les séries étaient validées avec un ressenti facile/moyen : prescris +1 répétition ou +1 à 2kg d\'augmentation.\n   - Si l\'utilisateur était à l\'échec ou en difficulté : conseille de maintenir la charge pour valider toutes les répétitions proprement.\n3. Donne un mot d\'ordre clair et motivant pour la séance.\n\nFormat de réponse court, direct et impactant, prêt à être lu en arrivant à la salle de sport.\n\nPour mettre du texte en gras, utilise les balises HTML : <b>mon texte en gras</b>. N\'utilise jamais de syntaxe Markdown (** ou *).' } }, position: [1648, 112], subnodes: { model: google_Gemini_Chat_Model_1 } }
});

const query_Router = node({
  type: 'n8n-nodes-base.switch',
  version: 3.5,
  config: { name: 'Query Router', parameters: { rules: { values: [{ conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 4 }, conditions: [{ leftValue: expr('{{ $json.query_type }}'), rightValue: 'LAST_SESSION', operator: { type: 'string', operation: 'equals' }, id: 'cfdd8b3b-23ed-435d-bc9b-0c770afa76a6' }], combinator: 'and' } }, { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 4 }, conditions: [{ id: '44c07666-fd19-40ad-8b18-678f77bd3a2d', leftValue: expr('{{ $json.query_type }}'), rightValue: 'PROGRESSION', operator: { type: 'string', operation: 'equals', name: 'filter.operator.equals' } }], combinator: 'and' } }, { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 4 }, conditions: [{ id: 'b821bb60-b09e-4a88-a4f3-24372d4cc445', leftValue: expr('{{ $json.query_type }}'), rightValue: 'RECORD', operator: { type: 'string', operation: 'equals', name: 'filter.operator.equals' } }], combinator: 'and' } }] }, options: {} }, position: [2096, 224] }
});

const format_Query_Reply = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Format Query Reply', parameters: { assignments: { assignments: [{ id: 'c18f007a-8a9d-4656-b02b-90ccedcecc32', name: 'replyText', value: expr('📊 Demande reçue : {{ $json.query_type }} pour {{ $json.exercise_name || \'la séance\' }} (en attente de liaison base de données).'), type: 'string' }] }, options: {} }, position: [2352, 240] }
});

const format_Advice_Reply = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Format Advice Reply', parameters: { assignments: { assignments: [{ id: '0b6f8a52-3c1e-4d7a-9e2f-5a1b7c9d4e60', name: 'replyText', value: expr('{{ $json.output }}'), type: 'string' }] }, options: {} }, position: [2224, 0] }
});

const format_Clarification_Question = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Format Clarification Question', parameters: { assignments: { assignments: [{ id: 'f41651b3-18eb-4e66-8ffb-73c1d0d00ca6', name: 'replyText', value: expr('❓ {{ $json.clarification_question || "Peux-tu préciser le nombre de répétitions et la charge ?" }}'), type: 'string' }] }, options: {} }, position: [1760, -256] }
});

const wf = workflow('00z7ZkDqr9FuLYFU', 'SportLog Workout Bot', { executionOrder: 'v1', binaryMode: 'separate', availableInMCP: true });

export default wf
  .add(error_Trigger)
  .to(send_Error_Alert)
  .add(telegram_Trigger)
  .to(security_Check_User_ID.onTrue(aI_Workout_Parser
    .to(parse_Validate_JSON)
    .to(intent_Router.onCase(0, save_Exercise_to_Table
      .to(format_Exercise_Summary)
      .to(send_Telegram_Reply)).onCase(1, get_Last_Log
      .to(update_Last_Log)
      .to(format_Correction_Summary)
      .to(send_Telegram_Reply)).onCase(2, fetch_Session_History
      .to(aggregate_History)
      .to(aI_Strength_Coach
      .to([
        query_Router.onCase(0, format_Query_Reply
          .to(send_Telegram_Reply)).onCase(1, format_Query_Reply).onCase(2, format_Query_Reply),
        format_Advice_Reply
        .to(send_Telegram_Reply)]))).onCase(3, format_Clarification_Question
      .to(send_Telegram_Reply)).onCase(4, send_Telegram_Reply))))