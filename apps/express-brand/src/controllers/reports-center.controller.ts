import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import * as ReportsCenterService from '../services/reports-center.service';

export const getConfig = async (req: Request, res: Response) => {
  try {
    const businessId = req.params.id;
    const config = await ReportsCenterService.getConfig(businessId);
    const response = createSuccessResponse(config, 'Reports center config fetched', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const updateConfig = async (req: Request, res: Response) => {
  try {
    const businessId = req.params.id;
    const config = await ReportsCenterService.updateConfig(businessId, req.body || {});
    const response = createSuccessResponse(config, 'Reports center config updated', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const getSchedule = async (req: Request, res: Response) => {
  try {
    const businessId = req.params.id;
    const schedule = await ReportsCenterService.getSchedule(businessId);
    const response = createSuccessResponse(schedule, 'Reports center schedule fetched', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const businessId = req.params.id;
    const payload = req.body || {};
    const nextRunAt = payload.nextRunAt ? new Date(payload.nextRunAt) : ReportsCenterService.computeNextRun(new Date(), payload.frequency || 'weekly');
    const schedule = await ReportsCenterService.updateSchedule(businessId, { ...payload, nextRunAt });
    const response = createSuccessResponse(schedule, 'Reports center schedule updated', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const generateRun = async (req: Request, res: Response) => {
  try {
    const businessId = req.params.id;
    const run = await ReportsCenterService.generateReportRun(businessId, { password: req.body?.password || null });
    const response = createSuccessResponse(run, 'Report generated', 201, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const listVault = async (req: Request, res: Response) => {
  try {
    const businessId = req.params.id;
    const runs = await ReportsCenterService.listVault(businessId);
    const response = createSuccessResponse(runs, 'Reports vault fetched', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const rerun = async (req: Request, res: Response) => {
  try {
    const businessId = req.params.id;
    const runId = req.params.runId;
    const run = await ReportsCenterService.rerunReport(businessId, runId);

    if (!run) {
      const response = createErrorResponse('Report not found', ErrorCode.NOT_FOUND, 404, undefined, req.id);
      return res.status(response.statusCode).json(response);
    }

    const response = createSuccessResponse(run, 'Report regenerated', 201, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const listExports = async (req: Request, res: Response) => {
  try {
    const businessId = req.params.id;
    const jobs = await ReportsCenterService.listExportJobs(businessId);
    const response = createSuccessResponse(jobs, 'Export jobs fetched', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const createExport = async (req: Request, res: Response) => {
  try {
    const businessId = req.params.id;
    const job = await ReportsCenterService.createExportJob(businessId, req.body?.type || 'Keyword History');
    const response = createSuccessResponse(job, 'Export job created', 201, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const downloadPdf = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const runId = req.params.runId;
        try {
            const pdfBuffer = await ReportsCenterService.generateReportPdf(runId, businessId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=report-${runId}.pdf`);
            res.send(pdfBuffer);
        } catch (error: any) {
            const message = error?.message || 'pdf_generation_failed';
            const response = createErrorResponse(message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
            return res.status(response.statusCode).json(response);
        }
    } catch (e: any) {
        const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const downloadExport = async (req: Request, res: Response) => {
  try {
    const businessId = req.params.id;
    const jobId = req.params.jobId;
    const format = (req.query.format as string) || 'csv';
    const payload = await ReportsCenterService.generateExportPayload(businessId, jobId, format);

    if (!payload) {
      const response = createErrorResponse('Export not found', ErrorCode.NOT_FOUND, 404, undefined, req.id);
      return res.status(response.statusCode).json(response);
    }

    res.setHeader('Content-Type', payload.contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${payload.filename}`);
    res.send(payload.body);
  } catch (e: any) {
    const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const getShare = async (req: Request, res: Response) => {
  try {
    const token = req.params.token;
    const password = (req.query.password as string) || null;
    const share = await ReportsCenterService.getShareReport(token);

    if (!share) {
      const response = createErrorResponse('Share not found', ErrorCode.NOT_FOUND, 404, undefined, req.id);
      return res.status(response.statusCode).json(response);
    }

    const isValid = ReportsCenterService.validateSharePassword(share.sharePasswordHash, password);
    if (!isValid) {
      const response = createErrorResponse('Password required', ErrorCode.UNAUTHORIZED, 401, undefined, req.id);
      return res.status(response.statusCode).json(response);
    }

    const html = await ReportsCenterService.generateReportHtml(share.id, share.businessId);
    await ReportsCenterService.markOpened(share.id);

    const response = createSuccessResponse({ run: share, html }, 'Share fetched', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const verifyShare = async (req: Request, res: Response) => {
  try {
    const token = req.params.token;
    const password = req.body?.password || null;
    const share = await ReportsCenterService.getShareReport(token);

    if (!share) {
      const response = createErrorResponse('Share not found', ErrorCode.NOT_FOUND, 404, undefined, req.id);
      return res.status(response.statusCode).json(response);
    }

    const isValid = ReportsCenterService.validateSharePassword(share.sharePasswordHash, password);
    if (!isValid) {
      const response = createErrorResponse('Password invalid', ErrorCode.UNAUTHORIZED, 401, undefined, req.id);
      return res.status(response.statusCode).json(response);
    }

    const response = createSuccessResponse({ ok: true }, 'Password verified', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};
