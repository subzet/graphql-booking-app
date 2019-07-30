const bcrypt = require('bcryptjs');

//Models
const Event = require('../../models/event');
const User = require('../../models/user');

const events = async eventsId => {
    try{
    const events = await Event.find({_id: {$in : eventsId}})
    return events.map(event => {
        return { ...event._doc
            , _id: event.id,
            date: new Date(event._doc.date).toISOString(), 
            creator: user.bind(this,event._doc.creator)}
    });
    }catch (err){
        throw err;
    }
}

const user = async userId => {
    try{
        const user = await User.findById(userId);
        return {...user._doc,_id: user.id, password:null,createdEvents:events.bind(this,user._doc.createdEvents)}
    }catch(err){
        throw err;
    }
}

module.exports = {
    events: async () =>  {
        try{
            const events = await Event.find();
            return events.map(event => {
                return {
                    ...event._doc, 
                    _id: event._doc._id.toString(),
                    date: new Date(event._doc.date).toISOString(), 
                    creator: user.bind(this, event._doc.creator)
                }; 
                //Returns only the event data and not the metadata from mongoDB.
                //Also gets ID (ObjectID) and returns it as an id.
            });
        }catch(err){
            throw(err);
        }
    },

    createEvent: async (args) => {
        const event = new Event ({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: "5d366550e2bc0f29549d0f50" //Dummy test
        })
        let createdEvent = null;
        try{
            const result = await event.save();
            createdEvent =  {...result._doc, 
                                _id : result.id,
                                date: new Date(event._doc.date).toISOString(),  
                                creator: user.bind(this,result._doc.creator)}   
            const existingUser = await User.findById('5d366550e2bc0f29549d0f50');
            if(!existingUser){
                    throw new Error("User does not exist!");
            }
            existingUser.createdEvents.push(result.id);
            await existingUser.save();
            return createdEvent;
        }catch(err){
            throw(err);
    }
    },
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
            return {...savedUser._doc,_id:savedUser.id,password:null}
        }
        catch (err){
            throw err;
        }
    }
}