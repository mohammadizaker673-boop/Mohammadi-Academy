# Reaction Video Editor

Create TikTok / Reels / Shorts style reaction videos where the **original video and your reaction appear together on one 9:16 screen**.

## Where to find it
| Role | Route | Menu |
|------|-------|------|
| Admin | `/admin/courses/reaction-video` | Courses → Reaction Video Editor |
| Teacher | `/teacher/reaction-video` | Reaction Video |
| Anyone | `/reaction-video` | full-screen standalone |

## Workflow (3–5 steps)
1. **Media → Original Video** – upload the video you react to.
2. **Media → 🎥 Record Reaction** (camera preview, mic selector, 3-second countdown, original plays while recording, recording is auto-added to the timeline) or **Upload reaction**.
3. **Layout** – Side by Side · Top & Bottom · Picture in Picture · Circle Reaction.
4. **Adjust** – click a video in the preview to move / resize it; the right panel offers Trim, Crop, Shape (rectangle / rounded / circle), Border, Volume, Mute, Speed. Drag the *Reaction Video* clip in the timeline left/right to sync it with the *Original Video*.
5. **Export Video** – MP4 · 1080×1920 · 30 FPS with TikTok / Instagram Reels / YouTube Shorts / Facebook Reels presets.

Tools: Trim · Split · Crop · Resize · Move · Volume · Speed · Text · Captions · Undo · Redo (Space = play/pause, Ctrl+Z / Ctrl+Shift+Z).

## Auto Captions
Captions → choose **English, Persian, Dari, Arabic or Urdu** → **Auto Captions**. Captions are generated from the reaction audio, offset to the reaction clip's position on the timeline, and each caption can be edited (text, start, end) from the list or the right panel.

Engines (auto-selected, best first):
| Engine | Config | Notes |
|--------|--------|-------|
| OpenAI Whisper | `VITE_OPENAI_API_KEY` in `.env.local` | Best accuracy, all 5 languages |
| Google Gemini | `GEMINI_API_KEY` in `.env.local` | Good accuracy |
| Browser speech recognition | none (Chrome/Edge) | Free fallback – plays the reaction audio out loud while the mic listens |

## Export notes
Rendering happens in the browser (canvas + WebAudio + `MediaRecorder`) and plays the timeline once in real time. Chrome/Edge/Safari export MP4 (H.264) where supported; otherwise the file is WebM, which TikTok, Instagram and YouTube all accept.

## Files
```
components/reaction/
  ReactionVideoEditor.tsx   – UI (left tabs, preview, right settings, export)
  Timeline.tsx              – Original / Reaction tracks, drag-to-sync, trim handles
  RecordReactionModal.tsx   – camera recording with countdown
  engine.ts                 – playback / audio mix / export engine
  renderer.ts               – draws layouts, shapes, borders, captions, text
  captionService.ts         – Whisper / Gemini / browser transcription
  useHistory.ts             – undo / redo
  types.ts                  – project model, layouts, presets
pages/ReactionVideoEditorPage.tsx
```
