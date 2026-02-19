import { Request, Response } from 'express';
import { prisma } from '@platform/db';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';

export const getUserBusinessRoles = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { businessId } = req.query;

    if (!userId) {
      return res.status(401).json(createErrorResponse('Unauthorized', ErrorCode.UNAUTHORIZED, 401));
    }

    if (!businessId) {
      return res.status(400).json(createErrorResponse('businessId is required', ErrorCode.BAD_REQUEST, 400));
    }

    // If the token already has global roles like "Admin", we can optionally trust it 
    // or always verify against the database for specific business roles.
    // Given the 401 issues, let's ensure we find the roles in the DB for this business.

    const userRoles = await prisma.userBusinessRole.findMany({
      where: { 
        userId,
        businessId: businessId as string
      },
      include: {
        role: true
      }
    });

    const response = createSuccessResponse(userRoles, 'User business roles fetched successfully');
    res.status(response.statusCode).json(response);

  } catch (error: any) {
    console.error('Error fetching user business roles:', error);
    const response = createErrorResponse('Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message);
    res.status(response.statusCode).json(response);
  }
};
