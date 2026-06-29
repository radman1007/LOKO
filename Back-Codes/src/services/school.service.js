const { query, queryOne } = require('../database/connection');
const { NotFoundError, ConflictError } = require('../utils/errors');
const auditService = require('./audit.service');

async function list({ page = 1, limit = 20, search = null } = {}) {
  const offset = (page - 1) * limit;
  let where = 'WHERE deleted_at IS NULL';
  const params = { limit, offset };

  if (search) {
    where += ' AND (name LIKE :search OR code LIKE :search)';
    params.search = `%${search}%`;
  }

  const schools = await query(
    `SELECT id, name, code, address, phone, email, is_active, created_at
     FROM schools ${where} ORDER BY created_at DESC LIMIT :limit OFFSET :offset`,
    params
  );
  const [countRow] = await query(`SELECT COUNT(*) AS total FROM schools ${where}`, params);
  return { schools, total: countRow.total, page, limit };
}

async function getById(id) {
  const school = await queryOne(
    'SELECT * FROM schools WHERE id = :id AND deleted_at IS NULL',
    { id }
  );
  if (!school) throw new NotFoundError('School');
  return school;
}

async function create(data, actorId) {
  const existing = await queryOne('SELECT id FROM schools WHERE code = :code', { code: data.code });
  if (existing) throw new ConflictError('School code already exists');

  const result = await query(
    `INSERT INTO schools (name, code, address, phone, email)
     VALUES (:name, :code, :address, :phone, :email)`,
    data
  );

  await auditService.log({
    userId: actorId,
    action: 'school.create',
    entityType: 'school',
    entityId: result.insertId,
    newValues: data,
  });

  return getById(result.insertId);
}

async function update(id, data, actorId) {
  const old = await getById(id);
  await query(
    `UPDATE schools SET name = :name, address = :address, phone = :phone, email = :email, updated_at = NOW()
     WHERE id = :id`,
    { ...data, id }
  );

  await auditService.log({
    userId: actorId,
    schoolId: id,
    action: 'school.update',
    entityType: 'school',
    entityId: id,
    oldValues: old,
    newValues: data,
  });

  return getById(id);
}

async function softDelete(id, actorId) {
  await getById(id);
  await query('UPDATE schools SET deleted_at = NOW(), is_active = 0 WHERE id = :id', { id });
  await auditService.log({
    userId: actorId,
    schoolId: id,
    action: 'school.delete',
    entityType: 'school',
    entityId: id,
  });
}

module.exports = { list, getById, create, update, softDelete };
