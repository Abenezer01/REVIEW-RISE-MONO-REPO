import { Request, Response } from 'express';

export const getBusinesses = async (req: Request, res: Response) => {
  res.json({ message: 'Get all businesses' });
};

export const getBusiness = async (req: Request, res: Response) => {
  res.json({ message: `Get business ${req.params.id}` });
};
