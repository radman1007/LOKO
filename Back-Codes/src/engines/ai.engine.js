const { query, queryOne } = require('../database/connection');
const moodEngine = require('./mood.engine');

const RESPONSES = {
  greeting: [
    'سلام! امروز چطوره؟ اگه نیاز به کمک داری اینجام.',
    'درود! خوشحالم که اینجایی. چطور می‌تونم کمکت کنم؟',
  ],
  mood_bad: [
    'متوجهم که امروز سخت گذشته. پیشنهاد می‌کنم یک تمرین تنفس انجام بدی.',
    'گاهی روزها سخت‌ترن. یادت باشه این احساس موقتیه.',
  ],
  mood_good: [
    'عالیه! از این انرژی مثبت استفاده کن و یک تسک امروز رو انجام بده.',
  ],
  default: [
    'می‌تونی از بخش لوکو سلامت تمرین تنفس انجام بدی یا یک پادکست گوش بدی.',
    'انجام تسک‌های روزانه بهت امتیاز و توکن می‌ده. امتحان کن!',
  ],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generateAnalysis(userId) {
  const moodHistory = await moodEngine.getMoodHistory(userId, 14);
  const secrets = await query(
    `SELECT COUNT(*) AS cnt FROM secrets WHERE user_id = :userId AND deleted_at IS NULL`,
    { userId }
  );
  const tasks = await query(
    `SELECT COUNT(*) AS cnt FROM task_completions
     WHERE user_id = :userId AND completion_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
    { userId }
  );
  const garden = await queryOne('SELECT level, experience FROM garden_states WHERE user_id = :userId', { userId });

  const moodCounts = { good: 0, normal: 0, bad: 0 };
  moodHistory.forEach((m) => {
    if (moodCounts[m.mood_slug] !== undefined) moodCounts[m.mood_slug]++;
  });

  const totalMoods = moodHistory.length || 1;
  const badRatio = moodCounts.bad / totalMoods;
  const goodRatio = moodCounts.good / totalMoods;

  let moodStatus = 'stable';
  let confidence = 0.7;
  if (badRatio > 0.5) {
    moodStatus = 'needs_attention';
    confidence = 0.85;
  } else if (goodRatio > 0.6) {
    moodStatus = 'positive';
    confidence = 0.8;
  }

  let activitySuggestion = 'تمرین تنفس ۵ دقیقه‌ای';
  let methodSuggestion = 1;
  if (badRatio > 0.4) {
    activitySuggestion = 'پادکست آرامش‌بخش و تمرین تنفس';
    methodSuggestion = 1;
  } else if (goodRatio > 0.5) {
    activitySuggestion = 'تکمیل تسک‌های روزانه و تماشای ویدیو آموزشی';
    methodSuggestion = 2;
  }

  const podcast = await queryOne(
    `SELECT id FROM podcasts WHERE mood_slug = :mood AND is_active = 1 ORDER BY RAND() LIMIT 1`,
    { mood: badRatio > 0.4 ? 'bad' : goodRatio > 0.5 ? 'good' : 'normal' }
  );

  const analysisData = {
    moodCounts,
    secretsCount: secrets[0]?.cnt || 0,
    weeklyTasks: tasks[0]?.cnt || 0,
    gardenLevel: garden?.level || 1,
    period: '14_days',
  };

  const result = await query(
    `INSERT INTO ai_analysis_reports
     (user_id, report_type, mood_status, activity_suggestion, podcast_suggestion, method_suggestion, analysis_data, confidence_score)
     VALUES (:userId, 'weekly', :moodStatus, :activity, :podcastId, :methodId, :data, :confidence)`,
    {
      userId,
      moodStatus,
      activity: activitySuggestion,
      podcastId: podcast?.id || null,
      methodId: methodSuggestion,
      data: JSON.stringify(analysisData),
      confidence,
    }
  );

  return {
    id: result.insertId,
    moodStatus,
    activitySuggestion,
    podcastSuggestion: podcast?.id,
    methodSuggestion,
    analysisData,
    confidenceScore: confidence,
  };
}

async function chat(userId, message, sessionId) {
  const lowerMsg = message.toLowerCase();

  await query(
    `INSERT INTO ai_chats (user_id, session_id, role, message) VALUES (:userId, :sessionId, 'user', :message)`,
    { userId, sessionId, message }
  );

  let response;
  if (lowerMsg.includes('سلام') || lowerMsg.includes('hello')) {
    response = pickRandom(RESPONSES.greeting);
  } else if (lowerMsg.includes('حالم بد') || lowerMsg.includes('ناراحت')) {
    response = pickRandom(RESPONSES.mood_bad);
  } else if (lowerMsg.includes('خوبم') || lowerMsg.includes('عالی')) {
    response = pickRandom(RESPONSES.mood_good);
  } else {
    const recentMood = await moodEngine.getMoodHistory(userId, 1);
    if (recentMood[0]?.mood_slug === 'bad') {
      response = pickRandom(RESPONSES.mood_bad);
    } else {
      response = pickRandom(RESPONSES.default);
    }
  }

  await query(
    `INSERT INTO ai_chats (user_id, session_id, role, message) VALUES (:userId, :sessionId, 'assistant', :message)`,
    { userId, sessionId, message: response }
  );

  return { sessionId, response };
}

module.exports = { generateAnalysis, chat };
