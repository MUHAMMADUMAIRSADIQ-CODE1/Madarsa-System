const messages = {
  // General
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',

  // Auth
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTER_SUCCESS: 'Registration successful',
  SIGNUP_SUCCESS: 'Account created successfully. Please verify your email.',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  SESSION_EXPIRED: 'Session expired, please login again',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in',
  TEACHER_PENDING_APPROVAL: 'Your account is awaiting administrator approval',
  USER_REJECTED: 'Your account has been rejected',
  USER_BLOCKED: 'Your account has been blocked. Please contact support',
  USER_ALREADY_EXISTS: 'An account with this email already exists',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent successfully',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  EMAIL_VERIFIED: 'Email verified successfully',
  EMAIL_VERIFICATION_SENT: 'Verification email sent successfully',
  INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',

  // User
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  PHONE_ALREADY_EXISTS: 'An account with this phone number already exists',
  PROFILE_UPDATED: 'Profile updated successfully',

  // Student
  STUDENT_NOT_FOUND: 'Student not found',
  STUDENT_ALREADY_ENROLLED: 'Student is already enrolled in this course',
  STUDENT_ALREADY_EXISTS: 'A student with this email or phone already exists',
  STUDENT_CREATED: 'Student created successfully',
  STUDENT_UPDATED: 'Student updated successfully',
  STUDENT_DELETED: 'Student deleted successfully',
  PROFILE_COMPLETED: 'Profile completed successfully',
  PROFILE_COMPLETION_REQUIRED: 'Please complete your profile before accessing the dashboard',
  USER_BLOCKED_SUCCESS: 'User blocked successfully',
  USER_UNBLOCKED_SUCCESS: 'User unblocked successfully',
  USER_ACTIVATED_SUCCESS: 'User activated successfully',
  USER_DEACTIVATED_SUCCESS: 'User deactivated successfully',
  STUDENT_RESTORED: 'Student restored successfully',
  STUDENT_ACTIVATED: 'Student activated successfully',
  STUDENT_DEACTIVATED: 'Student deactivated successfully',
  STUDENT_CONVERTED: 'Admission converted to student successfully',

  // Teacher
  TEACHER_NOT_FOUND: 'Teacher not found',

  // Attendance
  ATTENDANCE_NOT_FOUND: 'Attendance record not found',
  ATTENDANCE_ALREADY_MARKED: 'Attendance already marked for this student in this class on this date',
  ATTENDANCE_CREATED: 'Attendance marked successfully',
  ATTENDANCE_UPDATED: 'Attendance record updated successfully',
  ATTENDANCE_DELETED: 'Attendance record deleted successfully',
  ATTENDANCE_RESTORED: 'Attendance record restored successfully',

  // Course
  COURSE_NOT_FOUND: 'Course not found',
  COURSE_CREATED: 'Course created successfully',
  COURSE_UPDATED: 'Course updated successfully',

  // Admission
  ADMISSION_NOT_FOUND: 'Admission record not found',
  ADMISSION_ALREADY_EXISTS: 'Admission already exists for this student',
  APPLICATION_RECEIVED: 'Application received successfully',

  // Gallery
  GALLERY_NOT_FOUND: 'Gallery item not found',
  IMAGE_UPLOADED: 'Image uploaded successfully',

  // News
  NEWS_NOT_FOUND: 'News article not found',
  NEWS_CREATED: 'News article created successfully',

  // Validation
  VALIDATION_ERROR: 'Validation error',
  INVALID_EMAIL: 'Please provide a valid email address',
  INVALID_PHONE: 'Please provide a valid phone number',
  INVALID_OBJECT_ID: 'Invalid ID format',
  REQUIRED_FIELD: 'This field is required',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit',

  // Settings
  SETTINGS_UPDATED: 'Settings updated successfully',

  // Rate Limit
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',
};

module.exports = messages;
