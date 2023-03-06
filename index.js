import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
/* https://www.apollographql.com/docs/apollo-server/data/fetching-rest */
import { RESTDataSource } from '@apollo/datasource-rest';

// schema
const typeDefs = `#graphql
    type Lesson {
        title: String!
    }

    type Query {
        lessons: [Lesson]
    }
`;


class LessonsAPI extends RESTDataSource {
    baseURL = 'https://www.c0d3.com/api/lessons';

    async getLessons() {
        return this.get(``);
    }
}

// resolver
const resolvers = {
    Query: {
        lessons: async (_, __, { dataSources }) => {
            console.log(await dataSources.lessonsAPI.getLessons());
            return dataSources.lessonsAPI.getLessons();
        },
    },
};

// create instance of ApolloServer
const server = new ApolloServer({
    typeDefs,
    resolvers
});

// add data sources to server's context function
const { url } = await startStandaloneServer(server, {
    context: async () => {
        const { cache } = server;
        return {
            dataSources: {
                lessonsAPI: new LessonsAPI({ cache }),
                //another subclass here
            },
        };
    },
});



console.log(`🚀  Server ready at: ${url}`);


// lessons Query returns a list of lesson titles
// titles are a string