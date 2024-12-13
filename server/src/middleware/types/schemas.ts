import * as yup from 'yup';

export const createEstate = yup.object({
  body: yup.object({
    name: yup.string().required(),
    description: yup.string().required(),
    rental: yup.number().required(),
    location: yup.string().required(),
    estimatedValue: yup.number().required(),
    owner: yup.string().required(),
    token: yup.string().required()
  })
});

export const getEstateByOwner = yup.object({
  params: yup.object({
    owner: yup.string().required()
  })
});
