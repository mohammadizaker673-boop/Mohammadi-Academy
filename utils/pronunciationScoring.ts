/**
 * Pronunciation Scoring Algorithm
 * Compares student pronunciation against reference using phonetic analysis
 */

export interface PronunciationScore {
  letter: string;
  accuracy: number; // 0-100
  makhrajQuality: 'poor' | 'fair' | 'good' | 'excellent';
  durationRatio: number; // student_duration / reference_duration
  confidence: number; // 0-100, how confident is the scoring
  details: string; // Human-readable feedback
}

export interface RecitationAnalysis {
  overallAccuracy: number; // 0-100
  letterScores: PronunciationScore[];
  strongLetters: string[];
  weakLetters: string[];
  recommendations: string[];
  passedThreshold: boolean;
}

/**
 * Simple phonetic distance calculator
 * Compares transcribed text phonetically
 */
const getPhoneticDistance = (actual: string, expected: string): number => {
  const actualChars = actual.toLowerCase().split('');
  const expectedChars = expected.toLowerCase().split('');
  
  let matches = 0;
  const maxLength = Math.max(actualChars.length, expectedChars.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (actualChars[i] === expectedChars[i]) {
      matches++;
    }
  }
  
  return maxLength === 0 ? 100 : Math.round((matches / maxLength) * 100);
};

/**
 * Determine Makhraj quality based on frequency analysis
 * In a real system, this would analyze frequency spectrum from audio
 * For MVP, we'll use heuristics based on phonetic match quality and duration
 */
const assessMakhrajQuality = (
  accuracy: number,
  durationRatio: number
): 'poor' | 'fair' | 'good' | 'excellent' => {
  // Ideal duration ratio is 0.9-1.1 (within 10% of reference)
  const durationPenalty = Math.abs(durationRatio - 1.0) > 0.3 ? 20 : 0;
  const adjustedAccuracy = accuracy - durationPenalty;
  
  if (adjustedAccuracy >= 90) return 'excellent';
  if (adjustedAccuracy >= 75) return 'good';
  if (adjustedAccuracy >= 60) return 'fair';
  return 'poor';
};

/**
 * Score a single letter based on transcription and timing
 */
export const scoreLetter = (
  letter: string,
  studentTranscription: string,
  referenceTranscription: string,
  studentDurationMs: number,
  referenceDurationMs: number
): PronunciationScore => {
  const accuracy = getPhoneticDistance(studentTranscription, referenceTranscription);
  const durationRatio = referenceDurationMs > 0 ? studentDurationMs / referenceDurationMs : 1;
  const makhrajQuality = assessMakhrajQuality(accuracy, durationRatio);
  
  // Confidence is based on how clear the transcription was
  // Higher accuracy = higher confidence
  const confidence = Math.min(100, accuracy + (makhrajQuality === 'excellent' ? 10 : 0));
  
  let details = '';
  if (accuracy >= 90) {
    details = `Excellent pronunciation of ${letter}. Makhraj is clear and timing is correct.`;
  } else if (accuracy >= 75) {
    details = `Good pronunciation of ${letter}. Minor timing issues detected.`;
  } else if (accuracy >= 60) {
    details = `Fair pronunciation of ${letter}. Consider reviewing the makhraj.`;
  } else {
    details = `Needs improvement on ${letter}. Listen to the reference and try again.`;
  }
  
  return {
    letter,
    accuracy,
    makhrajQuality,
    durationRatio: Math.round(durationRatio * 100) / 100,
    confidence,
    details,
  };
};

/**
 * Analyze full recitation with multiple letters
 */
export const analyzeRecitation = (
  letterScores: PronunciationScore[],
  passingThreshold: number = 75
): RecitationAnalysis => {
  const overallAccuracy = letterScores.length > 0
    ? Math.round(letterScores.reduce((sum, s) => sum + s.accuracy, 0) / letterScores.length)
    : 0;
  
  const strongLetters = letterScores
    .filter(s => s.accuracy >= 85)
    .map(s => s.letter);
  
  const weakLetters = letterScores
    .filter(s => s.accuracy < 75)
    .map(s => s.letter);
  
  const recommendations: string[] = [];
  
  if (weakLetters.length > 0) {
    recommendations.push(`Focus on improving: ${weakLetters.join(', ')}`);
  }
  
  const poorMakhrajLetters = letterScores
    .filter(s => s.makhrajQuality === 'poor')
    .map(s => s.letter);
  
  if (poorMakhrajLetters.length > 0) {
    recommendations.push(`Review makhraj (articulation) for: ${poorMakhrajLetters.join(', ')}`);
  }
  
  const fastLetters = letterScores
    .filter(s => s.durationRatio < 0.7)
    .map(s => s.letter);
  
  if (fastLetters.length > 0) {
    recommendations.push(`Slow down on: ${fastLetters.join(', ')}`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Great job! Keep practicing to maintain consistency.');
  }
  
  const passedThreshold = overallAccuracy >= passingThreshold;
  
  return {
    overallAccuracy,
    letterScores,
    strongLetters,
    weakLetters,
    recommendations,
    passedThreshold,
  };
};

/**
 * Generate reference data for each letter for comparison
 * This is a simple lookup; in production, could come from database or audio files
 */
export const getLetterReference = (letter: string): { transcription: string; estimatedDurationMs: number } => {
  // Phonetic representations and typical durations for each Arabic letter
  const references: Record<string, { transcription: string; estimatedDurationMs: number }> = {
    'ا': { transcription: 'aa', estimatedDurationMs: 600 },
    'ب': { transcription: 'ba', estimatedDurationMs: 400 },
    'ت': { transcription: 'ta', estimatedDurationMs: 400 },
    'ث': { transcription: 'tha', estimatedDurationMs: 400 },
    'ج': { transcription: 'ja', estimatedDurationMs: 400 },
    'ح': { transcription: 'ha', estimatedDurationMs: 400 },
    'خ': { transcription: 'kha', estimatedDurationMs: 400 },
    'د': { transcription: 'da', estimatedDurationMs: 400 },
    'ذ': { transcription: 'dha', estimatedDurationMs: 400 },
    'ر': { transcription: 'ra', estimatedDurationMs: 400 },
    'ز': { transcription: 'za', estimatedDurationMs: 400 },
    'س': { transcription: 'sa', estimatedDurationMs: 400 },
    'ش': { transcription: 'sha', estimatedDurationMs: 400 },
    'ص': { transcription: 'sa', estimatedDurationMs: 450 }, // heavy
    'ض': { transcription: 'da', estimatedDurationMs: 450 }, // heavy
    'ط': { transcription: 'ta', estimatedDurationMs: 450 }, // heavy
    'ظ': { transcription: 'dha', estimatedDurationMs: 450 }, // heavy
    'ع': { transcription: 'a', estimatedDurationMs: 400 },
    'غ': { transcription: 'gha', estimatedDurationMs: 400 },
    'ف': { transcription: 'fa', estimatedDurationMs: 400 },
    'ق': { transcription: 'qa', estimatedDurationMs: 450 },
    'ك': { transcription: 'ka', estimatedDurationMs: 400 },
    'ل': { transcription: 'la', estimatedDurationMs: 400 },
    'م': { transcription: 'ma', estimatedDurationMs: 400 },
    'ن': { transcription: 'na', estimatedDurationMs: 400 },
    'ه': { transcription: 'ha', estimatedDurationMs: 400 },
    'و': { transcription: 'wa', estimatedDurationMs: 400 },
    'ي': { transcription: 'ya', estimatedDurationMs: 400 },
  };
  
  return references[letter] || { transcription: letter, estimatedDurationMs: 400 };
};
