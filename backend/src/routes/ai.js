const router = require('express').Router();
const { z } = require('zod');
const { asyncHandler, validate } = require('../utils');
const ai = require('../services/ai');

const lang = z.enum(['en', 'si', 'ta']).default('en');

router.post('/chat', validate(z.object({
  lang, messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().trim().max(600) })).min(1).max(12),
})), asyncHandler(async (req, res) => {
  const msgs = req.body.messages.slice(-8);
  const last = [...msgs].reverse().find((m) => m.role === 'user')?.content || '';
  if (ai.hasRedFlag(last)) return res.json({ reply: ai.EMERGENCY[req.body.lang], emergency: true, source: 'rules' }); // safety first
  try {
    const reply = await ai.callClaude(ai.CHAT_SYSTEM(req.body.lang), msgs);
    if (reply) return res.json({ reply, source: 'ai' });
  } catch (e) { console.warn('[ai] fallback:', e.message); }
  res.json({ reply: ai.FALLBACK[req.body.lang], source: 'fallback' });
}));

const DEPTS = ['cardiology', 'orthopaedics', 'neurology', 'paediatrics', 'obgyn', 'general', 'nephrology', 'ent', 'oncology'];
router.post('/symptom', validate(z.object({ lang, text: z.string().trim().min(3).max(500) })), asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (ai.hasRedFlag(text)) return res.json({ urgency: 'EMERGENCY', department: 'general', advice: ai.EMERGENCY[req.body.lang], redFlag: true, source: 'rules' });
  try {
    const raw = await ai.callClaude(ai.SYMPTOM_SYSTEM(req.body.lang), [{ role: 'user', content: text }], 300);
    if (raw) {
      const j = JSON.parse(raw.replace(/```json|```/g, '').trim());
      if (['EMERGENCY', 'SOON', 'ROUTINE'].includes(j.urgency) && DEPTS.includes(j.department) && typeof j.advice === 'string')
        return res.json({ urgency: j.urgency, department: j.department, advice: j.advice.slice(0, 400), redFlag: !!j.redFlag, source: 'ai' });
    }
  } catch (e) { console.warn('[ai] symptom fallback:', e.message); }
  res.json({ urgency: 'ROUTINE', department: 'general', advice: ai.FALLBACK[req.body.lang], redFlag: false, source: 'fallback' });
}));

module.exports = router;
