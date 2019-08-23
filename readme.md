NOTE: THIS IS PART 3/4 FOR MY TUTORIAL THAT CAN BE FOUND ON DEV.TO LINK TO DEV.TO ( UNPUBLISHED ) - https://dev.to/mstokluska/technologies-that-changed-my-perception-of-software-development-514o-temp-slug-9091855?preview=b2b0b8ac7f06850f80c48acef4b4ecabbcc4bc9e17ac24aaee54a92d445a726b93f98d34d347f67c5d3790bb21672185625b38f389f912606739cfdf


----
# <center>GraphQL</center>
----

GraphQL is a query language invented by Facebook and it's used to query data from a schema. Schema is at the center of any GraphQL server and describes functionality available to clients. Schema has types which define:
- Relationships between entities - in our case it would be a relationship between users and tasks
- Data manipulation and operation that can be executed by the client, in our project those will be for example queries to fetch all users or all tasks, and mutations to delete and add a user or a task.

To build our GraphQL server we are going to use the "Schema First" approach, which basically prioritizes building schema in development. It allows me to visualize the data flow between entities and queries/mutations that I might require!

Imagine our project, with tasks and users, our GraphQL schema will look something like this:

```
type User {
    id: ID!
    firstName: String!
    lastName: String!
    title: String!
    email: String
    task: [Task!]!
}

type Task {
    id: ID!
    title: String!
    description: String!
    status: String!
    assignedTo: [User!]!
}
```
We are defining two entities, a ``User`` and ``Task`` entity. Both have different attributes and return types. A client can access a ``User`` object or ``Task`` object and from there he can access any of the attributes given, however, notice that ``task`` attribute from within ``User`` returns an array of ``Task`` objects, and ``assignedTo`` from ``Task`` returns an array of ``User`` objects. 

To use our GraphQL server we are going to use Apollo server, which is a library that helps us connect our GraphQL schema to a node server.

- In your existing server project, use npm to add the following dependencies:
```
$ npm install apollo-server-express graphql
```
- Next, edit our ```index.ts``` file.
```js
const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const schema = require('./schema');

const app = express();

app.use(cors());
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
We no longer need the REST methods so you can delete them and what we are doing next is adding Apollo Server to our project. Then we are applying a schema ( that is yet to be implemented ) to our Apollo Server, and then we apply middleware to it, which is express and path - or endpoint.

- Next step is to create a new folder within our ``server`` folder, called ``schema``
- In ``schema`` folder create a file called ``typeDefs.graphql`` that is going to hold types that we have specified above. Paste the following code:
```
type User {
    id: ID!
    firstName: String!
    lastName: String!
    title: String!
    email: String
    task: [Task!]!
}

