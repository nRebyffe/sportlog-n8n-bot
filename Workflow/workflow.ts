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
  config: { name: 'Send Error Alert', parameters: { chatId: '8125535238', text: expr('⚠️ SPORTLOG BOT ALERT: An error occurred!\nDetails: {{ $json.execution.error.message }}'), additionalFields: { appendAttribution: false, parse_mode: 'HTML' } }, credentials: { telegramApi: newCredential('Telegram account', 'NslFTPROM5ZV37ip') }, position: [224, 416], webhookId: '6c6ae363-3957-4317-9286-091352d65227' }
});

const telegram_Trigger = trigger({
  type: 'n8n-nodes-base.telegramTrigger',
  version: 1.5,
  config: { name: 'Telegram Trigger', parameters: { updates: ['message'], additionalFields: {} }, credentials: { telegramApi: newCredential('Telegram account', 'NslFTPROM5ZV37ip') }, position: [0, -96], webhookId: '10882f6c-b7c4-4bac-a7e5-3619ef8b2fbb' }
});

const security_Check_User_ID = node({
  type: 'n8n-nodes-base.if',
  version: 2.4,
  config: { name: 'Security Check (User ID)', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 4 }, conditions: [{ id: '3361028b-f9d4-46c6-a8ba-95d9c4db769a', leftValue: expr('{{ $json.message.from.id }}'), rightValue: 8125535238, operator: { type: 'number', operation: 'equals' } }], combinator: 'and' }, options: {} }, position: [224, -96] }
});

