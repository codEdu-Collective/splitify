import { query } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { Id, Doc } from './_generated/dataModel';

interface Member {
    userId: Id<'users'>;
    role: string;
}

interface Split {
    userId: Id<'users'>;
    amount: number;
    paid: boolean;
}

interface Expense extends Doc<'expenses'> {
    paidByUserId: Id<'users'>;
    groupId?: Id<'groups'>;
    splits: Split[];
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

interface UserDetails {
    id: Id<'users'>;
    name: string;
    imageUrl?: string;
    role: string;
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

interface GroupExpensesResult {
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

export const getGroupExpenses = query({
    args: { groupId: v.id('groups') },
    handler: async (ctx, { groupId }): Promise<GroupExpensesResult> => {
        // @ts-expect-error: ToDO
        const currentUser = await ctx.runQuery(internal.users.getCurrentUser);
        if (!currentUser) throw new Error('User not found');

        const group = await ctx.db.get(groupId);
        if (!group) throw new Error('Group not found');

        // Type guard for group.members
        if (!group.members || !Array.isArray(group.members)) {
            throw new Error('Invalid group members data');
        }

        if (!group.members.some((m: Member) => m.userId === currentUser._id)) {
            throw new Error('You are not a member of this group');
        }

        // Fetch all expenses and settlements in parallel
        const [expenses, settlements] = await Promise.all([
            ctx.db
                .query('expenses')
                .withIndex('by_group', q => q.eq('groupId', groupId))
                .collect(),
            ctx.db
                .query('settlements')
                .filter(q => q.eq(q.field('groupId'), groupId))
                .collect(),
        ]);

        // Get member details with proper error handling
        const memberDetails = await Promise.all(
            group.members.map(async (m: Member) => {
                const user = await ctx.db.get(m.userId);
                if (!user) throw new Error(`User ${m.userId} not found`);
                return {
                    id: user._id,
                    name: user.name,
                    imageUrl: user.imageUrl,
                    role: m.role,
                };
            }),
        );

        const userIds = memberDetails.map(m => m.id);

        // Initialize balance tracking with type assertion
        const totals: Record<string, number> = {};
        userIds.forEach(id => {
            totals[id] = 0;
        });

        // Initialize ledger with proper typing
        const ledger: Record<string, Record<string, number>> = {};
        userIds.forEach(a => {
            ledger[a] = {};
            userIds.forEach(b => {
                if (a !== b) ledger[a][b] = 0;
            });
        });

        // Process expenses with type checks
        for (const exp of expenses) {
            const payer = exp.paidByUserId;
            for (const split of exp.splits) {
                if (split.userId === payer || split.paid) continue;

                const debtor = split.userId;
                const amount = split.amount;

                totals[payer] = (totals[payer] || 0) + amount;
                totals[debtor] = (totals[debtor] || 0) - amount;
                ledger[debtor][payer] = (ledger[debtor][payer] || 0) + amount;
            }
        }

        // Process settlements with type checks
        for (const s of settlements) {
            totals[s.paidByUserId] = (totals[s.paidByUserId] || 0) + s.amount;
            totals[s.receivedByUserId] = (totals[s.receivedByUserId] || 0) - s.amount;
            ledger[s.paidByUserId][s.receivedByUserId] =
                (ledger[s.paidByUserId][s.receivedByUserId] || 0) - s.amount;
        }

        // Prepare balance information with type safety
        const balances: BalanceInfo[] = memberDetails.map(member => {
            const owes = Object.entries(ledger[member.id] || {})
                .filter(([, amount]) => amount > 0)
                .map(([to, amount]) => ({
                    to: to as Id<'users'>,
                    amount: amount as number,
                }));

            const owedBy = userIds
                .filter(other => ledger[other]?.[member.id] > 0)
                .map(other => ({
                    from: other,
                    amount: ledger[other][member.id],
                }));

            return {
                ...member,
                totalBalance: totals[member.id] || 0,
                owes,
                owedBy,
            };
        });

        // Create user lookup map with string index
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
            expenses,
            settlements,
            balances,
            userLookupMap,
        };
    },
});
