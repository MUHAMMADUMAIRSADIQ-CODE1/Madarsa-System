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
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
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
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
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
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
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
