/**
 * AI Pronunciation Service
 * Integrates Whisper API for speech-to-text and pronunciation analysis
 */

import { RecitationAnalysis, scoreLetter, analyzeRecitation, getLetterReference } from '../utils/pronunciationScoring';

export interface RecordingMetadata {
  studentId: string;
  lessonId: string;
  letter: string;
  recordingUrl: string;
  durationMs: number;
  uploadedAt: string;
}

export interface PronunciationAnalysisResult {
  recordingUrl: string;
  transcription: string;
  analysis: RecitationAnalysis;
  processedAt: string;
  confidence: number;
}

/**
 * Call Whisper API to transcribe audio
 * In production, this would send audio to OpenAI Whisper API
 * For MVP/testing, returns mock data
 */
export const transcribeAudio = async (
  audioBlob: Blob,
  language: string = 'ar'
): Promise<string> => {
  try {
    // In production, send to OpenAI Whisper API
    // For now, return a mock transcription for testing
    
    // const formData = new FormData();
    // formData.append('file', audioBlob);
    // formData.append('model', 'whisper-1');
    // formData.append('language', language);
    // 
    // const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    //   },
    //   body: formData,
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`Whisper API error: ${response.statusText}`);
    // }
    // 
    // const data = await response.json();
    // return data.text;
    
    // Mock for MVP
    console.log('Mock transcription for audio duration:', audioBlob.size);
    return 'ba'; // Example: student says "ba"
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to transcribe audio'
    );
  }
};

/**
 * Upload recording to Supabase Storage
 */
export const uploadRecording = async (
  audioBlob: Blob,
  studentId: string,
  lessonId: string
): Promise<string> => {
  try {
    // In production, use Supabase storage
    // const { data, error } = await supabase.storage
    //   .from('voice-recordings')
    //   .upload(`${studentId}/${lessonId}-${Date.now()}.wav`, audioBlob);
    // 
    // if (error) throw error;
    // return data.path;
    
    // Mock for MVP - return a placeholder URL
    const mockUrl = `https://storage.example.com/${studentId}/${lessonId}-${Date.now()}.wav`;
    console.log('Mock upload to:', mockUrl);
    return mockUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to upload recording'
    );
  }
};

/**
 * Save recording metadata to database
 */
export const saveRecordingMetadata = async (
  metadata: RecordingMetadata
): Promise<string> => {
  try {
    // In production, insert into Supabase
    // const { data, error } = await supabase
    //   .from('student_voice_recordings')
    //   .insert([{
    //     student_id: metadata.studentId,
    //     lesson_id: metadata.lessonId,
    //     audio_url: metadata.recordingUrl,
    //     duration_seconds: Math.round(metadata.durationMs / 1000),
    //     uploaded_at: metadata.uploadedAt,
    //   }]);
    // 
    // if (error) throw error;
    // return data?.[0]?.id || '';
    
    // Mock for MVP
    const mockId = `rec-${Date.now()}`;
    console.log('Mock saved metadata:', metadata);
    return mockId;
  } catch (error) {
    console.error('Save metadata error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to save recording metadata'
    );
  }
};

/**
 * Save pronunciation scores to database
 */
export const savePronunciationScores = async (
  recordingId: string,
  analysis: RecitationAnalysis
): Promise<void> => {
  try {
    // In production, insert into Supabase
    // const scores = analysis.letterScores.map(score => ({
    //   recording_id: recordingId,
    //   letter: score.letter,
    //   accuracy_percent: score.accuracy,
    //   makhraj_quality: score.makhrajQuality,
    //   duration_vs_reference: score.durationRatio,
    //   flagged_for_review: score.accuracy < 75,
    // }));
    // 
    // const { error } = await supabase
    //   .from('pronunciation_scores')
    //   .insert(scores);
    // 
    // if (error) throw error;
    
    // Mock for MVP
    console.log('Mock saved pronunciation scores for recording:', recordingId, analysis);
  } catch (error) {
    console.error('Save scores error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to save pronunciation scores'
    );
  }
};

/**
 * Analyze recorded audio: transcribe → score → save
 * Main entry point for pronunciation analysis
 */
export const analyzeRecordedPronunciation = async (
  audioBlob: Blob,
  studentId: string,
  lessonId: string,
  letter: string,
  durationMs: number
): Promise<PronunciationAnalysisResult> => {
  try {
    // Step 1: Transcribe using Whisper
    const transcription = await transcribeAudio(audioBlob, 'ar');
    
    // Step 2: Get reference data for the letter
    const reference = getLetterReference(letter);
    
    // Step 3: Score the pronunciation
    const letterScore = scoreLetter(
      letter,
      transcription,
      reference.transcription,
      durationMs,
      reference.estimatedDurationMs
    );
    
    // Step 4: Analyze the recitation
    const analysis = analyzeRecitation([letterScore]);
    
    // Step 5: Upload recording to storage
    const recordingUrl = await uploadRecording(audioBlob, studentId, lessonId);
    
    // Step 6: Save metadata
    const recordingId = await saveRecordingMetadata({
      studentId,
      lessonId,
      letter,
      recordingUrl,
      durationMs,
      uploadedAt: new Date().toISOString(),
    });
    
    // Step 7: Save scores
    await savePronunciationScores(recordingId, analysis);
    
    return {
      recordingUrl,
      transcription,
      analysis,
      processedAt: new Date().toISOString(),
      confidence: letterScore.confidence,
    };
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to analyze pronunciation'
    );
  }
};

/**
 * Fetch student's previous recordings for a lesson
 */
export const getStudentRecordings = async (
  studentId: string,
  lessonId: string
): Promise<RecordingMetadata[]> => {
  try {
    // In production, query Supabase
    // const { data, error } = await supabase
    //   .from('student_voice_recordings')
    //   .select('*')
    //   .eq('student_id', studentId)
    //   .eq('lesson_id', lessonId);
    // 
    // if (error) throw error;
    // return data || [];
    
    // Mock for MVP
    return [];
  } catch (error) {
    console.error('Fetch recordings error:', error);
    return [];
  }
};

/**
 * Get pronunciation scores for a specific recording
 */
export const getRecordingScores = async (recordingId: string): Promise<any[]> => {
  try {
    // In production, query Supabase
    // const { data, error } = await supabase
    //   .from('pronunciation_scores')
    //   .select('*')
    //   .eq('recording_id', recordingId);
    // 
    // if (error) throw error;
    // return data || [];
    
    // Mock for MVP
    return [];
  } catch (error) {
    console.error('Fetch scores error:', error);
    return [];
  }
};
