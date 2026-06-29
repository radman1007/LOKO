const { ValidationError } = require('../utils/errors');
const { sanitizeObject } = require('../utils/sanitize');

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = sanitizeObject(req[source]);
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return next(new ValidationError('Validation failed', details));
    }

    req[source] = value;
    next();
  };
}

module.exports = validate;
