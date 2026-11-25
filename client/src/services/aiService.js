// Gemini-backed complaint classification and campus relevance analysis.
// Local keyword helpers remain only for legacy, non-authoritative suggestions.

import api from './api';

export const analyzeComplaint = async (title = '', description = '') => {
  try {
    const response = await api.post(
      '/ai/classify-complaint',
      { title, description },
      { timeout: 30000 }
    );

    if (!response.data?.success || !response.data?.analysis) {
      throw new Error(response.data?.message || 'AI classification failed. Please try again.');
    }

    return response.data.analysis;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'AI analysis timed out. Please try again.'
        : error.code === 'ERR_NETWORK'
        ? 'Could not reach the server for AI analysis. Check that the backend is running.'
        : error.message);
    throw new Error(message || 'AI classification failed. Please try again.');
  }
};

export const CATEGORY_KEYWORDS = {
  'Electrical': [
    'fan', 'ceiling fan', 'light', 'tube light', 'bulb', 'switch', 'socket', 'plug',
    'wire', 'wiring', 'spark', 'short circuit', 'voltage', 'power', 'power cut',
    'electricity', 'mcb', 'generator', 'inverter', 'fuse', 'switchboard', 'ac', 'air conditioner', 'cooler'
  ],
  'Plumbing': [
    'leak', 'leakage', 'pipe', 'water', 'tap', 'washbasin', 'drain', 'drainage',
    'sink', 'flush', 'commode', 'sewage', 'faucet', 'overflow', 'plumber',
    'cistern', 'dripping', 'choked', 'flush tank', 'geyser', 'toilet', 'washroom', 'bathroom'
  ],
  'WiFi / Internet': [
    'wifi', 'wi-fi', 'internet', 'network', 'router', 'hotspot', 'lan', 'ethernet',
    'latency', 'bandwidth', 'disconnect', 'dropping', 'portal', 'signal', 'speed',
    'connectivity', 'offline', 'access point', 'broadband'
  ],
  'Cleanliness': [
    'clean', 'cleaning', 'garbage', 'trash', 'dustbin', 'waste', 'litter', 'dirty',
    'smell', 'stink', 'broom', 'sweeper', 'pest', 'cockroach', 'insects',
    'hygiene', 'sweep', 'dust', 'mop', 'spill', 'sanitation', 'unhygienic'
  ],
  'Infrastructure': [
    'bench', 'desk', 'chair', 'table', 'door', 'window', 'hinge', 'latch', 'plank',
    'nail', 'wall', 'crack', 'ceiling', 'tile', 'plaster', 'painting', 'stairs',
    'railing', 'floor', 'furniture', 'carpentry', 'lift', 'elevator', 'cupboard', 'lock'
  ],
  'Hostel': [
    'hostel', 'mess', 'food', 'geyser', 'bed', 'warden', 'laundry', 'roommate',
    'cooler', 'water cooler', 'hostel room', 'block', 'corridor', 'dorm', 'mattress'
  ],
  'Classroom': [
    'projector', 'screen', 'smartboard', 'mic', 'microphone', 'podium', 'hdmi',
    'speaker', 'sound system', 'audio', 'lecture hall', 'seminar hall', 'chalkboard',
    'whiteboard', 'display', 'av cable', 'lab', 'computer lab'
  ],
  'Security': [
    'security', 'cctv', 'camera', 'guard', 'theft', 'stolen', 'lost', 'gate',
    'patrol', 'trespass', 'harassment', 'lock', 'perimeter', 'id card', 'emergency',
    'dark pathway', 'night lighting', 'campus safety'
  ],
  'Transport': [
    'bus', 'shuttle', 'transport', 'driver', 'van', 'transit', 'route', 'timing',
    'delay', 'pickup', 'parking', 'vehicle', 'ev charging', 'bus bay'
  ],
  'Other': [
    'campus', 'college', 'library', 'canteen', 'sports', 'ground', 'gym', 'auditorium',
    'department', 'office', 'admin block', 'classroom', 'exam hall', 'water filter'
  ]
};

