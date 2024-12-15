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

export const createChannel = yup.object({
  body: yup.object({
    channelId: yup.string().required(),
    participants: yup.array().of(yup.string()).required(),
    closer: yup.string().required(),
    tokens: yup.array().of(yup.string()).optional(),
    tokenAmounts: yup.array().of(yup.number()).optional(),
    nftTokens: yup.array().of(yup.string()).optional(),
    serialNumbers: yup.array().of(yup.number()).optional(),
    hbarDeposit: yup.number().required(),
    creator: yup.string().required(),
    estateId: yup.string().optional()
  })
});

export const updateChannelState = yup.object({
  body: yup.object({
    channelId: yup.string().required(),
    participants: yup.array().of(yup.string()).required(),
    hbarBalances: yup.array().of(yup.number()).required(),
    tokens: yup.array().of(yup.string()).required(),
    tokenBalances: yup.array().of(
      yup.array().of(yup.number()).required()
    ).required(),
    nftTokens: yup.array().of(yup.string()).required(),
    nftFinalBalances: yup.array().of(
      yup.array().of(yup.number()).required()
    ).required()
  })
});

export const addParticipant = yup.object({
  body: yup.object({
    channelId: yup.string().required(),
    participant: yup.string().required()
  })
});

export const getChannel = yup.object({
  body: yup.object({
    channelId: yup.string().required()
  })
});

export const finalizeChannel = yup.object({
  body: yup.object({
    channelId: yup.string().required()
  })
});
