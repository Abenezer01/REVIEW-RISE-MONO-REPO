import { Router } from 'express';
import * as PlannerService from '../../services/planner.service';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';

const router = Router({ mergeParams: true });

// GET /api/v1/brands/:id/planner/plan?month=1&year=2026
router.get('/plan', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;
    if (!month || !year) {
      const errorResponse = createErrorResponse('Month and year are required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }
    const plan = await PlannerService.getPlan(id, Number(month), Number(year));
    const response = createSuccessResponse(plan, 'Plan fetched successfully', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    const response = createErrorResponse(error.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
});

// POST /api/v1/brands/:id/planner/generate
router.post('/generate', async (req: any, res) => {
  try {
    const { id } = req.params;
    const plan = await PlannerService.generateMonthlyPlan(id, {
      ...req.body,
      month: Number(req.body.month),
      year: Number(req.body.year),
    });
    const response = createSuccessResponse(plan, 'Plan generated successfully', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    const response = createErrorResponse(error.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
});

// POST /api/v1/brands/:id/planner/convert/:planId
router.post('/convert/:planId', async (req: any, res) => {
  try {
    const { planId } = req.params;
    const { locationId } = req.query;

    if (!locationId) {
      const errorResponse = createErrorResponse('Location ID is required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }
    
    const posts = await PlannerService.convertPlanToDrafts(planId, locationId as string);
    const response = createSuccessResponse(posts, 'Plan converted to drafts successfully', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    const response = createErrorResponse(error.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
});

// GET /api/v1/brands/:id/planner/templates
router.get('/templates', async (req: any, res) => {
  try {
    const { industry } = req.query;
    const templates = await PlannerService.listTemplates(industry as string);
    const response = createSuccessResponse(templates, 'Templates fetched successfully', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    const response = createErrorResponse(error.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
});

// POST /api/v1/brands/:id/planner/templates
router.post('/templates', async (req: any, res) => {
  try {
    const template = await PlannerService.createTemplate(req.body);
    const response = createSuccessResponse(template, 'Template created successfully', 201, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    const response = createErrorResponse(error.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
});

// PATCH /api/v1/brands/:id/planner/templates/:templateId
router.patch('/templates/:templateId', async (req: any, res) => {
  try {
    const { templateId } = req.params;
    const template = await PlannerService.updateTemplate(templateId, req.body);
    const response = createSuccessResponse(template, 'Template updated successfully', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    const response = createErrorResponse(error.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
});

// DELETE /api/v1/brands/:id/planner/templates/:templateId
router.delete('/templates/:templateId', async (req: any, res) => {
  try {
    const { templateId } = req.params;
    await PlannerService.deleteTemplate(templateId);
    const response = createSuccessResponse(null, 'Template deleted successfully', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    const response = createErrorResponse(error.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
});

// GET /api/v1/brands/:id/planner/events
router.get('/events', async (req: any, res) => {
  try {
    const { month, year } = req.query;
    const events = await PlannerService.listSeasonalEvents(
      month ? Number(month) : undefined,
      year ? Number(year) : undefined
    );
    const response = createSuccessResponse(events, 'Events fetched successfully', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    const response = createErrorResponse(error.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
});

// POST /api/v1/brands/:id/planner/events
router.post('/events', async (req: any, res) => {
  try {
    const event = await PlannerService.createSeasonalEvent(req.body);
    const response = createSuccessResponse(event, 'Event created successfully', 201, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    const response = createErrorResponse(error.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
});

// PATCH /api/v1/brands/:id/planner/events/:eventId
router.patch('/events/:eventId', async (req: any, res) => {
  try {
    const { eventId } = req.params;
    const event = await PlannerService.updateSeasonalEvent(eventId, req.body);
    const response = createSuccessResponse(event, 'Event updated successfully', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    const response = createErrorResponse(error.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
});

// DELETE /api/v1/brands/:id/planner/events/:eventId
router.delete('/events/:eventId', async (req: any, res) => {
  try {
    const { eventId } = req.params;
    await PlannerService.deleteSeasonalEvent(eventId);
    const response = createSuccessResponse(null, 'Event deleted successfully', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    const response = createErrorResponse(error.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
});

export default router;
