// Student dashboard data
export const studentDashboardData = {
  // Current student courses
  courses: [
    {
      id: 'course-001',
      title: 'Quran Memorization (Hifz)',
      instructor: 'Sheikh Muhammad Ali',
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80',
      progress: 65,
      nextClass: '2024-07-15 3:00 PM',
      status: 'active',
      juzStarted: 15,
      juzTotal: 30,
    },
    {
      id: 'course-002',
      title: 'Arabic Language Basics',
      instructor: 'Dr. Fatima Khan',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f70a504f9?w=400&q=80',
      progress: 45,
      nextClass: '2024-07-16 4:00 PM',
      status: 'active',
      lessonsCompleted: 12,
      lessonsTotal: 30,
    },
    {
      id: 'course-003',
      title: 'Islamic Studies',
      instructor: 'Sheikh Ahmed Hassan',
      image: 'https://images.unsplash.com/photo-1507842072343-583f20270319?w=400&q=80',
      progress: 30,
      nextClass: '2024-07-17 2:00 PM',
      status: 'upcoming',
      topicsCompleted: 5,
      topicsTotal: 15,
    },
  ],

  // Today's classes
  todayClasses: [
    {
      id: 'class-001',
      title: 'Hifz - Juz 15 Revision',
      instructor: 'Sheikh Muhammad Ali',
      time: '3:00 PM - 4:30 PM',
      course: 'Quran Memorization (Hifz)',
      meetingLink: '#',
      status: 'upcoming',
    },
    {
      id: 'class-002',
      title: 'Arabic Grammar - Present Tense',
      instructor: 'Dr. Fatima Khan',
      time: '4:30 PM - 5:30 PM',
      course: 'Arabic Language Basics',
      meetingLink: '#',
      status: 'upcoming',
    },
  ],

  // Assignments
  assignments: [
    {
      id: 'assign-001',
      title: 'Memorize Surah Al-Fatiha',
      course: 'Quran Memorization (Hifz)',
      dueDate: '2024-07-15',
      status: 'pending',
      description: 'Complete memorization and recitation',
    },
    {
      id: 'assign-002',
      title: 'Arabic Grammar Worksheet',
      course: 'Arabic Language Basics',
      dueDate: '2024-07-18',
      status: 'pending',
      description: 'Complete 20 grammar exercises',
    },
    {
      id: 'assign-003',
      title: 'Islamic History Essay',
      course: 'Islamic Studies',
      dueDate: '2024-07-20',
      status: 'submitted',
      description: 'Write 500-word essay on Prophet Muhammad',
      submittedDate: '2024-07-19',
      score: 85,
    },
  ],

  // Attendance data
  attendance: {
    percentage: 92,
    totalClasses: 50,
    attended: 46,
    missed: 4,
    byMonth: [
      { month: 'Jan', percentage: 95 },
      { month: 'Feb', percentage: 90 },
      { month: 'Mar', percentage: 88 },
      { month: 'Apr', percentage: 94 },
      { month: 'May', percentage: 91 },
      { month: 'Jun', percentage: 92 },
    ],
  },

  // Certificates
  certificates: [
    {
      id: 'cert-001',
      title: 'Tajweed Fundamentals',
      completionDate: '2024-03-15',
      downloadUrl: '#',
      issueDate: '2024-03-16',
      certificateNumber: 'CERT-2024-0001',
    },
    {
      id: 'cert-002',
      title: 'Islamic Studies Level 1',
      completionDate: '2024-02-20',
      downloadUrl: '#',
      issueDate: '2024-02-21',
      certificateNumber: 'CERT-2024-0002',
    },
  ],

  // Fee status
  fees: {
    totalAmount: 120,
    paidAmount: 100,
    pendingAmount: 20,
    status: 'partial',
    invoices: [
      {
        id: 'inv-001',
        date: '2024-01-01',
        amount: 30,
        status: 'paid',
        month: 'January',
      },
      {
        id: 'inv-002',
        date: '2024-02-01',
        amount: 30,
        status: 'paid',
        month: 'February',
      },
      {
        id: 'inv-003',
        date: '2024-03-01',
        amount: 30,
        status: 'paid',
        month: 'March',
      },
      {
        id: 'inv-004',
        date: '2024-04-01',
        amount: 30,
        status: 'pending',
        month: 'April',
      },
    ],
  },

  // Messages
  messages: [
    {
      id: 'msg-001',
      from: 'Sheikh Muhammad Ali',
      subject: 'Great Progress in Hifz!',
      preview: 'Mashallah, you have made excellent progress...',
      date: '2024-07-13',
      unread: true,
      type: 'teacher',
    },
    {
      id: 'msg-002',
      from: 'Academy Admin',
      subject: 'Fee Reminder',
      preview: 'Your monthly fee is due. Please make payment...',
      date: '2024-07-12',
      unread: true,
      type: 'admin',
    },
    {
      id: 'msg-003',
      from: 'Dr. Fatima Khan',
      subject: 'Assignment Feedback',
      preview: 'Your grammar assignment was excellent...',
      date: '2024-07-10',
      unread: false,
      type: 'teacher',
    },
  ],

  // Notifications
  notifications: [
    {
      id: 'notif-001',
      type: 'class',
      title: 'Your class starts in 30 minutes',
      message: 'Hifz - Juz 15 Revision with Sheikh Muhammad Ali',
      date: '2024-07-14',
      read: false,
    },
    {
      id: 'notif-002',
      type: 'assignment',
      title: 'New assignment posted',
      message: 'Memorize Surah Al-Fatiha - Due 2024-07-15',
      date: '2024-07-13',
      read: false,
    },
    {
      id: 'notif-003',
      type: 'grade',
      title: 'Assignment graded',
      message: 'Islamic History Essay - Score: 85/100',
      date: '2024-07-12',
      read: true,
    },
  ],

  // Quick statistics
  stats: {
    totalCourses: 3,
    activeCourses: 3,
    completedCourses: 2,
    upcomingClasses: 2,
    pendingAssignments: 2,
    averageScore: 86,
  },
};
