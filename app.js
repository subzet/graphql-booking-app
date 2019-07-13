const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use(bodyParser.json()); //Uses body parser middleware.

app.get('/', (req,res, next)  => {
    res.send("Express says hi!");
})

app.use('/graphql', graphqlHttp({ //graphql routing configuration
    schema: buildSchema(` 
        type RootQuery {
            events: [String!]!
            
        }
        
        type RootMutation {
            createEvent(name: String): String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),//should point to a valid graphql schema
    rootValue: {
        events: () =>  {
            return ['Fiesta','Fiesta 2','Fiesta 3'];
        },
        createEvent: (args) => {
            const eventName = args.name;
            return eventName;
        }
    },//should point to a JavaScript Object which has all the resolver functions in it. Names have to be the same with query.
    graphiql: true
}))

let port = 3000;

app.listen(port, () => {
    console.log("App listening at port: " + port);
});