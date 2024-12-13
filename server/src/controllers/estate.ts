import { Request, Response, NextFunction } from 'express';
import Estate from '../models/estate';

const getEstates = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const estates = await Estate.find({});
    res.json(estates);
  } catch (error) {
    next(error);
  }
};

const getEstateByOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { owner } = req.params;
  try {
    const estates = await Estate.find({ owner });
    res.json(estates);
  } catch (error) {
    next(error);
  }
};

const createEstate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, description, rental, location, estimatedValue } = req.body;
  try {
    const estate = await Estate.create({
      name,
      description,
      rental,
      location,
      estimatedValue
    });
    res.status(201).json(estate);
  } catch (error) {
    next(error);
  }
};

export default { getEstates, getEstateByOwner, createEstate };
