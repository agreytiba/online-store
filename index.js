const jwt = require('jsonwebtoken')
const bcrypt =require('bcryptjs')
import dbConnect from './online-store/lib/dbConnect';
import User from './online-store/model/UserModel';

export default async function handler(req, res) {
	const { method } = req;

	// connect to database
    dbConnect();
    

// Generate JWT
const generateToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn:'30d',
    })
}


	// register user 
	// @method: POST,find()
	// @status: public
    if (method === 'POST') {
        
        try {
            
			const { name, email, password } = req.body;

			// check if the req.body contain all properties
			if (!name || !email || !password) {
				res.status(400).json('please add all fields');
			}

            
			//check if user exists
			const userExists = await User.findOne({ email });
			if (userExists) {
				res.status(400).json('user already exists');
			}
           
			// Hash password
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			//  create user
			const user = await User.create({
				name,
				email,
				password: hashedPassword
			});

			//  check  the user is create and the pass the value
			if (user) {
				res.status(201).json({
					_id: user.id,
					name: user.name,
					email: user.email,
					token: generateToken(user._id)
				});
			} else {
				res.status(400).json('invalid user data');
			}
		} catch (err) {
			res.status(500).json(err);
		}
	}
	
	
}