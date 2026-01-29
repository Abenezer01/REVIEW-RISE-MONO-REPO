import { Request, Response } from 'express';
import { prisma } from '@platform/db';
import { createSuccessResponse, createPaginatedResponse, createErrorResponse, ErrorCode } from '@platform/contracts';

export const getLocations = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', businessId } = req.query as any;
    const skip = (page - 1) * limit;
    
    // Handle include params (e.g. include[business]=true)
    const include: any = {};
    if (req.query['include[business]'] === 'true') {
      include.business = true;
    }

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (businessId) {
        where.businessId = businessId;
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

    res.json(createPaginatedResponse(
      locations,
      { total, page, limit },
      'Locations fetched successfully',
      200,
      { requestId: req.id }
    ));
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json(createErrorResponse('Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id));
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
      return res.status(404).json(createErrorResponse('Location not found', ErrorCode.NOT_FOUND, 404, undefined, req.id));
    }

    res.json(createSuccessResponse(location, 'Location fetched successfully', 200, { requestId: req.id }));
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json(createErrorResponse('Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id));
  }
};

export const createLocation = async (req: Request, res: Response) => {
  try {
    const { name, address, timezone, tags, businessId, platformIds, status } = req.body;

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

    res.status(201).json(createSuccessResponse(location, 'Location created successfully', 201, { requestId: req.id }));
  } catch (error: any) {
    console.error('Error creating location:', error);
    res.status(500).json(createErrorResponse('Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id));
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

    res.json(createSuccessResponse(location, 'Location updated successfully', 200, { requestId: req.id }));
  } catch (error: any) {
    console.error('Error updating location:', error);
    if (error.code === 'P2025') {
      return res.status(404).json(createErrorResponse('Location not found', ErrorCode.NOT_FOUND, 404, undefined, req.id));
    }
    res.status(500).json(createErrorResponse('Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id));
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.location.delete({
      where: { id }
    });

    res.json(createSuccessResponse(null, 'Location deleted successfully', 200, { requestId: req.id }));
  } catch (error: any) {
    console.error('Error deleting location:', error);
    if (error.code === 'P2025') {
      return res.status(404).json(createErrorResponse('Location not found', ErrorCode.NOT_FOUND, 404, undefined, req.id));
    }
    res.status(500).json(createErrorResponse('Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id));
  }
};