// Fraud / Spam / Commercial / Inappropriate Non-Campus Keywords
export const FRAUD_AND_NON_CAMPUS_PATTERNS = [
  'crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 'dogecoin', 'usdt',
  'lottery', 'earn money', 'investment', 'casino', 'betting', 'bet365', 'rummy',
  'loan', 'credit card', 'credit score', 'personal loan',
  'buy shoes', 'buy sneakers', 'buy clothes', 'amazon order', 'flipkart', 'swiggy',
  'zomato', 'pizza delivery', 'uber ride', 'ola cab', 'selling car', 'selling bike',
  'buy followers', 'movie ticket', 'cinema ticket', 'torrent', 'netflix password',
  'porn', 'dating', 'matrimony', 'escort', 'sexy', 'adult', 'free sex',
  'exam leak', 'paper leak', 'exam cheat', 'leak question paper',
  'hack instagram', 'hack whatsapp', 'game hack', 'free fire diamond', 'pubg uc',
  'cheat code', 'weapons', 'gun', 'drugs', 'weed', 'ganja', 'marijuana', 'liquor',
  'my dog', 'my cat', 'puppy', 'home cooking', 'cooking recipe', 'make pizza',
  'vacation tour', 'hotel booking', 'air ticket', 'flight ticket'
];

/**
 * Validates whether a text query or complaint is genuine and college-related.
 * Detects spam, commercial fraud, irrelevant external topics, and gibberish.
 */
export const validateCampusIssue = (title = '', description = '') => {
  const combined = `${title} ${description}`.trim().toLowerCase();

  // 1. Empty or too short
  if (combined.length < 5) {
    return {
      isValid: false,
      isFraudOrIrrelevant: true,
      reason: 'Issue description is too short. Please describe a valid campus maintenance problem.',
    };
  }

  // 2. Gibberish check: repeated characters like "aaaaaa" or "asdfasdf" or lacking vowels
  const repeatedCharPattern = /(.)\1{4,}/;
  if (repeatedCharPattern.test(combined)) {
    return {
      isValid: false,
      isFraudOrIrrelevant: true,
      reason: 'Gibberish or repetitive text detected. Please enter a genuine issue description.',
    };
  }

  // Check for random consonant mash
  const words = combined.split(/\s+/).filter(Boolean);
  const gibberishWords = words.filter(
    (w) => w.length > 5 && !/[aeiouy]/i.test(w)
  );
  if (gibberishWords.length > 0) {
    return {
      isValid: false,
      isFraudOrIrrelevant: true,
      reason: 'Unintelligible text detected. Please specify a genuine campus maintenance issue.',
    };
  }

  // 3. Explicit Fraud, Spam, or Commercial Keywords Check
  for (const pattern of FRAUD_AND_NON_CAMPUS_PATTERNS) {
    const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(combined)) {
      return {
        isValid: false,
        isFraudOrIrrelevant: true,
        reason: `Non-college topic / fraud keyword detected ("${pattern}"). CampusResolve AI is strictly reserved for genuine campus and college facility issues.`,
        flaggedKeyword: pattern,
      };
    }
  }

  // 4. College / Campus Relevance Check
  // Check if at least one category keyword or campus entity is present
  let hasCampusRelevance = false;
  for (const keywords of Object.values(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(combined)) {
        hasCampusRelevance = true;
        break;
      }
    }
    if (hasCampusRelevance) break;
  }

  // If words contain common general problem terms like "broken", "damaged", "repair", "not working", "problem", "fault"
  const generalProblemWords = ['broken', 'damaged', 'repair', 'not working', 'issue', 'problem', 'fault', 'stopped', 'fix', 'replace'];
  const hasProblemTerm = generalProblemWords.some((w) => combined.includes(w));

  if (!hasCampusRelevance && !hasProblemTerm) {
    return {
      isValid: false,
      isFraudOrIrrelevant: true,
      reason: 'Issue appears unrelated to college or campus facilities. Please describe a valid campus maintenance problem (e.g., electrical, plumbing, WiFi, cleanliness, hostel, classroom, or infrastructure).',
    };
  }

  return {
    isValid: true,
    isFraudOrIrrelevant: false,
    reason: 'Valid campus maintenance issue.',
  };
};

