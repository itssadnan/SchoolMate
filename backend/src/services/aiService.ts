import { prisma } from '../config/db';
import { ENV } from '../config/env';

export interface AiConfig {
  provider: string;
  baseURL: string;
  model: string;
  apiKey: string;
  temperature: number;
}

export class AiService {
  /**
   * Retrieves AI configuration from DB (SchoolSetting) or falls back to ENV properties
   */
  static async getConfig(schoolId?: string): Promise<AiConfig> {
    if (schoolId) {
      try {
        const dbSetting = await prisma.schoolSetting.findUnique({
          where: {
            schoolId_settingKey: {
              schoolId,
              settingKey: 'AI_MODEL_CONFIG',
            },
          },
        });

        if (dbSetting && dbSetting.settingValue) {
          const parsed = JSON.parse(dbSetting.settingValue);
          return {
            provider: parsed.provider || ENV.AI_PROVIDER,
            baseURL: parsed.baseURL || ENV.AI_BASE_URL,
            model: parsed.model || ENV.AI_MODEL,
            apiKey: parsed.apiKey || ENV.AI_API_KEY,
            temperature: parsed.temperature ?? ENV.AI_TEMPERATURE,
          };
        }
      } catch (err) {
        console.warn('Could not read AI config from DB, falling back to ENV', err);
      }
    }

    return {
      provider: ENV.AI_PROVIDER,
      baseURL: ENV.AI_BASE_URL,
      model: ENV.AI_MODEL,
      apiKey: ENV.AI_API_KEY,
      temperature: ENV.AI_TEMPERATURE,
    };
  }

  /**
   * Updates AI configuration in DB for a specific school
   */
  static async updateConfig(schoolId: string, config: Partial<AiConfig>) {
    const current = await this.getConfig(schoolId);
    const updated = { ...current, ...config };

    return prisma.schoolSetting.upsert({
      where: {
        schoolId_settingKey: {
          schoolId,
          settingKey: 'AI_MODEL_CONFIG',
        },
      },
      update: {
        settingValue: JSON.stringify(updated),
      },
      create: {
        schoolId,
        settingKey: 'AI_MODEL_CONFIG',
        settingValue: JSON.stringify(updated),
      },
    });
  }

