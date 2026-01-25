import { Request, Response } from 'express';
import { prisma } from '@platform/db';
import { createSuccessResponse, createErrorResponse, ErrorCode, createPaginatedResponse } from '@platform/contracts';

export const getLocations = async (req: Request, res: Response) => {
  const requestId = req.id;
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
        { address: { contains: search, mode: 'insensitive' } },
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

    res.json(createPaginatedResponse(
      locations,
      { page, limit, total },
      'Locations fetched successfully',
      200,
      { requestId }
    ));
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
  }
};

export const getLocation = async (req: Request, res: Response) => {
  const requestId = req.id;
  try {
    const { id } = req.params;
    const location = await prisma.location.findUnique({
      where: { id },
      include: { business: true }
    });

    if (!location) {
      return res.status(404).json(createErrorResponse('Location not found', ErrorCode.NOT_FOUND, 404, undefined, requestId));
    }

    res.json(createSuccessResponse(location, 'Location fetched successfully', 200, { requestId }));
  } catch (error: any) {
    console.error('Error fetching location:', error);
    res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
  }
};

export const createLocation = async (req: Request, res: Response) => {
  const requestId = req.id;
  try {
    const { name, address, timezone, tags, businessId, platformIds, status } = req.body;

    if (!businessId) {
        return res.status(400).json(createErrorResponse('Business ID is required', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
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

    res.status(201).json(createSuccessResponse(location, 'Location created successfully', 201, { requestId }));
  } catch (error: any) {
    console.error('Error creating location:', error);
    res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  const requestId = req.id;
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

    res.json(createSuccessResponse(location, 'Location updated successfully', 200, { requestId }));
  } catch (error: any) {
    console.error('Error updating location:', error);
    res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  const requestId = req.id;
  try {
    const { id } = req.params;
    await prisma.location.delete({
      where: { id }
    });

    res.json(createSuccessResponse(null, 'Location deleted successfully', 200, { requestId }));
  } catch (error: any) {
    console.error('Error deleting location:', error);
    res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
  }
};
