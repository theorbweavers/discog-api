// =============================================================================
// BASE SETUP
// =============================================================================

// call the packages we need
import express				from 'express';
import bodyParser			from 'body-parser';
import morgan					from 'morgan';
import mongoose				from 'mongoose';
import jwt						from 'express-jwt';
import jwksRsa				from 'jwks-rsa';
import jwtDecode			from 'jwt-decode'
import dotenv					from 'dotenv'
import Schema					from './schema';


const ENV = process.env.NODE_ENV || 'development';
if(ENV === 'development'){
	dotenv.config();
}

console.log('Connecting to DB', process.env.MONGODB_URL);
mongoose.connect(process.env.MONGODB_URL); // connect to our database

// helper for formatting message
const sendErrorResponse = (res, code, message, format = 'json') => {
	res.status(code)[format](message);
};

// validate the access token and enable the use of the jwtCheck middleware
const jwtCheck = jwt({
	// Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint
	secret: jwksRsa.expressJwtSecret({
		cache: true,
		rateLimit: true,
		jwksRequestsPerMinute: 5,
		jwksUri: `${process.env.AUTH0_DOMAIN}.well-known/jwks.json`
	}),
	// Validate the audience and the issuer
	audience: process.env.AUTH0_API_IDENTIFIER,
	issuer: process.env.AUTH0_DOMAIN,
	algorithms: [ 'RS256' ]
});

//middleware to check scopes
const checkPermissions = (req, res, next, model) => {
	try{
		let permission = `${req.method.toLowerCase()}:${model.toLowerCase()}`;
		if(req.user.permissions.includes(permission)){
			next();
		} else {
			sendErrorResponse(res, 403, { message: 'Forbidden' });
		}
	} catch(err){
		sendErrorResponse(res, 500, { message: `Error: ${err}` });
	}
};

// Create express app
let app = express();

// log requests to the console
app.use(morgan('dev')); 

// Check token
app.use(jwtCheck);
// return error message for unauthorized requests
app.use((err, req, res, next) => {
	if (err.name === 'UnauthorizedError') {
		sendErrorResponse(res, 401, { message: 'Missing or invalid token' });
	}
});

// configure body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
	// TODO make this configurable
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	//intercepts OPTIONS method
	if ('OPTIONS' === req.method) {
		//respond with 200
		res.sendStatus(200)
	} else {
		next();
	}
});

// =============================================================================
// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

router.param('model', checkPermissions);

// Default message for root
router.get('/', function(req, res) {
	res.json({ message: `API v${process.env.API_VERSION}` });
});

// ----------------------------------------------------
// Start routes /:model
// ----------------------------------------------------
router.route('/:model')

	// create an item
	.post(function(req, res) {
		try{
			// create a new instance of the model
			let model = new Schema[req.params.model](req.body);
			model.save(function(err) {
				if (err){
					sendErrorResponse(res, 400, { message: `Error: ${err}` });
				} else {
					res.json({ message: `${req.params.model} created` });
				}
			});
		} catch (err) {
			sendErrorResponse(res, 500, { message: `Error: ${err}` });
		}
	})
	// get all the items from a model
	// TODO add pagination here!
	.get(function(req, res) {
		try{
			let modelName = req.params.model;
			let Model = Schema[modelName];
			// Add status based on permission read:model
			Model.find((err, items) => {
				if (err){
					sendErrorResponse(res, 400, { message: `Error: ${err}` });
				} else {
					res.json({items});
				}
			});
		} catch (err) {
			sendErrorResponse(res, 500, { message: `Error: ${err}` });
		}
	});
// ----------------------------------------------------
// End routes /:model
// ----------------------------------------------------

// ----------------------------------------------------
// Start routes /:model/:id
// ----------------------------------------------------
router.route('/:model/:id([0-9a-fA-F]{24})')
	//Get model for use:
	
	// get the model with that id
	.get(function(req, res) {
		try{
			// Get model for use
			let Model = Schema[req.params.model];
			let modelId = req.params.id;
			Model.findById(modelId, (err, item) => {
				if (err) {
					sendErrorResponse(res, 500, { message: `Error: ${err}` });
				}else if (!item) {
					sendErrorResponse(res, 404, { message: `No item with id: ${modelId}` });
				} else {
					res.json(item);
				}
			});
		} catch(err) {
			sendErrorResponse(res, 500, { message: `Error: ${err}` });
		}
	})

	// update the model with this id
	.put(function(req, res) {

		try{
			let Model = Schema[req.params.model];
			delete req.body._id;
			Model.findByIdAndUpdate(req.params.id, req.body, null, (err, data) => {
				if (err){
					sendErrorResponse(res, 500, { message: `Error: ${err}` });
				} else if (!data){
					sendErrorResponse(res, 404, { message: `No item with id: ${modelId}` });
				} else {
					res.json({ message: `${req.params.model}: ${req.params.id} updated` });
				}

			});
		} catch(err) {
			sendErrorResponse(res, 500, { message: `Error: ${err}` });
		}
		
	})

	// delete the item with this id
	.delete(function(req, res) {
		try {
			let Model = Schema[req.params.model];
			let modelId = req.params.id;
			Model.findByIdAndRemove({ _id: modelId }, (err, data) => {
				if (err){
					sendErrorResponse(res, 500, { message: `Error: ${err}` });
				} else if (!data) {
					sendErrorResponse(res, 404, { message: `No item with id: ${modelId}` });
				} else {
					res.json({ message: `Successfully deleted item with id: ${modelId}` });
				}
			});
		} catch(err) {
			sendErrorResponse(res, 500, { message: `Error: ${err}` });
		}
	});
// ----------------------------------------------------
// End routes /:model/:id
// ----------------------------------------------------

// ----------------------------------------------------
// REGISTER ROUTES
// ----------------------------------------------------
app.use(`/${process.env.API_PATH}/${process.env.API_VERSION}`, router);


// ----------------------------------------------------
// START THE SERVER
// ----------------------------------------------------
if(ENV === 'development'){
	app.listen(process.env.APP_PORT);
	console.log(`server started at http://localhost:${process.env.APP_PORT}/`, router);
}

export default app
