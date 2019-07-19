const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const bcrypt = require('bcryptjs');

//Models
const Event = require('./models/event');
const User = require('./models/user');

//Database configuration.
const mongoose = require('mongoose');
//let dev_db_url = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-jdb9k.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
let dev_db_url = 'mongodb://localhost:27017/bookingApp'
let mongoDB = process.env.MONGODB_URI || dev_db_url;

let port = 3000;
//Database connection and app startup.
mongoose.connect(mongoDB).then( () => app.listen(port, () => {
    console.log("App listening at port: " + port);
})).catch(err => {
    console.log(err);
});

const app = express();

const events = eventsId => {
    return Event.find({_id: {$in : eventsId}})
}

const user = userId => {
    return User.findById(userId)
    .then( result => {
        return {...result._doc,_id: result.id, password: null}
    })
    .catch(err =>{
        throw err;
    })
}

app.use(bodyParser.json()); //Uses body parser middleware.

app.get('/', (req,res, next)  => {
    res.send("Express says hi!");
})

app.use('/graphql', graphqlHttp({ //graphql routing configuration
    schema: buildSchema(` 
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }

        type User {
            _id: ID!
            email:  String!
            password: String
            createdEvents: [Event!]
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }
    
        type RootQuery {
            events: [Event!]!
        }
        
        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),//should point to a valid graphql schema
    rootValue: {
        
        events: () =>  {
            return Event.find()
            .then(events => {
                return events.map(event => {
                    return {
                        ...event._doc, 
                        _id: event._doc._id.toString(),
                        creator: user.bind(this, event._doc.creator)
                    }; 
                    //Returns only the event data and not the metadata from mongoDB.
                    //Also gets ID (ObjectID) and returns it as an id.
                });                
            })
            .catch(err => {
                console.log(err);
            })
        },

        createEvent: (args) => {
            const event = new Event ({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: "5d31ca6a1b0d3f5948a80ee7" //Dummy test
            })
            let createdEvent = null;
            return event
            .save()
            .then(result => {
                createdEvent = {...result._doc, _id : result.id}
                return User.findById('5d31ca6a1b0d3f5948a80ee7');
            })
            .then(user => {
                if(!user){
                    throw new Error("User does not exist!");
                }
                user.createdEvents.push(event.id    );
                return user.save();
            })
            .then(result => {
                return createdEvent;
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
            
        },
        createUser: (args) => {
            //look for user with same email.
            return User.findOne({email: args.userInput.email})
            .then(user => {
                if(user){
                    throw new Error('User exists already.')
                }
                return bcrypt.hash(args.userInput.password,12)
            })
            .then(hashedPassword => {
                const user = new User ({
                    email: args.userInput.email,
                    password: hashedPassword    
                });
                return user.save();
            })
            .then(result => {
                return {...result._doc, _id: result.id, password: null}; //password set to null for security purpouses.
            })
            .catch(err => {
                throw err;
            })
        }
    },//should point to a JavaScript Object which has all the resolver functions in it. Names have to be the same with query.
    graphiql: true
}))



