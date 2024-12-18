import { Request, Response, NextFunction } from 'express';
import Channel from '../models/channel';
import Estate from '../models/estate';

const createChannel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    channelId,
    topicId,
    participants,
    closer,
    tokens,
    tokenAmounts,
    nftTokens,
    serialNumbers,
    hbarDeposit,
    creator,
    estateId
  } = req.body;

  try {
    const existingChannel = await Channel.findOne({ channelId });
    if (estateId) {
        await Estate.findByIdAndUpdate(estateId, { channel: channelId });
    }
    if (existingChannel) {
      res.status(400).json({ message: 'Channel already exists' });
      return;
    }

    const tokenDeposits: Record<string, Record<string, number>> = {};
    if (tokens && tokenAmounts) {
      tokens.forEach((tokenAddress: string, index: number) => {
        tokenDeposits[tokenAddress] = {
          [creator]: tokenAmounts[index]
        };
      });
    }

    const nftDeposits: Record<string, Record<string, number[]>> = {};
    if (nftTokens && serialNumbers) {
      nftTokens.forEach((tokenAddress: string, index: number) => {
        nftDeposits[tokenAddress] = {
          [creator]: serialNumbers[index]
        };
      });
    }

    const hbarDeposits: Record<string, number> = { [creator]: hbarDeposit };

    const newChannel = await Channel.create({
      name,
      channelId,
      topicId,
      participants,
      closer,
      hbarDeposits,
      tokenDeposits,
      nftDeposits,
      totalParticipants: participants.length,
      lastFinalized: Date.now()
    });

    res
      .status(201)
      .json({ message: 'Channel created successfully', channel: newChannel });
  } catch (error) {
    next(error);
  }
};

const updateChannelState = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    channelId,
    participants,
    hbarBalances,
    tokens,
    tokenBalances,
    nftTokens,
    nftFinalBalances
  } = req.body;

  try {
    const channel = await Channel.findOne({ channelId });
    if (!channel) {
      res.status(404).json({ message: 'Channel not found' });
      return;
    }

    // Validate input lengths
    if (
      participants.length !== hbarBalances.length ||
      tokens.length !== tokenBalances.length ||
      nftTokens.length !== nftFinalBalances.length
    ) {
      res.status(400).json({ message: 'Input lengths are inconsistent' });
      return;
    }

    // Update HBAR deposits
    const updatedHbarDeposits: Record<string, number> = {};
    participants.forEach((participant: string, index: number) => {
      updatedHbarDeposits[participant] = hbarBalances[index];
    });

    // Update token deposits
    const updatedTokenDeposits: Record<string, Record<string, number>> = {};
    tokens.forEach((tokenAddress: string, tokenIndex: number) => {
      updatedTokenDeposits[tokenAddress] = {};
      participants.forEach((participant: string, participantIndex: number) => {
        updatedTokenDeposits[tokenAddress][participant] =
          tokenBalances[tokenIndex][participantIndex];
      });
    });

    // Update NFT deposits
    const updatedNftDeposits: Record<string, Record<string, number[]>> = {};
    nftTokens.forEach((nftAddress: string, nftIndex: number) => {
      updatedNftDeposits[nftAddress] = {};
      participants.forEach((participant: string, participantIndex: number) => {
        updatedNftDeposits[nftAddress][participant] =
          nftFinalBalances[nftIndex][participantIndex];
      });
    });

    channel.hbarDeposits = updatedHbarDeposits;
    channel.tokenDeposits = updatedTokenDeposits;
    channel.nftDeposits = updatedNftDeposits;

    await channel.save();

    res
      .status(200)
      .json({ message: 'Channel state updated successfully', channel });
  } catch (error) {
    next(error);
  }
};

const addParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { channelId, participant } = req.body;

  try {
    const channel = await Channel.findOne({ channelId });
    if (!channel) {
      res.status(404).json({ message: 'Channel not found' });
      return;
    }

    if (channel.participants.includes(participant)) {
      res
        .status(400)
        .json({ message: 'Participant already exists in the channel' });
      return;
    }

    channel.participants.push(participant);

    channel.hbarDeposits[participant] = 0;

    Object.keys(channel.tokenDeposits).forEach((tokenAddress) => {
      channel.tokenDeposits[tokenAddress][participant] = 0;
    });

    Object.keys(channel.nftDeposits).forEach((nftTokenAddress) => {
      channel.nftDeposits[nftTokenAddress][participant] = [];
    });

    channel.totalParticipants += 1;

    await channel.save();

    res.status(200).json({
      message: 'Participant added successfully',
      channel
    });
  } catch (error) {
    next(error);
  }
};

const getChannel = async (req: Request, res: Response, next: NextFunction) => {
  const { channelId } = req.body;

  try {
    const channel = await Channel.findOne({ channelId });
    if (!channel) {
      res.status(404).json({ message: 'Channel not found' });
      return;
    }

    res.status(200).json({ channel });
  } catch (error) {
    next(error);
  }
};

const getChannelByParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { participant } = req.params;

  try {
    const channels = await Channel.find({ participants: participant });

    const enrichedChannels = channels.map((channel) => {
      const participantHBARBalance =
        channel.hbarDeposits?.[participant] || 0;

      return {
        ...channel.toObject(),
        participantHBARBalance,
        topicId: channel.topicId
      };
    });

    res.status(200).json({ channels: enrichedChannels });
  } catch (error) {
    next(error);
  }
};


const finalizeChannel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { channelId } = req.body;

  try {
    const channel = await Channel.findOne({ channelId });
    if (!channel) {
      res.status(404).json({ message: 'Channel not found' });
      return;
    }

    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    if (now - channel.lastFinalized < thirtyDays) {
      res.status(400).json({
        message:
          'Channel can only be finalized if the last finalized time was at least 30 days ago.'
      });
      return;
    }

    channel.hbarDeposits = {};
    channel.tokenDeposits = {};
    channel.nftDeposits = {};

    channel.lastFinalized = now;

    await channel.save();

    res
      .status(200)
      .json({ message: 'Channel finalized successfully', channel });
  } catch (error) {
    next(error);
  }
};

export default {
  createChannel,
  updateChannelState,
  addParticipant,
  getChannel,
  getChannelByParticipant,
  finalizeChannel
};
