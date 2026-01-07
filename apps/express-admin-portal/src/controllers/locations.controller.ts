import { Request, Response } from 'express';
import { prisma } from '@platform/db';

export const getLocations = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    
    // Handle include params (e.g. include[business]=true)
    const include: any = {};
    if (req.query['include[business]'] === 'true') {
      include.business = true;
    }

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }, // Assuming address field exists
      ];
    }
    
    if (req.query.businessId) {
        where.businessId = req.query.businessId as string;
    }

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include,
      }),
      prisma.location.count({ where }),
    ]);

    res.json({
      data: locations,
      meta: {
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const getLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const location = await prisma.location.findUnique({
      where: { id },
      include: { business: true }
    });

    if (!location) {
      return res.status(404).json({ status: 'error', message: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const createLocation = async (req: Request, res: Response) => {
  try {
    const { name, address, timezone, tags, businessId, platformIds, status } = req.body;

    if (!businessId) {
        return res.status(400).json({ status: 'error', message: 'Business ID is required' });
    }

    const location = await prisma.location.create({
      data: {
        name,
        address,
        timezone,
        tags: tags || [],
        businessId,
        platformIds: platformIds || {},
        status: status || 'active'
      },
      include: { business: true }
    });

    res.status(201).json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, address, timezone, tags, businessId, platformIds, status } = req.body;

    const location = await prisma.location.update({
      where: { id },
      data: {
        name,
        address,
        timezone,
        tags,
        businessId,
        platformIds,
        status
      },
      include: { business: true }
    });

    res.json(location);
  } catch (error) {
    console.error('Error updating location:', error);
    // Handle Prisma record not found error potentially
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.location.delete({
      where: { id }
    });

    res.json({ status: 'success', message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