/**
 * Legacy local keyword suggestion. Authoritative classification is performed by Gemini.
 */
export const detectCategory = (title = '', description = '') => {
  const combinedText = `${title} ${description}`.toLowerCase();

  if (!combinedText.trim()) {
    return {
      category: 'Other',
      confidence: 0,
      keywords: [],
      explanation: 'Please provide a title or description for a category suggestion.',
      isFraud: false,
    };
  }

  // Fraud / Relevance check
  const relevanceCheck = validateCampusIssue(title, description);
  if (!relevanceCheck.isValid) {
    return {
      category: 'Other',
      confidence: 0,
      keywords: relevanceCheck.flaggedKeyword ? [relevanceCheck.flaggedKeyword] : [],
      explanation: `⚠️ ${relevanceCheck.reason}`,
      isFraud: true,
      fraudReason: relevanceCheck.reason,
    };
  }

  let bestMatch = 'Other';
  let highestScore = 0;
  let matchedKeywords = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'Other') continue;
    let score = 0;
    const foundWords = [];

    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = combinedText.match(regex);
      if (matches) {
        score += matches.length * (kw.includes(' ') ? 2.5 : 1.5);
        if (!foundWords.includes(kw)) {
          foundWords.push(kw);
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = category;
      matchedKeywords = foundWords;
    }
  }

  const confidence =
    highestScore > 0 ? Math.min(Math.round(Math.min(highestScore / 4, 1) * 100), 98) : 50;

  return {
    category: bestMatch,
    confidence: bestMatch === 'Other' ? 40 : confidence,
    keywords: matchedKeywords.slice(0, 4),
    explanation:
      bestMatch !== 'Other'
        ? `Local keyword suggestion: "${bestMatch}" based on "${matchedKeywords.slice(0, 3).join('", "')}"`
        : 'General campus facility request',
    isFraud: false,
  };
};

