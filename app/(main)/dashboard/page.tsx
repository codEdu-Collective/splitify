'use client';
import { api } from '@/convex/_generated/api';
import { useConvexQuery } from '@/hooks/use-convex-query';
import React from 'react';
import { BarLoader } from 'react-spinners';

const DashboardPage = () => {
    const { data: balances, isLoading: balancesLoading } = useConvexQuery(
        api.dashboard.getUserBalances,
    );
    const { data: groups, isLoading: groupsLoading } = useConvexQuery(api.dashboard.getUserGroups);
    const { data: totalSpent, isLoading: totalSpentLoading } = useConvexQuery(
        api.dashboard.getTotalSpent,
    );
    const { data: monthlySpending, isLoading: monthlySpendingLoading } = useConvexQuery(
        api.dashboard.getMonthlySpending,
    );
    const isLoading =
        balancesLoading || groupsLoading || totalSpentLoading || monthlySpendingLoading;

    return (
        <div>
            {isLoading ? (
                <div className="w-full py-12 flex justify-center">
                    <BarLoader width={'100%'} color="#36d7b7" />
                </div>
            ) : (
                <div>
                    <h1 className="text-5xl gradient-title">Dashboard</h1>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
