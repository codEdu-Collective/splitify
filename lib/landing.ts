import { Bell, CircleCheckBig, CreditCard, PieChart, Receipt, Users } from 'lucide-react';

export const FEATURES = [
    {
        title: 'Group Expense Management',
        Icon: Users,
        bg: 'bg-green-100',
        color: 'text-green-600',
        description: 'Easily organize expenses by creating groups for trips, roommates, or events.',
    },
    {
        title: 'Optimized Settlements',
        Icon: CreditCard,
        bg: 'bg-teal-100',
        color: 'text-teal-600',
        description:
            'Settle up efficiently with our algorithm that reduces the number of payments.',
    },
    {
        title: 'Expense Insights',
        Icon: PieChart,
        bg: 'bg-green-100',
        color: 'text-green-600',
        description:
            'Analyze your shared costs and monitor spending trends with detailed analytics.',
    },
    {
        title: 'Automated Payment Reminders',
        Icon: Bell,
        bg: 'bg-amber-100',
        color: 'text-amber-600',
        description: 'Get notified about outstanding debts and receive updates on your expenses.',
    },
    {
        title: 'Flexible Split Options',
        Icon: Receipt,
        bg: 'bg-green-100',
        color: 'text-green-600',
        description:
            'Divide bills equally, by percentage, or by specific amounts to suit any need.',
    },
    {
        title: 'Instant Updates',
        Icon: CircleCheckBig,
        bg: 'bg-teal-100',
        color: 'text-teal-600',
        description: 'View new expenses and payments in real time as your group members add them.',
    },
];

export const STEPS = [
    {
        label: '1',
        title: 'Start or Join a Group',
        description: 'Create a group for your trip, roommates, or event and invite others to join.',
    },
    {
        label: '2',
        title: 'Log Expenses',
        description:
            'Add expenses, specify who paid, and choose how to split the bill among members.',
    },
    {
        label: '3',
        title: 'Settle Balances',
        description: 'See who owes whom and record payments as debts are settled.',
    },
];

export const TESTIMONIALS = [
    {
        quote: 'Splitr makes it so easy to track who paid for what—no more confusion in our group expenses!',
        name: 'Max Mustermann',
        image: '/testimonials/avatar_5.png',
        role: 'Rental Property Manager',
    },
    {
        quote: 'The calculations in Splitr are spot on—managing shared costs has never been simpler for me.',
        name: 'John Doe',
        image: '/testimonials/avatar_98.png',
        role: 'Stock Market Expert',
    },
    {
        quote: 'With Splitr, I can finally keep track of every expense—no more missing out on repayments!',
        name: 'Çağatay Yılmaz',
        image: '/testimonials/avatar_8.png',
        role: 'Job Searcher',
    },
];
