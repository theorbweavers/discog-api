import mongoose from 'mongoose';
import Person from './person'
import defaults from '../defaults'

let options = {};

options = Object.assign(defaults, options);

const ContentSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	body: {
		type: String,
	},
	image:{
		type: String
	},
	language: String,
	description: {
		type: String,
	},
	keywords: {
		type: String,
	},
	status: {
		type: String,
		enum: [ 'unpublished', 'published', 'archived' ]
	},
	deleted: {
		type: Boolean,
		default: false,
	},
	author: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Person'
		}
	]
}, options);

export default mongoose.model('Content', ContentSchema);