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
    month: string; // veya Date, eğer date olarak geliyorsa değiştirilebilir
    total: number;
}

interface ExpenseSummaryProps {
    monthlySpending?: MonthlySpendingItem[];
    totalSpent?: number;
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({
    monthlySpending = [],
    totalSpent = 0,
}) => {
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

    const chartData = monthlySpending.map(item => {
        const date = new Date(item.month);
        return {
            name: monthNames[date.getMonth()],
            amount: item.total,
        };
    });

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Expense Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Total This month</p>
                        <h3 className="text-2xl font-bold mt-1">
                            ${monthlySpending?.[currentMonth]?.total.toFixed(2) || '0.00'}
                        </h3>
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
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                                labelFormatter={() => 'Spending'}
                            />
                            <Bar
                                dataKey="amount"
                                fill="#36d7b7"
                                radius={[4, 4, 0, 0]}
                                activeBar={<Rectangle fill="pink" stroke="blue" />}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
            <p className="text-xs text-muted-foreground text-center mt-2">
                Monthly spending for {currentYear}
            </p>
        </Card>
    );
};

export default ExpenseSummary;
