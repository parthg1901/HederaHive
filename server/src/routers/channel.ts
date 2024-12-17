import express from 'express';
import { createChannel, updateChannelState, addParticipant, getChannel, finalizeChannel, validate, getChannelByParticipant } from '../middleware';
import Channel from '../controllers/channel';

const channel = express.Router();

channel.post('/', validate(createChannel), Channel.createChannel);

channel.post('/state', validate(updateChannelState), Channel.updateChannelState);

channel.post('/participant', validate(addParticipant), Channel.addParticipant);

channel.post('/getChannel', validate(getChannel), Channel.getChannel);

channel.get('/getChannelByParticipant/:participant', validate(getChannelByParticipant), Channel.getChannelByParticipant);

channel.post('/finalize', validate(finalizeChannel), Channel.finalizeChannel);

export { channel };
