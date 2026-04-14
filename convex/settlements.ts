import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByGroup = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Check membership
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", userId)
      )
      .first();

    if (!membership) return [];

    const settlements = await ctx.db
      .query("settlements")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .collect();

    const enrichedSettlements = await Promise.all(
      settlements.map(async (settlement) => {
        const fromUser = await ctx.db.get(settlement.fromUser);
        const toUser = await ctx.db.get(settlement.toUser);
        return {
          ...settlement,
          fromUser,
          toUser,
        };
      })
    );

    return enrichedSettlements;
  },
});

export const create = mutation({
  args: {
    groupId: v.id("groups"),
    toUser: v.id("users"),
    amount: v.number(), // in cents
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check membership
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", userId)
      )
      .first();

    if (!membership) throw new Error("Not a member of this group");

    const settlementId = await ctx.db.insert("settlements", {
      groupId: args.groupId,
      fromUser: userId,
      toUser: args.toUser,
      amount: args.amount,
      createdAt: Date.now(),
      note: args.note,
    });

    return settlementId;
  },
});
