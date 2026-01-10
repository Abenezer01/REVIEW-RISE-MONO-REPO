import { Request, Response } from 'express';

export const getLocations = async (req: Request, res: Response) => {
  res.json({ message: 'Get all locations' });
};

export const getLocation = async (req: Request, res: Response) => {
  res.json({ message: `Get location ${req.params.id}` });
};

export const createLocation = async (req: Request, res: Response) => {
  res.json({ message: 'Create location', data: req.body });
};

export const updateLocation = async (req: Request, res: Response) => {
  res.json({ message: `Update location ${req.params.id}`, data: req.body });
};

export const deleteLocation = async (req: Request, res: Response) => {
  res.json({ message: `Delete location ${req.params.id}` });
};
