import { Request, Response } from 'express';
import { prisma } from '@platform/db';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';

export const getUserBusinesses = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    // Find businesses where the user has a role via UserBusinessRole
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

    // Dedup businesses
    const uniqueBusinesses = Array.from(new Map(businesses.map(b => [b.id, b])).values());

    res.json(createSuccessResponse(uniqueBusinesses, 'User businesses fetched successfully', 200, { requestId: req.id }));

  } catch (error) {
    console.error('Error fetching user businesses:', error);
    res.status(500).json(createErrorResponse('Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id));
  }
};
