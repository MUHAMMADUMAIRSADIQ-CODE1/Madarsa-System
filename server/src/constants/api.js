const API_PREFIX = '/api/v1';

const API_ROUTES = {
  AUTH: `${API_PREFIX}/auth`,
  USERS: `${API_PREFIX}/users`,
  STUDENTS: `${API_PREFIX}/students`,
  STUDENT_PORTAL: `${API_PREFIX}/student`,
  TEACHER_PORTAL: `${API_PREFIX}/teacher`,
  TEACHERS: `${API_PREFIX}/teachers`,
  COURSES: `${API_PREFIX}/courses`,
  GALLERY: `${API_PREFIX}/gallery`,
  NEWS: `${API_PREFIX}/news`,
  ADMISSIONS: `${API_PREFIX}/admissions`,
  SETTINGS: `${API_PREFIX}/settings`,
  CONTACT_MESSAGES: `${API_PREFIX}/contact`,
  TESTIMONIALS: `${API_PREFIX}/testimonials`,
  NOTIFICATIONS: `${API_PREFIX}/notifications`,
  ATTENDANCE: `${API_PREFIX}/attendance`,
  ASSIGNMENTS: `${API_PREFIX}/assignments`,
  CERTIFICATES: `${API_PREFIX}/certificates`,
  LIVE_CLASSES: `${API_PREFIX}/live-classes`,
  PAYMENTS: `${API_PREFIX}/payments`,
  DASHBOARD: `${API_PREFIX}/dashboard`,
  HEALTH: `${API_PREFIX}/health`,
  ADMIN: `${API_PREFIX}/admin`,
  HERO: `${API_PREFIX}/admin/hero`,
  ABOUT: `${API_PREFIX}/admin/about`,
  ADMIN_CONTACT: `${API_PREFIX}/admin/contact`,
  ADMIN_SETTINGS: `${API_PREFIX}/admin/settings`,
  FOOTER: `${API_PREFIX}/admin/footer`,
  PUBLIC: `${API_PREFIX}/public`,
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
};

module.exports = {
  API_PREFIX,
  API_ROUTES,
  PAGINATION,
  SORT_ORDERS,
};
