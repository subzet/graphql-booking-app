//Models
const Event = require('../../models/event');
const User = require('../../models/user');

//Helpers
const { dateToString }  = require('../../helpers/date');

//Merging
const { transformedEvent } = require('./merge');



module.exports = {
    events: async () =>  {
        try{
            const events = await Event.find();
            return events.map(event => {
                return transformedEvent(event);
            });
        }catch(err){
            throw(err);
        }
    },
    createEvent: async (args, req) => {
        if(!req.isAuth){
            throw new Error('Unauthenticated!');
        }
        const event = new Event ({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: dateToString(args.eventInput.date),
            creator: req.userId //Dummy test
        })
        let createdEvent = null;
        try{
            const result = await event.save();
            createdEvent =  transformedEvent(result);   
            const existingUser = await User.findById(req.userId);
            if(!existingUser){
                    throw new Error("User does not exist!");
            }
            existingUser.createdEvents.push(result.id);
            await existingUser.save();
            return createdEvent;
        }catch(err){
            throw(err);
    }
    }
}