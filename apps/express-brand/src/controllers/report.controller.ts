import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import * as ReportService from '../services/report.service';
import * as OpportunitiesReportService from '../services/opportunities-report.service';

export const list = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const reports = await ReportService.listReports(businessId);
        const response = createSuccessResponse(reports, 'Reports listed', 200, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const get = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const reportId = req.params.reportId;
        const report = await ReportService.getReportContent(reportId, businessId);
        
        if(!report) {
            const errorResponse = createErrorResponse('Report not found', ErrorCode.NOT_FOUND, 404, undefined, req.id);
            return res.status(errorResponse.statusCode).json(errorResponse);
        }

        const response = createSuccessResponse(report, 'Report fetched', 200, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

// Opportunities Report Methods
export const generateOpportunities = async (req: Request, res: Response) => {
    const businessId = req.params.id; // inherited from /brands/:id

    try {
        const report = await OpportunitiesReportService.generateReport(businessId);
        const response = createSuccessResponse(report, 'Report generated successfully', 201, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        console.error(e);
        const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const listOpportunities = async (req: Request, res: Response) => {
    const businessId = req.params.id;

    try {
        const reports = await OpportunitiesReportService.listReports(businessId);
        const response = createSuccessResponse(reports, 'Reports listed', 200, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const getLatestOpportunities = async (req: Request, res: Response) => {
    const businessId = req.params.id;

    try {
        const report = await OpportunitiesReportService.getLatestReport(businessId);
        if (!report) {
            const errorResponse = createErrorResponse('No report found', ErrorCode.NOT_FOUND, 404, undefined, req.id);
            return res.status(errorResponse.statusCode).json(errorResponse);
        }
        const response = createSuccessResponse(report, 'Report fetched', 200, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const downloadPdf = async (req: Request, res: Response) => {
    const reportId = req.params.reportId;
    try {
        const pdfBuffer = await OpportunitiesReportService.generatePdf(reportId);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${reportId}.pdf`);
        res.send(pdfBuffer);
    } catch (e: any) {
        console.error('PDF Generation Error:', e);
        const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};
