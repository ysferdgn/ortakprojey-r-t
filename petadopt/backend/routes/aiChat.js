const express = require('express');
const rateLimit = require('express-rate-limit');
const { OpenAI } = require('openai');

const router = express.Router();

// Rate limiter: 5 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many requests, please try again later.'
});

// OpenAI setup (require API key from env)
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables.');
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', limiter, async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required.' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Sen kullanıcıya evcil hayvan bakımı, eğitimi, sağlığı ve sahiplenme konularında yardımcı olan, dost canlısı, samimi ve pozitif bir asistansın. Cevaplarını kısa, öz, anlaşılır ve sıcak bir dille ver. Gereksiz detaylardan kaçın, kullanıcıyı cesaretlendir ve motive et.' },
        ...(Array.isArray(history) ? history : []),
        { role: 'user', content: message }
      ],
      temperature: 0.7,
    });
    const aiMessage = completion.choices[0].message.content;
    res.json({ text: aiMessage });
  } catch (err) {
    console.error('OpenAI error:', err.response?.data || err.message);
    res.status(500).json({ error: 'AI service unavailable.' });
  }
});

module.exports = router; 