const aI_Workout_Parser = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 3.1,
  config: { name: 'AI Workout Parser', parameters: { promptType: 'define', text: expr('{{ $json.message.text }}'), options: { systemMessage: expr('<role>\nYou are a highly accurate data analysis and extraction engine for a strength-training tracking app (SportLog AI). Your job is to analyze the messages the user sends on Telegram (usually in French), fix typos and gym slang, classify the user\'s intent, and extract the training metrics into strict JSON, without ever inventing missing information.\n</role>\n\n<instructions>\n<goal>\nTurn every raw text message from the user into a standardized JSON object that feeds an n8n database and routes the right action (log, correct, look up, or ask for clarification).\n</goal>\n\n<context>\n1. PROGRAMS: The user has 3 workout templates: "Session 1", "Session 2", "Session 3" (often written S1, S2, S3, or "séance 1/2/3"). If no session is mentioned when logging, use "1" by default.\n2. DATES: Use the current date provided in the input. If the user says "yesterday" (or "hier"), compute the previous day\'s date in YYYY-MM-DD format.\n3. NORMALIZATION & TYPO CORRECTION:\n   - Always fix phonetic typos (e.g. "travion", "tractio", "pullup" -> "tractions").\n   - The user\'s data is stored in FRENCH: always write exercise_name in French, in lowercase, with correct accents, even if the user writes in English.\n   - Expand common abbreviations and English names into full standard French names:\n     * "dc", "bench", "bench press" -> "développé couché barre"\n     * "dch", "dc halteres" -> "développé couché haltères"\n     * "di", "dih", "incline bench" -> "développé incliné"\n     * "dm", "ohp", "militaire" -> "développé militaire"\n     * "dips" -> "dips"\n     * "tractions", "pull-ups" -> "tractions"\n     * "el", "lateral raises" -> "élévations latérales"\n     * "rowing barre", "rowing", "row" -> "rowing"\n     * "écarté poulie", "ecarte poulie", "cable fly" -> "écarté poulie"\n     * "curl", "curl halteres", "curl barre" -> "curl biceps"\n4. LOAD TYPES ("load_type"):\n   - "bodyweight": Bodyweight only (load_value = 0).\n   - "weighted": Weighted bodyweight (load_value = added weight).\n   - "dumbbell_bar": Dumbbell or barbell weight (total load or per dumbbell, depending on usage).\n   - "machine": Weight on a guided machine or cable pulley.\n   - "band": Resistance band.\n5. MULTIPLE EXERCISES: If the message contains several exercises, return ONE SINGLE JSON object with intent "NEW_EXERCISE" and an "exercises" array: [{ "exercise_name", "sets", "rpe_feeling" }, ...] (one element per exercise). Never return a JSON array at the root. If the message contains an explicit date (DD/MM/YYYY), use it as session_date.\n6. ANTI-HALLUCINATION RULE: Never invent a rep count, a load, or a session. If critical information is missing when logging (e.g. no reps), use intent "AMBIGUOUS" and ask a short question.\n7. LANGUAGE: These instructions are in English, but the user\'s data is in French. exercise_name and rpe_feeling must be in French (keep the user\'s own wording for rpe_feeling, just fix typos; e.g. "facile", "dur", "RPE 8"). Write clarification_question in English.\n</context>\n\n<examples>\n<example_1>\n<!-- Example 1: Exercise log with abbreviation, dumbbell load and RPE feeling -->\n<inputs>\n<current_date>2026-10-22</current_date>\n<user_message>S1 : dc halteres 4x10 @ 26kg rpe 8</user_message>\n</inputs>\n<output>\n{\n  "intent": "NEW_EXERCISE",\n  "query_type": null,\n  "session_type": "1",\n  "session_date": "2026-10-22",\n  "exercise_name": "développé couché haltères",\n  "sets": [\n    { "reps": 10, "load_value": 26, "load_type": "dumbbell_bar" },\n    { "reps": 10, "load_value": 26, "load_type": "dumbbell_bar" },\n    { "reps": 10, "load_value": 26, "load_type": "dumbbell_bar" },\n    { "reps": 10, "load_value": 26, "load_type": "dumbbell_bar" }\n  ],\n  "rpe_feeling": "RPE 8",\n  "clarification_question": null\n}\n</output>\n</example_1>\n\n<example_2>\n<!-- Example 2: Typo ("travion"), weighted bodyweight and relative date ("yesterday") -->\n<inputs>\n<current_date>2026-10-22</current_date>\n<user_message>hier en séance 2 : travion 3x8 avec 10kg de lest, c\'était facile</user_message>\n</inputs>\n<output>\n{\n  "intent": "NEW_EXERCISE",\n  "query_type": null,\n  "session_type": "2",\n  "session_date": "2026-10-21",\n  "exercise_name": "tractions",\n  "sets": [\n    { "reps": 8, "load_value": 10, "load_type": "weighted" },\n    { "reps": 8, "load_value": 10, "load_type": "weighted" },\n    { "reps": 8, "load_value": 10, "load_type": "weighted" }\n  ],\n  "rpe_feeling": "facile",\n  "clarification_question": null\n}\n</output>\n</example_2>\n\n<example_3>\n<!-- Example 3: Advice request / history lookup -->\n<inputs>\n<current_date>2026-10-22</current_date>\n<user_message>Conseil prochaine séance 1</user_message>\n</inputs>\n<output>\n{\n  "intent": "QUERY",\n  "query_type": "ADVICE",\n  "session_type": "1",\n  "session_date": "2026-10-22",\n  "exercise_name": null,\n  "sets": [],\n  "rpe_feeling": null,\n  "clarification_question": null\n}\n</output>\n</example_3>\n\n<example_4>\n<!-- Example 4: Live correction of a previous value -->\n<inputs>\n<current_date>2026-10-22</current_date>\n<user_message>en fait c\'était 12 reps pas 10 sur la dernière série</user_message>\n</inputs>\n<output>\n{\n  "intent": "CORRECTION",\n  "query_type": null,\n  "session_type": null,\n  "session_date": "2026-10-22",\n  "exercise_name": null,\n  "sets": [\n    { "reps": 12, "load_value": null, "load_type": null }\n  ],\n  "rpe_feeling": null,\n  "clarification_question": null\n}\n</output>\n</example_4>\n\n<example_5>\n<!-- Example 5: Incomplete information / ambiguity with no reps -->\n<inputs>\n<current_date>2026-10-22</current_date>\n<user_message>j\'ai fait des dips</user_message>\n</inputs>\n<output>\n{\n  "intent": "AMBIGUOUS",\n  "query_type": null,\n  "session_type": "1",\n  "session_date": "2026-10-22",\n  "exercise_name": "dips",\n  "sets": [],\n  "rpe_feeling": null,\n  "clarification_question": "How many sets and reps did you do on dips?"\n}\n</output>\n</example_5>\n</examples>\n\n<output_format>\nReturn ONLY a valid JSON object, with no introductory sentence and no text before or after. Follow this structure:\n{\n  "intent": "NEW_EXERCISE" | "CORRECTION" | "QUERY" | "AMBIGUOUS",\n  "query_type": "ADVICE" | "LAST_SESSION" | "PROGRESSION" | "RECORD" | null,\n  "session_type": "1" | "2" | "3" | null,\n  "session_date": "YYYY-MM-DD",\n  "exercise_name": "full normalized French name in lowercase" | null,\n  "sets": [\n    {\n      "reps": number or null,\n      "load_value": number or null,\n      "load_type": "bodyweight" | "weighted" | "machine" | "dumbbell_bar" | "band" | null\n    }\n  ],\n  "rpe_feeling": "string" or null,\n  "clarification_question": "string" or null\n}\n</output_format>\n</instructions>\n\n<inputs>\n<current_date>\n{{ $now.format(\'YYYY-MM-DD\') }}\n</current_date>\n<user_message>\n{{ $(\'Telegram Trigger\').item.json.message.text }}\n</user_message>\n</inputs>') } }, position: [448, -96], retryOnFail: true, maxTries: 4, waitBetweenTries: 5000, subnodes: { model: google_Gemini_Chat_Model } }
});

