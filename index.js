import { ApolloServer } from "apollo-server-express";
import express from "express";
import mongoose from "mongoose";
import typeDefs from "./src/Typedefs/index.js";
import resolvers from "./src/Resolvers/index.js";
import dotenv from "dotenv";
import { createServer } from "http";
dotenv.config();

try {
	mongoose.connect(process.env.MONGO_DB_CONNECTION);
} catch (error) {
	console.log(error);
}

async function startServer() {
	const app = express();
	const httpServer = createServer(app);
	const server = new ApolloServer({ typeDefs, resolvers, introspection:true });

	await server.start();
	server.applyMiddleware({ app });
	httpServer.listen(process.env.PORT || 4000, () => {
		const port = httpServer.address().port;
		console.log(`Express is working on port ${port}`);
	});
}

startServer();

// The `listen` method launches a web server.
