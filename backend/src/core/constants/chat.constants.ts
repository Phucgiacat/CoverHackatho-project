export const CHAT_CONSTANTS = {
  MAX_QUERY_MESSAGES: 10,
  MAX_PLAN_MESSAGES: 8,
  MAX_CONVERSATION_HISTORY: 10,
  MAX_PLAN_REFINEMENTS: 6,
};

export const CONFIRMATION_KEYWORDS = [
  'yes',
  'proceed',
  'ok',
  'sure',
  'lets go',
  "let's go",
  'continue',
  'start planning',
];

export const APPROVAL_KEYWORDS = [
  'looks good',
  'proceed',
  'yes',
  'approve',
  'generate',
  'ok',
  'perfect',
  'great',
  'go ahead',
];

export const LLM_DETECTION_PHRASES = {
  TRANSITION_TO_PLAN: ['ready to start planning', 'proceed to the planning phase'],
  GENERATE_HTML: ['generate the html dashboard', "i'll now generate", 'generating the html'],
};

