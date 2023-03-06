import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// schema
const typeDefs = `#graphql
    type Book {
        title: String
        author: String
    }

    type Query {
        books: [Book]
    }
`;

// data set
const books = [
    {
        title: 'The Awakening',
        author: 'Kate Chopin',
    },
    {
        title: 'City of Glass',
        author: 'Paul Auster',
    },
];

// resolver
const resolvers = {
    Query: {
        books: () => books,
    },
};

// create instance of ApolloServer
const server = new ApolloServer({
    typeDefs,
    resolvers
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);