const parse_Validate_JSON = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Parse Validate JSON', parameters: { jsCode: 'const outputItems = [];\nfor (const item of $input.all()) {\n  let rawText = item.json.output || item.json.text || \'\';\n  rawText = rawText.replace(/```json/gi, \'\').replace(/```/g, \'\').trim();\n  try {\n    let parsedData = JSON.parse(rawText);\n    if (Array.isArray(parsedData)) {\n      const list = parsedData.filter(e => e && typeof e === \'object\');\n      const first = list[0] || {};\n      parsedData = { ...first, exercises: list.filter(e => !e.intent || e.intent === \'NEW_EXERCISE\') };\n      if (!parsedData.intent) parsedData.intent = list.some(e => Array.isArray(e.sets) && e.sets.length > 0) ? \'NEW_EXERCISE\' : \'AMBIGUOUS\';\n    }\n    let exercises = Array.isArray(parsedData.exercises) ? parsedData.exercises.filter(e => e && Array.isArray(e.sets) && e.sets.length > 0) : [];\n    if (exercises.length === 0 && Array.isArray(parsedData.sets) && parsedData.sets.length > 0) {\n      exercises = [{ exercise_name: parsedData.exercise_name, sets: parsedData.sets, rpe_feeling: parsedData.rpe_feeling }];\n    }\n    if (exercises.length > 0 && parsedData.intent === \'NEW_EXERCISE\') {\n      for (const ex of exercises) {\n        for (const set of ex.sets) {\n          outputItems.push({\n            json: {\n              ...item.json,\n              ...parsedData,\n              exercise_name: ex.exercise_name,\n              rpe_feeling: ex.rpe_feeling || parsedData.rpe_feeling || null,\n              reps: set.reps,\n              load: set.load_value,\n              load_type: set.load_type,\n              rest_time: ex.rest_time || parsedData.rest_time || null,\n              exercises: undefined,\n              sets: undefined\n            }\n          });\n        }\n      }\n    } else {\n      outputItems.push({\n        json: {\n          ...item.json,\n          ...parsedData\n        }\n      });\n    }\n  } catch (error) {\n    outputItems.push({\n      json: {\n        ...item.json,\n        intent: \'AMBIGUOUS\',\n        clarification_question: "I didn\'t quite understand your entry. Could you rephrase it?"\n      }\n    });\n  }\n}\nreturn outputItems;' }, position: [768, -80], notes: 'Parse JSON from AI output and expand multiple sets into individual items.' }
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

const aggregate_Logs = node({
  type: 'n8n-nodes-base.aggregate',
  version: 1,
  config: { name: 'Aggregate Logs', parameters: { aggregate: 'aggregateAllItemData', destinationFieldName: 'logs', options: {} }, position: [1740, -752] }
});

const format_Exercise_Summary = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Format Exercise Summary', parameters: { assignments: { assignments: [{ id: 'a534f5bf-ed7d-448b-b155-fcbce7a86cfe', name: 'replyText', value: expr('✅ <b>Session logged</b> ({{ $json.logs.length }} sets)\n{{ (() => { const groups = {}; const order = []; ($json.logs || []).forEach(r => { const name = r.exercise || r.exercise_name; if (!groups[name]) { groups[name] = []; order.push(name); } groups[name].push(r); }); return order.map(ex => \'• <b>\' + ex + \'</b> : \' + groups[ex].map(r => r.reps + (r.load ? \' @ \' + r.load + \'kg\' : \'\')).join(\' - \')).join(\'\\n\'); })() }}'), type: 'string' }] }, options: {} }, position: [1856, -752] }
});

