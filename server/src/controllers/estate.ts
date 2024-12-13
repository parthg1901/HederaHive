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

const updateHolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { address, share, estateId } = req.body;
  try {
    const estate = await Estate.findById(estateId);
    if (!estate) {
      res.status(404).json({ message: 'Estate not found' });
      return
    }
    const existingHolder = estate.holders.find(
      (holder) => holder.address === address
    );

    if (existingHolder) {
      res.status(400).json({ message: 'Holder already exists' });
      return
    }
    estate.holders.push({ address, share });
    await estate.save();
    res.json(estate);
  } catch (error) {
    next(error);
  }
};

const getHoldings = async (req: Request, res: Response, next: NextFunction) => {
  const { address } = req.params;
  try {
    const estates = await Estate.find({ 'holders.address': address });
    const holdings = estates.map((estate) => {
      const holding = estate.holders.find(
        (holder) => holder.address === address
      );
      if (!holding) {
        return {
          ...estate.toJSON(),
          holders: []
        };
      }
      return {
        ...estate.toJSON(),
        holders: [holding]
      };
    });
    res.json(holdings);
  } catch (error) {
    next(error);
  }
};

export default {
    getEstates,
    getEstateByOwner,
    createEstate,
    updateHolders,
    getHoldings
  };
  