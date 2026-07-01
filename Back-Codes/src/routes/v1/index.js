const express = require('express');
const {
  authController, moodController, podcastController, taskController,
  gardenController, aiController, schoolController, userController,
  ticketController, secretController, breathingController, reportController,
  importController, auditController, contentController, classController,
  parentController, clubController, bookController,
} = require('../../controllers');
const { authenticate } = require('../../middleware/auth');
const { authorize, authorizeAny, authorizeRoles, tenantScope } = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { excelUpload, mediaUpload } = require('../../middleware/upload');
const { PERMISSIONS } = require('../../config/permissions');
const {
  loginSchema, refreshSchema, moodCheckinSchema, aiChatSchema,
  secretSchema, secretUpdateSchema, breathingSchema, ticketSchema, schoolSchema,
  userCreateSchema, userUpdateSchema, classCreateSchema, bookSchema, bookGameSchema,
  parentRegisterSchema, addChildSchema,
} = require('../../validators/schemas');
const { authLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

// ─── Auth ───────────────────────────────────────────────────
router.post('/auth/login', authLimiter(), validate(loginSchema), authController.login);
router.post('/auth/refresh', validate(refreshSchema), authController.refresh);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authenticate, authController.me);

// ─── Parent Self-Registration (public) ──────────────────────
router.post('/auth/register/parent', authLimiter(), validate(parentRegisterSchema), parentController.register);

// ─── Parent Panel ────────────────────────────────────────────
router.get('/parent/children', authenticate, authorize(PERMISSIONS.CHILDREN_MANAGE), parentController.listChildren);
router.post('/parent/children', authenticate, authorize(PERMISSIONS.CHILDREN_MANAGE), validate(addChildSchema), parentController.addChild);
router.get('/parent/children/:childId/report', authenticate, authorize(PERMISSIONS.CHILDREN_REPORT), parentController.getChildReport);
router.delete('/parent/children/:childId', authenticate, authorize(PERMISSIONS.CHILDREN_MANAGE), parentController.removeChild);

// ─── Schools (Team Admin) ───────────────────────────────────
router.get('/schools', authenticate, authorize(PERMISSIONS.SCHOOLS_READ), schoolController.list);
router.post('/schools', authenticate, authorize(PERMISSIONS.SCHOOLS_WRITE), validate(schoolSchema), schoolController.create);
router.get('/schools/:id', authenticate, authorize(PERMISSIONS.SCHOOLS_READ), schoolController.get);
router.put('/schools/:id', authenticate, authorize(PERMISSIONS.SCHOOLS_WRITE), schoolController.update);
router.delete('/schools/:id', authenticate, authorize(PERMISSIONS.SCHOOLS_DELETE), schoolController.remove);

// ─── Users ──────────────────────────────────────────────────
router.get('/users', authenticate, authorize(PERMISSIONS.USERS_READ), userController.listAll);
router.get('/schools/:schoolId/users', authenticate, authorize(PERMISSIONS.USERS_READ), tenantScope, userController.list);
router.post('/schools/:schoolId/users', authenticate, authorize(PERMISSIONS.USERS_WRITE), validate(userCreateSchema), userController.create);
router.get('/users/:id', authenticate, authorize(PERMISSIONS.USERS_READ), userController.get);
router.put('/users/:id', authenticate, authorize(PERMISSIONS.USERS_WRITE), validate(userUpdateSchema), userController.update);
router.get('/users/:id/password', authenticate, authorize(PERMISSIONS.USERS_VIEW_PASSWORD), userController.getPassword);
router.post('/users/:id/reset-password', authenticate, authorize(PERMISSIONS.USERS_RESET_PASSWORD), userController.resetPassword);
router.delete('/users/:id', authenticate, authorize(PERMISSIONS.USERS_DELETE), userController.softDelete);

// ─── Classes ────────────────────────────────────────────────
// مسیرهای ثابت قبل از :id
router.get('/classes/my', authenticate, authorize(PERMISSIONS.BOOKS_READ), bookController.myClasses);
router.get('/schools/:schoolId/classes', authenticate, authorize(PERMISSIONS.CLASSES_READ), classController.list);
router.post('/schools/:schoolId/classes', authenticate, authorize(PERMISSIONS.CLASSES_WRITE), validate(classCreateSchema), classController.create);
router.get('/classes/:id', authenticate, authorize(PERMISSIONS.CLASSES_READ), classController.get);

