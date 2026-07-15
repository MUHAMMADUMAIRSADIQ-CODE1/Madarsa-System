const { Router } = require('express');
const { API_ROUTES } = require('../constants/api');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const courseRoutes = require('./course.routes');
const studentRoutes = require('./student.routes');
const teacherRoutes = require('./teacher.routes');
const galleryRoutes = require('./gallery.routes');
const newsRoutes = require('./news.routes');
const admissionRoutes = require('./admission.routes');
const settingRoutes = require('./setting.routes');
const adminRoutes = require('./admin.routes');
const studentPortalRoutes = require('./studentPortal.routes');
const teacherPortalRoutes = require('./teacherPortal.routes');
const attendanceRoutes = require('./attendance.routes');

const router = Router();

const publicRoutes = require('./public.routes');

const routeConfigs = [
  { path: API_ROUTES.AUTH, route: authRoutes },
  { path: API_ROUTES.USERS, route: userRoutes },
  { path: API_ROUTES.COURSES, route: courseRoutes },
  { path: API_ROUTES.STUDENTS, route: studentRoutes },
  { path: API_ROUTES.TEACHERS, route: teacherRoutes },
  { path: API_ROUTES.GALLERY, route: galleryRoutes },
  { path: API_ROUTES.NEWS, route: newsRoutes },
  { path: API_ROUTES.ADMISSIONS, route: admissionRoutes },
  { path: API_ROUTES.SETTINGS, route: settingRoutes },
  { path: API_ROUTES.ADMIN, route: adminRoutes },
  { path: API_ROUTES.PUBLIC, route: publicRoutes },
  { path: API_ROUTES.STUDENT_PORTAL, route: studentPortalRoutes },
  { path: API_ROUTES.TEACHER_PORTAL, route: teacherPortalRoutes },
  { path: API_ROUTES.ATTENDANCE, route: attendanceRoutes },
];

routeConfigs.forEach(({ path, route }) => {
  router.use(path, route);
});

router.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Jamia Tul Uloom Muhammadiya API is running',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    },
  });
});

module.exports = router;
