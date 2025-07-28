import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
 
const schema = defineSchema({
  ...authTables,
  todos: defineTable({
    title: v.string(), 
    done: v.boolean(),
    createdBy: v.id("users"),

  })
  .index("by_user", ["createdBy"])
  .index("by_user_and_done", ["createdBy", "done"])
  .searchIndex("search_title", {
    searchField: "title", 
    filterFields: ["createdBy"]
  })
  // Your other tables...
});
 
export default schema;