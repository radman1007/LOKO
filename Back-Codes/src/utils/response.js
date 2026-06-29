function success(res, data, statusCode = 200, meta = null) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

function created(res, data, meta = null) {
  return success(res, data, 201, meta);
}

function paginated(res, data, pagination) {
  return success(res, data, 200, { pagination });
}

function noContent(res) {
  return res.status(204).send();
}

module.exports = { success, created, paginated, noContent };
