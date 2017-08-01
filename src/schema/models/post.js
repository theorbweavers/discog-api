import mongoose from 'mongoose';

import Content from './content.js'

const PostSchema = new mongoose.Schema({
	postDate:{
		type: Date,
		required: true,
		default: Date.now,
	},
});

const Post = Content.discriminator('Post', ReleaseSchema);

export default Post;