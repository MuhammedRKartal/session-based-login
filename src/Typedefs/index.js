import { gql } from "apollo-server-express";

const typeDefs = gql`
	type User {
		name: String
		surname: String
		email: String
		phone: String
		sessionToken: String
		sessionExpiryDate: String
		loginToken: String
		loginTokenExpiryDate: String
	}
	type Query {
		welcome: String
		getUser(id: String, email: String, phone: String): [User]
		getSingleUser(id: String, email: String, phone: String): User
	}
	type Mutation {
		addUser(name: String!, surname: String!, phone: String!, email: String!): User
		createToken(email: String!): User
		deleteToken(email: String!): User
		login(email: String!): User
		verifyLogin(email: String!, loginToken: String!): User
		controlSession(sessionToken: String!): User
	}
`;
export default typeDefs;
