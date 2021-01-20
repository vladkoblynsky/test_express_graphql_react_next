import { Field, ObjectType } from "type-graphql";
import {
	BaseEntity,
	Column,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn()
	id!: number;

	// @Field()
	@Column({ type: "int" })
	value: number;

	// @Field()
	@Column({ type: "int" })
	userId: number;

	// @Field(() => User)
	@ManyToOne(() => User, (user) => user.updoots)
	user: User;

	// @Field()
	@Column({ type: "int" })
	postId: number;

	// @Field(() => Post)
	@ManyToOne(() => Post, (post) => post.updoots, { onDelete: "CASCADE" })
	post: Post;
}
