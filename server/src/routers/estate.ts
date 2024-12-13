import express from 'express';
import { createEstate, getEstateByOwner, updateHolders, getHoldings, validate } from '../middleware';
import Estate from '../controllers/estate';

const estate = express.Router();

estate.post('/', validate(createEstate), Estate.createEstate);
estate.get('/', Estate.getEstates);
estate.get('/:owner', validate(getEstateByOwner), Estate.getEstateByOwner);
estate.post('/holders', validate(updateHolders), Estate.updateHolders);
estate.get('/holdings/:address', validate(getHoldings), Estate.getHoldings);

export { estate };
