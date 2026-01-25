import { Request, Response } from 'express';
import { prisma } from '@platform/db';
import { createSuccessResponse, createErrorResponse, ErrorCode, createPaginatedResponse } from '@platform/contracts';

export const getBusinesses = async (req: Request, res: Response) => {
  const requestId = req.id;
  try {
    const search = (req.query.search as string) || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where: any = {
        deletedAt: null 
    };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: { id: true, name: true, email: true } // Select only needed fields
      }),
      prisma.business.count({ where }),
    ]);

    res.json(createPaginatedResponse(
      businesses,
      { page, limit, total },
      'Businesses fetched successfully',
      200,
      { requestId }
    ));
  } catch (error: any) {
    console.error('Error fetching businesses:', error);
    res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
  }
};
