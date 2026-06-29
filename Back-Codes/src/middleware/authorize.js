const { ROLE_PERMISSIONS } = require('../config/permissions');
const { ForbiddenError } = require('../utils/errors');

function authorize(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];

    const hasPermission = requiredPermissions.every((p) => userPermissions.includes(p));
    if (!hasPermission) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}

function authorizeAny(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasAny = requiredPermissions.some((p) => userPermissions.includes(p));

    if (!hasAny) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient role'));
    }
    next();
  };
}

function tenantScope(req, res, next) {
  if (req.user.role === 'team_admin') {
    req.tenantFilter = {};
    return next();
  }

  if (!req.user.schoolId) {
    return next(new ForbiddenError('No school context'));
  }

  req.tenantFilter = { schoolId: req.user.schoolId };
  next();
}

module.exports = { authorize, authorizeAny, authorizeRoles, tenantScope };
