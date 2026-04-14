import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Groups for splitting expenses
  groups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    color: v.optional(v.string()),
  }).index("by_creator", ["createdBy"]),

  // Group memberships
  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    joinedAt: v.number(),
    nickname: v.optional(v.string()),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_and_user", ["groupId", "userId"]),

  // Expenses within groups
  expenses: defineTable({
    groupId: v.id("groups"),
    description: v.string(),
    amount: v.number(), // in cents to avoid floating point issues
    paidBy: v.id("users"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    category: v.optional(v.string()),
    splitType: v.string(), // "equal", "exact", "percentage"
  })
    .index("by_group", ["groupId"])
    .index("by_paid_by", ["paidBy"]),

  // How each expense is split among members
  expenseSplits: defineTable({
    expenseId: v.id("expenses"),
    userId: v.id("users"),
    amount: v.number(), // amount this user owes (in cents)
  })
    .index("by_expense", ["expenseId"])
    .index("by_user", ["userId"]),

  // Settlements between users
  settlements: defineTable({
    groupId: v.id("groups"),
    fromUser: v.id("users"),
    toUser: v.id("users"),
    amount: v.number(), // in cents
    createdAt: v.number(),
    note: v.optional(v.string()),
  })
    .index("by_group", ["groupId"])
    .index("by_from_user", ["fromUser"])
    .index("by_to_user", ["toUser"]),
});
