import { query } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';

export const getGroupExpenses = query({
    args: { groupId: v.id('groups') },
    handler: async (ctx, { groupId }) => {
        // Use centralized getCurrentUser function
        const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

        const group = await ctx.db.get(groupId);
        if (!group) throw new Error('Group not found');

        if (!group.members.some(m => m.userId === currentUser._id))
            throw new Error('You are not a member of this group');

        const expenses = await ctx.db
            .query('expenses')
            .withIndex('by_group', q => q.eq('groupId', groupId))
            .collect();

        const settlements = await ctx.db
            .query('settlements')
            .filter(q => q.eq(q.field('groupId'), groupId))
            .collect();

        /* ----------  member map ---------- */

        const memberDetails = await Promise.all(
            group.members.map(async m => {
                const u = await ctx.db.get(m.userId);
                return { id: u._id, name: u.name, imageUrl: u.imageUrl, role: m.role };
            }),
        );
        const ids = memberDetails.map(m => m.id);

        //Balance Calculation Setup
        //Initaliaze totals object to track overall balance for each user
        // Format :{userId1: balance1,userId2:balance2...}
        const totals = Object.fromEntries(ids.map(id => [id, 0]));

        //Create a two-dimensional ledger to track who owes whom
        //ledger[A][B] = how much A owes B
        //Example for 3 users (user1,user2,user3):
        // ledger={
        // "user1":{"user2":0,"user3":0},
        // "user2":{"user1":0,"user3":0},
        // "user3":{"user1":0,"user2":0}
        // }

        const ledger = {};
        ids.forEach(a => {
            ledger[a] = {};
            ids.forEach(b => {
                if (a !== b) ledger[a][b] = 0;
            });
        });

        //Appley Expenses to Balances
        //Example:
        //-Expense 1:user1 paid $60,split equally among all 3 users($20 each)
        //-After applying this expense:
        //--totals={"user1":+40,"user2":-20,"user3":-20}
        //--ledger={
        // "user1":{"user2":0,"user3":0},
        // "user2":{"user1":20,"user3":0},
        // "user3":{"user1":20,"user2":0}
        // }
        //--this means user2 owes user1 $20, and user3 owes user1 $20

        for (const exp of expenses) {
            const payer = exp.paidByUserId;
            for (const split of exp.splits) {
                if (split.userId === payer || split.paid) continue; // skip payer & settled
                const debtor = split.userId;
                const amt = split.amount;

                totals[payer] += amt;
                totals[debtor] -= amt;

                ledger[debtor][payer] += amt; // debtor owes payer
            }
        }
        //Appley Settlements to Balances
        //Example:
        //-Settlement:user2 paid $10 paid to user1
        //-After applying this Settlement:
        //--totals={"user1":+30,"user2":-10,"user3":-20}
        //--ledger={
        // "user1":{"user2":0,"user3":0},
        // "user2":{"user1":10,"user3":0},
        // "user3":{"user1":20,"user2":0}
        // }
        //--this means user2 now owes user1 only $10, and user3 still owes user1 $20

        for (const s of settlements) {
            //update totals:increase player's balance, decrease receiver's balance
            totals[s.paidByUserId] += s.amount;
            totals[s.receivedByUserId] -= s.amount;

            //update ledger:reduce what the player owes to the reciver
            ledger[s.paidByUserId][s.receivedByUserId] -= s.amount; // they paid back
        }
        // format response data
        // crated a comprehensive balance object for each member
        const balances = memberDetails.map(m => ({
            ...m,
            totalBalance: totals[m.id],
            owes: Object.entries(ledger[m.id])
                .filter(([, v]) => v > 0)
                .map(([to, amount]) => ({ to, amount })),
            owedBy: ids
                .filter(other => ledger[other][m.id] > 0)
                .map(other => ({ from: other, amount: ledger[other][m.id] })),
        }));

        const userLookupMap = {};
        memberDetails.forEach(member => {
            userLookupMap[member.id] = member;
        });
        return {
            //group information
            group: {
                id: group._id,
                name: group.name,
                description: group.description,
            },
            members: memberDetails, //All group members with details
            expenses, //All expences in this group
            settlements, //All settletements in this group
            balances, //Calculated balance info for each member
            userLookupMap, //Quick lookup for user details
        };
    },
});
