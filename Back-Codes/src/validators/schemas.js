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
  content: Joi.string().min(1).max(5000).required(),
  moodTag: Joi.string().valid('good', 'normal', 'bad').allow(null),
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
  nationalCode: Joi.string().max(20).allow('', null),
  phone: Joi.string().max(20).allow('', null),
  email: Joi.string().email().allow('', null),
  classId: Joi.number().integer().when('role', { is: 'student', then: Joi.required() }),
  parentId: Joi.number().integer().when('role', { is: 'student', then: Joi.optional() }),
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
  breathingSchema,
  ticketSchema,
  schoolSchema,
  userCreateSchema,
  aiChatSchema,
  parentRegisterSchema,
  addChildSchema,
};
