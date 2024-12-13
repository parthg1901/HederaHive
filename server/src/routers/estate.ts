import express from 'express';
import { createEstate, getEstateByOwner, validate } from '../middleware';
import Estate from '../controllers/estate';

const estate = express.Router();

estate.post('/', validate(createEstate), Estate.createEstate);
estate.get('/', Estate.getEstates);
estate.get('/:owner', validate(getEstateByOwner), Estate.getEstateByOwner);

export { estate };
