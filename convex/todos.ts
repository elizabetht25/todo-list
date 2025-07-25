import { convexToJson, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createTodo = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorised");
    }
    return await ctx.db.insert("todos", {
      title: args.title,
      done: false,
      createdBy: userId,
    });
  },
});

export const getTodos = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return []
    }
    return await ctx.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("createdBy", userId))
      .collect();
  },
});

export const markAsDone = mutation({
  args: {
    id: v.id("todos"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorised");
    }
    const todo = await ctx.db.get(args.id);
    if (!todo) throw new Error("Todo not found");

    return await ctx.db.patch(args.id, {
      done: !todo.done,
    });
  },
});