type Task {
    id: ID!
    title: String!
    description: String!
    status: String!
    assignedTo: [User!]!
}
```
- Next, we are adding type Query - which enables query support for given queries, for now, let's keep it simple and stick to our basic two queries, tasks, which allows a client to access a list of all ``tasks``, and users, which allows accessing an entire array of ``users``.
```
type Query {
    tasks: [Task!]!
    users: [User!]!
}
```
The exclamation mark means it is a must, while a question mark would mean it's optional. So for example, we could have changed tasks query to look like this:
```
tasks: Task!
```
which would mean we are about to return a single ``task``, or even like this:
```
tasks: ?Task
```
which would mean that we can return a null value or a single ``task``.

- Next, add another file called ``resolvers.js`` into ``schema`` folder and paste the following code:
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
Resolvers are simply functions resolving value for a type from typeDefs. They can return values like Strings, Numbers, Booleans etc. However, if an object is returned, execution continues to the next child - but more about this later.  

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
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const schema = require('./schema'); <-----------------------------

const app = express();

app.use(cors());
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

You have just launched GraphQL playground! In the left window, you can write your queries and mutations while responses will be displayed on the right-hand side! Let's give it a go and write our very first query:

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

 

When we execute query task we have access to the full object, but we might only want a certain part of it! So in our example above, we have requested only title and description from an array of ``tasks``. You might think, why would we set a name of our query if we are using the pre-named query from our typeDefs.
The answer is - we don't have to! But imagine you are working on a client and you want to access tasks twice, once where you are only interested in titles, and other time when you are interested in descriptions only! Naming queries can be very helpful.

- Now, let's add ``assignedTo`` to our existing query.

Add ``assignedTo{`` and hit `ctrl + space`. You should see all the available data that GraphQL can fetch for you, it's all the users data we have specified in our typeDefs!

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
The reason why it is not working is that we have not specified what data should be fetched when a ``User`` array is accessed from ``Task`` object, same for ``Task`` array from ``User`` object.

- Let's specify what our assignedTo should do by adding the following code to the resolvers:
```js
const resolvers = {
    Task: {
        assignedTo(task) {
            return users.filter(u => u.taskId.includes(task.id));
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
So, when ``assignedTo`` is accessed, we are going to filter through an array of users and return a user that has the ``taskId`` of matching ``Task.id``. Let's do the same with task accessed via User object.
```js
const resolvers = {
    Task: {
        assignedTo(task) {
            return users.filter(u => u.taskId.includes(task.id));
        },
    },
    User: {
        task(user) {
          return tasks.filter(t => t.assignedTo.includes(user.id));
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
Now our query should work just fine. Try accessing tasks from users query as well:

![GetNamesAndTaskTitles Query](https://thepracticaldev.s3.amazonaws.com/i/b59jidjiiujpar1fvm1l.png)

I recommend you to play a little bit with queries in the playground to get a better understanding of GraphQL.

- Next, let's add one more query to our server - let's say we would like our server to accept a user name and reply with that user object. First, we need to edit our ``typeDefs.graphql``:
```
type Query {
    tasks: [Task!]!
    users: [User!]!
    userByName(firstName: String!): User!
}
```
So our new ``userByName`` query is going to take in a string and is going to return a User object to us.

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

I think it would be a great practice for you to enable another query, lets say ``findUserById`` - give it a go! 

- Next, we are going to add our first mutation type next! It would be great if we could add tasks to our database, to start it we need to edit our typeDefs first:
```
type Mutation {
    addTask(id: ID!, title: String!, description: String!, status: String!, assignedTo: String!): Task!
}
```
Our ``addTask`` mutation takes in an id, title, description, status and assignedTo, all fields are required and we want to return the task created.

- Now to resolvers:
```js
const { tasks, users } = require('../db');

const resolvers = {
    Task: {
        assignedTo(task) {
            return users.filter(u => u.taskId.includes(task.id));
        },
    },
    User: {
        task(user) {
          return tasks.filter(t => t.assignedTo.includes(user.id));
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
    
            return newTask;
        },
    }
};

module.exports = resolvers;
```
What we are doing in about ``addTask`` mutation is:
- Creating a new task based on passed in parameters
- As our task contains assignedTo we need also need to push new task id to an existing user.
- Push new task to the task array
- Return added task

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
            return users.filter(u => u.taskId.includes(task.id));
        },
    },
    User: {
        task(user) {
          return tasks.filter(t => t.assignedTo.includes(user.id));
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

I think by now you should have a good idea what you can do with GraphQL and what is the difference between GraphQL and REST - all those queries and mutations we went through used one endpoint and the client dictates what he wants from the server which can hugely improve the speed of our responses! Another huge success of GraphQL is that it allows receiving many resources in a single request! Imagine that on one of your pages you need access to both tasks and user - you can do it by sending one query! To me, understanding GraphQL changed the way I look at client-server architecture - simply because I'm finding it so amazing and easy to work with that I regret I only got to know it now! I really do hope you will enjoy it as well!

Now, let's head straight for our last part - absolutely mind-blowing Graphback! 




 