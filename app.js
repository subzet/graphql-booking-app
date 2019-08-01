const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');

const graphqlSchema = require('./graphql/schema/index');
const graphqlResolvers = require('./graphql/resolvers/index');

const isAuth = require('./middleware/is-auth');


//Database configuration.
const mongoose = require('mongoose');
let dev_db_url = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-jdb9k.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
//let dev_db_url = 'mongodb://localhost:27017/bookingApp'
let mongoDB = process.env.MONGODB_URI || dev_db_url;

let port = 3000;
//Database connection and app startup.
mongoose.connect(mongoDB).then( () => app.listen(port, () => {
    console.log("App listening at port: " + port);
})).catch(err => {
    console.log(err);
});

const app = express();

app.use(bodyParser.json()); //Uses body parser middleware.

app.use(isAuth);//Uses middleware isAuth function in every request.

app.get('/', (req,res, next)  => {
    res.send("Express says hi!");
})

app.use('/graphql', graphqlHttp({ //graphql routing configuration
    schema: graphqlSchema,
    rootValue: graphqlResolvers,//should point to a JavaScript Object which has all the resolver functions in it. Names have to be the same with query.
    graphiql: true
}))