const send_Telegram_Reply = node({
  type: 'n8n-nodes-base.telegram',
  version: 1.2,
  config: { name: 'Send Telegram Reply', parameters: { chatId: expr('{{ $(\'Telegram Trigger\').item.json.message.chat.id }}'), text: expr('{{ $json.replyText }}'), replyMarkup: 'forceReply', forceReply: {}, additionalFields: { appendAttribution: false, parse_mode: 'HTML' } }, credentials: { telegramApi: newCredential('Telegram account', 'NslFTPROM5ZV37ip') }, position: [2688, -176], webhookId: '5784b630-b75f-46f7-9a49-71206250bcb0' }
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
  config: { name: 'Format Correction Summary', parameters: { assignments: { assignments: [{ id: 'c46413a7-6452-441c-846e-7cc34f45a604', name: 'replyText', value: expr('✏️ <b>Correction applied!</b>\nExercise: {{ $json.exercise }}\nNew value: {{ $json.reps }} reps @ {{ $json.load }}kg'), type: 'string' }] }, options: {} }, position: [1984, -448] }
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
  config: { name: 'AI Strength Coach', parameters: { promptType: 'define', text: expr('Here is my history for this session: {{ JSON.stringify($json.history) }}'), options: { systemMessage: expr('<role>\nYou are an elite strength and conditioning coach and an expert in weight training and progressive overload. Your job is to analyze an athlete\'s raw session history and deliver a pre-workout briefing that is very clear, direct and motivating, readable in 20 seconds on a smartphone at the gym.\n</role>\n\n<instructions>\n<goal>\nAnalyze the past sets, loads and feelings for the requested session in order to prescribe precise rep and weight targets for the next session, applying the evidence-based principles of double progression. The athlete\'s history is stored in French (exercise names and feelings): translate them and always answer in English.\n</goal>\n\n<context>\n1. DOUBLE PROGRESSION PRINCIPLE:\n   - Step A (Earn the volume): If last time the athlete completed their sets with an "easy", "moderate" or "RPE <= 8" feeling, first prescribe +1 rep per set at the same load, or add +1 to +2.5 kg if they already hit the top of their rep range.\n   - Step B (Consolidate the load): If the feeling was "hard", "failure", or "RPE >= 9", do not increase the load. Prescribe keeping the same weight to lock in perfectly executed reps.\n2. STRICT SYNTAX & FORMATTING:\n   - Use ONLY the HTML tags <b>text</b> for bold.\n   - NEVER use Markdown syntax (** or *): it breaks the Telegram display.\n   - Short, airy answers, paced with bullet points and relevant emojis.\n</context>\n\n<examples>\n<example_1>\n<!-- Example 1: Session with 2 exercises — one completed easily and one hard -->\n<inputs>\n<session_type>1</session_type>\n<session_history>\n[\n  { "exercise": "barbell bench press", "reps": 10, "load": 80, "load_type": "dumbbell_bar", "session_date": "2026-10-18", "rpe_feeling": "easy" },\n  { "exercise": "barbell bench press", "reps": 10, "load": 80, "load_type": "dumbbell_bar", "session_date": "2026-10-18", "rpe_feeling": "easy" },\n  { "exercise": "pull-ups", "reps": 8, "load": 0, "load_type": "bodyweight", "session_date": "2026-10-18", "rpe_feeling": "failure on last rep" }\n]\n</session_history>\n</inputs>\n<output>\n🎯 <b>SESSION 1 BRIEFING</b>\n\n📊 <b>1. Barbell bench press</b>\n• Last time: 2x10 @ 80kg (Feeling: Easy)\n• <b>Today\'s target:</b> Move up to <b>82.5kg</b> on both sets aiming for 8 to 10 reps, or do <b>11 reps</b> at 80kg.\n\n📊 <b>2. Pull-ups</b>\n• Last time: 1x8 bodyweight (Feeling: Failure)\n• <b>Today\'s target:</b> Stay at <b>bodyweight</b>. Focus on clean form: hit 8 full reps without chin cheating.\n\n🔥 <b>Motto:</b> Your chest has room to grow, go grab that 82.5kg right from the start!\n</output>\n</example_1>\n\n<example_2>\n<!-- Example 2: Heavy dumbbell exercise with a plateau -->\n<inputs>\n<session_type>2</session_type>\n<session_history>\n[\n  { "exercise": "dumbbell bench press", "reps": 10, "load": 28, "load_type": "dumbbell_bar", "session_date": "2026-10-19", "rpe_feeling": "hard RPE 9.5" },\n  { "exercise": "lateral raises", "reps": 15, "load": 10, "load_type": "dumbbell_bar", "session_date": "2026-10-19", "rpe_feeling": "very easy" }\n]\n</session_history>\n</inputs>\n<output>\n🎯 <b>SESSION 2 BRIEFING</b>\n\n📊 <b>1. Dumbbell bench press</b>\n• Last time: 10 reps @ 28kg per arm (RPE 9.5)\n• <b>Today\'s target:</b> Don\'t touch the 30kg dumbbells! Stay at <b>28kg</b> and aim for 10 solid reps with a controlled tempo on the way down.\n\n📊 <b>2. Lateral raises</b>\n• Last time: 15 reps @ 10kg (Very easy)\n• <b>Today\'s target:</b> The 15 reps are earned. Grab the <b>12kg dumbbells</b> for strict sets of 10-12 reps.\n\n🔥 <b>Motto:</b> Discipline on the presses, explosiveness on the shoulders!\n</output>\n</example_2>\n\n<example_3>\n<!-- Example 3: Empty history (first time the athlete runs this session) -->\n<inputs>\n<session_type>3</session_type>\n<session_history>[]</session_history>\n</inputs>\n<output>\n🎯 <b>SESSION 3 BRIEFING</b>\n\nℹ️ No history recorded for this session yet.\n\n<b>Coach\'s tip:</b>\n• Pick your base exercises (e.g. lat pulldown, dips, biceps).\n• Do 3 to 4 sets per exercise keeping 2 reps in reserve (RPE 8) to establish your reference loads.\n\n🔥 <b>Motto:</b> Set your first scores today, we\'ll build the overload on top of them!\n</output>\n</example_3>\n</examples>\n\n<output_format>\nReturn a Telegram-optimized HTML text message, strictly following this template:\n\n🎯 <b>SESSION [X] BRIEFING</b>\n\n📊 <b>[Exercise name]</b>\n• Last time: [Sets]x[Reps] @ [Load]kg ([Feeling])\n• <b>Today\'s target:</b> [Exact numeric prescription]\n\n🔥 <b>Motto:</b> [Short catchy motivational sentence]\n\nIMPORTANT: Do not include any Markdown tags (* or **). Only the HTML tags <b> and </b>.\n</output_format>\n</instructions>\n\n<inputs>\n<session_type>\n{{ $(\'Parse Validate JSON\').item.json.session_type || \'1\' }}\n</session_type>\n<session_history>\n{{ JSON.stringify($(\'Fetch Session History\').all().map(i => i.json)) }}\n</session_history>\n</inputs>') } }, position: [1648, 112], retryOnFail: true, maxTries: 4, waitBetweenTries: 5000, subnodes: { model: google_Gemini_Chat_Model_1 } }
});

