import mongoose from 'mongoose';
import defaults from '../defaults'

//override schema options here
let options = {};

options = Object.assign(defaults, options);

const PersonSchema = new mongoose.Schema({
	givenName: {
		type: String,
		required: true
	},
	familyName: {
		type: String,
		required: true
	}
}, options);

const Person = mongoose.model('Person', PersonSchema);

export default Person;