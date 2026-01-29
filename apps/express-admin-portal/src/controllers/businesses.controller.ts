import { Request, Response } from 'express';
import { prisma } from '@platform/db';
import { createPaginatedResponse, createErrorResponse } from '@platform/contracts';

export const getBusinesses = async (req: Request, res: Response) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query as any;
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
      { total, page, limit },
      'Businesses fetched successfully',
      200,
      { requestId: req.id }
    ));
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json(createErrorResponse('Internal Server Error', 'INTERNAL_SERVER_ERROR', 500, undefined, req.id));
  }
};
