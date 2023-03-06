import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
/* https://www.apollographql.com/docs/apollo-server/data/fetching-rest */
import { RESTDataSource } from '@apollo/datasource-rest';

const typeDefs = `#graphql
    type Lesson {
        title: String!
    }

    type Pokemon {
        name: String!
        image: String!
    }

    type BasicPokemon {
        name: String!
    }

    type Query {
        lessons: [Lesson!]!
        getPokemon(name: String!): Pokemon!
        search(searchString: String!): [BasicPokemon]!
    }
`;

class LessonsAPI extends RESTDataSource {
    baseURL = 'https://www.c0d3.com/api/lessons/';

    async getLessons() {
        return this.get('./');
    }
}

class PokemonAPI extends RESTDataSource {
    baseURL = 'https://pokeapi.co/api/v2/';

    async getPokemon(name) {
        const data = this.get(`./pokemon/${name}`);
        return {
            name: data.name,
            image: this.sprites.front_default,
        };
    }
}

const allPokemonData = 
    await fetch('https://pokeapi.co/api/v2/pokemon/?offset=0&limit=5000')
    .then(res => res.json());
const allPokemonNames = allPokemonData.results.map(e => ({ name: e.name }));

const resolvers = {
    Query: {
        lessons: async (_, __, { dataSources }) => {
            return dataSources.lessonsAPI.getLessons();
        },
        getPokemon: (_, { name }, { dataSources }) => {
            return dataSources.pokemonAPI.getPokemon(name);
        },
        search: () => {
            return allPokemonNames.filter(e => {
                return e.name.includes(searchString.toLowerCase());
            });
        }
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers
});

/* Add data sources to server's context function */
const { url } = await startStandaloneServer(server, {
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