// Helper to extract location patterns like "Room 204", "Hostel B", "Library 3rd floor"
const extractLocation = (text) => {
  const locationPatterns = [
    /(?:room|rm|hall|lab|block|floor|hostel|library|canteen|department|dept|wing|ground)\s+[a-z0-9-]+(?:\s+[a-z0-9-]+)?/i,
    /(?:in|at|near|outside|inside)\s+([a-z0-9\s-]+(?:room|hall|lab|block|floor|hostel|library|canteen|complex|gate|bay))/i,
    /\b(?:room|lab)\s*\d+[a-z]?\b/i,
    /\b(?:block|hostel)\s*[a-z0-9]\b/i,
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  return null;
};

// Generate a professional complaint title based on detected category & problem snippet
const generateTitle = (text, category) => {
  const clean = text.trim();
  if (clean.length < 50 && !clean.includes('.')) {
    return clean.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  const resolvedCategory = category || detectCategory(clean, '').category;
  switch (resolvedCategory) {
    case 'Electrical':
      if (clean.toLowerCase().includes('fan')) return 'Ceiling Fan Malfunction';
      if (clean.toLowerCase().includes('light')) return 'Lighting Issue in Premises';
      return 'Electrical Equipment Failure';
    case 'Plumbing':
      if (clean.toLowerCase().includes('leak')) return 'Water Leakage and Drainage Issue';
      if (clean.toLowerCase().includes('tap')) return 'Damaged Tap / Water Outlet';
      return 'Plumbing & Water Supply Problem';
    case 'WiFi / Internet':
      return 'Campus WiFi Connectivity & Speed Degradation';
    case 'Cleanliness':
      return 'Garbage Disposal & Sanitation Required';
    case 'Infrastructure':
      return 'Damaged Furniture / Physical Infrastructure Repair';
    case 'Classroom':
      return 'Classroom Audio-Visual Equipment Malfunction';
    case 'Hostel':
      return 'Hostel Facility Maintenance Issue';
    case 'Security':
      return 'Campus Safety & Security Concern';
    case 'Transport':
      return 'Campus Shuttle Transit Maintenance';
    default:
      return 'Campus Facility Assistance Request';
  }
};

/**
 * Gemini-backed multi-turn intake, location extraction, and complaint summary generation.
 */
export const processAIAssistantStep = async (userMessage, currentContext = {}) => {
  const text = (userMessage || '').trim();

  const context = {
    step: currentContext.step || 'initial',
    title: currentContext.title || '',
    description: currentContext.description || '',
    location: currentContext.location || '',
    category: currentContext.category || '',
    history: currentContext.history || [],
  };

  let analysis;
  if (context.step === 'initial') {
    analysis = await analyzeComplaint('', text);
  } else if (context.step === 'awaiting_details') {
    analysis = await analyzeComplaint(context.title, `${context.description}. ${text}`);
  }

  if (analysis && (!analysis.isCampusRelated || analysis.isPotentiallySpam)) {
    return {
      botReply: `This may be unrelated to campus or potentially spam. ${analysis.explanation} Please clarify the genuine campus issue if this was flagged incorrectly.`,
      updatedContext: currentContext,
      complaintSummary: null,
      isComplete: false,
      isFraud: true,
      fraudReason: analysis.explanation,
    };
  }

  // Extract location if present in user message
  const detectedLoc = extractLocation(text);
  if (detectedLoc && !context.location) {
    context.location = detectedLoc;
  }

  let botReply = '';
  let isComplete = false;

  if (context.step === 'initial') {
    context.description = text;
    context.category = analysis.category;
    context.title = generateTitle(text, analysis.category);

    if (!context.location) {
      botReply = `I'm sorry you're facing this issue with the ${analysis.category.toLowerCase()} facilities. Could you please tell me the exact campus location or room/hostel number?`;
      context.step = 'awaiting_location';
    } else {
      botReply = `Thank you. I've noted the location as "${context.location}". Could you describe the issue in a little more detail (e.g. when it started or specific symptoms)?`;
      context.step = 'awaiting_details';
    }
  } else if (context.step === 'awaiting_location') {
    context.location = text;
    if (context.description.length < 25) {
      botReply = `Got it! Location recorded as "${context.location}". Could you add a short description of what happens or how severe the issue is?`;
      context.step = 'awaiting_details';
    } else {
      isComplete = true;
      botReply = `Thank you! I have collected all necessary complaint details. You can review the summary below and submit your complaint immediately.`;
      context.step = 'completed';
    }
  } else if (context.step === 'awaiting_details') {
    context.description = `${context.description}. ${text}`;
    context.category = analysis.category;
    isComplete = true;
    botReply = `Thank you for the details! I have prepared your complete complaint ticket summary. Please review it below and click Submit Complaint to proceed.`;
    context.step = 'completed';
  } else {
    // Already completed or follow-up edits
    if (
      text.toLowerCase().includes('room') ||
      text.toLowerCase().includes('hostel') ||
      text.toLowerCase().includes('block')
    ) {
      context.location = text;
      botReply = `Updated the complaint location to "${context.location}". You can now submit your complaint.`;
    } else {
      context.description += ` Note: ${text}`;
      botReply = `Updated the complaint details. Review the summary card below.`;
    }
    isComplete = true;
  }

  const complaintSummary =
    (context.location && context.description) || isComplete
      ? {
          title: context.title || generateTitle(context.description, context.category),
          description: context.description,
          location: context.location || 'Campus Premises (Location required)',
          category: context.category || 'Other',
          isAiDetected: true,
        }
      : null;

  return {
    botReply,
    updatedContext: context,
    complaintSummary,
    isComplete,
    isFraud: false,
  };
};
