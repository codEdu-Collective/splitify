'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Rectangle,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface MonthlySpendingItem {
    month: string;
    total: number;
}

interface ChartDataItem {
    name: string;
    amount: number;
}

interface ExpenseSummaryProps {
    monthlySpending?: MonthlySpendingItem[];
    totalSpent?: number;
}

const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({
    monthlySpending = [],
    totalSpent = 0,
}) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const chartData: ChartDataItem[] = monthlySpending.map(item => {
        const date = new Date(item.month);
        return {
            name: monthNames[date.getMonth()],
            amount: item.total,
        };
    });

    const currentMonthTotal = monthlySpending[currentMonth]?.total ?? 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Expense Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Total This month</p>
                        <h3 className="text-2xl font-bold mt-1">${currentMonthTotal.toFixed(2)}</h3>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Total this year</p>
                        <h3 className="text-2xl font-bold mt-1">${totalSpent.toFixed(2)}</h3>
                    </div>
                </div>
                <div className="h-64 mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={value => `$${value}`} tick={{ fontSize: 12 }} />
                            <Tooltip
                                formatter={(value: unknown) => {
                                    const numValue = typeof value === 'number' ? value : 0;
                                    return [`$${numValue.toFixed(2)}`, 'Amount'];
                                }}
                                labelFormatter={() => 'Spending'}
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                }}
                            />
                            <Bar
                                dataKey="amount"
                                fill="#36d7b7"
                                radius={[4, 4, 0, 0]}
                                activeBar={<Rectangle fill="#4fd1c5" stroke="#38b2ac" />}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                    Monthly spending for {currentYear}
                </p>
            </CardContent>
        </Card>
    );
};

export default ExpenseSummary;
