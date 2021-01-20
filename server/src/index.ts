import "reflect-metadata";
import express from "express";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { ApolloServer } from "apollo-server-express";
import { __prod__, COOKIE_NAME } from "./constants";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import cors from "cors";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import path from "path";
import { Updoot } from "./entities/Updoot";
import { createUserLoader } from "./utils/createUserLoader";

const RedisStore = connectRedis(session);
const redis = new Redis();

const main = async () => {
	await createConnection({
		type: "postgres",
		database: "test",
		username: "postgres",
		password: "postgres",
		logging: true,
		synchronize: true,
		entities: [Post, User, Updoot],
		migrations: [path.join(__dirname, "./migrations/**")],
	});
	// await con.runMigrations();
	const app = express();
	app.use(
		cors({
			origin: "http://localhost:3000",
			credentials: true,
		})
	);
	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({
				client: redis,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
				httpOnly: true,
				sameSite: "lax", // csrf
				secure: __prod__, // cookie only works in https
			},
			saveUninitialized: false,
			secret: "test secret key",
			resave: false,
		})
	);
	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }) => ({
			req,
			res,
			redis,
			userLoader: createUserLoader(),
		}),
		debug: !__prod__,
	});
	apolloServer.applyMiddleware({
		app,
		cors: false,
	});
	app.listen(4000, () => {
		console.log("Server started on localhost:4000");
	});
};
main().catch((e) => {
	console.error(e);
});