const query_Router = node({
  type: 'n8n-nodes-base.switch',
  version: 3.5,
  config: { name: 'Query Router', parameters: { rules: { values: [{ conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 4 }, conditions: [{ leftValue: expr('{{ $json.query_type }}'), rightValue: 'LAST_SESSION', operator: { type: 'string', operation: 'equals' }, id: 'last-session-node' }], combinator: 'and' } }, { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 4 }, conditions: [{ leftValue: expr('{{ $json.query_type }}'), rightValue: 'ADVICE', operator: { type: 'string', operation: 'equals', name: 'filter.operator.equals' } }], combinator: 'and' } }, { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 4 }, conditions: [{ id: '44c07666-fd19-40ad-8b18-678f77bd3a2d', leftValue: expr('{{ $json.query_type }}'), rightValue: 'PROGRESSION', operator: { type: 'string', operation: 'equals', name: 'filter.operator.equals' } }], combinator: 'and' } }, { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 4 }, conditions: [{ id: 'b821bb60-b09e-4a88-a4f3-24372d4cc445', leftValue: expr('{{ $json.query_type }}'), rightValue: 'RECORD', operator: { type: 'string', operation: 'equals', name: 'filter.operator.equals' } }], combinator: 'and' } }] }, options: {} }, position: [2096, 224] }
});

