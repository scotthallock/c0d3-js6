import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { RESTDataSource } from '@apollo/datasource-rest';
import fetch from 'node-fetch';

/* Define schema */
const typeDefs = `#graphql
    type Lesson {
        title: String
    }

    type Pokemon {
        name: String
        image: String
    }

    type BasicPokemon {
        name: String
    }

    type Query {
        lessons: [Lesson]
        getPokemon(name: String!): Pokemon
        search(searchString: String!): [BasicPokemon]
    }
`;

/**
 * Extend RESTDataSource classes to fetch data from REST APIs
 * See: https://www.apollographql.com/docs/apollo-server/data/fetching-rest
 */
class LessonsAPI extends RESTDataSource {
    baseURL = 'https://www.c0d3.com/api/lessons/';

    async getLessons() {
        return this.get('./');
    }
}

class PokemonAPI extends RESTDataSource {
    baseURL = 'https://pokeapi.co/api/v2/';

    async getPokemon(name) {
        const data = await this.get(`./pokemon/${name}`);
        return {
            name: data.name,
            image: data.sprites.front_default,
        };
    }
}

/**
 * Get list of all pokemon names from PokeAPI.
 * (Set ?limit=10000 so all pokemon are returned on one page.)
 */
const allPokemonData = 
    await fetch('https://pokeapi.co/api/v2/pokemon/?offset=0&limit=10000')
    .then(res => res.json());
const allPokemonNames = allPokemonData.results.map(e => ({ name: e.name }));

/* Define resolvers */
const resolvers = {
    Query: {
        lessons: async (_, __, { dataSources }) => {
            return dataSources.lessonsAPI.getLessons();
        },
        getPokemon: (_, { name }, { dataSources }) => {
            return dataSources.pokemonAPI.getPokemon(name);
        },
        search: (_, { searchString }) => {
            return allPokemonNames.filter(e => {
                return e.name.includes(searchString.toLowerCase());
            });
        },
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
});

/* Add data sources to server's context function */
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async () => {
        const { cache } = server;
        return {
            dataSources: {
                lessonsAPI: new LessonsAPI({ cache }),
                pokemonAPI: new PokemonAPI({ cache }),
            },
        };
    },
});

console.log(`🚀  Server ready at: ${url}`);
