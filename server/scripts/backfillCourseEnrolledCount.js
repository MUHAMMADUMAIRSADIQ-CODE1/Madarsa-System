/**
 * One-time Backfill Script: Sync Course.enrolledCount with actual enrollments
 * 
 * Usage: node scripts/backfillCourseEnrolledCount.js
 * 
 * This script:
 *   1. Connects to MongoDB using the server's existing configuration
 *   2. Reads every published (non-deleted) course
 *   3. Counts actual enrolled students for each course by querying
 *      the students collection
 *   4. Updates Course.enrolledCount to match the real count
 *   5. Prints before/after values for every updated course
 *   6. Exits cleanly
 * 
 * This script should be run exactly once to backfill existing data.
 * Going forward, the $inc operations in:
 *   - student.service.js (enrollInCourse)
 *   - studentAssignment.service.js (assignStudent, bulkAssignStudents,
 *     removeStudent, removeAssignmentOnStudentDelete)
 * will keep enrolledCount in sync automatically.
 */

const mongoose = require('mongoose');
const env = require('../src/config/env');

async function main() {
  console.log('\n=== Backfill: Sync Course.enrolledCount with actual enrollments ===\n');

  // 1. Connect to MongoDB
  console.log('Connecting to MongoDB...');
  await mongoose.connect(env.mongodb.uri);
  const db = mongoose.connection.db;
  console.log(`Connected: ${mongoose.connection.host}/${mongoose.connection.name}\n`);

  // 2. Read all published courses
  const courses = await db.collection('courses').find({
    status: 'published',
    isDeleted: { $ne: true },
  }).toArray();

  console.log(`Found ${courses.length} published course(s)\n`);

  if (courses.length === 0) {
    console.log('No published courses to backfill. Exiting.');
    await mongoose.disconnect();
    process.exit(0);
  }

  let updatedCount = 0;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const course of courses) {
    const courseId = course._id;
    const beforeValue = course.enrolledCount || 0;

    // 3. Count actual enrolled students for this course
    const actualCount = await db.collection('students').countDocuments({
      'courses.course': courseId,
      isDeleted: { $ne: true },
    });

    if (actualCount !== beforeValue) {
      // 4. Update Course.enrolledCount
      await db.collection('courses').updateOne(
        { _id: courseId },
        { $set: { enrolledCount: actualCount } }
      );

      // 5. Print before/after
      console.log(
        `  [UPDATED] ${course.title} (${course.slug})` +
        `\n    enrolledCount: ${beforeValue} → ${actualCount}`
      );

      updatedCount++;
      totalBefore += beforeValue;
      totalAfter += actualCount;
    } else {
      console.log(
        `  [  OK   ] ${course.title} (${course.slug})` +
        `\n    enrolledCount: ${beforeValue} (already correct)`
      );
      totalBefore += beforeValue;
      totalAfter += beforeValue;
    }
  }

  // Summary
  console.log('\n--- Summary ---');
  console.log(`Total courses processed: ${courses.length}`);
  console.log(`Courses updated:          ${updatedCount}`);
  console.log(`Courses already correct:  ${courses.length - updatedCount}`);
  console.log(`Total enrolledCount:      ${totalBefore} → ${totalAfter}`);
  console.log('\n=== Backfill complete ===\n');

  // 6. Exit cleanly
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('\nBackfill failed:', err);
  process.exit(1);
});
