'use client';

import { api } from '@/convex/_generated/api';
import { useConvexQuery } from '@/hooks/use-convex-query';
import { BarLoader } from 'react-spinners';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { BalanceSummary } from './components/balance-summary';
import ExpenseSummary from './components/expense-summary';
import GroupList from './components/group-list';

interface BalanceOwedItem {
    userId: string;
    name: string;
    imageUrl?: string;
    amount: number;
}

interface BalanceOwingItem {
    base: {
        userId: string;
        name: string;
        imageUrl?: string;
        amount: number;
    };
}

interface BalanceDetails {
    totalBalance: number;
    youAreOwed: number;
    youOwe: number;
    oweDetails: {
        youAreOwedBy: BalanceOwedItem[];
        youOwe: BalanceOwingItem[];
    };
}

interface Group {
    id: string;
    name: string;
    members: Array<{
        id: string;
        name: string;
        imageUrl?: string;
    }>;
}

interface MonthlySpendingItem {
    month: string;
    total: number;
}

export default function Dashboard() {
    const { data: balances, isLoading: balancesLoading } = useConvexQuery<BalanceDetails>(
        api.dashboard.getUserBalances,
    );

    const { data: groups, isLoading: groupsLoading } = useConvexQuery<Group[]>(
        api.dashboard.getUserGroups,
    );

    const { data: totalSpent, isLoading: totalSpentLoading } = useConvexQuery<number>(
        api.dashboard.getTotalSpent,
    );

    const { data: monthlySpending, isLoading: monthlySpendingLoading } = useConvexQuery<
        MonthlySpendingItem[]
    >(api.dashboard.getMonthlySpending);

    const isLoading =
        balancesLoading || groupsLoading || totalSpentLoading || monthlySpendingLoading;

    return (
        <div className="container mx-auto py-6 space-y-6">
            {isLoading ? (
                <div className="w-full py-12 flex justify-center">
                    <BarLoader width={'100%'} color="#36d7b7" />
                </div>
            ) : (
                <>
                    <div className="flex justify-between flex-col sm:flex-row sm:items-center gap-4">
                        <h1 className="text-5xl gradient-title">Dashboard</h1>
                        <Button asChild>
                            <Link href="/expenses/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add expense
                            </Link>
                        </Button>
                    </div>

                    {/* Balance overview cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Cards remain the same... */}
                    </div>

                    {/* Main dashboard content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left column */}
                        <div className="lg:col-span-2 space-y-6">
                            <ExpenseSummary
                                monthlySpending={monthlySpending?.map(item => ({
                                    month: item.month,
                                    total: item.total,
                                }))}
                                totalSpent={totalSpent}
                            />
                        </div>

                        {/* Right column */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Balance Details</CardTitle>
                                        <Button variant="link" asChild className="p-0">
                                            <Link href="/contacts">
                                                View all
                                                <ChevronRight className="ml-1 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <BalanceSummary balances={balances} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Your Groups</CardTitle>
                                        <Button variant="link" asChild className="p-0">
                                            <Link href="/contacts">
                                                View all
                                                <ChevronRight className="ml-1 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <GroupList
                                        groups={groups?.map(group => ({
                                            id: group.id,
                                            name: group.name,
                                            members: group.members || [],
                                        }))}
                                    />
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" asChild className="w-full">
                                        <Link href="/contacts?createGroup=true">
                                            <Users className="mr-2 h-4 w-4" />
                                            Create new group
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
