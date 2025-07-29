import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
 
const schema = defineSchema({
  ...authTables,
  todos: defineTable({
    title: v.string(), 
    done: v.boolean(),
    createdBy: v.id("users"),
    tag: v.string(),

  })
  .index("by_user", ["createdBy"])
  .index("by_user_and_done", ["createdBy", "done"])
  .searchIndex("search_title", {
    searchField: "title", 
    filterFields: ["createdBy", "done"]
  })
  .searchIndex("search_tag", {
    searchField: "tag",
    filterFields: ["createdBy"]
  }),
  // Your other tables...
});
 
export default schema;