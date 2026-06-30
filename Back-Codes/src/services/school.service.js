const { query, queryOne } = require('../database/connection');
const { NotFoundError, ConflictError } = require('../utils/errors');
const auditService = require('./audit.service');

async function list({ page = 1, limit = 20, search = null } = {}) {
  const offset = (page - 1) * limit;
  let where = 'WHERE deleted_at IS NULL';
  const params = [];

  if (search) {
    where += ' AND (name LIKE ? OR code LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const schools = await query(
    `SELECT 
      id, 
      name, 
      code, 
      address, 
      phone, 
      email, 
      logo_url, 
      is_active, 
      settings, 
      deleted_at, 
      created_at, 
      updated_at
     FROM schools ${where} 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  
  const [countRow] = await query(
    `SELECT COUNT(*) AS total FROM schools ${where}`,
    params
  );
  
  return { schools, total: countRow?.total || 0, page, limit };
}

async function getById(id) {
  const school = await queryOne(
    'SELECT * FROM schools WHERE id = ? AND deleted_at IS NULL',
    [id]
  );
  if (!school) throw new NotFoundError('School');
  return school;
}

async function create(data, actorId) {
  const existing = await queryOne(
    'SELECT id FROM schools WHERE code = ?',
    [data.code]
  );
  if (existing) throw new ConflictError('School code already exists');

  const result = await query(
    `INSERT INTO schools (name, code, address, phone, email)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.name,
      data.code,
      data.address || null,
      data.phone || null,
      data.email || null,
    ]
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
    `UPDATE schools 
     SET name = ?, address = ?, phone = ?, email = ?, updated_at = NOW()
     WHERE id = ?`,
    [
      data.name,
      data.address || null,
      data.phone || null,
      data.email || null,
      id
    ]
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
  
  await query(
    'UPDATE schools SET deleted_at = NOW(), is_active = 0 WHERE id = ?',
    [id]
  );
  
  await auditService.log({
    userId: actorId,
    schoolId: id,
    action: 'school.delete',
    entityType: 'school',
    entityId: id,
  });
}

module.exports = { list, getById, create, update, softDelete };