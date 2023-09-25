// import required modules
const express = require('express');
// import ApolloServer
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
// import authMiddleware from utils
const { authMiddleware } = require('./utils/auth');
// import GraphQL schema
const { typeDefs, resolvers } = require('./schemas');

// import MongoDB database config
const db = require('./config/connection');
const routes = require('./routes');

// create an instance of Express.js app
const app = express();
const PORT = process.env.PORT || 3001;

// create a new Apollo Server with imported typeDefs and resolvers, set context to authMiddleware to be applied to GraphQL request
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

// configure middleware for parsing JSON and url-encoded data in requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// app.use(routes);

// create a new instance of Apollo Server with the the GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });

// db.once('open', () => {
//   app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
// });
  
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })
};

// call the async function to start the server
startApolloServer(typeDefs, resolvers);