import { Request, Response } from 'express';
import { prisma } from '@platform/db';
import { createSuccessResponse, createPaginatedResponse, createErrorResponse, SystemMessageCode } from '@platform/contracts';

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
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include,
      }),
      prisma.location.count({ where }),
    ]);

    const response = createPaginatedResponse(
      locations,
      { total, page: parseInt(page as string), limit: parseInt(limit as string) },
      'Locations fetched successfully',
      200,
      { requestId: req.id },
      SystemMessageCode.SUCCESS
    );
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    const response = createErrorResponse('Internal Server Error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
    res.status(response.statusCode).json(response);
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
      const errorResponse = createErrorResponse('Location not found', SystemMessageCode.NOT_FOUND, 404, undefined, req.id);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    const response = createSuccessResponse(location, 'Location fetched successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    console.error('Error fetching location:', error);
    const response = createErrorResponse('Internal Server Error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
    res.status(response.statusCode).json(response);
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

    const response = createSuccessResponse(location, 'Location created successfully', 201, { requestId: req.id }, SystemMessageCode.LOCATION_CREATED);
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    console.error('Error creating location:', error);
    const response = createErrorResponse('Internal Server Error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
    res.status(response.statusCode).json(response);
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

    const response = createSuccessResponse(location, 'Location updated successfully', 200, { requestId: req.id }, SystemMessageCode.LOCATION_UPDATED);
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    console.error('Error updating location:', error);
    if (error.code === 'P2025') {
      const errorResponse = createErrorResponse('Location not found', SystemMessageCode.NOT_FOUND, 404, undefined, req.id);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }
    const response = createErrorResponse('Internal Server Error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.location.delete({
      where: { id }
    });

    const response = createSuccessResponse(null, 'Location deleted successfully', 200, { requestId: req.id }, SystemMessageCode.LOCATION_DELETED);
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    console.error('Error deleting location:', error);
    if (error.code === 'P2025') {
      const errorResponse = createErrorResponse('Location not found', SystemMessageCode.NOT_FOUND, 404, undefined, req.id);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }
    const response = createErrorResponse('Internal Server Error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
    res.status(response.statusCode).json(response);
  }
};