// مدیریت دانش‌آموز و معلم در کلاس
router.post('/classes/:id/students', authenticate, authorize(PERMISSIONS.CLASSES_WRITE), classController.addStudent);
router.delete('/classes/:id/students/:studentId', authenticate, authorize(PERMISSIONS.CLASSES_WRITE), classController.removeStudent);
router.post('/classes/:id/teachers', authenticate, authorize(PERMISSIONS.CLASSES_WRITE), classController.addTeacher);
router.delete('/classes/:id/teachers/:teacherId', authenticate, authorize(PERMISSIONS.CLASSES_WRITE), classController.removeTeacher);

// ─── Books & Games ──────────────────────────────────────────
router.get('/books/my', authenticate, authorize(PERMISSIONS.BOOKS_READ), bookController.myBooks);
router.get('/books', authenticate, authorize(PERMISSIONS.BOOKS_MANAGE), bookController.list);
router.post('/books', authenticate, authorize(PERMISSIONS.BOOKS_MANAGE), validate(bookSchema), bookController.create);
router.get('/books/:id', authenticate, authorize(PERMISSIONS.BOOKS_READ), bookController.get);
router.put('/books/:id', authenticate, authorize(PERMISSIONS.BOOKS_MANAGE), validate(bookSchema), bookController.update);
router.delete('/books/:id', authenticate, authorize(PERMISSIONS.BOOKS_MANAGE), bookController.remove);

// لیست بازی‌های یک کتاب + مدیریت بازی‌ها (ادمین)
router.get('/books/:id/games', authenticate, authorize(PERMISSIONS.BOOKS_READ), bookController.games);
router.post('/books/:id/games', authenticate, authorize(PERMISSIONS.BOOKS_MANAGE), validate(bookGameSchema), bookController.createGame);
router.put('/games/:gameId', authenticate, authorize(PERMISSIONS.BOOKS_MANAGE), validate(bookGameSchema), bookController.updateGame);
router.delete('/games/:gameId', authenticate, authorize(PERMISSIONS.BOOKS_MANAGE), bookController.removeGame);

// پخش و تکمیل یک بازی مشخص
router.get('/games/:gameId', authenticate, authorize(PERMISSIONS.BOOKS_READ), bookController.getGame);
router.post('/games/:gameId/complete', authenticate, authorize(PERMISSIONS.BOOKS_READ), bookController.completeGame);

// ─── Content: Videos (Loko TV) ──────────────────────────────
router.get('/videos/latest-by-category', authenticate, authorize(PERMISSIONS.CONTENT_READ), contentController.latestVideosByCategory);
router.get('/videos', authenticate, authorize(PERMISSIONS.CONTENT_READ), contentController.listVideos);
router.get('/videos/:id', authenticate, authorize(PERMISSIONS.CONTENT_READ), contentController.getVideo);
router.post('/videos', authenticate, authorize(PERMISSIONS.CONTENT_WRITE), mediaUpload.single('file'), contentController.uploadVideo);
router.put('/videos/:id', authenticate, authorize(PERMISSIONS.CONTENT_WRITE), contentController.updateVideo);
router.delete('/videos/:id', authenticate, authorize(PERMISSIONS.CONTENT_DELETE), contentController.deleteVideo);
router.get('/content/categories/:type', authenticate, authorize(PERMISSIONS.CONTENT_READ), contentController.listCategories);
router.post('/content/interactions', authenticate, authorize(PERMISSIONS.CONTENT_READ), contentController.recordInteraction);

// ─── Content: Podcasts (Loko Podcast) ───────────────────────
router.get('/podcasts/daily', authenticate, authorize(PERMISSIONS.CONTENT_READ), podcastController.daily);
router.get('/podcasts', authenticate, authorize(PERMISSIONS.CONTENT_READ), contentController.listPodcasts);
router.post('/podcasts', authenticate, authorize(PERMISSIONS.CONTENT_WRITE), mediaUpload.single('file'), contentController.uploadPodcast);
router.put('/podcasts/:id', authenticate, authorize(PERMISSIONS.CONTENT_WRITE), contentController.updatePodcast);
router.delete('/podcasts/:id', authenticate, authorize(PERMISSIONS.CONTENT_DELETE), contentController.deletePodcast);

// ─── Excel Import ───────────────────────────────────────────
router.post('/import/excel', authenticate, authorize(PERMISSIONS.IMPORT_EXCEL), excelUpload.single('excel'), importController.uploadExcel);

// ─── Mood (Loko Health) ─────────────────────────────────────
router.get('/mood/prompt', authenticate, authorize(PERMISSIONS.MOOD_READ_OWN), moodController.getPromptStatus);
router.post('/mood/checkin', authenticate, authorize(PERMISSIONS.MOOD_WRITE), validate(moodCheckinSchema), moodController.checkin);
router.get('/mood/history', authenticate, authorize(PERMISSIONS.MOOD_READ_OWN), moodController.history);

