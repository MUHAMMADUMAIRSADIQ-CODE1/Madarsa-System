// Mock authentication data - In production, this would come from a backend API
export const authData = {
  // Sample users for testing
  users: [
    {
      id: 'student-001',
      name: 'Ahmed Hassan',
      email: 'ahmed@example.com',
      password: 'Student@123', // In production, never store plain passwords
      role: 'student',
      phone: '+1-555-123-4567',
      country: 'Pakistan',
      city: 'Lahore',
      gender: 'Male',
      profileImage: '',
      enrolledCourses: ['course-001', 'course-002'],
      createdAt: '2024-01-15',
      verified: true,
    },
    {
      id: 'teacher-001',
      name: 'Sheikh Muhammad Ali',
      email: 'teacher@example.com',
      password: 'Teacher@123',
      role: 'teacher',
      phone: '+1-555-987-6543',
      country: 'Pakistan',
      city: 'Islamabad',
      gender: 'Male',
      profileImage: '',
      qualification: 'MA Islamic Studies',
      experience: '10 years',
      verified: true,
      approved: true,
      teachingCourses: ['course-001', 'course-003'],
    },
    {
      id: 'admin-001',
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+1-555-555-5555',
      country: 'Pakistan',
      city: 'Lahore',
      gender: 'Male',
      profileImage: '',
      verified: true,
    },
  ],

  // Trust indicators for login page
  trustIndicators: [
    {
      icon: 'shield',
      text: 'Secure SSL Encryption',
      description: 'Bank-level security for your data',
    },
    {
      icon: 'users',
      text: 'Trusted by 50,000+',
      description: 'Students worldwide',
    },
    {
      icon: 'award',
      text: 'Certified Academy',
      description: 'Accredited Islamic Education',
    },
  ],
};
