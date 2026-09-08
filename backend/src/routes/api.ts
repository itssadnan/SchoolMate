import { Router } from 'express';
import { login, getMe, registerSchool, registerTeacher } from '../controllers/authController';
import { listSchools, getSchoolDetails } from '../controllers/schoolController';
import { getTeacherClasses, getClassStudents, getStudent360 } from '../controllers/classController';
import { getClassAttendanceByDate, recordBatchAttendance } from '../controllers/attendanceController';
import {
  getTeacherAssignments,
  createAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  submitHomework,
} from '../controllers/assignmentController';
import { getClassGradebook } from '../controllers/gradebookController';
import { getTeacherTimetable, getLivePeriod } from '../controllers/timetableController';
import { getAnnouncements, createAnnouncement } from '../controllers/noticeController';
import { logBehavior, getClassBehaviors } from '../controllers/behaviorController';
import {
  getThreads,
  getConversation,
  sendMessage,
  verifyParentPin,
} from '../controllers/messageController';
import {
  generateReportCardComment,
  generateLessonPlan,
  generateRubric,
  generateIntervention,
  generateGradingFeedback,
  getAiConfig,
  updateAiConfig,
} from '../controllers/aiController';
import { getParentChildren, getStudentDashboard } from '../controllers/mobileController';
import { importStudents } from '../controllers/importController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================
router.post('/auth/login', login);
router.post('/auth/register-school', registerSchool);
router.post('/auth/register-teacher', registerTeacher);
router.get('/schools', listSchools);

// ==========================================
// AUTHENTICATED COMMON ENDPOINTS
// ==========================================
router.use(authenticateToken);

router.get('/auth/me', getMe);
router.get('/schools/details', getSchoolDetails);
router.get('/notices', getAnnouncements); // Announcements readable by all authenticated stakeholders
router.get('/messages/threads', getThreads);
router.get('/messages/:otherUserId', getConversation);
router.post('/messages', sendMessage);

// ==========================================
// TEACHER & FACULTY ENDPOINTS (Restricted)
// ==========================================
const facultyRoles = ['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'];

router.get('/classes', requireRole(facultyRoles), getTeacherClasses);
router.get('/classes/:classId/students', requireRole(facultyRoles), getClassStudents);
router.get('/students/:studentId/360', requireRole(facultyRoles), getStudent360);
router.post('/classes/import-students', requireRole(facultyRoles), importStudents);

// Attendance
router.get('/attendance/:classId', requireRole(facultyRoles), getClassAttendanceByDate);
router.post('/attendance/:classId/batch', requireRole(facultyRoles), recordBatchAttendance);

// Assignments & Grading Studio
router.get('/assignments', requireRole(facultyRoles), getTeacherAssignments);
router.post('/assignments', requireRole(facultyRoles), createAssignment);
router.get('/assignments/:assignmentId/submissions', requireRole(facultyRoles), getAssignmentSubmissions);
router.post('/assignments/:assignmentId/submissions/:studentId/grade', requireRole(facultyRoles), gradeSubmission);

// Matrix Gradebook
router.get('/gradebook/:classId', requireRole(facultyRoles), getClassGradebook);

// Timetable & Live Period
router.get('/timetable', requireRole(facultyRoles), getTeacherTimetable);
router.get('/timetable/live', requireRole(facultyRoles), getLivePeriod);

// Announcements (Creation restricted to staff/faculty)
router.post('/notices', requireRole(facultyRoles), createAnnouncement);

// Pastoral Care & Behavior Merits
router.post('/behavior', requireRole(facultyRoles), logBehavior);
router.get('/classes/:classId/behaviors', requireRole(facultyRoles), getClassBehaviors);

// Pedagogical AI Studio
router.post('/ai/report-card', requireRole(facultyRoles), generateReportCardComment);
router.post('/ai/lesson-plan', requireRole(facultyRoles), generateLessonPlan);
router.post('/ai/rubric', requireRole(facultyRoles), generateRubric);
router.post('/ai/intervention', requireRole(facultyRoles), generateIntervention);
router.post('/ai/grading-feedback', requireRole(facultyRoles), generateGradingFeedback);

// ==========================================
// ADMIN ONLY ENDPOINTS (Restricted from Teachers & Others)
// ==========================================
const adminRoles = ['SCHOOL_ADMIN', 'SUPER_ADMIN'];

router.get('/ai/config', requireRole(adminRoles), getAiConfig);
router.post('/ai/config', requireRole(adminRoles), updateAiConfig);

// ==========================================
// STUDENT ONLY ENDPOINTS (Restricted)
// ==========================================
router.post('/student/assignments/:assignmentId/submit', requireRole(['STUDENT']), submitHomework);
router.get('/mobile/student/dashboard', requireRole(['STUDENT']), getStudentDashboard);

// ==========================================
// PARENT ONLY ENDPOINTS (Restricted)
// ==========================================
router.get('/mobile/parent/children', requireRole(['PARENT']), getParentChildren);
router.post('/parent/verify-pin', requireRole(['PARENT']), verifyParentPin);

export default router;
