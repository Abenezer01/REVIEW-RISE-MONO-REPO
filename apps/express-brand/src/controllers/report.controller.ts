import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import * as ReportService from '../services/report.service';

export const list = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const reports = await ReportService.listReports(businessId);
        res.json(createSuccessResponse(reports, 'Reports listed', 200, { requestId }));
    } catch (e: any) {
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};

export const get = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const reportId = req.params.reportId;
        const report = await ReportService.getReportContent(reportId, businessId);
        
        if(!report) {
            return res.status(404).json(createErrorResponse('Report not found', ErrorCode.NOT_FOUND, 404, undefined, requestId));
        }

        res.json(createSuccessResponse(report, 'Report fetched', 200, { requestId }));
    } catch (e: any) {
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};
