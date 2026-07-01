const authService = require('../services/auth.service');
const parentService = require('../services/parent.service');
const moodEngine = require('../engines/mood.engine');
const podcastEngine = require('../engines/podcast.engine');
const taskEngine = require('../engines/task.engine');
const gardenEngine = require('../engines/garden.engine');
const aiEngine = require('../engines/ai.engine');
const schoolService = require('../services/school.service');
const userService = require('../services/user.service');
const ticketService = require('../services/ticket.service');
const secretService = require('../services/secret.service');
const reportService = require('../services/report.service');
const excelImportService = require('../services/excelImport.service');
const contentService = require('../services/content.service');
const classService = require('../services/class.service');
const bookService = require('../services/book.service');
const clubService = require('../services/club.service');
const { query } = require('../database/connection');
const { success, created } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');
const { v4: uuidv4 } = require('uuid');

const authController = {
  async login(req, res, next) {
    try {
      const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await authService.login(req.body.username, req.body.password, meta);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await authService.refresh(req.body.refreshToken, meta);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      await authService.logout(req.body.jti);
      return success(res, { message: 'Logged out' });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res) {
    return success(res, req.user);
  },
};

const moodController = {
  async getPromptStatus(req, res, next) {
    try {
      const status = await moodEngine.getMoodPromptStatus(req.user.id);
      return success(res, status);
    } catch (err) {
      next(err);
    }
  },

  async checkin(req, res, next) {
    try {
      const result = await moodEngine.recordCheckin(req.user.id, req.body.mood, req.body.note);
      await gardenEngine.recordActivity(req.user.id, 'mood_checkin');
      return created(res, result);
    } catch (err) {
      next(err);
    }
  },

  async history(req, res, next) {
    try {
      const days = parseInt(req.query.days, 10) || 30;
      const history = await moodEngine.getMoodHistory(req.user.id, days);
      return success(res, history);
    } catch (err) {
      next(err);
    }
  },
};

const podcastController = {
  async daily(req, res, next) {
    try {
      const result = await podcastEngine.getDailyPodcast(req.user.id);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },
};

const taskController = {
  async listDaily(req, res, next) {
    try {
      const tasks = await taskEngine.getDailyTasks(req.user.id);
      return success(res, tasks);
    } catch (err) {
      next(err);
    }
  },
  async complete(req, res, next) {
    try {
      const result = await taskEngine.completeTask(req.user.id, req.params.taskId);
      await gardenEngine.recordActivity(req.user.id, 'task_complete');
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },
};

const gardenController = {
  async getState(req, res, next) {
    try {
      const state = await gardenEngine.getGardenState(req.user.id);
      return success(res, state);
    } catch (err) {
      next(err);
    }
  },
  async wellbeing(req, res, next) {
    try {
      const result = await gardenEngine.getWellbeing(req.user.id);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },
};

const BREATHING_INTERVAL_HOURS = 4;
const clubController = {
  async summary(req, res, next) {
    try { return success(res, await clubService.getSummary(req.user.id)); } catch (err) { next(err); }
  },
  async coins(req, res, next) {
    try { return success(res, await clubService.getCoins(req.user.id)); } catch (err) { next(err); }
  },
  async rewards(req, res, next) {
    try { return success(res, await clubService.listRewards(req.user.id)); } catch (err) { next(err); }
  },
  async redeem(req, res, next) {
    try { return success(res, await clubService.redeemReward(req.user.id, req.params.rewardId)); } catch (err) { next(err); }
  },
  async badges(req, res, next) {
    try { return success(res, await clubService.getBadges(req.user.id)); } catch (err) { next(err); }
  },
  async streak(req, res, next) {
    try { return success(res, await clubService.getStreak(req.user.id)); } catch (err) { next(err); }
  },
};

const bookController = {
  async myBooks(req, res, next) {
    try { return success(res, await bookService.getMyBooks(req.user.id)); } catch (err) { next(err); }
  },
  async myClasses(req, res, next) {
    try { return success(res, await bookService.getMyClasses(req.user.id)); } catch (err) { next(err); }
  },
  async get(req, res, next) {
    try { return success(res, await bookService.getBook(req.params.id)); } catch (err) { next(err); }
  },
  // لیست بازی‌های یک کتاب (با وضعیت تکمیل کاربر)
  async games(req, res, next) {
    try { return success(res, await bookService.getBookGames(req.params.id, req.user.id)); } catch (err) { next(err); }
  },
  // اطلاعات یک بازی برای پخش
  async getGame(req, res, next) {
    try { return success(res, await bookService.getGame(req.params.gameId)); } catch (err) { next(err); }
  },
  async completeGame(req, res, next) {
    try {
      const result = await bookService.completeGame(req.user.id, req.params.gameId, { score: req.body.score });
      return success(res, result);
    } catch (err) { next(err); }
  },
  // مدیریت (ادمین)
  async list(req, res, next) {
    try { return success(res, await bookService.listAll({ classId: req.query.classId })); } catch (err) { next(err); }
  },
  async create(req, res, next) {
    try { return created(res, await bookService.create(req.body)); } catch (err) { next(err); }
  },
  async update(req, res, next) {
    try { return success(res, await bookService.update(req.params.id, req.body)); } catch (err) { next(err); }
  },
  async remove(req, res, next) {
    try { return success(res, await bookService.remove(req.params.id)); } catch (err) { next(err); }
  },
  // مدیریت بازی‌های کتاب (ادمین)
  async createGame(req, res, next) {
    try { return created(res, await bookService.createGame(req.params.id, req.body)); } catch (err) { next(err); }
  },
  async updateGame(req, res, next) {
    try { return success(res, await bookService.updateGame(req.params.gameId, req.body)); } catch (err) { next(err); }
  },
  async removeGame(req, res, next) {
    try { return success(res, await bookService.removeGame(req.params.gameId)); } catch (err) { next(err); }
  },
};

const aiController = {
  async analyze(req, res, next) {
    try {
      const report = await aiEngine.generateAnalysis(req.user.id);
      return created(res, report);
    } catch (err) {
      next(err);
    }
  },

  async chat(req, res, next) {
    try {
      const sessionId = req.body.sessionId || uuidv4();
      const result = await aiEngine.chat(req.user.id, req.body.message, sessionId);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },
};

const schoolController = {
  async list(req, res, next) {
    try {
      const result = await schoolService.list({
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 20,
        search: req.query.search,
      });
      return success(res, result.schools, 200, { pagination: { total: result.total, page: result.page, limit: result.limit } });
    } catch (err) { next(err); }
  },
  async get(req, res, next) {
    try { return success(res, await schoolService.getById(req.params.id)); } catch (err) { next(err); }
  },
  async create(req, res, next) {
    try { return created(res, await schoolService.create(req.body, req.user.id)); } catch (err) { next(err); }
  },
  async update(req, res, next) {
    try { return success(res, await schoolService.update(req.params.id, req.body, req.user.id)); } catch (err) { next(err); }
  },
  async remove(req, res, next) {
    try { await schoolService.softDelete(req.params.id, req.user.id); return success(res, { deleted: true }); } catch (err) { next(err); }
  },
};

const userController = {
  async list(req, res, next) {
    try {
      const schoolId = req.user.role === 'team_admin' ? req.params.schoolId : req.user.schoolId;
      const result = await userService.list(schoolId, {
        role: req.query.role,
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 20,
      });
      return success(res, result.users, 200, { pagination: { total: result.total, page: result.page, limit: result.limit } });
    } catch (err) { next(err); }
  },
  // لیست همه‌ی کاربرها: team_admin کل سیستم، سایرین محدود به مدرسه‌ی خود
  async listAll(req, res, next) {
    try {
      const opts = {
        role: req.query.role,
        search: req.query.search,
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 500,
      };
      const result = req.user.role === 'team_admin'
        ? await userService.listAll(opts)
        : await userService.list(req.user.schoolId, opts);
      return success(res, result.users, 200, { pagination: { total: result.total, page: result.page, limit: result.limit } });
    } catch (err) { next(err); }
  },
  async get(req, res, next) {
    try {
      const schoolId = req.user.role === 'team_admin' ? null : req.user.schoolId;
      return success(res, await userService.getById(req.params.id, schoolId));
    } catch (err) { next(err); }
  },
  async create(req, res, next) {
    try {
      const schoolId = req.params.schoolId || req.user.schoolId;
      return created(res, await userService.create(req.body, schoolId, req.user.id));
    } catch (err) { next(err); }
  },
  async update(req, res, next) {
    try {
      const schoolId = req.user.role === 'team_admin' ? null : req.user.schoolId;
      return success(res, await userService.update(req.params.id, req.body, schoolId, req.user.id));
    } catch (err) { next(err); }
  },
  async getPassword(req, res, next) {
    try {
      const schoolId = req.user.role === 'team_admin' ? null : req.user.schoolId;
      return success(res, await userService.getPassword(req.params.id, schoolId, req.user.role));
    } catch (err) { next(err); }
  },
  async softDelete(req, res, next) {
    try {
      await userService.softDeleteStudent(req.params.id, req.user.schoolId, req.user.id);
      return success(res, { deleted: true });
    } catch (err) { next(err); }
  },
  async resetPassword(req, res, next) {
    try {
      const schoolId = req.user.role === 'team_admin' ? null : req.user.schoolId;
      return success(res, await authService.resetPassword(req.user.id, req.params.id, schoolId));
    } catch (err) { next(err); }
  },
};

const ticketController = {
  async list(req, res, next) {
    try { return success(res, await ticketService.list(req.user, { status: req.query.status })); } catch (err) { next(err); }
  },
  async get(req, res, next) {
    try { return success(res, await ticketService.getById(req.params.id, req.user)); } catch (err) { next(err); }
  },
  async create(req, res, next) {
    try {
      return created(res, await ticketService.create(req.body, req.user, req.user.schoolId));
    } catch (err) { next(err); }
  },
  async reply(req, res, next) {
    try { return success(res, await ticketService.reply(req.params.id, req.body.message, req.user)); } catch (err) { next(err); }
  },
  async updateStatus(req, res, next) {
    try { return success(res, await ticketService.updateStatus(req.params.id, req.body.status, req.user)); } catch (err) { next(err); }
  },
};

const secretController = {
  async list(req, res, next) {
    try { return success(res, await secretService.list(req.user.id)); } catch (err) { next(err); }
  },
  async create(req, res, next) {
    try { return created(res, await secretService.create(req.user.id, req.body)); } catch (err) { next(err); }
  },
  async unlock(req, res, next) {
    try { return success(res, await secretService.unlock(req.user.id, req.params.id, req.body.secretPassword)); } catch (err) { next(err); }
  },
  async update(req, res, next) {
    try { return success(res, await secretService.update(req.user.id, req.params.id, req.body)); } catch (err) { next(err); }
  },
  async remove(req, res, next) {
    try { return success(res, await secretService.remove(req.user.id, req.params.id, req.body.secretPassword)); } catch (err) { next(err); }
  },
};

const breathingController = {
  async record(req, res, next) {
    try {
      const started = new Date(req.body.startedAt);
      const ended = new Date(req.body.endedAt);
      const duration = Math.floor((ended - started) / 1000);
      const result = await query(
        `INSERT INTO breathing_sessions (user_id, started_at, ended_at, duration_seconds, cycle_count)
         VALUES (:userId, :started, :ended, :duration, :cycles)`,
        { userId: req.user.id, started, ended, duration, cycles: req.body.cycleCount || 0 }
      );
      await gardenEngine.recordActivity(req.user.id, 'breathing_session');
      return created(res, { id: result.insertId, durationSeconds: duration });
    } catch (err) { next(err); }
  },
  async history(req, res, next) {
    try {
      const sessions = await query(
        'SELECT * FROM breathing_sessions WHERE user_id = :userId ORDER BY started_at DESC LIMIT 50',
        { userId: req.user.id }
      );
      return success(res, sessions);
    } catch (err) { next(err); }
  },
  // وضعیت در دسترس بودن تمرین (هر ۴ ساعت یکبار)
  async status(req, res, next) {
    try {
      const last = await query(
        'SELECT created_at FROM breathing_sessions WHERE user_id = :userId ORDER BY created_at DESC LIMIT 1',
        { userId: req.user.id }
      );
      if (last.length === 0) {
        return success(res, { available: true, nextAvailableAt: null, lastSessionAt: null });
      }
      const lastAt = new Date(last[0].created_at).getTime();
      const nextAt = lastAt + BREATHING_INTERVAL_HOURS * 60 * 60 * 1000;
      const available = Date.now() >= nextAt;
      return success(res, {
        available,
        lastSessionAt: last[0].created_at,
        nextAvailableAt: new Date(nextAt).toISOString(),
        intervalHours: BREATHING_INTERVAL_HOURS,
      });
    } catch (err) { next(err); }
  },
};

const reportController = {
  async global(req, res, next) {
    try { return success(res, await reportService.getGlobalStats()); } catch (err) { next(err); }
  },
  async school(req, res, next) {
    try {
      const schoolId = req.user.role === 'team_admin' ? req.params.schoolId : req.user.schoolId;
      return success(res, await reportService.getSchoolStats(schoolId));
    } catch (err) { next(err); }
  },
  async classReport(req, res, next) {
    try { return success(res, await reportService.getClassReport(req.user.id, req.params.classId)); } catch (err) { next(err); }
  },
  async child(req, res, next) {
    try { return success(res, await reportService.getChildReport(req.user.id, req.params.childId)); } catch (err) { next(err); }
  },
};

const importController = {
  async uploadExcel(req, res, next) {
    try {
      if (!req.file) return next(new NotFoundError('File'));
      const schoolId = req.user.role === 'team_admin' ? req.body.schoolId : req.user.schoolId;
      const result = await excelImportService.processExcelImport(req.file.path, schoolId, req.user.id);
      return success(res, result);
    } catch (err) { next(err); }
  },
};

const auditController = {
  async list(req, res, next) {
    try {
      const logs = await query(
        `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT :limit OFFSET :offset`,
        { limit: parseInt(req.query.limit, 10) || 50, offset: ((parseInt(req.query.page, 10) || 1) - 1) * 50 }
      );
      return success(res, logs);
    } catch (err) { next(err); }
  },
};

const contentController = {
  async listVideos(req, res, next) {
    try {
      const result = await contentService.listVideos({
        categoryId: req.query.categoryId,
        search: req.query.search,
        page: parseInt(req.query.page, 10) || 1,
      });
      return success(res, result.videos, 200, { pagination: { page: result.page, limit: result.limit } });
    } catch (err) { next(err); }
  },
  async listPodcasts(req, res, next) {
    try {
      const result = await contentService.listPodcasts({
        categoryId: req.query.categoryId,
        moodSlug: req.query.moodSlug,
        page: parseInt(req.query.page, 10) || 1,
      });
      return success(res, result.podcasts, 200, { pagination: { page: result.page, limit: result.limit } });
    } catch (err) { next(err); }
  },
  async getVideo(req, res, next) {
    try { return success(res, await contentService.getVideo(req.params.id)); } catch (err) { next(err); }
  },
  async latestVideosByCategory(req, res, next) {
    try {
      const perCategory = parseInt(req.query.perCategory, 10) || 6;
      return success(res, await contentService.getLatestVideosByCategory(perCategory));
    } catch (err) { next(err); }
  },
  async updateVideo(req, res, next) {
    try { return success(res, await contentService.updateVideo(req.params.id, req.body)); } catch (err) { next(err); }
  },
  async deleteVideo(req, res, next) {
    try { return success(res, await contentService.deleteVideo(req.params.id)); } catch (err) { next(err); }
  },
  async updatePodcast(req, res, next) {
    try { return success(res, await contentService.updatePodcast(req.params.id, req.body)); } catch (err) { next(err); }
  },
  async deletePodcast(req, res, next) {
    try { return success(res, await contentService.deletePodcast(req.params.id)); } catch (err) { next(err); }
  },
  async uploadVideo(req, res, next) {
    try {
      const fileUrl = req.file ? `/uploads/videos/${req.file.filename}` : (req.body.fileUrl || null);
      const video = await contentService.createVideo({
        title: req.body.title,
        description: req.body.description,
        categoryId: req.body.categoryId,
        fileUrl,
        thumbnailUrl: req.body.thumbnailUrl,
        durationSeconds: req.body.durationSeconds,
      }, req.user.id);
      return created(res, video);
    } catch (err) { next(err); }
  },
  async uploadPodcast(req, res, next) {
    try {
      const fileUrl = req.file ? `/uploads/podcasts/${req.file.filename}` : (req.body.fileUrl || null);
      const podcast = await contentService.createPodcast({
        title: req.body.title,
        description: req.body.description,
        categoryId: req.body.categoryId,
        moodSlug: req.body.moodSlug,
        fileUrl,
        coverUrl: req.body.coverUrl,
        durationSeconds: req.body.durationSeconds,
      }, req.user.id);
      return created(res, podcast);
    } catch (err) { next(err); }
  },
  async recordInteraction(req, res, next) {
    try {
      return success(res, await contentService.recordInteraction(req.user.id, req.body));
    } catch (err) { next(err); }
  },
  async listCategories(req, res, next) {
    try {
      return success(res, await contentService.listCategories(req.params.type));
    } catch (err) { next(err); }
  },
};

const classController = {
  async list(req, res, next) {
    try {
      const schoolId = req.user.role === 'team_admin' ? req.params.schoolId : req.user.schoolId;
      return success(res, await classService.list(schoolId));
    } catch (err) { 
      next(err); 
    }
  },

  async get(req, res, next) {
    try {
      const schoolId = req.user.role === 'team_admin' ? null : req.user.schoolId;
      return success(res, await classService.getById(req.params.id, schoolId));
    } catch (err) { 
      next(err); 
    }
  },

  async create(req, res, next) {
    try {
      const schoolId = req.params.schoolId || req.user.schoolId;
      return created(res, await classService.create(req.body, schoolId));
    } catch (err) { 
      next(err); 
    }
  },

  async addStudent(req, res, next) {
    try {
      const result = await classService.addStudent(
        req.params.id,
        req.body.studentId,
        req.user.id
      );
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async addTeacher(req, res, next) {
    try {
      const result = await classService.addTeacher(
        req.params.id,
        req.body.teacherId,
        req.body.isPrimary || false,
        req.user.id
      );
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async removeStudent(req, res, next) {
    try {
      const result = await classService.removeStudent(req.params.id, req.params.studentId, req.user.id);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async removeTeacher(req, res, next) {
    try {
      const result = await classService.removeTeacher(req.params.id, req.params.teacherId, req.user.id);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },
};

const parentController = {
  async register(req, res, next) {
    try {
      const result = await parentService.register(req.body);
      return created(res, result);
    } catch (err) { next(err); }
  },
  async addChild(req, res, next) {
    try {
      const result = await parentService.addChild(req.user.id, req.body);
      return created(res, result);
    } catch (err) { next(err); }
  },
  async listChildren(req, res, next) {
    try {
      return success(res, await parentService.listChildren(req.user.id));
    } catch (err) { next(err); }
  },
  async getChildReport(req, res, next) {
    try {
      return success(res, await parentService.getChildReport(req.user.id, req.params.childId));
    } catch (err) { next(err); }
  },
  async removeChild(req, res, next) {
    try {
      return success(res, await parentService.removeChild(req.user.id, req.params.childId));
    } catch (err) { next(err); }
  },
};

module.exports = {
  authController,
  moodController,
  podcastController,
  taskController,
  gardenController,
  aiController,
  schoolController,
  userController,
  ticketController,
  secretController,
  breathingController,
  reportController,
  importController,
  auditController,
  contentController,
  classController,
  parentController,
  clubController,
  bookController,
};