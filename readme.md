NOTE: THIS IS PART 3/4 FOR MY TUTORIAL THAT CAN BE FOUND ON DEV.TO LINK TO DEV.TO ( UNPUBLISHED ) - https://dev.to/mstokluska/technologies-that-changed-my-perception-of-software-development-514o-temp-slug-9091855?preview=b2b0b8ac7f06850f80c48acef4b4ecabbcc4bc9e17ac24aaee54a92d445a726b93f98d34d347f67c5d3790bb21672185625b38f389f912606739cfdf

----
# <center>GraphQL</center>
----

GraphQL is a query language invented by Facebook and is an alternative approach to REST for designing and building APIs. Schema is at the center of any GraphQL server and describes the functionality available to clients. Schema has types which define:
- Relationships between entities - in our case it would be a relationship between users and tasks
- Data manipulation and operation that can be executed by the client. In our project these will be queries to fetch all users or all tasks, and mutations to delete and add a user or a task.

To build our GraphQL server we are going to use the "Schema First" approach. This basically prioritizes building schema in development. It allows for the visualisation of the data flow between entities and queries/mutations that might be require. We are also going to use Apollo framework for the GraphQL server. This is a library that helps us connect our GraphQL schema to a node server, which is the same as express framework for REST. 

## Requirements

- [Rest in 10 minutes](https://dev.to/mstokluska/rest-4559-temp-slug-1084036?preview=499edc364810a5d0d706a9427deaf0d51e9edc299c1356589b1740a15199a655106aa2dd7174005c025caedbf6511c5deeba9d52bb6628ad22e8f5ef) completed or downloaded from my [REST tutorial](https://github.com/MStokluska/REST-Tutorial) github repository.

## Let's get started

First, think about the schema. What are our entities going to be? What data are we planning to return? What does the client need? Our project will have tasks and users so our GraphQL types will look something like this:

```
type User {
    id: ID!
    firstName: String!
    lastName: String!
    title: String!
    email: String
}

type Task {
    id: ID!
    title: String!
    description: String!
    status: String!
    assignedTo: [User!]!
}
```
We are defining two entities, a ``User`` and a ``Task``. Both have different attributes and return types. A client can access a ``User`` object or a``Task`` object and can then access any of the attributes given. However, ``assignedTo`` from ``Task`` returns a ``User`` object. An exclamation mark simply means `Required`, so in our example of `assignedTo` the return type is required to be an array of `Users`.

- Navigate to the REST tutorial project in your terminal and use npm to add the following dependencies:
```sh
$ npm install apollo-server-express graphql graphql-import
```
- Open Visual Studio Code and edit the ```index.js``` file. Replace all of the existing code with the following: 
```js
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const schema = require('./schema');

const app = express();

app.use(express.json());

const server = new ApolloServer({ schema });

server.applyMiddleware({
  app,
  path: '/graphql',
});

const port = 4000;

app.listen(port, () => {
  console.log(`🚀 Server is running at: http://localhost:${port}/graphql`);
});
```
 Next, we are going to add Apollo Server and then apply a schema, that is yet to be implemented, to our Apollo Server. Finally, we will add Express and path middleware which is also known as endpoint.

- Create a new folder called `schema` within the `server` folder
- In this new folder create a file called `typeDefs.graphql` and insert the following code into this file:
```
type User {
    id: ID!
    firstName: String!
    lastName: String!
    title: String!
    email: String
}

type Task {
    id: ID!
    title: String!
    description: String!
    status: String!
    assignedTo: [User!]!
}
```
- In the same file add a Query type. This enables query support for given queries but let's keep it simple and stick to our basic two queries, `tasks`, which allows a client to access to an array of tasks, and `users`, which allows access to an array of users.
```
type Query {
    tasks: [Task!]!
    users: [User!]!
}
```
- In the same `schema` folder, add another file called `resolvers.js`and insert the following code:
```js
const { tasks, users } = require('../db');

const resolvers = {
  Query: {
    tasks() {
      return tasks;
    },

    users() {
      return users;
    },
  },
};

