const { pool } = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ok } = require('../utils/respond');

exports.getQuiz = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    const quizCheck = await pool.query('SELECT question_data FROM quizzes WHERE video_id = $1', [videoId]);
    if (quizCheck.rowCount > 0) {
      return ok(res, { quiz: quizCheck.rows[0].question_data }, 'OK');
    }

    const videoCheck = await pool.query('SELECT title, description FROM videos WHERE id = $1', [videoId]);
    if (videoCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    const { title, description } = videoCheck.rows[0];

    let quizData;

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'fake');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        You are an expert educational course designer.
        Generate a 3-question multiple-choice quiz based on the following topic.
        Topic Title: ${title}
        Description: ${description}
        
        Return EXACTLY AND ONLY a valid JSON array of 3 objects. Do not include markdown code blocks (\`\`\`json) or any other text.
        Each object MUST have the following keys:
        - "question" (string)
        - "options" (array of exactly 4 strings)
        - "answer" (string, must exactly match one of the options)
      `;

      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();

      if (text.startsWith('\`\`\`json')) text = text.replace(/^\`\`\`json/, '');
      if (text.startsWith('\`\`\`')) text = text.replace(/^\`\`\`/, '');
      if (text.endsWith('\`\`\`')) text = text.replace(/\`\`\`$/, '');

      quizData = JSON.parse(text.trim());
    } catch (apiError) {
      console.warn('Gemini API failed, using fallback quiz:', apiError.message);
      quizData = [
        {
          question: `What is the main topic of the video "${title}"?`,
          options: ["Language basics", "Advanced grammar", "Writing skills", "Speaking practice"],
          answer: "Language basics"
        },
        {
          question: "How can you best apply the knowledge from this video?",
          options: ["By practicing daily", "By ignoring it", "By sleeping on it", "By reading a different book"],
          answer: "By practicing daily"
        },
        {
          question: "Which of the following is a key takeaway from this lesson?",
          options: ["Consistency is key", "Vocabulary is not important", "Grammar should be skipped", "Learning fast is better than learning well"],
          answer: "Consistency is key"
        }
      ];
    }

    await pool.query(
      'INSERT INTO quizzes (video_id, question_data) VALUES ($1, $2)',
      [videoId, JSON.stringify(quizData)]
    );

    ok(res, { quiz: quizData }, 'OK');
  } catch (error) {
    console.error('Quiz Generation Error:', error);
    next(error);
  }
};

exports.submitQuiz = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { score } = req.body;

    if (score > 0) {
      const bonusXp = score * 20;
      await pool.query('UPDATE users SET xp = xp + $1 WHERE id = $2', [bonusXp, userId]);

      const userRes = await pool.query('SELECT xp FROM users WHERE id = $1', [userId]);
      return ok(res, { bonusXp, newXp: userRes.rows[0].xp }, 'Quiz submitted!');
    }

    ok(res, { bonusXp: 0 }, 'Keep trying!');
  } catch (error) {
    next(error);
  }
};

