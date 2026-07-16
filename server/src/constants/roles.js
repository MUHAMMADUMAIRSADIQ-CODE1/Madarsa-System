const roles = Object.freeze({
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
});

const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  PENDING: 'pending',
  REJECTED: 'rejected',
  BLOCKED: 'blocked',
});

const roleHierarchy = Object.freeze({
  [roles.ADMIN]: 0,
  [roles.TEACHER]: 1,
  [roles.STUDENT]: 2,
  [roles.PARENT]: 3,
});

const rolePermissions = Object.freeze({
  [roles.ADMIN]: ['*'],
  [roles.TEACHER]: [
    'courses:read',
    'courses:write',
    'students:read',
    'assignments:read',
    'assignments:write',
    'attendance:read',
    'attendance:write',
    'profile:read',
    'profile:write',
  ],
  [roles.STUDENT]: [
    'courses:read',
    'assignments:read',
    'assignments:write',
    'attendance:read',
    'profile:read',
    'profile:write',
  ],
  [roles.PARENT]: [
    'courses:read',
    'attendance:read',
    'assignments:read',
    'profile:read',
    'profile:write',
  ],
});

function hasPermission(role, permission) {
  if (rolePermissions[roles.ADMIN].includes('*')) return true;
  return rolePermissions[role]?.includes(permission) ?? false;
}

function isRoleHigherOrEqual(role1, role2) {
  return (roleHierarchy[role1] ?? Infinity) <= (roleHierarchy[role2] ?? Infinity);
}

module.exports = {
  roles,
  USER_STATUS,
  roleHierarchy,
  rolePermissions,
  hasPermission,
  isRoleHigherOrEqual,
};
