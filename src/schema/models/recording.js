import mongoose from 'mongoose';

import Release from './release.js'
import Content from './content.js'

const RecordingSchema = new mongoose.Schema({
	lyrics: {
		type: String
	},
	composers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Person'
		}
	]
});

const Recording = Content.discriminator('Recording', RecordingSchema);

export default Recording;