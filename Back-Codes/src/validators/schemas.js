const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().min(3).max(100).required(),
  password: Joi.string().min(4).max(100).required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const moodCheckinSchema = Joi.object({
  mood: Joi.string().valid('good', 'normal', 'bad').required(),
  note: Joi.string().max(500).allow('', null),
});

const secretSchema = Joi.object({
  title: Joi.string().max(200).allow('', null),
  content: Joi.string().min(1).max(5000).required(),
  moodTag: Joi.string().valid('good', 'normal', 'bad').allow(null),
  secretPassword: Joi.string().min(4).max(100).allow('', null),
});

const secretUpdateSchema = Joi.object({
  title: Joi.string().max(200).allow('', null),
  content: Joi.string().min(1).max(5000),
  moodTag: Joi.string().valid('good', 'normal', 'bad').allow(null),
  secretPassword: Joi.string().max(100).allow('', null),
  newPassword: Joi.string().max(100).allow('', null),
});

const breathingSchema = Joi.object({
  startedAt: Joi.date().iso().required(),
  endedAt: Joi.date().iso().greater(Joi.ref('startedAt')).required(),
  cycleCount: Joi.number().integer().min(0).default(0),
});

const ticketSchema = Joi.object({
  subject: Joi.string().min(3).max(200).required(),
  message: Joi.string().min(1).max(5000).required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
});

const schoolSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  code: Joi.string().min(2).max(50).required(),
  address: Joi.string().max(500).allow('', null),
  phone: Joi.string().max(20).allow('', null),
  email: Joi.string().email().allow('', null),
});

const userCreateSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  role: Joi.string().valid('school_admin', 'teacher', 'student', 'parent').required(),
  username: Joi.string().min(3).max(100).pattern(/^[a-zA-Z0-9_.]+$/).allow('', null),
  password: Joi.string().min(6).max(100).allow('', null),
  nationalCode: Joi.string().max(20).allow('', null),
  phone: Joi.string().max(20).allow('', null),
  email: Joi.string().email().allow('', null),
  classId: Joi.number().integer().allow(null),
  parentId: Joi.number().integer().allow(null),
});

const userUpdateSchema = Joi.object({
  firstName: Joi.string().min(1).max(100),
  lastName: Joi.string().min(1).max(100),
  username: Joi.string().min(3).max(100).pattern(/^[a-zA-Z0-9_.]+$/),
  nationalCode: Joi.string().max(20).allow('', null),
  phone: Joi.string().max(20).allow('', null),
  email: Joi.string().email().allow('', null),
  isActive: Joi.boolean(),
}).min(1);

const classCreateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  grade: Joi.string().min(1).max(20).required(),
  academicYear: Joi.string().min(2).max(20).required(),
});

const bookSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(2000).allow('', null),
  coverUrl: Joi.string().max(500).allow('', null),
  gameUrl: Joi.string().max(500).allow('', null),
  gameType: Joi.string().max(50).allow('', null),
  coinReward: Joi.number().integer().min(0).max(1000),
  classId: Joi.number().integer().allow(null),
  sortOrder: Joi.number().integer().allow(null),
});

const aiChatSchema = Joi.object({
  message: Joi.string().min(1).max(2000).required(),
  sessionId: Joi.string().uuid().allow(null),
});

const parentRegisterSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  username: Joi.string().min(3).max(100).pattern(/^[a-zA-Z0-9_]+$/).required(),
  password: Joi.string().min(6).max(100).required(),
  phone: Joi.string().max(20).allow('', null),
  email: Joi.string().email().allow('', null),
});

const addChildSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  nationalCode: Joi.string().max(20).allow('', null),
  phone: Joi.string().max(20).allow('', null),
});

module.exports = {
  loginSchema,
  refreshSchema,
  moodCheckinSchema,
  secretSchema,
  secretUpdateSchema,
  breathingSchema,
  ticketSchema,
  schoolSchema,
  userCreateSchema,
  userUpdateSchema,
  classCreateSchema,
  bookSchema,
  aiChatSchema,
  parentRegisterSchema,
  addChildSchema,
};
