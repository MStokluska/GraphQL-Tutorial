NOTE: THIS IS PART 3/4 FOR MY TUTORIAL THAT CAN BE FOUND ON DEV.TO LINK TO DEV.TO ( UNPUBLISHED ) - https://dev.to/mstokluska/technologies-that-changed-my-perception-of-software-development-514o-temp-slug-9091855?preview=b2b0b8ac7f06850f80c48acef4b4ecabbcc4bc9e17ac24aaee54a92d445a726b93f98d34d347f67c5d3790bb21672185625b38f389f912606739cfdf

----
# <center>GraphQL</center>
----

GraphQL is a query language invented by Facebook and is an alternative approach to REST for designing and building API. Schema is at the center of any GraphQL server and describes functionality available to clients. Schema has types which define:
- Relationships between entities - in our case it would be a relationship between users and tasks 
- Data manipulation and operation that can be executed by the client, in our project those will be for example queries to fetch all users or all tasks, and mutations to delete and add a user or a task.

To build our GraphQL server we are going to use the "Schema First" approach, which basically prioritizes building schema in development. It allows me to visualize the data flow between entities and queries/mutations that I might require! We are also going to use Apollo framework for GraphQL server, a library that helps us connect our GraphQL schema to a node server, which is same as express framework for REST. 

## Requirements

