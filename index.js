const { ApolloServer } = require(`apollo-server`);
const { GraphQLScalarType } = require(`graphql`);

const typeDefs = `
  scalar DateTime
  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhots: [Photo!]!
    inPhotos: [Photo!]!
  }
  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LNADSCAPE
    GRAPHIC
  }
  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    postedBy: User!
    taggedUsers: [User!]!
    created: DateTime!
  }
  input PostPhotoInput {
    name: String!
    category: PhotoCategory=PORTRAIT
    description: String
  }
  type Query {
    totalPhotos: Int!
    allPhotos(after: DateTime): [Photo!]!
  }
  type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
  }
`;

var _id = 0;
var users = [
  { githubLogin: "user1", name: "Mike" },
  { githubLogin: "user2", name: "Glen" },
  { githubLogin: "user3", name: "Scot" },
];
var photos = [
  {
    id: "1",
    name: "Dropping1",
    description: "The heart1",
    category: "ACTION",
    githubUser: "user1",
    created: "3-28-1977",
  },
  {
    id: "2",
    name: "Dropping2",
    description: "The heart2",
    category: "SELFIE",
    githubUser: "user1",
    created: "1-2-1985",
  },
  {
    id: "3",
    name: "Dropping3",
    description: "The heart3",
    category: "LNADSCAPE",
    githubUser: "user3",
    created: "2018-04-15T19:09:57.308Z",
  },
];
var tags = [
  { photoID: "1", userID: "user1" },
  { photoID: "2", userID: "user1" },
  { photoID: "2", userID: "user2" },
  { photoID: "2", userID: "user3" },
];

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: (parent, args) => photos,
  },
  Mutation: {
    postPhoto: (parent, args) => {
      var newPhoto = {
        id: _id++,
        ...args.input,
        created: new Date(),
      };
      photos.push(newPhoto);
      return newPhoto;
    },
  },
  Photo: {
    url: (parent) => `http://yoursite.com/img/${parent.id}.jpg`,
    postedBy: (parent) => {
      return users.find((u) => u.githubLogin === parent.githubUser);
    },
    taggedUsers: (parent) =>
      tags
        .filter((tag) => tag.photoID === parent.id)
        .map((tag) => tag.userID)
        .map((userID) => users.find((u) => u.githubLogin === userID)),
  },
  User: {
    postedPhots: (parent) => {
      return photos.filter((p) => p.githubUser === parent.githubLogin);
    },
    inPhotos: (parent) =>
      tags
        .filter((tag) => tag.userID === parent.id)
        .map((tag) => tag.photoID)
        .map((photoID) => photos.find((p) => p.id === photoID)),
  },
  DateTime: new GraphQLScalarType({
    name: `DateTime`,
    description: `A valid date time value.`,
    parseValue: (value) => new Date(value),
    serialize: (value) => new Date(value).toISOString(),
    parseLiteral: (ast) => ast.value,
  }),
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`GraphQL Servuce running on ${url}`);
});
