import { convexToJson, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createTodo = mutation({
  args: {
    title: v.string(),
    // tag:v.string(),
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
      // tags: args.tags,
    });
  },
});

export const getTodos = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const unDoneTodos = await ctx.db
      .query("todos")
      .withIndex("by_user_and_done", (q) =>
        q.eq("createdBy", userId).eq("done", false)
      )
      .order("desc")
      .collect();
    const doneTodos = await ctx.db
      .query("todos")
      .withIndex("by_user_and_done", (q) =>
        q.eq("createdBy", userId).eq("done", true)
      )
      .order("desc")
      .collect();
    return [...unDoneTodos, ...doneTodos];
  },
});

export const searchTodo = query({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("todos")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.title).eq("createdBy", userId)
      )
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

export const editTodo = mutation({
  args: {
    id: v.id("todos"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorised");

    return await ctx.db.patch(args.id, {
      title: args.title,
    });
  },
});

export const deleteTodo = mutation({
  args: {
    id: v.id("todos"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorised");

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
