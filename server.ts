import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'sakhi360' });
  });

  // 1. Mind Pillar: Judgment-free AI mental health & coping support chatbot
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { messages, moodContext } = req.body as {
        messages?: Array<{ role: 'user' | 'assistant'; text: string }>;
        moodContext?: string;
      };

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required.' });
      }

      const ai = getAiClient();
      const conversationText = messages
        .slice(-10)
        .map((m) => `${m.role === 'user' ? 'User' : 'Sakhi'}: ${m.text}`)
        .join('\n');

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `${conversationText}\nSakhi:`,
        config: {
          systemInstruction: `You are Sakhi, a warm, empathetic, judgment-free women's mental well-being and safety companion inside Sakhi360.
Context: User's current mood check-in is "${moodContext || 'not specified'}".
Guidelines:
- Keep responses concise (2-4 short paragraphs max), calm, respectful, and culturally aware (Indian & global context).
- Never judge, lecture, or dismiss feelings.
- Offer practical, gentle coping exercises (e.g., 4-7-8 breathing, 5-4-3-2-1 grounding, journaling prompts) when helpful.
- Never claim to be a licensed therapist or doctor. If someone expresses immediate self-harm or domestic violence danger, gently remind them of the Silent SOS tool in Sakhi360 and Indian helplines (112 Emergency, 181 Women's Helpline, 14416 Tele-MANAS).`,
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        return res.status(502).json({ error: 'Empty response received from AI service.' });
      }
      return res.json({ reply });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to generate AI response.';
      console.error('AI Chat error:', message);
      return res.status(500).json({ error: message });
    }
  });

  // 2. Body Pillar: PCOS Screening Insights & Doctor Prep Questions
  app.post('/api/ai/pcos-insights', async (req, res) => {
    try {
      const { score, tier, factors, cycleSummary } = req.body as {
        score?: number;
        tier?: string;
        factors?: string[];
        cycleSummary?: string;
      };

      if (typeof score !== 'number' || !tier) {
        return res.status(400).json({ error: 'Screening score and tier are required.' });
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Screening result: Tier=${tier}, Score=${score}/100.
Observed markers: ${(factors || []).join(', ') || 'None specified'}.
Cycle pattern: ${cycleSummary || 'Irregular / variable'}.`,
        config: {
          systemInstruction:
            'You are a women’s reproductive health educator. Provide screening-only educational insights (explicitly NOT a medical diagnosis). Suggest clear questions the user can ask a gynecologist or endocrinologist, plus gentle evidence-based daily habits.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: 'A calm, non-alarmist 2-sentence explanation of the screening markers.',
              },
              doctorQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 specific questions to ask a gynecologist (e.g. hormone panel, ultrasound, insulin resistance).',
              },
              lifestyleSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 practical daily habits supporting hormonal & metabolic balance.',
              },
              disclaimer: {
                type: Type.STRING,
                description: 'One-sentence reminder that this is a screening guide, not a medical diagnosis.',
              },
            },
          },
        },
      });

      const raw = (response.text ?? '{}').trim();
      const parsed = JSON.parse(raw);
      return res.json(parsed);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to generate PCOS insights.';
      console.error('PCOS Insights error:', message);
      return res.status(500).json({ error: message });
    }
  });

  // 3. Mind Pillar: Private Journal Gentle Reflection
  app.post('/api/ai/journal-reflect', async (req, res) => {
    try {
      const { entryText, mood } = req.body as { entryText?: string; mood?: string };
      if (!entryText || !entryText.trim()) {
        return res.status(400).json({ error: 'Journal text is required.' });
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Mood: ${mood || 'Reflective'}\nEntry: ${entryText.slice(0, 1500)}`,
        config: {
          systemInstruction:
            'You are a gentle, privacy-respecting reflection guide. Acknowledge the user’s emotions warmly in 2 sentences, highlight one personal strength visible in their words, and offer 1 tiny 2-minute grounding action.',
        },
      });

      return res.json({ reflection: response.text?.trim() || 'Thank you for checking in with yourself today.' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to generate journal reflection.';
      console.error('Journal Reflect error:', message);
      return res.status(500).json({ error: message });
    }
  });

  // 4. Digital Defense Pillar: Deepfake / Morphed-Image Takedown Notice Draft
  app.post('/api/ai/takedown-draft', async (req, res) => {
    try {
      const { platform, incidentType, contentReference, additionalContext } = req.body as {
        platform?: string;
        incidentType?: string;
        contentReference?: string;
        additionalContext?: string;
      };

      if (!platform || !incidentType) {
        return res.status(400).json({ error: 'Platform and incident type are required.' });
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Platform: ${platform}
Incident Type: ${incidentType}
Reference URL/Handle: ${contentReference || '[Attach URL / Hash ID]'}
Context: ${additionalContext || 'Non-consensual morphed / deepfake imagery.'}`,
        config: {
          systemInstruction:
            'Draft a crisp, formal, legally grounded takedown & grievance request suitable for platform Trust & Safety / Grievance Officer (referencing India IT Rules 2021 24-hour NCII takedown mandate, IT Act Sections 66E/67/67A, and StopNCII hash preservation). Keep placeholders in square brackets for personal details.',
        },
      });

      return res.json({ draft: response.text?.trim() || '' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to draft takedown notice.';
      console.error('Takedown Draft error:', message);
      return res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sakhi360 server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Sakhi360 server:', err);
  process.exit(1);
});
