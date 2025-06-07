import { mutation, query } from './_generated/server';
import { GenericId, v } from 'convex/values';
import { internal } from './_generated/api';
import { Id } from './_generated/dataModel';

export const createSettlement: ReturnType<typeof mutation> = mutation({
    args: {
        amount: v.number(),
        note: v.optional(v.string()),
        paidByUserId: v.id('users'),
        receivedByUserId: v.id('users'),
        groupId: v.optional(v.id('groups')),
        relatedExpenseIds: v.optional(v.array(v.id('expenses'))),
    },
    handler: async (ctx, args) => {
        // @ts-expect-error: False-Positive
        const caller = await ctx.runQuery(internal.users.getCurrentUser);

        if (args.amount <= 0) throw new Error('Amount must be positive');
        if (args.paidByUserId === args.receivedByUserId) {
            throw new Error('Payer and receiver cannot be the same user');
        }
        if (caller._id !== args.paidByUserId && caller._id !== args.receivedByUserId) {
            throw new Error('You must be either the payer or the receiver');
        }

        if (args.groupId) {
            const group = await ctx.db.get(args.groupId);
            if (!group) throw new Error('Group not found');

            const isMember = (uid: GenericId<'users'>) => group.members.some(m => m.userId === uid);
            if (!isMember(args.paidByUserId) || !isMember(args.receivedByUserId)) {
                throw new Error('Both parties must be members of the group');
            }
        }

        return await ctx.db.insert('settlements', {
            amount: args.amount,
            note: args.note,
            date: Date.now(),
            paidByUserId: args.paidByUserId,
            receivedByUserId: args.receivedByUserId,
            groupId: args.groupId,
            relatedExpenseIds: args.relatedExpenseIds,
            createdBy: caller._id,
        });
    },
});

export const getSettlementData = query({
    args: {
        entityType: v.string(),
        entityId: v.string(),
    },
    handler: async (ctx, args) => {
        // @ts-expect-error: False-Positive
        const me = await ctx.runQuery(internal.users.getCurrentUser);

        if (args.entityType === 'user') {
            const other = await ctx.db.get(args.entityId as Id<'users'>);
            if (!other) throw new Error('User not found');

            const myExpenses = await ctx.db
                .query('expenses')
                .withIndex('by_user_and_group', q =>
                    q.eq('paidByUserId', me._id).eq('groupId', undefined),
                )
                .collect();

            const otherUserExpenses = await ctx.db
                .query('expenses')
                .withIndex('by_user_and_group', q =>
                    q.eq('paidByUserId', other._id).eq('groupId', undefined),
                )
                .collect();

            const expenses = [...myExpenses, ...otherUserExpenses];

            let owed = 0;
            let owing = 0;

            for (const exp of expenses) {
                const involvesMe =
                    exp.paidByUserId === me._id || exp.splits.some(s => s.userId === me._id);
                const involvesThem =
                    exp.paidByUserId === other._id || exp.splits.some(s => s.userId === other._id);
                if (!involvesMe || !involvesThem) continue;

                if (exp.paidByUserId === me._id) {
                    const split = exp.splits.find(s => s.userId === other._id && !s.paid);
                    if (split) owed += split.amount;
                }

                if (exp.paidByUserId === other._id) {
                    const split = exp.splits.find(s => s.userId === me._id && !s.paid);
                    if (split) owing += split.amount;
                }
            }

            const mySettlements = await ctx.db
                .query('settlements')
                .withIndex('by_user_and_group', q =>
                    q.eq('paidByUserId', me._id).eq('groupId', undefined),
                )
                .collect();

            const otherUserSettlements = await ctx.db
                .query('settlements')
                .withIndex('by_user_and_group', q =>
                    q.eq('paidByUserId', other._id).eq('groupId', undefined),
                )
                .collect();

            const settlements = [...mySettlements, ...otherUserSettlements];

            for (const st of settlements) {
                if (st.paidByUserId === me._id) {
                    owing = Math.max(0, owing - st.amount);
                } else {
                    owed = Math.max(0, owed - st.amount);
                }
            }

            return {
                type: 'user',
                counterpart: {
                    userId: other._id,
                    name: other.name,
                    email: other.email,
                    imageUrl: other.imageUrl,
                },
                youAreOwed: owed,
                youOwe: owing,
                netBalance: owed - owing,
            };
        } else if (args.entityType === 'group') {
            const groupId = ctx.db.normalizeId('groups', args.entityId);
            if (!groupId) throw new Error('Invalid group id');
            const group = await ctx.db.get(groupId);
            if (!group) throw new Error('Group not found');

            if (!('members' in group)) throw new Error('Invalid group object: missing members');
            const isMember = group.members.some(m => m.userId === me._id);
            if (!isMember) throw new Error('You are not a member of this group');

            const expenses = await ctx.db
                .query('expenses')
                .withIndex('by_group', q => q.eq('groupId', group._id))
                .collect();

            const balances: Record<Id<'users'>, { owed: number; owing: number }> = {};
            group.members.forEach((m: { userId: Id<'users'> }) => {
                if (m.userId !== me._id) balances[m.userId] = { owed: 0, owing: 0 };
            });

            for (const exp of expenses) {
                if (exp.paidByUserId === me._id) {
                    exp.splits.forEach(split => {
                        if (split.userId !== me._id && !split.paid) {
                            balances[split.userId].owed += split.amount;
                        }
                    });
                } else if (balances[exp.paidByUserId]) {
                    const split = exp.splits.find(s => s.userId === me._id && !s.paid);
                    if (split) balances[exp.paidByUserId].owing += split.amount;
                }
            }

            const settlements = await ctx.db
                .query('settlements')
                .filter(q => q.eq(q.field('groupId'), group._id))
                .collect();

            for (const st of settlements) {
                if (st.paidByUserId === me._id && balances[st.receivedByUserId]) {
                    balances[st.receivedByUserId].owing = Math.max(
                        0,
                        balances[st.receivedByUserId].owing - st.amount,
                    );
                }
                if (st.receivedByUserId === me._id && balances[st.paidByUserId]) {
                    balances[st.paidByUserId].owed = Math.max(
                        0,
                        balances[st.paidByUserId].owed - st.amount,
                    );
                }
            }

            const members = await Promise.all(
                Object.keys(balances).map(id => {
                    const userId = ctx.db.normalizeId('users', id);
                    return userId ? ctx.db.get(userId) : null;
                }),
            );

            const list = Object.keys(balances).map(uid => {
                const userId = uid as Id<'users'>;
                const m = members.find(u => u && u._id === userId);
                const { owed, owing } = balances[userId];
                return {
                    userId: userId,
                    name: m?.name || 'Unknown',
                    imageUrl: m?.imageUrl,
                    youAreOwed: owed,
                    youOwe: owing,
                    netBalance: owed - owing,
                };
            });

            return {
                type: 'group',
                group: {
                    id: group._id,
                    name: group.name,
                    description: group.description,
                },
                balances: list,
            };
        }

        throw new Error("Invalid entityType; expected 'user' or 'group'");
    },
});
