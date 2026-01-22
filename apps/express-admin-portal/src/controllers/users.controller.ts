import { Request, Response } from 'express';
import { prisma } from '@platform/db';

export const getUserBusinesses = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    // Find businesses where the user has a role via UserBusinessRole
    // Simplified: Find all businesses associated with the user
    const userRoles = await prisma.userBusinessRole.findMany({
        where: { userId },
        include: {
            business: true,
            role: true
        }
    });

    // Map to a cleaner format if needed, but for now return as is or flattened
    const businesses = userRoles.map(ur => ({
        ...ur.business,
        role: ur.role?.name,
        roleId: ur.roleId,
        locationId: ur.locationId
    }));

    // Dedup businesses if a user has multiple roles in the same business (e.g. across locations)
    // The frontend likely expects a list of unique businesses
    const uniqueBusinesses = Array.from(new Map(businesses.map(b => [b.id, b])).values());

    res.json({
      status: 'success',
      data: uniqueBusinesses
    });

  } catch (error) {
    console.error('Error fetching user businesses:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
