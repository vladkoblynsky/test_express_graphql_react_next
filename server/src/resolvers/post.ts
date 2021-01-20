import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
	UseMiddleware,
} from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";

@InputType()
class PostInput {
	@Field()
	title: string;

	@Field()
	text: string;
}

@ObjectType()
class PaginatedPosts {
	@Field(() => [Post])
	posts: Post[];

	@Field(() => Boolean)
	hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post) {
		return root.text.slice(0, 50);
	}

	@FieldResolver(() => User)
	creator(@Root() root: Post, @Ctx() { userLoader }: MyContext) {
		return userLoader.load(root.creatorId);
	}

	@Query(() => PaginatedPosts)
	async posts(
		@Arg("limit", () => Int) limit: number,
		@Arg("cursor", () => String, { nullable: true })
		cursor: string | null
	): Promise<PaginatedPosts> {
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = realLimit + 1;
		const qb = getConnection()
			.getRepository(Post)
			.createQueryBuilder("p")
			// .innerJoinAndSelect("p.creator", "u")
			.orderBy("p.createdAt", "DESC")
			.take(realLimitPlusOne);
		if (cursor) {
			qb.where("p.createdAt > :cursor", {
				cursor: new Date(parseInt(cursor)),
			});
		}
		const posts = await qb.getMany();

		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne,
		};
	}

	@Query(() => Post, { nullable: true })
	post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
		return Post.findOne(id, { relations: ["creator"] });
	}

	@Mutation(() => Int)
	@UseMiddleware(isAuth)
	async vote(
		@Arg("postId", () => Int) postId: number,
		@Arg("value", () => Int) value: number,
		@Ctx() { req }: MyContext
	): Promise<number> {
		const isUpdoot = value !== -1;
		const realValue = isUpdoot ? 1 : -1;
		const { userId } = req.session;
		const post = await Post.findOne(postId);
		if (!post) return 0;

		const updoot = await Updoot.findOne({ where: { postId, userId } });
		if (updoot && updoot.value !== realValue) {
			updoot.value = realValue;
			await updoot.save();
			post.points += realValue * 2;
			await post.save();
		} else if (!updoot) {
			await Updoot.insert({ userId: userId as number, postId, value });
			post.points += realValue;
			await post.save();
		}

		return post.points;
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	createPost(
		@Arg("input") input: PostInput,
		@Ctx() { req }: MyContext
	): Promise<Post> {
		return Post.create({
			...input,
			creatorId: req.session.userId!,
		}).save();
	}

	@Mutation(() => Post, { nullable: true })
	@UseMiddleware(isAuth)
	async updatePost(
		@Arg("id", () => Int) id: number,
		@Arg("title") title: string,
		@Arg("text") text: string,
		@Ctx() { req }: MyContext
	): Promise<Post | null> {
		const post = await Post.findOne(id);
		const userId = req.session.userId!;
		if (!post || post.creatorId !== userId) {
			return null;
		}
		post.title = title;
		post.text = text;
		post.creatorId = userId;
		await post.save();
		return post;
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async deletePost(
		@Arg("id", () => Int) id: number,
		@Ctx() { req }: MyContext
	): Promise<boolean> {
		const userId = req.session.userId!;
		// not cascade delete
		// const post = await Post.findOne(id);
		// if (!post) {
		// 	return false;
		// }
		// if (post.creatorId !== userId) {
		// 	throw new Error("not authorized");
		// }
		// await Updoot.delete({ postId: id });
		await Post.delete({ id, creatorId: userId });
		return true;
	}
}
