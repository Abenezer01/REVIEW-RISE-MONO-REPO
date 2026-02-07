import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, SystemMessageCode } from '@platform/contracts';

export const uploadFile = (req: Request, res: Response) => {
    try {
        if (!req.file) {
            const errorResponse = createErrorResponse('No file uploaded', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(errorResponse.statusCode).json(errorResponse);
        }

        // Construct public URL
        // Assumes the server is serving 'uploads' directory at '/uploads' path
        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        const response = createSuccessResponse({ url: fileUrl }, 'File uploaded successfully', 201, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        const response = createErrorResponse(error.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};
