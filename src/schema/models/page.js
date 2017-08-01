import mongoose from 'mongoose';

import Content from './content.js'

const PageSchema = new mongoose.Schema({

});

const Page = Content.discriminator('Page', ReleaseSchema);

export default Page;