// ─── Breathing ──────────────────────────────────────────────
router.get('/breathing/status', authenticate, authorize(PERMISSIONS.BREATHING_WRITE), breathingController.status);
router.post('/breathing/sessions', authenticate, authorize(PERMISSIONS.BREATHING_WRITE), validate(breathingSchema), breathingController.record);
router.get('/breathing/sessions', authenticate, authorize(PERMISSIONS.BREATHING_WRITE), breathingController.history);

// ─── Secrets ────────────────────────────────────────────────
router.get('/secrets', authenticate, authorize(PERMISSIONS.SECRETS_MANAGE_OWN), secretController.list);
router.post('/secrets', authenticate, authorize(PERMISSIONS.SECRETS_MANAGE_OWN), validate(secretSchema), secretController.create);
router.post('/secrets/:id/unlock', authenticate, authorize(PERMISSIONS.SECRETS_MANAGE_OWN), secretController.unlock);
router.put('/secrets/:id', authenticate, authorize(PERMISSIONS.SECRETS_MANAGE_OWN), validate(secretUpdateSchema), secretController.update);
router.delete('/secrets/:id', authenticate, authorize(PERMISSIONS.SECRETS_MANAGE_OWN), secretController.remove);

// ─── Tasks (Loko Club) ──────────────────────────────────────
router.get('/tasks/daily', authenticate, authorize(PERMISSIONS.TASKS_COMPLETE), taskController.listDaily);
router.post('/tasks/:taskId/complete', authenticate, authorize(PERMISSIONS.TASKS_COMPLETE), taskController.complete);

// ─── Loko Club (coins, rewards, badges, streak) ─────────────
router.get('/club/summary', authenticate, authorize(PERMISSIONS.CLUB_ACCESS), clubController.summary);
router.get('/club/coins', authenticate, authorize(PERMISSIONS.CLUB_ACCESS), clubController.coins);
router.get('/club/rewards', authenticate, authorize(PERMISSIONS.CLUB_ACCESS), clubController.rewards);
router.post('/club/rewards/:rewardId/redeem', authenticate, authorize(PERMISSIONS.CLUB_ACCESS), clubController.redeem);
router.get('/club/badges', authenticate, authorize(PERMISSIONS.CLUB_ACCESS), clubController.badges);
router.get('/club/streak', authenticate, authorize(PERMISSIONS.CLUB_ACCESS), clubController.streak);

// ─── Garden ─────────────────────────────────────────────────
router.get('/garden', authenticate, authorize(PERMISSIONS.GARDEN_MANAGE_OWN), gardenController.getState);
router.get('/garden/wellbeing', authenticate, authorize(PERMISSIONS.GARDEN_MANAGE_OWN), gardenController.wellbeing);

// ─── AI ─────────────────────────────────────────────────────
router.post('/ai/analyze', authenticate, authorize(PERMISSIONS.AI_CHAT), aiController.analyze);
router.post('/ai/chat', authenticate, authorize(PERMISSIONS.AI_CHAT), validate(aiChatSchema), aiController.chat);

// ─── Tickets ────────────────────────────────────────────────
router.get('/tickets', authenticate, authorizeAny(PERMISSIONS.TICKETS_READ_OWN, PERMISSIONS.TICKETS_READ_ALL), ticketController.list);
router.post('/tickets', authenticate, authorize(PERMISSIONS.TICKETS_CREATE), validate(ticketSchema), ticketController.create);
router.get('/tickets/:id', authenticate, authorizeAny(PERMISSIONS.TICKETS_READ_OWN, PERMISSIONS.TICKETS_READ_ALL), ticketController.get);
router.post('/tickets/:id/reply', authenticate, ticketController.reply);
router.patch('/tickets/:id/status', authenticate, authorize(PERMISSIONS.TICKETS_RESPOND), ticketController.updateStatus);

// ─── Reports ────────────────────────────────────────────────
router.get('/reports/global', authenticate, authorize(PERMISSIONS.REPORTS_GLOBAL), reportController.global);
router.get('/reports/school/:schoolId?', authenticate, authorize(PERMISSIONS.REPORTS_SCHOOL), reportController.school);
router.get('/reports/class/:classId', authenticate, authorize(PERMISSIONS.REPORTS_CLASS), reportController.classReport);
router.get('/reports/child/:childId', authenticate, authorize(PERMISSIONS.REPORTS_CHILD), reportController.child);

// ─── Audit Logs ─────────────────────────────────────────────
router.get('/audit-logs', authenticate, authorize(PERMISSIONS.AUDIT_READ), auditController.list);

module.exports = router;
