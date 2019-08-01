//Models
const Event = require('../../models/event');
const User = require('../../models/user');

//Helpers
const { dateToString }  = require('../../helpers/date');

const transformedEvent = event => {
    return {...event._doc, 
        _id: event.id,
        date: dateToString(event._doc.date), 
        creator: user.bind(this,event._doc.creator)}
}

const transformedUser = user => {
    return {...user._doc,
        _id: user.id, 
        password:null,
        createdEvents:events.bind(this,user._doc.createdEvents)
    }
}

const transformedBooking = booking => {
    return {...booking._doc,
        _id:booking.id,
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt),
        event: singleEvent.bind(this,booking._doc.event),
        user: user.bind(this,booking._doc.user)
    }
}

const events = async eventsId => {
    try{
    const events = await Event.find({_id: {$in : eventsId}})
    return events.map(event => {
        return transformedEvent(event);
    });
    }catch (err){
        throw err;
    }
}

const user = async userId => {
    try{
        const user = await User.findById(userId);
        return transformedUser(user);
    }catch(err){
        throw err;
    }
}

const singleEvent = async eventId => {
    try{
        const event = await Event.findById(eventId);
        return  transformedEvent(event);
    }
    catch (err){
        throw err;
    }
}

exports.transformedBooking = transformedBooking;
exports.transformedEvent = transformedEvent;
exports.transformedUser = transformedUser;