const format_Last_Session = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Format Last Session', parameters: { assignments: { assignments: [{ id: 'lastSess', name: 'replyText', value: expr('📅 Last session: {{ $json.history[0]?.session_date || "---" }}\n{{ $json.history[0]?.exercise || "---" }} – {{ $json.history[0]?.reps }} reps @ {{ $json.history[0]?.load }}kg'), type: 'string' }] }, options: {} }, position: [2400, 208] }
});

const format_Advice_Reply = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Format Advice Reply', parameters: { assignments: { assignments: [{ id: '0b6f8a52-3c1e-4d7a-9e2f-5a1b7c9d4e60', name: 'replyText', value: expr('{{ $json.output }}'), type: 'string' }] }, options: {} }, position: [2400, 48] }
});

const format_Clarification_Question = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Format Clarification Question', parameters: { assignments: { assignments: [{ id: 'f41651b3-18eb-4e66-8ffb-73c1d0d00ca6', name: 'replyText', value: expr('❓ {{ $json.clarification_question || "Could you specify the number of reps and the load?" }}'), type: 'string' }] }, options: {} }, position: [1760, -256] }
});





const note_Analysis = node({
  type: 'n8n-nodes-base.stickyNote',
  version: 1,
  config: {
    parameters: {
      content: '## 🛡️ Data Uniformity & Security\nTranslates natural language into structured data. It ensures consistency and "security" for Data Table entries by standardizing exercise names and formats, which is crucial for reliable tracking.',
      height: 180,
      width: 300
    }
  },
  position: [400, -350]
});

const note_Coach = node({
  type: 'n8n-nodes-base.stickyNote',
  version: 1,
  config: {
    parameters: {
      content: '## 🧠 Personalized Coaching Intelligence\nAnalyzes history to prescribe precise goals (weight/reps) before a session. It acts as a personal coach to apply progressive overload effectively based on past performance.',
      height: 180,
      width: 300
    }
  },
  position: [1600, -150]
});

const note_UX = node({
  type: 'n8n-nodes-base.stickyNote',
  version: 1,
  config: {
    parameters: {
      content: '## 🚦 Seamless User Experience (UX)\nInstantly separates intents (Record, Advice, Correction). It ensures the user receives an immediate and relevant response without friction, essential for gym use.',
      height: 180,
      width: 300
    }
  },
  position: [1000, -350]
});

const note_Formatting = node({
  type: 'n8n-nodes-base.stickyNote',
  version: 1,
  config: {
    parameters: {
      content: '## 📝 Response Adaptability\nAdapts the final output based on the request type. These nodes confirm that data is correctly saved or present coach advice in a readable and motivating way.',
      height: 180,
      width: 300
    }
  },
  position: [2200, -350]
});

const wf = workflow('00z7ZkDqr9FuLYFU', 'SportLog Workout Bot', { executionOrder: 'v1', binaryMode: 'separate', availableInMCP: true });

export default wf
  .add(error_Trigger)
  .to(send_Error_Alert)
  .add(telegram_Trigger)
  .add(note_Analysis)
  .add(note_Coach)
  .add(note_UX)
  .add(note_Formatting)
  
  .to(security_Check_User_ID.onTrue(aI_Workout_Parser
    .to(parse_Validate_JSON)
    .to(intent_Router.onCase(0, save_Exercise_to_Table
      .to(aggregate_Logs)
      .to(format_Exercise_Summary)
      .to(send_Telegram_Reply)).onCase(1, get_Last_Log
      .to(update_Last_Log)
      .to(format_Correction_Summary)
      .to(send_Telegram_Reply)).onCase(2, fetch_Session_History
      .to(aggregate_History)
      .to(aI_Strength_Coach
      .to([
        query_Router.onCase(0, format_Last_Session
          .to(send_Telegram_Reply)).onCase(1, format_Advice_Reply
          .to(send_Telegram_Reply)).onCase(2, format_Advice_Reply),
        format_Advice_Reply]))).onCase(3, format_Clarification_Question
      .to(send_Telegram_Reply)).onCase(4, format_Clarification_Question))))