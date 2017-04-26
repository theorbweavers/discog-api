import mongoose from 'mongoose';

import Content from './content.js'

const ReleaseSchema = new mongoose.Schema({
	releaseDate:{
		type: Date,
		required: true,
		default: Date.now,
	},
	//TODO Put these into a separate object
	soundcloudId: {
		type: String
	},
	itunesId: {
		type: String
	},
	spotifyId: {
		type: String
	},
	labelLink: {
		type: String
	},
	linerNotes: {
		type: String
	}
});

const Release = Content.discriminator('Release', ReleaseSchema);

export default Release;