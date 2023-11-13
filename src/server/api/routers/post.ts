import { auth, clerkClient } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    imageUrl: user.imageUrl,
  };
};

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
    });
    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(filterUserForClient);
    users.forEach((user) => {
      console.log("user : ", user);
    });
    return posts.map((post) => {
      console.log("post author id : ", post.authorId);
      const author = users.find((user) => user.id === post.authorId);
      console.log("author : ", author);
      // commenting this due to error but it gives typs safety when uncommented now there is one undefined author i dont know how to delete that from prisma studio
      //  if (!author) {
      //   throw new TRPCError({
      //     code: "INTERNAL_SERVER_ERROR",
      //     message: "Author not found",
      //   });
      // }
      return {
        post,
        author,
      };
    });
  }),
});