- [Rest in 10 minutes](https://dev.to/mstokluska/rest-4559-temp-slug-1084036?preview=499edc364810a5d0d706a9427deaf0d51e9edc299c1356589b1740a15199a655106aa2dd7174005c025caedbf6511c5deeba9d52bb6628ad22e8f5ef) completed

## Let's get started

First, think about the schema, what are our entities going to be? What data are we planning to return? What does the client need? Imagine our project, with tasks and users, our GraphQL types will look something like this:

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
We are defining two entities, a ``User`` and ``Task`` entity. Both have different attributes and return types. A client can access a ``User`` object or ``Task`` object and from there he can access any of the attributes given, however, ``assignedTo`` from ``Task`` returns an array of ``User`` objects. Exclamation mark simply means `Required`.

- In your existing server project, use npm to add the following dependencies:
```sh
$ npm install apollo-server-express graphql
```
- Next, edit our ```index.ts``` file.
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
We no longer need the REST methods so you can delete them. Next, we are adding Apollo Server to our project. Then, applying a schema ( that is yet to be implemented ) to our Apollo Server, finally, we can apply middleware to it, which is express and path - also called - endpoint.

- Create a new folder within our `server` folder, called `schema`
- In `schema` folder create a file called `typeDefs.graphql` which is going to hold types that we have specified above. Paste the following code:
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
- Next, we are adding type Query - which enables query support for given queries, for now, let's keep it simple and stick to our basic two queries, `tasks`, which allows a client to access a list of all tasks, and `users`, which allows accessing an entire array of users.
```
type Query {
    tasks: [Task!]!
    users: [User!]!
}
```
- Next, add another file called `resolvers.js` into `schema` folder and paste the following code:
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
Resolvers are simply functions resolving value for a type from typeDefs. They can return values like Strings, Numbers, Booleans etc.

- Create ``index.js`` in ``schema`` folder and paste following code:
```js
const { importSchema } = require('graphql-import');
const { makeExecutableSchema } = require('graphql-tools');
const resolvers = require('./resolvers');
const typeDefs = importSchema('schema/typeDefs.graphql');

module.exports = makeExecutableSchema({ resolvers, typeDefs });
```
In this step we have made an executable schema that contains both, our resolvers and typeDefs so it can be used in our ``index.js``
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

- You can now save all your changes, run npm start and navigate to ``http://localhost:4000/graphql``. You should see the following:

![Playground](https://thepracticaldev.s3.amazonaws.com/i/gaz5w352o1y0k8fxnbw6.png)

You have just launched GraphQL playground from your very first GraphQL server! In the left window, you can write your queries and mutations while responses will be displayed on the right-hand side! Let's give it a go and write our very first query:

![First Query](https://thepracticaldev.s3.amazonaws.com/i/c04ztnuycm9rl0q7pczu.png)

- Line#2 ``query AnyNameOfQuery`` - in here you simply specify whether you are about to use query or mutation and you are naming your query/mutation.
- Line#3 ``tasks{`` this is the name of our query specified in typeDefs file:
```
tasks: [Task!]!
```
- Line#4 & 5 specifies what are we interested in. We have specified in our typeDefs that query task is going to return an array of ``task`` objects.
- Hit the play button in the middle of the playground and you should get the following response:

![First Response](https://thepracticaldev.s3.amazonaws.com/i/nkkd90xqxyfghssgr5ny.png)

If you type in more than one query or mutation in the left window, play button should give you an option to choose which query/mutation you would like to execute. 

When we execute query task we have access to the full object, but we might only want a certain part of it! So in our example above, we have requested only title and description from an array of `tasks`. You might think, why would we set a name of our query if we are using the pre-named query from our typeDefs.
The answer is - we don't have to! But imagine you are working on a client and you want to access tasks twice, once where you are only interested in titles, and other time when you are interested in descriptions only! Naming queries can be very helpful.

- Now, let's add ``assignedTo`` to our existing query, which is not going to work for now but I would like you to try it anyway to give you a better understanding the duty of the resolvers.

Add ``assignedTo{`` and hit `ctrl + space`. You should see all the available data that GraphQL can fetch for you, all that information comes from types specified in `typeDefs`.

- Let's say we are interested in ``firstName`` and ``lastName`` of our users.

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
The reason why it is not working is that we have not specified what data should be fetched when a `User` array is accessed from `Task` object.
- Let's specify what our assignedTo should do by adding the following code to the resolvers:
```js
const resolvers = {
    Task: {
        assignedTo(task) {
            return users.filter(u => u.id.includes(task.assignedTo));
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
So, when ``assignedTo`` is accessed, we are going to filter through an array of users and return a user that has the `id` same as `assignedTo` from `Task` object.

Now our query should work just fine and I recommend you to play a little bit with queries in the playground to get a better understanding of GraphQL.

- Next, let's add one more query to our server - let's say we would like our server to accept a user name and return with a `User` object of that name. First, we need to edit our ``typeDefs.graphql``:
```
type Query {
    tasks: [Task!]!
    users: [User!]!
    userByName(firstName: String!): User!
}
```
So our new `userByName` query is going to take in a string and is going to return a User object to us.

- Now into resolvers:
```js
Query: {
        tasks() {
            return tasks;
        },

        users() {
            return users;
        },
        
        userByName(parent, args, context,){
            const findIndex = users.findIndex(u => u.firstName === args.firstName)
            return users[findIndex]
        }
    },
```

What we are doing is equivalent to REST params!

- Now restart the server and test our new query in a playground:

![Search for user by name](https://thepracticaldev.s3.amazonaws.com/i/cj0jobage6c0jmj9opwc.png)

I think it would be a great practice for you to enable another query, let's say ``findUserById`` - give it a go! 

- Next, we are going to add our first mutation type next! It would be useful if we could add tasks to our database and to start it we need to edit our typeDefs first:
```
type Mutation {
    addTask(id: ID!, title: String!, description: String!, status: String!, assignedTo: ID!): Task!
}
```
Our ``addTask`` mutation takes in an id, title, description, status, and assignedTo, all fields are required and we want to return the task created.

- Now to resolvers:
```js
const { tasks, users } = require('../db');

const resolvers = {
    Task: {
        assignedTo(task) {
            return users.filter(u => u.id.includes(task.assignedTo));
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
            const findIndex = users.findIndex(u => u.firstName === args.firstName)
            return users[findIndex]
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

            let taskAssignedUser = users.find(u => u.id === args.assignedTo);
            taskAssignedUser.taskId = taskAssignedUser.taskId + args.id;
    
            tasks.push(newTask);
    
            return tasks;
        },
    }
};

module.exports = resolvers;
```
What we are doing in about ``addTask`` mutation is:
- Creating a new task based on passed in parameters
- As our task contains assignedTo we need also need to push new task id to an existing user.
- Push new task to the task array
- Return updated list of tasks

You can view our newly created mutation in action by visiting the playground:

![new task mutation](https://thepracticaldev.s3.amazonaws.com/i/io6thze4xpnmaeootujl.png)

- Our second mutation is going to be ``deleteTask`` mutation, again we start with `typeDefs.graphql` file:
```
removeTask(id: ID!): [Task!]!
```
- Next our resolvers:
```js
const resolvers = {
    Task: {
        assignedTo(task) {
            return users.filter(u => u.id.includes(task.assignedTo));
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
            const findIndex = users.findIndex(u => u.firstName === args.firstName)
            return users[findIndex]
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

I think by now you should have a good idea what you can do with GraphQL and what is the difference between GraphQL and REST - all those queries and mutations we went through used one endpoint and the client dictates what he wants from the server which can hugely improve the speed of our responses! Another huge success of GraphQL is that it allows receiving many resources in a single request! Imagine that on one of your pages you need access to both tasks and user - you can do it by sending one query! To me, understanding GraphQL changed the way I look at client-server architecture - simply because I'm finding it so amazing and easy to work with that I regret I only got to know it now! I really do hope you will enjoy it as well!

Now, let's head straight for our last part - absolutely mind-blowing Graphback!  
