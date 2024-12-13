import * as yup from 'yup';

export const createEstate = yup.object({
  body: yup.object({
    name: yup.string().required(),
    description: yup.string().required(),
    rental: yup.number().required(),
    location: yup.string().required(),
    estimatedValue: yup.number(),
    owner: yup.string().required(),
    token: yup.string().required()
  })
});

export const getEstateByOwner = yup.object({
  params: yup.object({
    owner: yup.string().required()
  })
});

export const updateHolders = yup.object({
  body: yup.object({
    address: yup.string().required(),
    share: yup.number().required(),
    estateId: yup.string().required()
  })
});

export const getHoldings = yup.object({
  params: yup.object({
    address: yup.string().required()
  })
});