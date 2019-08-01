const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Models
const User = require('../../models/user');

//Merging
const { transformedUser } = require('./merge');


module.exports = {
    createUser: async (args) => {
        //look for user with same email.
        try{
            const user = await User.findOne({email: args.userInput.email});
            if(user){
                throw new Error('User exists already.');
            }
            hashedPassword = await bcrypt.hash(args.userInput.password,12);
            const newUser = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const savedUser = await newUser.save();
            return transformedUser(savedUser);
        }
        catch (err){
            throw err;
        }
    },
    login: async ({email,password}) => {
        try{
            const user = await User.findOne({email: email})
            if (!user){
                throw new Error('User does not exists!');
            }
            //Password comparation
            const success = await bcrypt.compare(password, user._doc.password);
            if(!success){
                throw new Error('Password is incorrect!');
            }
            const token  = await jwt.sign({userId:user.id, email: user._doc.email},'someSuperSecretKey', {
                expiresIn: '1h',

            });
            return { userId: user.id, token: token, tokenExp: 1}
        }catch(err){
            throw err;
        }
    }   
}