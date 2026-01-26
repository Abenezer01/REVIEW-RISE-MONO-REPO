import { Request, Response } from 'express';
import { prisma } from '@platform/db';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';

export const getUserBusinesses = async (req: Request, res: Response) => {
  const requestId = req.id;
  try {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json(createErrorResponse('User ID is required', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
    }

    const userRoles = await prisma.userBusinessRole.findMany({
        where: { userId },
        include: {
            business: true,
            role: true
        }
    });

    const businesses = userRoles.map(ur => ({
        ...ur.business,
        role: ur.role?.name,
        roleId: ur.roleId,
        locationId: ur.locationId
    }));

    const uniqueBusinesses = Array.from(new Map(businesses.map(b => [b.id, b])).values());

    res.json(createSuccessResponse(uniqueBusinesses, 'User businesses fetched successfully', 200, { requestId }));

  } catch (error: any) {
    console.error('Error fetching user businesses:', error);
    res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
  }
};
