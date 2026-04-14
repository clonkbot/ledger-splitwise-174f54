import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getGroupBalances = query({
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

    // Get all members
    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    // Get all expenses in this group
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    // Get all settlements in this group
    const settlements = await ctx.db
      .query("settlements")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    // Calculate balances: positive = others owe you, negative = you owe others
    const balances: Record<string, number> = {};

    for (const member of members) {
      balances[member.userId] = 0;
    }

    // Process expenses
    for (const expense of expenses) {
      // Payer gets credited
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;

      // Get splits for this expense
      const splits = await ctx.db
        .query("expenseSplits")
        .withIndex("by_expense", (q) => q.eq("expenseId", expense._id))
        .collect();

      // Each person who owes gets debited
      for (const split of splits) {
        balances[split.userId] = (balances[split.userId] || 0) - split.amount;
      }
    }

    // Process settlements
    for (const settlement of settlements) {
      balances[settlement.fromUser] = (balances[settlement.fromUser] || 0) + settlement.amount;
      balances[settlement.toUser] = (balances[settlement.toUser] || 0) - settlement.amount;
    }

    // Convert to array with user info
    const result = await Promise.all(
      Object.entries(balances).map(async ([memberId, balance]) => {
        const user = await ctx.db.get(memberId as any);
        return {
          userId: memberId,
          user,
          balance,
        };
      })
    );

    return result;
  },
});

export const getOverallBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { totalOwed: 0, totalOwing: 0 };

    // Get all groups user is in
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let totalOwed = 0; // Others owe me
    let totalOwing = 0; // I owe others

    for (const membership of memberships) {
      // Get all expenses in this group
      const expenses = await ctx.db
        .query("expenses")
        .withIndex("by_group", (q) => q.eq("groupId", membership.groupId))
        .collect();

      // Get all settlements in this group
      const settlements = await ctx.db
        .query("settlements")
        .withIndex("by_group", (q) => q.eq("groupId", membership.groupId))
        .collect();

      let balance = 0;

      for (const expense of expenses) {
        if (expense.paidBy === userId) {
          balance += expense.amount;
        }

        const splits = await ctx.db
          .query("expenseSplits")
          .withIndex("by_expense", (q) => q.eq("expenseId", expense._id))
          .collect();

        for (const split of splits) {
          if (split.userId === userId) {
            balance -= split.amount;
          }
        }
      }

      for (const settlement of settlements) {
        if (settlement.fromUser === userId) {
          balance += settlement.amount;
        }
        if (settlement.toUser === userId) {
          balance -= settlement.amount;
        }
      }

      if (balance > 0) {
        totalOwed += balance;
      } else {
        totalOwing += Math.abs(balance);
      }
    }

    return { totalOwed, totalOwing };
  },
});
