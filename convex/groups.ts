import { query } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { Id, Doc } from './_generated/dataModel';

interface Member {
    userId: Id<'users'>;
    role: string;
}

interface UserDetails {
    id: Id<'users'>;
    name: string;
    email?: string;
    imageUrl?: string;
    role: string;
}

interface Group {
    _id: Id<'groups'>;
    name: string;
    description?: string;
    createdBy: Id<'users'>;
    members: Member[];
}

interface Expense extends Doc<'expenses'> {
    paidByUserId: Id<'users'>;
    groupId: Id<'groups'>;
    splits: {
        userId: Id<'users'>;
        amount: number;
        paid: boolean;
    }[];
    description: string;
    amount: number;
    date: number;
}

interface Settlement extends Doc<'settlements'> {
    groupId?: Id<'groups'>;
    paidByUserId: Id<'users'>;
    receivedByUserId: Id<'users'>;
    amount: number;
    date: number;
    note?: string;
}

interface BalanceInfo {
    id: Id<'users'>;
    name: string;
    imageUrl?: string;
    role: string;
    totalBalance: number;
    owes: { to: Id<'users'>; amount: number }[];
    owedBy: { from: Id<'users'>; amount: number }[];
}

export interface GroupExpensesResult {
    group: {
        id: Id<'groups'>;
        name: string;
        description?: string;
    };
    members: UserDetails[];
    expenses: Expense[];
    settlements: Settlement[];
    balances: BalanceInfo[];
    userLookupMap: Record<string, UserDetails>;
}

interface GroupOrMembersResult {
    selectedGroup: {
        id: Id<'groups'>;
        name: string;
        description?: string;
        createdBy: Id<'users'>;
        members: UserDetails[];
    } | null;
    groups: {
        id: Id<'groups'>;
        name: string;
        description?: string;
        memberCount: number;
    }[];
}

export const getGroupOrMembers = query({
    args: {
        groupId: v.optional(v.id('groups')),
    },
    handler: async (ctx, args): Promise<GroupOrMembersResult> => {
        // @ts-expect-error: ToDO
        const currentUser = await ctx.runQuery(internal.users.getCurrentUser);
        if (!currentUser) throw new Error('User not authenticated');

        const allGroups = await ctx.db.query('groups').collect();
        const userGroups = allGroups.filter(group =>
            group.members.some(member => member.userId === currentUser._id),
        );

        if (args.groupId) {
            const selectedGroup = userGroups.find(group => group._id === args.groupId);

            if (!selectedGroup) {
                throw new Error("Group not found or you're not a member");
            }

            const memberDetails = await Promise.all(
                selectedGroup.members.map(async member => {
                    const user = await ctx.db.get(member.userId);
                    if (!user) return null;
                    return {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        imageUrl: user.imageUrl,
                        role: member.role,
                    } as UserDetails;
                }),
            );

            const validMembers = memberDetails.filter(
                (member): member is UserDetails => member !== null,
            );

            return {
                selectedGroup: {
                    id: selectedGroup._id,
                    name: selectedGroup.name,
                    description: selectedGroup.description,
                    createdBy: selectedGroup.createdBy,
                    members: validMembers,
                },
                groups: userGroups.map(group => ({
                    id: group._id,
                    name: group.name,
                    description: group.description,
                    memberCount: group.members.length,
                })),
            };
        } else {
            return {
                selectedGroup: null,
                groups: userGroups.map(group => ({
                    id: group._id,
                    name: group.name,
                    description: group.description,
                    memberCount: group.members.length,
                })),
            };
        }
    },
});

export const getGroupExpenses = query({
    args: { groupId: v.id('groups') },
    handler: async (ctx, { groupId }): Promise<GroupExpensesResult> => {
        // @ts-expect-error: ToDO
        const currentUser = await ctx.runQuery(internal.users.getCurrentUser);
        if (!currentUser) throw new Error('User not authenticated');

        const group = await ctx.db.get(groupId);
        if (!group) throw new Error('Group not found');

        if (!group.members.some(m => m.userId === currentUser._id))
            throw new Error('You are not a member of this group');

        const expenses = await ctx.db
            .query('expenses')
            .withIndex('by_group', q => q.eq('groupId', groupId))
            .collect();

        const validExpenses = expenses.filter((exp): exp is Expense => exp.groupId !== undefined);

        const settlements = await ctx.db
            .query('settlements')
            .filter(q => q.eq(q.field('groupId'), groupId))
            .collect();

        const memberDetails = await Promise.all(
            group.members.map(async m => {
                const u = await ctx.db.get(m.userId);
                if (!u) throw new Error(`User ${m.userId} not found`);
                return {
                    id: u._id,
                    name: u.name,
                    imageUrl: u.imageUrl,
                    role: m.role,
                };
            }),
        );

        const ids = memberDetails.map(m => m.id);
        const totals: Record<string, number> = Object.fromEntries(ids.map(id => [id, 0]));
        const ledger: Record<string, Record<string, number>> = {};

        ids.forEach(a => {
            ledger[a] = {};
            ids.forEach(b => {
                if (a !== b) ledger[a][b] = 0;
            });
        });

        // Process expenses
        for (const exp of validExpenses) {
            const payer = exp.paidByUserId;
            for (const split of exp.splits) {
                if (split.userId === payer || split.paid) continue;
                const debtor = split.userId;
                const amt = split.amount;

                totals[payer] += amt;
                totals[debtor] -= amt;
                ledger[debtor][payer] += amt;
            }
        }

        // Process settlements
        for (const s of settlements) {
            totals[s.paidByUserId] += s.amount;
            totals[s.receivedByUserId] -= s.amount;
            ledger[s.paidByUserId][s.receivedByUserId] -= s.amount;
        }

        // Net the ledger
        ids.forEach(a => {
            ids.forEach(b => {
                if (a >= b) return;
                const diff = ledger[a][b] - ledger[b][a];
                if (diff > 0) {
                    ledger[a][b] = diff;
                    ledger[b][a] = 0;
                } else if (diff < 0) {
                    ledger[b][a] = -diff;
                    ledger[a][b] = 0;
                } else {
                    ledger[a][b] = ledger[b][a] = 0;
                }
            });
        });

        const balances: BalanceInfo[] = memberDetails.map(m => ({
            ...m,
            totalBalance: totals[m.id],
            owes: Object.entries(ledger[m.id])
                .filter(([, v]) => v > 0)
                .map(([to, amount]) => ({ to: to as Id<'users'>, amount })),
            owedBy: ids
                .filter(other => ledger[other][m.id] > 0)
                .map(other => ({ from: other as Id<'users'>, amount: ledger[other][m.id] })),
        }));

        const userLookupMap: Record<string, UserDetails> = {};
        memberDetails.forEach(member => {
            userLookupMap[member.id] = member;
        });

        return {
            group: {
                id: group._id,
                name: group.name,
                description: group.description,
            },
            members: memberDetails,
            expenses: validExpenses,
            settlements,
            balances,
            userLookupMap,
        };
    },
});
