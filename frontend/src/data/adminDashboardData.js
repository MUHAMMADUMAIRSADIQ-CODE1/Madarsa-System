export const adminDashboardData = {
  dashboard: {
    statistics: {
      totalStudents: 487,
      totalTeachers: 28,
      totalCourses: 12,
      totalAdmissions: 156,
      revenue: 45000,
    },
    recentActivities: [
      { id: 1, type: 'enrollment', text: 'New student enrolled: Ahmed Hassan', time: '2 hours ago' },
      { id: 2, type: 'teacher', text: 'Teacher approved: Dr. Muhammad', time: '4 hours ago' },
      { id: 3, type: 'course', text: 'New course created: Advanced Arabic', time: '1 day ago' },
      { id: 4, type: 'system', text: 'System backup completed', time: '2 days ago' },
      { id: 5, type: 'enrollment', text: 'Certificate issued to 15 students', time: '3 days ago' },
    ],
    charts: {
      enrollmentTrend: [
        { month: 'Jan', students: 45 },
        { month: 'Feb', students: 62 },
        { month: 'Mar', students: 58 },
        { month: 'Apr', students: 78 },
        { month: 'May', students: 95 },
        { month: 'Jun', students: 112 },
        { month: 'Jul', students: 135 },
      ],
      courseDistribution: [
        { course: 'Quran', students: 120 },
        { course: 'Islamic Studies', students: 95 },
        { course: 'Arabic', students: 87 },
        { course: 'Hadith', students: 75 },
        { course: 'Fiqh', students: 60 },
      ],
    },
  },

  contentManagement: {
    heroSection: {
      heading: 'Welcome to Jamia Tul Uloom',
      description: 'Premier Islamic Learning Platform',
      image: '/hero-image.jpg',
      primaryCTA: 'Enroll Now',
      secondaryCTA: 'Learn More',
    },
    homeStatistics: [
      { label: 'Active Students', value: 487 },
      { label: 'Expert Teachers', value: 28 },
      { label: 'Courses Available', value: 12 },
      { label: 'Certifications', value: 156 },
    ],
    aboutSection: {
      mission: 'To provide world-class Islamic education accessible to everyone',
      vision: 'Building a global community of knowledgeable and virtuous Muslims',
      timeline: [
        { year: 2020, event: 'Academy Founded' },
        { year: 2021, event: 'First 100 Students' },
        { year: 2022, event: 'Online Platform Launched' },
        { year: 2024, event: 'Expanded to 500+ Students' },
      ],
    },
  },

  courses: [
    {
      id: 1,
      name: 'Quran Recitation (Tajweed)',
      teacher: 'Dr. Abdullah Al-Qadi',
      students: 120,
      level: 'Beginner',
      status: 'active',
      createdDate: '2026-01-15',
    },
    {
      id: 2,
      name: 'Islamic Studies Fundamentals',
      teacher: 'Ustadha Zahra Ahmed',
      students: 95,
      level: 'Intermediate',
      status: 'active',
      createdDate: '2026-02-20',
    },
    {
      id: 3,
      name: 'Classical Arabic Grammar',
      teacher: 'Dr. Hassan Ibrahim',
      students: 87,
      level: 'Advanced',
      status: 'active',
      createdDate: '2026-03-10',
    },
    {
      id: 4,
      name: 'Hadith Collections',
      teacher: 'Dr. Muhammad Al-Razi',
      students: 75,
      level: 'Intermediate',
      status: 'inactive',
      createdDate: '2026-04-05',
    },
  ],

  teachers: [
    {
      id: 1,
      name: 'Dr. Abdullah Al-Qadi',
      email: 'abdulla@example.com',
      qualification: 'Ph.D Islamic Studies',
      experience: '8 years',
      courses: 2,
      status: 'active',
    },
    {
      id: 2,
      name: 'Ustadha Zahra Ahmed',
      email: 'zahra@example.com',
      qualification: 'Masters Islamic Education',
      experience: '6 years',
      courses: 2,
      status: 'active',
    },
    {
      id: 3,
      name: 'Dr. Hassan Ibrahim',
      email: 'hassan@example.com',
      qualification: 'Ph.D Arabic Linguistics',
      experience: '10 years',
      courses: 1,
      status: 'active',
    },
    {
      id: 4,
      name: 'Dr. Muhammad Al-Razi',
      email: 'muhammad@example.com',
      qualification: 'Ph.D Hadith Sciences',
      experience: '12 years',
      courses: 1,
      status: 'pending',
    },
  ],

  students: [
    {
      id: 1,
      name: 'Ahmed Hassan',
      email: 'ahmed@example.com',
      enrolledCourses: 2,
      status: 'active',
      joinDate: '2026-06-01',
      attendance: 92,
    },
    {
      id: 2,
      name: 'Fatima Khan',
      email: 'fatima@example.com',
      enrolledCourses: 3,
      status: 'active',
      joinDate: '2026-05-15',
      attendance: 88,
    },
    {
      id: 3,
      name: 'Omar Ibrahim',
      email: 'omar@example.com',
      enrolledCourses: 1,
      status: 'suspended',
      joinDate: '2026-04-20',
      attendance: 45,
    },
  ],

  admissions: [
    {
      id: 1,
      studentName: 'Aisha Malik',
      email: 'aisha@example.com',
      desiredCourse: 'Quran Recitation',
      appliedDate: '2026-07-12',
      status: 'pending',
    },
    {
      id: 2,
      studentName: 'Muhammad Farooq',
      email: 'farooq@example.com',
      desiredCourse: 'Islamic Studies',
      appliedDate: '2026-07-10',
      status: 'approved',
    },
    {
      id: 3,
      studentName: 'Zainab Hussain',
      email: 'zainab@example.com',
      desiredCourse: 'Arabic Grammar',
      appliedDate: '2026-07-08',
      status: 'approved',
    },
  ],

  gallery: {
    images: [
      { id: 1, title: 'Campus View', category: 'campus', uploaded: '2026-07-01' },
      { id: 2, title: 'Classroom Session', category: 'classroom', uploaded: '2026-07-02' },
      { id: 3, title: 'Student Workshop', category: 'event', uploaded: '2026-07-03' },
    ],
    videos: [
      { id: 1, title: 'Campus Tour', category: 'campus', uploaded: '2026-07-01' },
      { id: 2, title: 'Class Recording', category: 'class', uploaded: '2026-07-02' },
    ],
    categories: ['Campus', 'Classrooms', 'Students', 'Teachers', 'Events', 'Online Classes'],
  },

  news: [
    {
      id: 1,
      title: 'New Hadith Course Launched',
      category: 'Courses',
      status: 'published',
      publishDate: '2026-07-12',
      featured: true,
    },
    {
      id: 2,
      title: 'Summer Internship Program',
      category: 'Events',
      status: 'draft',
      publishDate: null,
      featured: false,
    },
  ],

  testimonials: [
    {
      id: 1,
      studentName: 'Ahmed Hassan',
      text: 'Excellent teaching and very supportive instructors!',
      rating: 5,
      status: 'approved',
    },
    {
      id: 2,
      studentName: 'Fatima Khan',
      text: 'Great learning experience with interactive classes.',
      rating: 5,
      status: 'pending',
    },
  ],

  faqs: [
    {
      id: 1,
      question: 'How do I enroll in a course?',
      answer: 'You can enroll by visiting the Admissions page...',
      category: 'Enrollment',
    },
    {
      id: 2,
      question: 'What are the course timings?',
      answer: 'Our courses run from 9 AM to 5 PM daily...',
      category: 'General',
    },
  ],

  contactSettings: {
    phone: '+966-11-4700111',
    email: 'info@jamiatululoom.edu',
    address: 'Riyadh, Saudi Arabia',
    socialLinks: {
      facebook: 'https://facebook.com/jamiatululoom',
      instagram: 'https://instagram.com/jamiatululoom',
      youtube: 'https://youtube.com/jamiatululoom',
      linkedin: 'https://linkedin.com/company/jamiatululoom',
    },
  },

  userManagement: {
    roles: [
      { id: 1, name: 'Student', permissions: ['View Courses', 'Submit Assignments', 'Join Classes'] },
      { id: 2, name: 'Teacher', permissions: ['Create Courses', 'Grade Assignments', 'Manage Classes', 'View Students'] },
      { id: 3, name: 'Admin', permissions: ['Full Access', 'Manage Users', 'System Settings'] },
    ],
    permissions: [
      'View Courses',
      'Manage Courses',
      'View Students',
      'Manage Students',
      'View Teachers',
      'Manage Teachers',
      'System Settings',
      'Reports',
    ],
  },

  websiteSettings: {
    academyName: 'Jamia Tul Uloom Muhammadiya',
    logo: '/logo.png',
    favicon: '/favicon.ico',
    themeColors: {
      primary: '#0B4F30',
      secondary: '#C9A84C',
    },
    seo: {
      siteTitle: 'Jamia Tul Uloom - Islamic Learning Platform',
      metaDescription: 'Premier online Islamic education platform',
      keywords: 'Islamic Education, Quran, Arabic, Islamic Studies',
    },
  },
};
