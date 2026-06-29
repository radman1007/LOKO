const XLSX = require('xlsx');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { withTransaction, query, queryOne } = require('../database/connection');
const { generateUsername, generateSecurePassword, hashPassword } = require('../utils/crypto');
const { ROLES } = require('../config/permissions');
const auditService = require('./audit.service');

const ROLE_MAP = {
  student: 4,
  teacher: 3,
  school_admin: 2,
  parent: 5,
};

const REQUIRED_COLUMNS = ['first_name', 'last_name', 'role', 'class_name', 'grade'];

async function processExcelImport(filePath, schoolId, uploadedBy) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const school = await queryOne('SELECT code FROM schools WHERE id = :id', { id: schoolId });
  if (!school) throw new Error('School not found');

  const importRecord = await query(
    `INSERT INTO imported_files (school_id, uploaded_by, file_name, file_path, status, total_rows)
     VALUES (:schoolId, :uploadedBy, :fileName, :filePath, 'processing', :total)`,
    {
      schoolId,
      uploadedBy,
      fileName: path.basename(filePath),
      filePath,
      total: rows.length,
    }
  );
  const importId = importRecord.insertId;

  const errors = [];
  let successCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    try {
      const validation = validateRow(row);
      if (validation.errors.length > 0) {
        errors.push({ row: rowNum, errors: validation.errors });
        continue;
      }

      await createUserFromRow(row, schoolId, school.code, uploadedBy);
      successCount++;
    } catch (err) {
      errors.push({ row: rowNum, errors: [err.message] });
    }
  }

  const status = errors.length === rows.length ? 'failed' : 'completed';
  await query(
    `UPDATE imported_files SET status = :status, success_count = :success, error_count = :errors,
     error_report = :report, processed_at = NOW() WHERE id = :id`,
    {
      status,
      success: successCount,
      errors: errors.length,
      report: JSON.stringify(errors),
      id: importId,
    }
  );

  await auditService.log({
    userId: uploadedBy,
    schoolId,
    action: 'import.excel',
    entityType: 'imported_file',
    entityId: importId,
    newValues: { successCount, errorCount: errors.length },
  });

  return { importId, totalRows: rows.length, successCount, errorCount: errors.length, errors };
}

function validateRow(row) {
  const errors = [];
  for (const col of REQUIRED_COLUMNS) {
    if (!row[col] && row[col] !== 0) {
      errors.push(`Missing required field: ${col}`);
    }
  }
  if (row.role && !['student', 'teacher', 'parent'].includes(String(row.role).toLowerCase())) {
    errors.push(`Invalid role: ${row.role}`);
  }
  return { errors };
}

async function createUserFromRow(row, schoolId, schoolCode, createdBy) {
  return withTransaction(async (conn) => {
    const role = String(row.role).toLowerCase();
    const roleId = ROLE_MAP[role];
    if (!roleId) throw new Error(`Invalid role: ${role}`);

    let classId = null;
    if (role === 'student' || role === 'teacher') {
      const academicYear = row.academic_year || new Date().getFullYear().toString();
      const [classes] = await conn.execute(
        `SELECT id FROM classes WHERE school_id = ? AND name = ? AND academic_year = ?`,
        [schoolId, row.class_name, academicYear]
      );

      if (classes.length > 0) {
        classId = classes[0].id;
      } else {
        const [classResult] = await conn.execute(
          `INSERT INTO classes (school_id, name, grade, academic_year) VALUES (?, ?, ?, ?)`,
          [schoolId, row.class_name, row.grade, academicYear]
        );
        classId = classResult.insertId;
      }
    }

    let sequence = 1;
    let username;
    let exists = true;
    while (exists) {
      username = generateUsername(row.first_name, row.last_name, schoolCode, sequence);
      const [users] = await conn.execute('SELECT id FROM users WHERE username = ?', [username]);
      exists = users.length > 0;
      sequence++;
    }

    const password = generateSecurePassword(10);
    const passwordHash = await hashPassword(password);

    const [userResult] = await conn.execute(
      `INSERT INTO users (school_id, role_id, username, password_hash, plain_password, first_name, last_name, national_code, phone, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        schoolId, roleId, username, passwordHash, password,
        row.first_name, row.last_name, row.national_code || null, row.phone || null, createdBy,
      ]
    );
    const userId = userResult.insertId;

    if (role === 'student') {
      await conn.execute('INSERT INTO student_profiles (user_id) VALUES (?)', [userId]);
      await conn.execute('INSERT INTO token_wallets (user_id, balance) VALUES (?, 0)', [userId]);
      await conn.execute('INSERT INTO garden_states (user_id) VALUES (?)', [userId]);
      await conn.execute(
        'INSERT INTO class_students (class_id, student_id) VALUES (?, ?)',
        [classId, userId]
      );
    }

    if (role === 'teacher') {
      await conn.execute(
        'INSERT INTO class_teachers (class_id, teacher_id, is_primary) VALUES (?, ?, 1)',
        [classId, userId]
      );
    }

    return { userId, username, password };
  });
}

module.exports = { processExcelImport, validateRow };
