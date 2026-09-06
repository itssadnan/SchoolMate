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

// ==========================================
// TEACHER WORKSPACE ENDPOINTS
// ==========================================
router.get('/classes', getTeacherClasses);
router.get('/classes/:classId/students', getClassStudents);
router.get('/students/:studentId/360', getStudent360);

// Attendance
router.get('/attendance/:classId', getClassAttendanceByDate);
router.post('/attendance/:classId/batch', recordBatchAttendance);

// Assignments & Grading
router.get('/assignments', getTeacherAssignments);
router.post('/assignments', createAssignment);
router.get('/assignments/:assignmentId/submissions', getAssignmentSubmissions);
router.post('/assignments/:assignmentId/submissions/:studentId/grade', gradeSubmission);

// Matrix Gradebook
router.get('/gradebook/:classId', getClassGradebook);

// Timetable & Live Period
router.get('/timetable', getTeacherTimetable);
router.get('/timetable/live', getLivePeriod);

// Announcements & Communication
router.get('/notices', getAnnouncements);
router.post('/notices', createAnnouncement);

// Pastoral Care & Behavior Merits
router.post('/behavior', logBehavior);
router.get('/classes/:classId/behaviors', getClassBehaviors);

// Teacher AI Studio
router.post('/ai/report-card', generateReportCardComment);
router.post('/ai/lesson-plan', generateLessonPlan);
router.post('/ai/rubric', generateRubric);
router.post('/ai/intervention', generateIntervention);
router.post('/ai/grading-feedback', generateGradingFeedback);
router.get('/ai/config', getAiConfig);
router.post('/ai/config', updateAiConfig);

// Student Coursework Submission
router.post('/student/assignments/:assignmentId/submit', submitHomework);

// Parent-Teacher Direct Discussion & Parent PIN Protection
router.get('/messages/threads', getThreads);
router.get('/messages/:otherUserId', getConversation);
router.post('/messages', sendMessage);
router.post('/parent/verify-pin', verifyParentPin);

// ==========================================
// MOBILE READINESS ENDPOINTS (Phase 2)
// ==========================================
router.get('/mobile/parent/children', getParentChildren);
router.get('/mobile/student/dashboard', getStudentDashboard);

export default router;

