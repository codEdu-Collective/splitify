import { v } from 'convex/values';
import { query, mutation, type QueryCtx } from './_generated/server';
import { internal } from './_generated/api';
import { Id, Doc } from './_generated/dataModel';

interface Split {
    userId: Id<'users'>;
    amount: number;
    paid: boolean;
}

interface Expense {
    _id: Id<'expenses'>;
    _creationTime: number;
    paidByUserId: Id<'users'>;
    groupId?: Id<'groups'>;
    splits: Split[];
    date: number;
    createdBy: Id<'users'>;
    description: string;
    amount: number;
    splitType: string;
    category?: string;
}

interface Settlement {
    _id: Id<'settlements'>;
    _creationTime: number;
    groupId?: Id<'groups'>;
    paidByUserId: Id<'users'>;
    receivedByUserId: Id<'users'>;
    amount: number;
    date: number;
    createdBy: Id<'users'>;
    note?: string;
    relatedExpenseIds?: Id<'expenses'>[];
}

interface User {
    _id: Id<'users'>;
    name: string;
    email: string;
    imageUrl?: string;
}

export const getExpensesBetweenUsers = query({
    args: { userId: v.id('users') },
    handler: async (
        ctx: QueryCtx,
        { userId },
    ): Promise<{
        expenses: Expense[];
        settlements: Settlement[];
        otherUser: {
            id: Id<'users'>;
            name: string;
            email: string;
            imageUrl?: string;
        };
        balance: number;
    }> => {
        // @ts-expect-error: ToDO
        const me = await ctx.runQuery(internal.users.getCurrentUser);
        if (!me) throw new Error('User not found');
        if (me._id === userId) throw new Error('Cannot query yourself');

        const myPaid = await ctx.db
            .query('expenses')
            .withIndex('by_user_and_group', q =>
                q.eq('paidByUserId', me._id).eq('groupId', undefined),
            )
            .collect();

        const theirPaid = await ctx.db
            .query('expenses')
            .withIndex('by_user_and_group', q =>
                q.eq('paidByUserId', userId).eq('groupId', undefined),
            )
            .collect();

        const candidateExpenses = [...myPaid, ...theirPaid];

        const expenses = candidateExpenses
            .filter(e => {
                const meInSplits = e.splits.some(s => s.userId === me._id);
                const themInSplits = e.splits.some(s => s.userId === userId);

                const meInvolved = e.paidByUserId === me._id || meInSplits;
                const themInvolved = e.paidByUserId === userId || themInSplits;

                return meInvolved && themInvolved;
            })
            .sort((a, b) => b.date - a.date);

        const settlements = await ctx.db
            .query('settlements')
            .filter(q =>
                q.and(
                    q.eq(q.field('groupId'), undefined),
                    q.or(
                        q.and(
                            q.eq(q.field('paidByUserId'), me._id),
                            q.eq(q.field('receivedByUserId'), userId),
                        ),
                        q.and(
                            q.eq(q.field('paidByUserId'), userId),
                            q.eq(q.field('receivedByUserId'), me._id),
                        ),
                    ),
                ),
            )
            .collect();

        settlements.sort((a, b) => b.date - a.date);

        let balance = 0;

        for (const e of expenses) {
            if (e.paidByUserId === me._id) {
                const split = e.splits.find(s => s.userId === userId && !s.paid);
                if (split) balance += split.amount;
            } else {
                const split = e.splits.find(s => s.userId === me._id && !s.paid);
                if (split) balance -= split.amount;
            }
        }

        for (const s of settlements) {
            if (s.paidByUserId === me._id) {
                balance += s.amount;
            } else {
                balance -= s.amount;
            }
        }

        const other = await ctx.db.get(userId);
        if (!other) throw new Error('User not found');

        return {
            expenses,
            settlements,
            otherUser: {
                id: other._id,
                name: other.name,
                email: other.email,
                imageUrl: other.imageUrl,
            },
            balance,
        };
    },
});

export const deleteExpense = mutation({
    args: {
        expenseId: v.id('expenses'),
    },
    handler: async (ctx, args): Promise<{ success: boolean }> => {
        // @ts-expect-error: ToDO
        const user = await ctx.runQuery(internal.users.getCurrentUser);
        if (!user) throw new Error('User not found');

        const expense = await ctx.db.get(args.expenseId);
        if (!expense) {
            throw new Error('Expense not found');
        }

        if (expense.createdBy !== user._id && expense.paidByUserId !== user._id) {
            throw new Error("You don't have permission to delete this expense");
        }

        await ctx.db.delete(args.expenseId);
        return { success: true };
    },
});
