'use client';

import { useConvexQuery } from '@/hooks/use-convex-query';
import { api } from '@/convex/_generated/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

interface BalanceMember {
    id: Id<'users'>;
    name: string;
    imageUrl?: string;
    amount: number;
}
interface UserDetails {
    _id: Id<'users'>;
    name: string;
    email?: string;
    imageUrl?: string;
    role: string;
}
interface GroupBalancesProps {
    balances: {
        id: Id<'users'>;
        name: string;
        imageUrl?: string;
        role: string;
        totalBalance: number;
        owes: { to: Id<'users'>; amount: number }[];
        owedBy: { from: Id<'users'>; amount: number }[];
    }[];
}

export function GroupBalances({ balances }: GroupBalancesProps) {
    const { data: currentUser } = useConvexQuery<UserDetails>(api.users.getCurrentUser);

    // guards
    if (!balances?.length || !currentUser) {
        return (
            <div className="text-center py-4 text-muted-foreground">
                No balance informaction available
            </div>
        );
    }

    // helper
    const me = balances.find(b => b.id === currentUser._id);
    if (!me) {
        return (
            <div className="text-center py-4 text-muted-foreground">
                You're not part of this group
            </div>
        );
    }

    const userMap = Object.fromEntries(balances.map(b => [b.id, b]));

    // Who owes me?
    const owedByMembers: BalanceMember[] = me.owedBy
        .map(({ from, amount }) => ({ ...userMap[from], amount }))
        .sort((a, b) => b.amount - a.amount);

    // Whom do I owe?
    const owingToMembers: BalanceMember[] = me.owes
        .map(({ to, amount }) => ({ ...userMap[to], amount }))
        .sort((a, b) => b.amount - a.amount);

    const isAllSettledUp =
        me.totalBalance === 0 && owedByMembers.length === 0 && owingToMembers.length === 0;

    return (
        <div className="space-y-4">
            {/* Current user's total balance */}
            <div className="text-center pb-4 border-b">
                <p className="text-sm text-muted-foreground mb-1">Your balance</p>
                <p
                    className={`text-2xl font-bold ${
                        me.totalBalance > 0
                            ? 'text-green-600'
                            : me.totalBalance < 0
                              ? 'text-red-600'
                              : ''
                    }`}
                >
                    {me.totalBalance > 0
                        ? `+$${me.totalBalance.toFixed(2)}`
                        : me.totalBalance < 0
                          ? `-$${Math.abs(me.totalBalance).toFixed(2)}`
                          : '$0.00'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    {me.totalBalance > 0
                        ? 'You are owed money'
                        : me.totalBalance < 0
                          ? 'You owe money'
                          : 'You are all settled up'}
                </p>
            </div>

            {isAllSettledUp ? (
                <div className="text-center py-4">
                    <p className="text-muted-foreground">Everyone is settled up!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* People who owe the current user */}
                    {owedByMembers.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium flex items-center mb-3">
                                <ArrowUpCircle className="h-4 w-4 text-green-500 mr-2" />
                                Owed to you
                            </h3>
                            <div className="space-y-3">
                                {owedByMembers.map(member => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={member.imageUrl} />
                                                <AvatarFallback>
                                                    {member.name?.charAt(0) ?? '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{member.name}</span>
                                        </div>
                                        <span className="font-medium text-green-600">
                                            ${member.amount.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* People the current user owes */}
                    {owingToMembers.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium flex items-center mb-3">
                                <ArrowDownCircle className="h-4 w-4 text-red-500 mr-2" />
                                You owe
                            </h3>
                            <div className="space-y-3">
                                {owingToMembers.map(member => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={member.imageUrl} />
                                                <AvatarFallback>
                                                    {member.name?.charAt(0) ?? '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{member.name}</span>
                                        </div>
                                        <span className="font-medium text-red-600">
                                            ${member.amount.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
