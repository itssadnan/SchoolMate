import { Response } from 'express';
import { AiService } from '../services/aiService';
import { TenantRequest } from '../middleware/tenant';

export const generateReportCardComment = async (req: TenantRequest, res: Response) => {
  try {
    const { studentName, subject, gradeAverage, attendanceRate, strengths, growthAreas, teacherTone } = req.body;
    const schoolId = req.user?.schoolId || req.school?.id;

    if (!studentName || !subject) {
      return res.status(400).json({ error: 'Student name and subject are required' });
    }

    const result = await AiService.generateReportCardComment({
      studentName,
      subject,
      gradeAverage: gradeAverage !== undefined ? Number(gradeAverage) : 88,
      attendanceRate: attendanceRate !== undefined ? Number(attendanceRate) : 95,
      strengths: Array.isArray(strengths) && strengths.length > 0 ? strengths : ['Curiosity', 'Analytical Problem Solving'],
      growthAreas: Array.isArray(growthAreas) ? growthAreas : ['Detailed lab write-up documentation'],
      teacherTone,
      schoolId,
    });

    return res.json(result);
  } catch (error) {
    console.error('generateReportCardComment error:', error);
    return res.status(500).json({ error: 'Failed to generate report card comment' });
  }
};

export const generateLessonPlan = async (req: TenantRequest, res: Response) => {
  try {
    const { topic, gradeLevel, subject, durationMinutes, learningStyle } = req.body;
    const schoolId = req.user?.schoolId || req.school?.id;

    if (!topic || !subject) {
      return res.status(400).json({ error: 'Topic and subject are required' });
    }

    const result = await AiService.generateLessonPlan({
      topic,
      gradeLevel: gradeLevel || 'Grade 9',
      subject,
      durationMinutes: durationMinutes ? Number(durationMinutes) : 45,
      learningStyle,
      schoolId,
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate lesson plan' });
  }
};

export const generateRubric = async (req: TenantRequest, res: Response) => {
  try {
    const { title, subject, maxPoints } = req.body;
    const schoolId = req.user?.schoolId || req.school?.id;

    if (!title || !subject) {
      return res.status(400).json({ error: 'Title and subject are required' });
    }

    const result = await AiService.generateRubric({
      title,
      subject,
      maxPoints: maxPoints ? Number(maxPoints) : 100,
      schoolId,
    });

    let criteria;
    try {
      criteria = JSON.parse(result.text);
    } catch {
      criteria = result.text;
    }

    return res.json({
      rubric: criteria,
      source: result.source,
      model: result.model,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate rubric' });
  }
};

export const generateIntervention = async (req: TenantRequest, res: Response) => {
  try {
    const { studentName, attendanceRate, gradeAverage, subject } = req.body;
    const schoolId = req.user?.schoolId || req.school?.id;

    if (!studentName || !subject) {
      return res.status(400).json({ error: 'Student name and subject are required' });
    }

    const result = await AiService.generateInterventionPlan({
      studentName,
      attendanceRate: attendanceRate ? Number(attendanceRate) : 78,
      gradeAverage: gradeAverage ? Number(gradeAverage) : 62,
      subject,
      schoolId,
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate intervention plan' });
  }
};

export const getAiConfig = async (req: TenantRequest, res: Response) => {
  try {
    const schoolId = req.user?.schoolId || req.school?.id;
    const config = await AiService.getConfig(schoolId);

    // Return config masking most of the key for security
    const maskedKey = config.apiKey ? `${config.apiKey.substring(0, 7)}...${config.apiKey.slice(-4)}` : '';

    return res.json({
      provider: config.provider,
      baseURL: config.baseURL,
      model: config.model,
      temperature: config.temperature,
      hasApiKey: !!(config.apiKey && config.apiKey.length > 0),
      maskedApiKey: maskedKey,
      isConfiguredInDb: true,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve AI configuration' });
  }
};

export const updateAiConfig = async (req: TenantRequest, res: Response) => {
  try {
    const schoolId = req.user?.schoolId || req.school?.id;
    if (!schoolId) {
      return res.status(400).json({ error: 'School tenant context required' });
    }

    const { provider, baseURL, model, apiKey, temperature } = req.body;

    await AiService.updateConfig(schoolId, {
      provider,
      baseURL,
      model,
      apiKey,
      temperature: temperature !== undefined ? Number(temperature) : undefined,
    });

    return res.json({
      success: true,
      message: 'AI Model Configuration updated successfully in database',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update AI configuration' });
  }
};