  /**
   * Core generation method using NVIDIA Build / OpenAI compatible endpoint
   * with automatic fallback to high-fidelity local pedagogical synthesizer
   */
  static async generateCompletion(
    prompt: string,
    systemPrompt: string,
    schoolId?: string,
    fallbackGenerator?: () => string
  ): Promise<{ text: string; source: 'nvidia_build' | 'local_synthesizer'; model: string }> {
    const config = await this.getConfig(schoolId);

    // If API key is provided, attempt call to NVIDIA Build / OpenAI endpoint
    if (config.apiKey && config.apiKey.trim().length > 0) {
      try {
        const endpoint = `${config.baseURL.replace(/\/$/, '')}/chat/completions`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: config.temperature,
            max_tokens: 1500,
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return {
              text: reply,
              source: 'nvidia_build',
              model: config.model,
            };
          }
        } else {
          console.warn(`NVIDIA API returned status ${response.status}. Using smart local fallback.`);
        }
      } catch (error) {
        console.warn('NVIDIA API call failed, activating smart local synthesizer:', error);
      }
    }

    // High fidelity offline synthesizer fallback
    const resultText = fallbackGenerator ? fallbackGenerator() : this.defaultFallback(prompt);
    return {
      text: resultText,
      source: 'local_synthesizer',
      model: `${config.model} (Zero-Cost Local Orchestrator)`,
    };
  }

  /**
   * 1. Evidence-Based Report Card Comment Synthesizer
   */
  static async generateReportCardComment(params: {
    studentName: string;
    subject: string;
    gradeAverage: number;
    attendanceRate: number;
    strengths: string[];
    growthAreas?: string[];
    teacherTone?: string;
    schoolId?: string;
  }) {
    const systemPrompt =
      'You are a senior department head and expert pedagogical advisor. Generate an authentic, nuanced, evidence-based report card comment written from the teacher to parents. Synthesize the student data precisely with actionable feedback.';
    
    const prompt = `Student Name: ${params.studentName}
Subject: ${params.subject}
Academic Performance: ${params.gradeAverage}% average score
Attendance Record: ${params.attendanceRate}% present
Notable Strengths: ${params.strengths.join(', ')}
Areas for Growth: ${params.growthAreas?.join(', ') || 'Independent revision habits'}
Teacher Tone: ${params.teacherTone || 'Warm, inspiring, and actionable'}`;

    return this.generateCompletion(prompt, systemPrompt, params.schoolId, () => {
      const avg = params.gradeAverage;
      const att = params.attendanceRate;
      const tone = params.teacherTone?.toLowerCase() || 'warm';

      // 1. Academic Performance Tier
      let academicOpening = '';
      if (avg >= 94) {
        academicOpening = `${params.studentName} has delivered an extraordinary academic performance in ${params.subject} this term, securing an outstanding ${avg}% average score. Their command of both foundational theories and intricate analytical problem-solving sets a benchmark for intellectual curiosity.`;
      } else if (avg >= 85) {
        academicOpening = `${params.studentName} has had a consistently strong and commendable term in ${params.subject}, achieving a praiseworthy ${avg}% average. They demonstrate a dependable understanding of core concepts and regularly apply reasoned methodologies during assessments.`;
      } else if (avg >= 75) {
        academicOpening = `${params.studentName} has maintained solid progress in ${params.subject} this term with an overall average of ${avg}%. They show steady engagement with central syllabus themes and have made demonstrable strides across unit checkpoints.`;
      } else if (avg >= 65) {
        academicOpening = `${params.studentName} is demonstrating positive potential in ${params.subject}, finishing the term with a ${avg}% average. While foundational comprehension is emerging, more consistent reinforcement of analytical techniques will help consolidate their learning.`;
      } else {
        academicOpening = `${params.studentName} has encountered academic challenges in ${params.subject} this term, currently holding an average of ${avg}%. With targeted structural support and renewed focus on foundational coursework, they are capable of regaining positive momentum.`;
      }

      // 2. Attendance & Engagement Analysis
      let attendanceSection = '';
      if (att >= 96) {
        attendanceSection = `With an exemplary ${att}% attendance record, ${params.studentName}'s punctual presence creates a positive classroom anchor. Their reliability ensures seamless continuity across collaborative practicals and classroom seminars.`;
      } else if (att >= 88) {
        attendanceSection = `Maintaining a healthy ${att}% attendance rate, ${params.studentName} attends lessons with good regularity and contributes constructively to group discussions.`;
      } else if (att >= 75) {
        attendanceSection = `With an attendance rate of ${att}%, occasional absences have interrupted the sequence of complex unit topics; minimizing missed periods will immediately bolster their retention and confidence.`;
      } else {
        attendanceSection = `At ${att}% attendance, missed instructional hours have significantly impacted coursework continuity. Prioritizing regular attendance will be an essential foundation for academic recovery next term.`;
      }

      // 3. Learning Dispositions & Demonstrated Strengths
      const strengthsList = params.strengths && params.strengths.length > 0 
        ? params.strengths.join(', ') 
        : 'inquisitive questioning and analytical thinking';
      const dispositionSection = `In day-to-day lessons, ${params.studentName} particularly distinguishes themselves through ${strengthsList}. They demonstrate genuine enthusiasm when dissecting challenging case studies and actively collaborate with peers to refine their reasoning.`;

      // 4. Growth Trajectory & Actionable Next Steps
      const growthList = params.growthAreas && params.growthAreas.length > 0
        ? params.growthAreas.join(' and ')
        : 'structuring written responses with precision and maintaining continuous revision habits';
      const nextStepsSection = `Looking ahead to the upcoming academic term, I encourage ${params.studentName} to focus on ${growthList}. Embracing regular self-assessment and utilizing teacher feedback loops will allow them to translate their conceptual grasp into peak examination performance.`;

      // 5. Teacher Closing by Tone
      let closing = '';
      if (tone.includes('formal') || tone.includes('academic')) {
        closing = `It is a pleasure having ${params.studentName} in our department, and I anticipate continued academic advancement in the terms ahead.`;
      } else if (tone.includes('growth') || tone.includes('restorative')) {
        closing = `${params.studentName}'s growth mindset and perseverance are commendable. I look forward to supporting their ongoing journey towards academic excellence!`;
      } else {
        closing = `It has been an absolute delight teaching ${params.studentName} this term. I am very proud of their dedication and look forward to celebrating their continued milestones!`;
      }

      return `${academicOpening}\n\n${attendanceSection}\n\n${dispositionSection}\n\n${nextStepsSection}\n\n${closing}`;
    });
  }

  /**
   * 2. Toddle / IB Inquiry Framework 45-Min Lesson Planner
   */
  static async generateLessonPlan(params: {
    topic: string;
    gradeLevel: string;
    subject: string;
    durationMinutes?: number;
    learningStyle?: string;
    schoolId?: string;
  }) {
    const duration = params.durationMinutes || 45;
    const systemPrompt =
      'You are a world-class educational consultant and IB/Cambridge curriculum designer. Build a rigorous, timed, inquiry-based lesson plan following the Toddle/IB framework with an inquiry hook, guided conceptual breakdown, differentiated challenges, and formative exit tickets.';
    
    const prompt = `Topic: ${params.topic}
Subject: ${params.subject}
Grade Level: ${params.gradeLevel}
Duration: ${duration} minutes
Pedagogical Approach: ${params.learningStyle || 'Hands-on inquiry and real-world application'}`;

    return this.generateCompletion(prompt, systemPrompt, params.schoolId, () => {
      // Calculate dynamic minute allocation based on duration
      const hookMins = Math.max(5, Math.round(duration * 0.16));
      const guidedMins = Math.round(duration * 0.28);
      const appMins = Math.round(duration * 0.36);
      const exitMins = Math.max(5, duration - hookMins - guidedMins - appMins);

      // Subject classification for tailored pedagogical questions
      const subjLower = params.subject.toLowerCase();
      let centralQuestion = `How does understanding "${params.topic}" empower us to explain and solve real-world challenges?`;
      let hookActivity = `Present an engaging 2-minute demonstration or visual discrepancy illustrating "${params.topic}". Have students record on sticky notes: "What did I observe?" vs "What underlying rule caused it?"`;
      
      if (subjLower.includes('physic') || subjLower.includes('chem') || subjLower.includes('sci')) {
        centralQuestion = `What empirical forces or mechanisms dictate the behavior of ${params.topic}, and how do we measure their effects?`;
        hookActivity = `Display a slow-motion video of a dynamic physical event related to ${params.topic}. Facilitate a rapid "Predict-Observe-Explain" prompt on individual mini-whiteboards.`;
      } else if (subjLower.includes('math') || subjLower.includes('stat')) {
        centralQuestion = `How can mathematical modeling of ${params.topic} transform complex real-world data into predictable patterns?`;
        hookActivity = `Pose a real-world optimization conundrum (e.g., predicting trajectory or budget allocation) that seems unsolvable without the formula of ${params.topic}.`;
      } else if (subjLower.includes('hist') || subjLower.includes('human') || subjLower.includes('soc')) {
        centralQuestion = `To what extent did the dynamics of ${params.topic} reshape institutional power and human societal structures?`;
        hookActivity = `Share a primary source excerpt or contrasting eyewitness accounts regarding ${params.topic} without revealing the historical outcome. Prompt students: "What perspective is missing?"`;
      } else if (subjLower.includes('lit') || subjLower.includes('eng')) {
        centralQuestion = `How do narrative techniques and rhetorical conventions in ${params.topic} evoke empathy and critique cultural paradigms?`;
        hookActivity = `Analyze a 3-line evocative excerpt reflecting ${params.topic}. Students underline power verbs and identify subtle authorial subtext.`;
      }

      return `# 📖 Inquiry-Based Lesson Plan: ${params.topic}
**Subject:** ${params.subject} | **Target Cohort:** ${params.gradeLevel} | **Duration:** ${duration} Minutes
**Pedagogical Framework:** Toddle / IB Inquiry Cycle (Provocation ➔ Investigation ➔ Application ➔ Reflection)

---

### 🎯 Key Learning Objectives
- **Conceptual Knowledge:** Students will understand and synthesize the governing principles of **${params.topic}**.
- **Inquiry & Critical Analysis:** Formulate empirical hypotheses and justify conclusions with analytical evidence.
- **Real-World Application:** Transfer the theoretical framework of ${params.topic} to evaluate an authentic case scenario.

### ❓ Central Inquiry Question
> *" ${centralQuestion} "*

---

### ⏱️ Instructional Timeline & Phases

#### 1. Provocation & The Hook (00 – ${String(hookMins).padStart(2, '0')} Mins)
- **Activity:** ${hookActivity}
- **Thinking Routine:** *Think-Pair-Share* — students compare observations with an elbow partner before 3 key insights are charted on the primary board.
- **Formative Baseline Check:** Teacher polls the room using thumbs/hand-signals to calibrate pre-existing familiarity.

#### 2. Guided Exploration & Concept Breakdown (${String(hookMins).padStart(2, '0')} – ${String(hookMins + guidedMins).padStart(2, '0')} Mins)
- **Teacher Modeling:** Direct conceptual instruction using interactive diagrams, step-by-step worked examples, and structured questioning.
- **Active Note-Taking:** Students populate a dual-column Guided Inquiry Graphic Organizer (*Key Concept* vs *Mathematical / Logical Proof*).
- **Misconception Alert:** Proactively address common pitfalls (e.g., confusing correlation with causation, or overlooking unit scalar interactions).

#### 3. Differentiated Application Challenge (${String(hookMins + guidedMins).padStart(2, '0')} – ${String(hookMins + guidedMins + appMins).padStart(2, '0')} Mins)
- **Collaborative Investigation:** Students form heterogeneous trios to tackle a multi-tiered problem dossier centered on **${params.topic}**.
- **Deliverable:** Groups synthesize their calculations/arguments onto an interactive collaborative sheet with peer review rotation at minute ${hookMins + guidedMins + Math.round(appMins / 2)}.

#### 4. Synthesis & Formative Exit Ticket (${String(hookMins + guidedMins + appMins).padStart(2, '0')} – ${duration} Mins)
- **Consolidation:** Teacher summarizes key discoveries and connects today's principles to the upcoming curricular unit.
- **3-2-1 Exit Ticket:**
  1. *3 core takeaways or governing equations mastered today.*
  2. *2 real-world engineering, historical, or literary applications of ${params.topic}.*
  3. *1 lingering question or conceptual puzzle to explore in the next lab/seminar.*

---

### 🌟 Differentiated Scaffolding Architecture
- **Tier 1 (Targeted Scaffolding & Support):** Provide pre-populated reference cards with formula breakdowns, structural sentence frames, and paired mentor seating.
- **Tier 2 (Core Mastery):** Standard inquiry dossier requiring independent derivation and multi-step justifications.
- **Tier 3 (Honors & Extension Challenge):** Open-ended boundary question: *"How would this model alter under extreme conditions or non-standard constraints?"*

---

### 🛠️ Required Materials & Educational Technology
- Interactive Digital Display / Projector
- Guided Inquiry Worksheets & Lab/Analysis Dossiers
- Mini-whiteboards with dry-erase markers
- Institutional LMS portal access for submission upload`;
    });
  }

  /**
   * 3. 4-Tier Assessment Rubric Generator
   */
  static async generateRubric(params: {
    title: string;
    subject: string;
    maxPoints: number;
    schoolId?: string;
  }) {
    const systemPrompt =
      'You are a senior assessment specialist. Generate a comprehensive, 4-level scoring rubric (Exemplary, Proficient, Developing, Novice) tailored to the specific assignment title and discipline with explicit criteria percentages.';
    
    const prompt = `Assignment Title: ${params.title}
Subject: ${params.subject}
Total Marks: ${params.maxPoints}`;

    return this.generateCompletion(prompt, systemPrompt, params.schoolId, () => {
      const titleLower = params.title.toLowerCase();
      const subjLower = params.subject.toLowerCase();
      const max = params.maxPoints || 100;

      // Determine rubric category based on assignment context
      const isLab = titleLower.includes('lab') || titleLower.includes('experiment') || titleLower.includes('investigation') || subjLower.includes('physics') || subjLower.includes('chemistry') || subjLower.includes('bio');
      const isEssay = titleLower.includes('essay') || titleLower.includes('paper') || titleLower.includes('analysis') || titleLower.includes('critique') || subjLower.includes('history') || subjLower.includes('literature');

      if (isLab) {
        return JSON.stringify([
          {
            criterion: 'Hypothesis Formulation & Scientific Methodology',
            weight: '25%',
            points: Math.round(max * 0.25),
            levels: {
              exemplary: 'Formulates a testable, sophisticated hypothesis grounded in scientific theory. Methodology is meticulously planned with complete variable isolation.',
              proficient: 'Hypothesis is clear and reasoned. Methodology identifies primary independent and dependent variables with adequate control mechanisms.',
              developing: 'Hypothesis is generic or partially untestable. Methodology contains minor ambiguities or unaddressed confounding variables.',
              novice: 'Lacks a structured hypothesis or fails to design a coherent experimental procedure with controlled conditions.',
            },
          },
          {
            criterion: 'Data Collection, Quantitative Accuracy & Modeling',
            weight: '35%',
            points: Math.round(max * 0.35),
            levels: {
              exemplary: 'Raw data is comprehensive, rigorously tabulated with appropriate SI units, error bounds, and professional graphical representations.',
              proficient: 'Data is recorded systematically with correct units and clear graphs; minor minor non-critical charting oversights.',
              developing: 'Data shows omissions, irregular units, or imprecise graph axes that hinder thorough mathematical analysis.',
              novice: 'Data is incomplete, untabulated, or contains severe mathematical and unit errors throughout.',
            },
          },
          {
            criterion: 'Analytical Evaluation & Error Synthesis',
            weight: '25%',
            points: Math.round(max * 0.25),
            levels: {
              exemplary: 'Offers nuanced critical interpretation of experimental anomalies, quantifies percentage error, and proposes sophisticated methodological refinements.',
              proficient: 'Discusses results in relation to the original hypothesis and identifies sensible sources of systematic or random error.',
              developing: 'Superficial discussion of outcomes with generic statements of error (e.g., "human error") lacking empirical justification.',
              novice: 'Omits analysis of results or draws conclusions contradictory to the collected experimental data.',
            },
          },
          {
            criterion: 'Academic Conventions, Formatting & Citations',
            weight: '15%',
            points: Math.round(max * 0.15),
            levels: {
              exemplary: 'Impeccable scientific report structure, professional diagrams, precise technical terminology, and flawless academic citations.',
              proficient: 'Well-structured lab report adhering to standard scientific conventions with minor layout inconsistencies.',
              developing: 'Formatting is informal or inconsistent; technical vocabulary is used loosely or without definitions.',
              novice: 'Lacks required report structure, missing section headers, or shows evidence of incomplete presentation.',
            },
          },
        ]);
      } else if (isEssay) {
        return JSON.stringify([
          {
            criterion: 'Thesis Formulation & Conceptual Depth',
            weight: '30%',
            points: Math.round(max * 0.30),
            levels: {
              exemplary: 'Articulates an insightful, original thesis that directly addresses the core prompt with intellectual nuance and depth.',
              proficient: 'Presents a clear, defensible thesis statement that establishes a structured argumentative roadmap.',
              developing: 'Thesis is overly broad, descriptive rather than argumentative, or partially decoupled from the prompt.',
              novice: 'Lacks an identifiable thesis or presents a confusing, self-contradictory premise.',
            },
          },
          {
            criterion: 'Textual Evidence, Grounding & Synthesis',
            weight: '30%',
            points: Math.round(max * 0.30),
            levels: {
              exemplary: 'Seamlessly integrates compelling primary and secondary source evidence to anchor every line of argumentation.',
              proficient: 'Incorporates sufficient relevant evidence to support major claims with appropriate contextual explanation.',
              developing: 'Relies on repetitive evidence or leaves quotes unanalyzed ("quote bombing") without explicit connective commentary.',
              novice: 'Assertions are unsupported by textual evidence or draw on inaccurate, out-of-context references.',
            },
          },
          {
            criterion: 'Critical Argumentation & Counter-Perspective',
            weight: '25%',
            points: Math.round(max * 0.25),
            levels: {
              exemplary: 'Sustains a rigorous line of reasoning, anticipates counter-arguments, and synthesizes opposing viewpoints with elegance.',
              proficient: 'Logical progression of arguments is sustained with coherent transitions between thematic paragraphs.',
              developing: 'Argument shows occasional logical lapses, circular reasoning, or sudden abrupt topical shifts.',
              novice: 'Disorganized thoughts with disjointed paragraphs that fail to build a sustained analytical perspective.',
            },
          },
          {
            criterion: 'Academic Register, Clarity & Mechanics',
            weight: '15%',
            points: Math.round(max * 0.15),
            levels: {
              exemplary: 'Demonstrates command of formal academic prose, varied sentence architecture, and impeccable grammatical precision.',
              proficient: 'Clear, fluent writing with formal tone and minimal stylistic or punctuation infractions.',
              developing: 'Frequent colloquialisms, repetitive syntax, or recurring grammatical slips that distract from comprehension.',
              novice: 'Pervasive mechanical and structural errors that severely impede readability and academic tone.',
            },
          },
        ]);
      } else {
        // Standard Comprehensive Multidisciplinary Rubric
        return JSON.stringify([
          {
            criterion: 'Conceptual Knowledge & Core Accuracy',
            weight: '35%',
            points: Math.round(max * 0.35),
            levels: {
              exemplary: 'Exhibits complete, authoritative mastery of all theoretical concepts with zero misconceptions.',
              proficient: 'Demonstrates solid, reliable grasp of essential principles with minor, non-critical inaccuracies.',
              developing: 'Basic understanding is evident, but struggles when applying concepts to non-routine problems.',
              novice: 'Significant foundational gaps and recurring theoretical misunderstandings throughout.',
            },
          },
          {
            criterion: 'Analytical Problem-Solving & Methodology',
            weight: '35%',
            points: Math.round(max * 0.35),
            levels: {
              exemplary: 'Deploys sophisticated, multi-step problem-solving strategies and rigorously justifies all procedural decisions.',
              proficient: 'Applies appropriate problem-solving procedures with logical step-by-step working and valid answers.',
              developing: 'Partial problem-solving steps shown; requires prompting or skips crucial intermediate workings.',
              novice: 'Unable to formulate an effective approach or applies completely invalid methodologies.',
            },
          },
          {
            criterion: 'Organization, Communication & Delivery',
            weight: '30%',
            points: Math.round(max * 0.30),
            levels: {
              exemplary: 'Exceptionally organized, visually elegant presentation with clear annotations, diagrams, and professional formatting.',
              proficient: 'Neat, well-ordered submission that is easy to navigate and review.',
              developing: 'Somewhat disorganized layout; annotations are sparse or difficult to decipher.',
              novice: 'Careless formatting, incomplete sections, or missing essential required deliverables.',
            },
          },
        ]);
      }
    });
  }

  /**
   * 4. Early Intervention Academic & Attendance Radar
   */
  static async generateInterventionPlan(params: {
    studentName: string;
    attendanceRate: number;
    gradeAverage: number;
    subject: string;
    schoolId?: string;
  }) {
    const systemPrompt =
      'You are a compassionate school counselor and academic intervention specialist. Produce a structured, 3-phase pastoral and instructional recovery plan for an at-risk student based on their attendance and grade data.';
    
    const prompt = `Student: ${params.studentName}
Subject: ${params.subject}
Attendance Rate: ${params.attendanceRate}%
Grade Average: ${params.gradeAverage}%`;

    return this.generateCompletion(prompt, systemPrompt, params.schoolId, () => {
      const att = params.attendanceRate;
      const avg = params.gradeAverage;

      // Determine severity level
      let urgencyTier = '🟢 Tier 1: Preventive Monitoring';
      let riskDiagnosis = 'Mild disengagement or isolated assessment dip.';
      if (att < 75 || avg < 60) {
        urgencyTier = '🔴 Tier 3: Critical Priority Intervention';
        riskDiagnosis = 'Acute risk of credit loss and compounding conceptual deficit requiring rapid interdisciplinary response.';
      } else if (att < 85 || avg < 72) {
        urgencyTier = '🟡 Tier 2: Targeted Academic Radar';
        riskDiagnosis = 'Emerging attendance gaps and assessment inconsistency threatening term mastery.';
      }

      return `### 🚨 Academic & Pastoral Intervention Dossier: ${params.studentName}
**Subject:** ${params.subject} | **Classification:** ${urgencyTier}
**Diagnostic Metrics:** Current Grade: **${avg}%** | Attendance Rate: **${att}%**

---

### 🔍 Diagnostic Root-Cause Analysis
> **Evaluated Risk Pattern:** *${riskDiagnosis}*
${
  att < 80 
    ? `- **Attendance Factor:** The ${att}% attendance rate indicates approximately ${Math.round((100 - att) * 0.4)} missed instructional periods. This disrupted the sequential scaffolding of unit topics.`
    : `- **Attendance Factor:** Attendance at ${att}% is stable; the academic deficit (${avg}%) stems primarily from assessment execution or exam confidence rather than absenteeism.`
}
${
  avg < 65 
    ? `- **Assessment Factor:** Summative scores (${avg}%) show critical foundational misconceptions. Immediate remediation of prerequisites is necessary before introducing advanced content.`
    : `- **Assessment Factor:** Student possesses workable foundational knowledge, but lacks consistent study routines and assignment completion diligence.`
}

---

### 📋 3-Phase Action & Recovery Roadmap

#### Phase 1: Rapid 48-Hour Pastoral Stabilization
1. **1-on-1 Restorative Conference:** Schedule a private, 12-minute check-in with ${params.studentName} to understand emotional wellbeing, subject anxieties, and outside commitments without punitive framing.
2. **Classroom Anchor Seating:** Relocate seating to an active learning zone adjacent to an encouraging peer mentor for collaborative reassurance.
3. **Core Concept Diagnostic Check:** Administer a low-stakes 5-question baseline check to pinpoint exact prerequisite gaps.

#### Phase 2: Differentiated Instructional Scaffolding (Weeks 1 – 2)
1. **"Chunked" Deliverables:** Break all summative tasks into 3 manageable checkpoints (Outline ➔ Draft ➔ Final) with immediate micro-feedback from the teacher.
2. **Structured Revision Packs:** Supply curated worked-example cards and formula/vocabulary reference sheets for home study.
3. **Dedicated Bi-Weekly Office Hours:** Two 15-minute weekly clinics during homeroom or advisory periods for targeted guidance.

#### Phase 3: Family Partnership & Quantitative Benchmarks (Weeks 2 – 4)
1. **Empathetic Guardian Collaboration:** Dispatch a proactive, solution-oriented communication to parents emphasizing support mechanisms rather than criticism.
2. **Weekly Attendance Tracking:** Implement a shared digital attendance log with parents to celebrate consecutive on-time arrivals.
3. **Quantitative 3-Week Target Benchmark:**
   - **Target Grade Elevation:** Lift assessment average from **${avg}%** to **${Math.min(100, avg + 12)}%**.
   - **Target Attendance Threshold:** Achieve **95%+ on-time presence** across the next 15 school days.`;
    });
  }

  /**
   * 5. Speed Grading Constructive Feedback Synthesizer
   */
  static async generateGradingFeedback(params: {
    studentName: string;
    assignmentTitle: string;
    score: number;
    maxScore: number;
    submissionText?: string;
    subject?: string;
    schoolId?: string;
  }) {
    const percentage = Math.round((params.score / params.maxScore) * 100);
    const systemPrompt =
      'You are an inspiring master educator grading student submissions. Provide specific, encouraging, and constructive criterion-referenced feedback balancing praise with actionable growth steps.';
    
    const prompt = `Student: ${params.studentName}
Assignment: ${params.assignmentTitle}
Subject: ${params.subject || 'General Studies'}
Score: ${params.score} / ${params.maxScore} (${percentage}%)
Student Submission Content: ${params.submissionText ? `"${params.submissionText}"` : 'Standard assignment answers submitted online.'}`;

    return this.generateCompletion(prompt, systemPrompt, params.schoolId, () => {
      const name = params.studentName;
      const title = params.assignmentTitle;

      if (percentage >= 90) {
        return `Exceptional work on "${title}", ${name}! Your submission demonstrates profound conceptual mastery and rigorous attention to detail (${params.score}/${params.maxScore} marks). I was particularly impressed by the precision of your analytical reasoning and the clear organization of your findings. To challenge yourself even further, consider how these principles interact under non-standard external conditions. Keep setting this stellar academic benchmark!`;
      } else if (percentage >= 75) {
        return `Very commendable effort on "${title}", ${name} (${params.score}/${params.maxScore} marks). You show a solid grasp of the core concepts and executed the main methodology correctly. To elevate your work to full distinction marks next time, ensure you thoroughly document every intermediate calculation and explicitly justify your concluding statements. Great progress!`;
      } else if (percentage >= 60) {
        return `Good foundation shown on "${title}", ${name} (${params.score}/${params.maxScore} marks). You have identified the main themes correctly; however, several answers would benefit from deeper elaboration and careful checking of units and terminology. I encourage you to review the worked examples we covered in class and consult my inline annotations for key corrections. You have the capability to push higher!`;
      } else {
        return `Thank you for your submission on "${title}", ${name} (${params.score}/${params.maxScore} marks). It is evident that you attempted the core questions, but there are a few central misunderstandings in this unit that need our attention. Please come see me for a quick 10-minute clinic during advisory this week so we can review the foundational steps together and get you back on track for the next assessment.`;
      }
    });
  }

  private static defaultFallback(prompt: string): string {
    return `AI Educational Output for:\n"${prompt.substring(0, 120)}..."\n\nGenerated with high-fidelity institutional pedagogical synthesizer.`;
  }
}
