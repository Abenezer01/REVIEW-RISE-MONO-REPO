import { Router } from 'express';
import * as PlannerService from '../../services/planner.service';

const router = Router({ mergeParams: true });

// GET /api/v1/brands/:id/planner/plan?month=1&year=2026
router.get('/plan', async (req, res) => {
  try {
    const { id } = req.params as any;
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }
    const plan = await PlannerService.getPlan(id, Number(month), Number(year));
    res.json({ data: plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/brands/:id/planner/generate
router.post('/generate', async (req, res) => {
  try {
    const { id } = req.params as any;
    const plan = await PlannerService.generateMonthlyPlan(id, {
      ...req.body,
      month: Number(req.body.month),
      year: Number(req.body.year),
    });
    res.json({ data: plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/brands/:id/planner/convert/:planId
router.post('/convert/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const { locationId } = req.query;

    if (!locationId) {
      return res.status(400).json({ error: 'Location ID is required' });
    }
    
    const posts = await PlannerService.convertPlanToDrafts(planId, locationId as string);
    res.json({ data: posts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/brands/:id/planner/templates
router.get('/templates', async (req, res) => {
  try {
    const { industry } = req.query;
    const templates = await PlannerService.listTemplates(industry as string);
    res.json({ data: templates });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/brands/:id/planner/templates
router.post('/templates', async (req, res) => {
  try {
    const template = await PlannerService.createTemplate(req.body);
    res.status(201).json({ data: template });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/brands/:id/planner/templates/:templateId
router.patch('/templates/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await PlannerService.updateTemplate(templateId, req.body);
    res.json({ data: template });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/brands/:id/planner/templates/:templateId
router.delete('/templates/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    await PlannerService.deleteTemplate(templateId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/brands/:id/planner/events
router.get('/events', async (req, res) => {
  try {
    const { month, year } = req.query;
    const events = await PlannerService.listSeasonalEvents(
      month ? Number(month) : undefined,
      year ? Number(year) : undefined
    );
    res.json({ data: events });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/brands/:id/planner/events
router.post('/events', async (req, res) => {
  try {
    const event = await PlannerService.createSeasonalEvent(req.body);
    res.status(201).json({ data: event });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/brands/:id/planner/events/:eventId
router.patch('/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await PlannerService.updateSeasonalEvent(eventId, req.body);
    res.json({ data: event });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/brands/:id/planner/events/:eventId
router.delete('/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    await PlannerService.deleteSeasonalEvent(eventId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