module.exports = resolvers;
```
Resolvers are functions that resolve values for a type from typeDefs. They can return values like Strings, Numbers, Booleans etc. For example, the `users` resolver must return an array of `Users`. They are similar to HTTP handler functions that we saw in express where they implement the business logic and return a result.

- Create `index.js` in `schema` folder and paste following code:
```js
const { importSchema } = require('graphql-import');
const { makeExecutableSchema } = require('graphql-tools');
const resolvers = require('./resolvers');
const typeDefs = importSchema('schema/typeDefs.graphql');

module.exports = makeExecutableSchema({ resolvers, typeDefs });
```
The above code creates an executable schema that contains both our resolvers and typeDefs. The main ``index.js`` file should now include the two new lines of code indicated below:
```js
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const schema = require('./schema'); <-----------------------------

const app = express();

app.use(express.json());

const server = new ApolloServer({ schema });<---------------------

server.applyMiddleware({
  app,
  path: '/graphql',
});

const port = 4000;

app.listen(port, () => {
  console.log(`🚀 Server is running at: http://localhost:${port}/graphql`);
});
```

- You can now save all your changes, run `npm start` and navigate to ``http://localhost:4000/graphql``. You should see the following:

![Playground](https://thepracticaldev.s3.amazonaws.com/i/gaz5w352o1y0k8fxnbw6.png)

You have just launched GraphQL playground from your very first GraphQL server! In the left window, you can write your queries and mutations while responses will be displayed on the right-hand side! Let's give it a go and write our very first query:

![First Query](https://thepracticaldev.s3.amazonaws.com/i/c04ztnuycm9rl0q7pczu.png)

- ``query AnyNameOfQuery`` specifies whether you are using a query or a mutation and you are also naming your query/mutation.
- ``tasks{`` is the name of our query specified in our `typeDefs` file:
```
tasks: [Task!]!
```
- Everything inside the curly braces specifies what are we interested in. We have specified in our typeDefs that query task is going to return an array of ``task`` objects.
- Hit the play button in the middle of the playground and you should get the following response:

![First Response](https://thepracticaldev.s3.amazonaws.com/i/nkkd90xqxyfghssgr5ny.png)

If you type in more than one query or mutation in the left window, play button should give you an option to choose which query/mutation you would like to execute. 

When we execute the query `task` we have access to the full object, but we might only want a certain part of it! In our example above, we have requested only title and description from an array of `tasks`. You might be thinking why do we set a name for our query if we are using the pre-named query from our typeDefs. The answer is that we don't have to, but imagine you are working on a client and you want to access tasks twice. The first time you might be only interested in titles, and the second time you are only interested in descriptions. In situations like this naming queries can be very helpful.

- Now, let's add `assignedTo` to our existing query, which is not going to work for now but I would like you to try it anyway to give you a better understanding around the duty of the resolvers.

Add `assignedTo{` and hit `ctrl + space`. You should see all the available types that is specified in `typeDefs` which GraphQL can fetch for you.

- Let's say we are interested in `firstName` and `lastName` of our users.

![AssignedTo](https://thepracticaldev.s3.amazonaws.com/i/hflmb09uk44obzjdpcrd.png)

Hit play and...an error! Think of our resolvers and typeDefs now:

```js
const { tasks, users } = require('../db');

const resolvers = {
  Query: {
    tasks() {
      return tasks;
    },

    users() {
      return users;
    },
  },
};

module.exports = resolvers;
```
The reason why it gives an error is that we must implement a new resolver to return the user that the task is assigned to.

- Let's specify what our assignedTo should do by adding the following code to the resolvers:

```js
const resolvers = {

    Task: {
        assignedTo(task) {
            return users.filter(u => u.id === task.assignedTo);
        },
    },

    Query: {
        tasks() {
            return tasks;
        },

        users() {
            return users;
        },
    },
};
```
So, when `assignedTo` is accessed, we are going to filter through an array of `users` and return a `user` that has the `id` of matching `assignedTo`. 

The query should run error free now and I recommend you to play around with queries in the Playground to get a better understanding of GraphQL.

- Next, we will add one more query to our server. Let's say we would like the server to accept a user name and return a `User` object of that name. First, we need to edit our ``typeDefs.graphql``:
```
type Query {
    tasks: [Task!]!
    users: [User!]!
    userByName(firstName: String!): User!
}
```
So our new `userByName` query is going to take in a string and is going to return a User object to us.

- Now into the resolvers.js input the new `userByName` query below:
```js
Query: {
        tasks() {
            return tasks;
        },

        users() {
            return users;
        },
        
        userByName(parent, args, context,){
            return users.find(u => u.firstName === args.firstName)
        },
    },
```

What we are doing is equivalent to REST params!

- Now restart the server and test our new query in a playground:

![Search for user by name](https://thepracticaldev.s3.amazonaws.com/i/cj0jobage6c0jmj9opwc.png)

I think it would be a great practice for you to enable another query, let's say ``findUserById`` - give it a go yourself! 

- Next we are going to add our first mutation type as it would be useful if we could add tasks to our database. We need to edit our typeDefs first:
```
type Mutation {
    addTask(id: ID!, title: String!, description: String!, status: String!, assignedTo: ID!): Task!
}
```
Our `addTask` mutation takes in an id, title, description, status, and assignedTo, all fields are required and we want to return new `task`.

- Now to resolvers:
```js
const { tasks, users } = require('../db');

const resolvers = {

    Task: {
        assignedTo(task) {
            return users.find(u => u.id === task.assignedTo);
        },
    },

    Query: {
        tasks() {
            return tasks;
        },

        users() {
            return users;
        },
        
        userByName(parent, args, context,){
            return users.find(u => u.firstName === args.firstName)
        }
    },
    Mutation: {
        addTask(parent, args, context) {
          const newTask = {
            id: args.id,
            title: args.title,
            description: args.description,
            status: args.status,
            assignedTo: args.assignedTo,
          };
    
            tasks.push(newTask);
    
            return newTask;
        },
    };
};

module.exports = resolvers;
```
What we are doing in the ``addTask`` mutation is:
- Creating a new `task` based on the parameters that are passed in
- Push the new `task` to the `task` array
- Return the newly created `task`

You can view our newly created mutation in action by visiting the playground and entering the following code:

![new task mutation](https://thepracticaldev.s3.amazonaws.com/i/io6thze4xpnmaeootujl.png)

- Our second mutation is going to be ``removeTask`` mutation. Again we start with `typeDefs.graphql` file and insert the following code into the mutation type block:
```
removeTask(id: ID!): [Task!]!
```
- In our resolvers.js enter `removeTask` as seen below :
```js
const resolvers = {

    Task: {
        assignedTo(task) {
            return users.find(u => u.id === task.assignedTo);
        },
    },

    Query: {
        tasks() {
            return tasks;
        },

        users() {
            return users;
        },
        
        userByName(parent, args, context,){
            return users.filter(u => u.firstName === args.firstName)
        }
    },
    Mutation: {
        addTask(parent, args, context) {
          const newTask = {
            id: args.id,
            title: args.title,
            description: args.description,
            status: args.status,
            assignedTo: args.assignedTo,
          };
    
            tasks.push(newTask);
    
            return newTask;
        },

        removeTask(parent, args, context) {
            const taskIndex = tasks.findIndex(t => t.id === args.id);
      
            tasks.splice(taskIndex, 1);
            
            return tasks;
          },
    }
};
```
And just like with the first mutation give it a try in the playground!

## Summary

I think by now you should have a good idea what you can do with GraphQL and what is the difference between GraphQL and REST. All of the queries and mutations we went through used one endpoint, and the client dictates what it wants from the server which can hugely improve the speed of our responses. Another huge advantage with GraphQL is that it allows receiving many resources in a single request. So if you need access to both tasks and user you can do it by sending one query. Personally, understanding GraphQL has changed the way I now look at client-server architecture. I'm finding it so amazing and easy to work with, that I regret only getting to know it now. I really hope you will enjoy it as well!

Now, let's head straight for our last part, the absolutely mind-blowing [Graphback](https://dev.to/mstokluska/graphback-38en-temp-slug-5939347?preview=1896530eda5cbfedb0a4577a495ef66b1470d7d6327e75f108e3dfff33b527d1fd6285419679d44653956648ca0741e0e82fc84d545ede7e7faccaa5)! 




 
