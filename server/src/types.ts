import { Request, Response } from "express";
import { Redis } from "ioredis";
import { createUserLoader } from "./utils/createUserLoader";

export interface MyContext {
	req: Request & { session: { userId: number | null; [key: string]: any } };
	res: Response;
	redis: Redis;
	userLoader: ReturnType<typeof createUserLoader>;
}
