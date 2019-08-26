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
