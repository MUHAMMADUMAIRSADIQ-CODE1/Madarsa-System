const CMS_SECTIONS = Object.freeze({
  HERO: 'hero',
  ABOUT: 'about',
  MISSION: 'mission',
  VISION: 'vision',
  CONTACT: 'contact',
  FAQ: 'faq',
  FOOTER: 'footer',
  HOME: 'home',
  SETTINGS: 'settings',
});

const CMS_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
});

const ADMIN_PERMISSIONS = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  CONTENT_MANAGER: 'content_manager',
  COURSE_MANAGER: 'course_manager',
  TEACHER_MANAGER: 'teacher_manager',
  SUPPORT_MANAGER: 'support_manager',
});

const ADMIN_PERMISSION_HIERARCHY = Object.freeze({
  [ADMIN_PERMISSIONS.SUPER_ADMIN]: 0,
  [ADMIN_PERMISSIONS.CONTENT_MANAGER]: 1,
  [ADMIN_PERMISSIONS.COURSE_MANAGER]: 2,
  [ADMIN_PERMISSIONS.TEACHER_MANAGER]: 3,
  [ADMIN_PERMISSIONS.SUPPORT_MANAGER]: 4,
});

const ADMIN_PERMISSION_SCOPES = Object.freeze({
  [ADMIN_PERMISSIONS.SUPER_ADMIN]: [
    'cms:*',
    'settings:*',
    'users:*',
    'courses:*',
    'teachers:*',
    'students:*',
    'audit:*',
    'permissions:*',
  ],
  [ADMIN_PERMISSIONS.CONTENT_MANAGER]: [
    'cms:read',
    'cms:write',
    'settings:read',
    'settings:write',
  ],
  [ADMIN_PERMISSIONS.COURSE_MANAGER]: [
    'cms:read',
    'courses:*',
    'teachers:read',
    'students:read',
  ],
  [ADMIN_PERMISSIONS.TEACHER_MANAGER]: [
    'cms:read',
    'teachers:*',
    'courses:read',
  ],
  [ADMIN_PERMISSIONS.SUPPORT_MANAGER]: [
    'cms:read',
    'users:read',
    'students:read',
  ],
});

const CMS_AUDIT_ACTIONS = Object.freeze({
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  PUBLISH: 'PUBLISH',
  UNPUBLISH: 'UNPUBLISH',
  ARCHIVE: 'ARCHIVE',
  RESTORE: 'RESTORE',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  WAITLIST: 'WAITLIST',
  REVIEW: 'REVIEW',
  CONVERT: 'CONVERT',
  // Auth actions
  SIGNUP: 'signup',
  CHANGE_PASSWORD: 'change_password',
  CHANGE_EMAIL: 'change_email',
  FORGOT_PASSWORD: 'forgot_password',
  RESET_PASSWORD: 'reset_password',
  APPROVE_USER: 'approve_user',
  REJECT_USER: 'reject_user',
  RE_APPROVE_USER: 're_approve_user',
  COMPLETE_PROFILE: 'complete_profile',
  BLOCK_USER: 'block_user',
  UNBLOCK_USER: 'unblock_user',
  DEACTIVATE_USER: 'deactivate_user',
  ACTIVATE_USER: 'activate_user',
  ASSIGN_STUDENT: 'assign_student',
  REMOVE_STUDENT: 'remove_student',
  REASSIGN_STUDENT: 'reassign_student',
  BULK_ASSIGN_STUDENTS: 'bulk_assign_students',
});

const CMS_MODULES = Object.freeze({
  CMS: 'cms',
  SETTINGS: 'settings',
  USERS: 'users',
  COURSES: 'courses',
  TEACHERS: 'teachers',
  STUDENTS: 'students',
  GALLERY: 'gallery',
  NEWS: 'news',
  ADMISSIONS: 'admissions',
  PERMISSIONS: 'permissions',
  AUDIT: 'audit',
  AUTH: 'auth',
  ADMIN: 'admin',
  ASSIGNMENTS: 'assignments',
});

function hasAdminPermission(adminRole, scope) {
  const scopes = ADMIN_PERMISSION_SCOPES[adminRole];
  if (!scopes) return false;
  return scopes.some((s) => {
    if (s.endsWith(':*')) {
      const prefix = s.slice(0, -2);
      return scope.startsWith(prefix);
    }
    return s === scope;
  });
}

function isAdminRoleHigherOrEqual(role1, role2) {
  const l1 = ADMIN_PERMISSION_HIERARCHY[role1];
  const l2 = ADMIN_PERMISSION_HIERARCHY[role2];
  if (l1 === undefined || l2 === undefined) return false;
  return l1 <= l2;
}

module.exports = {
  CMS_SECTIONS,
  CMS_STATUS,
  ADMIN_PERMISSIONS,
  ADMIN_PERMISSION_HIERARCHY,
  ADMIN_PERMISSION_SCOPES,
  CMS_AUDIT_ACTIONS,
  CMS_MODULES,
  hasAdminPermission,
  isAdminRoleHigherOrEqual,
};
