/**
 * One-time Cleanup Script: Remove Duplicate Attendance Records
 *
 * Usage: node scripts/dedupAttendanceRecords.js
 *
 * This script:
 *   1. Connects to MongoDB using the server's existing configuration
 *   2. Scans the Attendance collection for duplicate records grouped by
 *      student + course + classDate
 *   3. For each group with more than one record:
 *      - Keeps the OLDEST record (first created — preserved by _id sort)
 *      - Soft-deletes (isDeleted = true) all duplicate records
 *   4. Prints a detailed report: student | course | date | before -> after | status
 *   5. Exits cleanly
 *
 * Root cause of duplicates:
 *   The bulkMarkAttendance() upsert check used `.setHours(0,0,0,0)` which
 *   returned a number (milliseconds), but MongoDB's exact-match query is
 *   BSON type-sensitive — a number never matched the stored Date object.
 *   Every save created a new document instead of updating. This has been
 *   fixed so no future duplicates will be created.
 *
 * This script should be run exactly once to clean existing corrupted data.
 */

const mongoose = require('mongoose');
const env = require('../src/config/env');

async function main() {
  console.log('\n=== Dedup: Remove Duplicate Attendance Records ===\n');

  // 1. Connect to MongoDB
  console.log('Connecting to MongoDB...');
  await mongoose.connect(env.mongodb.uri);
  const db = mongoose.connection.db;
  console.log(`Connected: ${mongoose.connection.host}/${mongoose.connection.name}\n`);

  const collection = db.collection('attendances');

  // 2. Find duplicate groups: same student + course + classDate
  const pipeline = [
    {
      $match: { isDeleted: { $ne: true } },
    },
    {
      $group: {
        _id: {
          student: '$student',
          course: '$course',
          classDate: '$classDate',
        },
        count: { $sum: 1 },
        records: { $push: { _id: '$_id', createdAt: '$createdAt', status: '$status', attendanceId: '$attendanceId' } },
      },
    },
    {
      $match: { count: { $gt: 1 } },
    },
    {
      $sort: { count: -1 },
    },
  ];

  const duplicateGroups = await collection.aggregate(pipeline).toArray();

  console.log(`Found ${duplicateGroups.length} duplicate group(s)\n`);

  if (duplicateGroups.length === 0) {
    console.log('No duplicate records found. Attendance collection is clean. Exiting.');
    await mongoose.disconnect();
    process.exit(0);
  }

  // 3. Count total duplicates before processing
  let totalBefore = 0;
  let totalAfter = 0;
  let totalDeleted = 0;

  for (const group of duplicateGroups) {
    totalBefore += group.count;
    totalAfter += 1;
    totalDeleted += group.count - 1;
  }

  // 4. Process each group
  console.log('Processing duplicate groups...\n');

  // ── Header ──
  console.log(
    '  ' +
    'Student ID'.padEnd(28) +
    'Course ID'.padEnd(28) +
    'Date'.padEnd(22) +
    'Before → After'.padEnd(18) +
    'Status'
  );
  console.log('  ' + '─'.repeat(100));

  let cleanedCount = 0;
  let errorCount = 0;

  for (const group of duplicateGroups) {
    const { student, course, classDate } = group._id;

    // Sort records by _id ascending (oldest first)
    const sorted = [...group.records].sort((a, b) => {
      const aId = a._id.toString();
      const bId = b._id.toString();
      return aId.localeCompare(bId);
    });

    // Keep the oldest record, soft-delete the rest
    const keepRecord = sorted[0];
    const deleteRecords = sorted.slice(1);
    const deleteIds = deleteRecords.map(r => r._id);

    try {
      // Soft-delete duplicates: set isDeleted = true, deletedAt = now
      const deleteResult = await collection.updateMany(
        { _id: { $in: deleteIds } },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
          },
        }
      );

      // Resolve student/course names for the report
      const studentDoc = await db.collection('students').findOne(
        { _id: student },
        { projection: { studentName: 1 } }
      );
      const courseDoc = await db.collection('courses').findOne(
        { _id: course },
        { projection: { title: 1 } }
      );

      const studentName = (studentDoc?.studentName || student.toString()).padEnd(26);
      const courseName = (courseDoc?.title || course.toString()).padEnd(26);
      const dateStr = classDate
        ? new Date(classDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
        : 'unknown';
      const dateFormatted = dateStr.padEnd(20);
      const countStr = `${group.count} → 1`.padEnd(16);

      console.log(`  ${studentName} ${courseName} ${dateFormatted} ${countStr} Cleaned`);

      cleanedCount++;
    } catch (err) {
      const studentStr = (student?.toString() || '?').padEnd(26);
      const courseStr = (course?.toString() || '?').padEnd(26);
      console.log(`  ${studentStr.padEnd(26)} ${courseStr.padEnd(26)} ${'ERROR'.padEnd(20)} Failed: ${err.message}`);
      errorCount++;
    }
  }

  // 5. Summary
  console.log('\n--- Summary ---');
  console.log(`Duplicate groups found:     ${duplicateGroups.length}`);
  console.log(`Groups cleaned:             ${cleanedCount}`);
  console.log(`Groups with errors:         ${errorCount}`);
  console.log(`Total records before:       ${totalBefore}`);
  console.log(`Total records after:        ${totalAfter}`);
  console.log(`Records soft-deleted:       ${totalDeleted}`);
  console.log('\n=== Dedup complete ===\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('\nDedup failed:', err);
  process.exit(1);
});
