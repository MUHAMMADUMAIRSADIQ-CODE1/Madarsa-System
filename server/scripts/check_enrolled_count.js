/**
 * Diagnostic script: Check Course.enrolledCount in MongoDB
 * 
 * Usage: node scripts/check_enrolled_count.js
 * 
 * This connects to MongoDB using the server's own config and
 * reports the enrolledCount for every published course alongside
 * the actual count of students enrolled in each course.
 */

const path = require('path');
const env = require('../src/config/env');
const mongoose = require('mongoose');

async function main() {
  console.log('\n========== DIAGNOSTIC: Course.enrolledCount Check ==========');
  console.log('Connecting to MongoDB...');
  
  await mongoose.connect(env.mongodb.uri);
  console.log('Connected to:', mongoose.connection.host);
  console.log('Database:', mongoose.connection.name);
  
  // Direct MongoDB access to the courses collection
  const db = mongoose.connection.db;
  const coursesCollection = db.collection('courses');
  const studentsCollection = db.collection('students');
  const teachersCollection = db.collection('teachers');
  
  // Get all published courses
  const courses = await coursesCollection.find({
    status: 'published',
    isDeleted: { $ne: true }
  }).toArray();
  
  console.log(`\nFound ${courses.length} published course(s):\n`);
  
  let totalDiscrepancy = 0;
  
  for (const course of courses) {
    // Count actual students who have this course in their courses array
    const actualStudentCount = await studentsCollection.countDocuments({
      'courses.course': course._id,
      isDeleted: { $ne: true }
    });
    
    // Count students assigned to teachers for this course via teacher.assignedStudents
    const teachersWithCourse = await teachersCollection.find({
      assignedCourses: course._id,
      isDeleted: { $ne: true }
    }).toArray();
    
    const assignedStudentIds = new Set();
    for (const teacher of teachersWithCourse) {
      if (teacher.assignedStudents && Array.isArray(teacher.assignedStudents)) {
        for (const sid of teacher.assignedStudents) {
          assignedStudentIds.add(sid.toString());
        }
      }
    }
    
    // Count how many of those assigned students also have this course selected
    let teacherAssignedCount = 0;
    if (assignedStudentIds.size > 0) {
      teacherAssignedCount = await studentsCollection.countDocuments({
        _id: { $in: Array.from(assignedStudentIds).map(id => new mongoose.Types.ObjectId(id)) },
        'courses.course': course._id,
        isDeleted: { $ne: true }
      });
    }
    
    const stored = course.enrolledCount || 0;
    const mismatch = actualStudentCount !== stored;
    const teacherMismatch = teacherAssignedCount !== stored;
    
    if (mismatch) totalDiscrepancy++;
    
    console.log(`----------------------------------------`);
    console.log(`Course:     ${course.title}`);
    console.log(`  ID:       ${course._id}`);
    console.log(`  Slug:     ${course.slug}`);
    console.log(`  Status:   ${course.status}`);
    console.log(`  enrolledCount (stored): ${stored}`);
    console.log(`  Actual students with course selected: ${actualStudentCount}`);
    console.log(`  Teacher-assigned students in course:  ${teacherAssignedCount}`);
    
    if (mismatch) {
      console.log(`  ⚠️  MISMATCH: stored=${stored}, actual=${actualStudentCount}`);
      console.log(`     → Would update enrolledCount to ${actualStudentCount}`);
    } else {
      console.log(`  ✅ MATCH: stored=${stored}, actual=${actualStudentCount}`);
    }
    
    if (teacherMismatch && !mismatch) {
      console.log(`  ⚠️  Teacher-assigned count differs (${teacherAssignedCount} vs stored ${stored})`);
    }
  }
  
  console.log(`\n----------------------------------------`);
  console.log(`Summary: ${totalDiscrepancy} of ${courses.length} courses have mismatched enrolledCount`);
  console.log('========================================================\n');
  
  await mongoose.disconnect();
  process.exit(totalDiscrepancy > 0 ? 0 : 0); // Exit 0 regardless, this is diagnostic
}

main().catch(err => {
  console.error('DIAGNOSTIC ERROR:', err);
  process.exit(1);
});
