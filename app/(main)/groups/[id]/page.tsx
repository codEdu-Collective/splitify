'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/convex/_generated/api';
import { useConvexQuery } from '@/hooks/use-convex-query';
import { BarLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, ArrowLeftRight, ArrowLeft, Users } from 'lucide-react';
import { ExpenseList } from '@/components/expense-list';
import { SettlementList } from '@/components/settlement-list';
import { GroupBalances } from '@/components/group-balances';
import { GroupMembers } from '@/components/group-members';
import { Doc } from '@/convex/_generated/dataModel';
import { Id } from '@/convex/_generated/dataModel';

type Expense = Doc<'expenses'>;

interface Member {
    id: Id<'users'>;
    name: string;
    email?: string;
    imageUrl?: string;
    role: string;
}

interface Settlement {
    _id: Id<'settlements'>;
    _creationTime: number;
    paidByUserId: Id<'users'>;
    receivedByUserId: Id<'users'>;
    amount: number;
    date: number;
    groupId?: Id<'groups'>;
}

interface Balance {
    id: Id<'users'>;
    name: string;
    imageUrl?: string;
    role: string;
    totalBalance: number;
    owes: { to: Id<'users'>; amount: number }[];
    owedBy: { from: Id<'users'>; amount: number }[];
}

interface UserLookupMap {
    [userId: string]: {
        name: string;
        email?: string;
        imageUrl?: string;
    };
}

interface Group {
    name: string;
    description?: string;
}

interface GroupExpensesData {
    group?: Group;
    members: Member[];
    expenses: Expense[];
    settlements: Settlement[];
    balances: Balance[];
    userLookupMap: UserLookupMap;
}

export default function GroupExpensesPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<string>('expenses');

    const { data, isLoading } = useConvexQuery<GroupExpensesData>(api.groups.getGroupExpenses, {
        groupId: params.id,
    });

    if (isLoading) {
        return (
            <div className="container mx-auto py-12">
                <BarLoader width={'100%'} color="#36d7b7" />
            </div>
        );
    }

    const group = data?.group;
    const members = data?.members || [];
    const expenses = data?.expenses || [];
    const settlements = data?.settlements || [];
    const balances = data?.balances || [];
    const userLookupMap = data?.userLookupMap || {};

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            <div className="mb-6">
                <Button variant="outline" size="sm" className="mb-4" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-4 rounded-md">
                            <Users className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl gradient-title">{group?.name}</h1>
                            <p className="text-muted-foreground">{group?.description}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {members.length} members
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/settlements/group/${params.id}`}>
                                <ArrowLeftRight className="mr-2 h-4 w-4" />
                                Settle up
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/expenses/new`}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add expense
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl">Group Balances</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GroupBalances balances={balances} />
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl">Members</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GroupMembers members={members} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Tabs
                defaultValue="expenses"
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-4"
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
                    <TabsTrigger value="settlements">
                        Settlements ({settlements.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="expenses" className="space-y-4">
                    <ExpenseList
                        expenses={expenses}
                        showOtherPerson={true}
                        isGroupExpense={true}
                        userLookupMap={userLookupMap}
                    />
                </TabsContent>

                <TabsContent value="settlements" className="space-y-4">
                    <SettlementList
                        settlements={settlements}
                        isGroupSettlement={true}
                        userLookupMap={userLookupMap}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
