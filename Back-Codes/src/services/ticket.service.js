const { query, queryOne } = require('../database/connection');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const auditService = require('./audit.service');

async function create({ subject, message, priority }, user, schoolId) {
  const result = await query(
    `INSERT INTO tickets (school_id, created_by, subject, priority, status)
     VALUES (:schoolId, :userId, :subject, :priority, 'open')`,
    { schoolId, userId: user.id, subject, priority: priority || 'medium' }
  );

  await query(
    `INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES (:ticketId, :senderId, :message)`,
    { ticketId: result.insertId, senderId: user.id, message }
  );

  return getById(result.insertId, user);
}

async function getById(id, user) {
  const ticket = await queryOne(
    `SELECT t.*, u.first_name AS creator_first_name, u.last_name AS creator_last_name
     FROM tickets t JOIN users u ON u.id = t.created_by
     WHERE t.id = :id AND t.deleted_at IS NULL`,
    { id }
  );
  if (!ticket) throw new NotFoundError('Ticket');

  if (user.role !== 'team_admin' && ticket.created_by !== user.id && ticket.school_id !== user.schoolId) {
    throw new ForbiddenError('Access denied');
  }

  const messages = await query(
    `SELECT tm.*, u.first_name, u.last_name, r.slug AS sender_role
     FROM ticket_messages tm
     JOIN users u ON u.id = tm.sender_id
     JOIN roles r ON r.id = u.role_id
     WHERE tm.ticket_id = :id ORDER BY tm.created_at ASC`,
    { id }
  );

  return { ...ticket, messages };
}

async function list(user, { status = null, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  let where = 'WHERE t.deleted_at IS NULL';
  const params = { limit, offset };

  if (user.role === 'team_admin') {
    // all tickets
  } else if (user.role === 'school_admin') {
    where += ' AND t.school_id = :schoolId';
    params.schoolId = user.schoolId;
  } else {
    where += ' AND t.created_by = :userId';
    params.userId = user.id;
  }

  if (status) {
    where += ' AND t.status = :status';
    params.status = status;
  }

  const tickets = await query(
    `SELECT t.*, u.first_name AS creator_first_name, u.last_name AS creator_last_name
     FROM tickets t JOIN users u ON u.id = t.created_by
     ${where} ORDER BY t.created_at DESC LIMIT :limit OFFSET :offset`,
    params
  );

  return { tickets, page, limit };
}

async function reply(ticketId, message, user) {
  const ticket = await getById(ticketId, user);

  if (user.role !== 'team_admin' && ticket.created_by !== user.id) {
    throw new ForbiddenError('Cannot reply to this ticket');
  }

  await query(
    `INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES (:ticketId, :senderId, :message)`,
    { ticketId, senderId: user.id, message }
  );

  const newStatus = user.role === 'team_admin' ? 'answered' : 'open';
  await query(
    'UPDATE tickets SET status = :status, updated_at = NOW() WHERE id = :id',
    { status: newStatus, id: ticketId }
  );

  await auditService.log({
    userId: user.id,
    schoolId: ticket.school_id,
    action: 'ticket.reply',
    entityType: 'ticket',
    entityId: ticketId,
  });

  return getById(ticketId, user);
}

async function updateStatus(ticketId, status, user) {
  if (user.role !== 'team_admin') throw new ForbiddenError('Only team admin can update status');
  await getById(ticketId, user);
  await query('UPDATE tickets SET status = :status, updated_at = NOW() WHERE id = :id', { status, id: ticketId });
  return getById(ticketId, user);
}

module.exports = { create, getById, list, reply, updateStatus };
