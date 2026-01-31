import { Request, Response } from 'express';
import { prisma } from '@platform/db';
import { createPaginatedResponse, createErrorResponse, ErrorCode } from '@platform/contracts';

export const getBusinesses = async (req: Request, res: Response) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query as any;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
        deletedAt: null 
    };
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { name: 'asc' },
        select: { id: true, name: true, email: true } // Select only needed fields
      }),
      prisma.business.count({ where }),
    ]);

    const response = createPaginatedResponse(
      businesses,
      { total, page: parseInt(page as string), limit: parseInt(limit as string) },
      'Businesses fetched successfully',
      200,
      { requestId: req.id }
    );
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    console.error('Error fetching businesses:', error);
    const response = createErrorResponse('Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
    res.status(response.statusCode).json(response);
  }
};
