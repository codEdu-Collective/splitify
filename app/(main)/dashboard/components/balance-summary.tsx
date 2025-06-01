import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

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
    youAreOwedBy: BalanceOwedItem[];
    youOwe: BalanceOwingItem[];
}

interface BalanceSummaryProps {
    balances?: {
        oweDetails: BalanceDetails;
    };
}

/**
 * Displays user's balance summary with:
 * - People who owe you (green section)
 * - People you owe (red section)
 * - Settled up message if no balances
 */
export function BalanceSummary({ balances }: BalanceSummaryProps) {
    // Return null if no balances data
    if (!balances) return null;

    const { oweDetails } = balances;
    const hasOwed = oweDetails.youAreOwedBy.length > 0;
    const hasOwing = oweDetails.youOwe.length > 0;

    return (
        <div className="space-y-4">
            {/* Show settled up message if no balances */}
            {!hasOwed && !hasOwing && (
                <div className="text-center py-6">
                    <p className="text-muted-foreground">You're all settled up!</p>
                </div>
            )}

            {/* People who owe you section */}
            {hasOwed && (
                <div>
                    <h3 className="text-sm font-medium flex items-center mb-3">
                        <ArrowUpCircle className="h-4 w-4 text-green-500 mr-2" />
                        Owed to you
                    </h3>
                    <div className="space-y-3">
                        {oweDetails.youAreOwedBy.map(item => (
                            <Link
                                href={`/person/${item.userId}`}
                                key={item.userId}
                                className="flex items-center justify-between hover:bg-muted p-2 rounded-md transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={item.imageUrl} />
                                        <AvatarFallback>
                                            {item.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{item.name}</span>
                                </div>
                                <span className="font-medium text-green-600">
                                    ${item.amount.toFixed(2)}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* People you owe section */}
            {hasOwing && (
                <div>
                    <h3 className="text-sm font-medium flex items-center mb-3">
                        <ArrowDownCircle className="h-4 w-4 text-red-500 mr-2" />
                        You owe
                    </h3>
                    <div className="space-y-3">
                        {oweDetails.youOwe.map(item => (
                            <Link
                                href={`/person/${item.base.userId}`}
                                key={item.base.userId}
                                className="flex items-center justify-between hover:bg-muted p-2 rounded-md transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={item.base.imageUrl} />
                                        <AvatarFallback>
                                            {item.base.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{item.base.name}</span>
                                </div>
                                <span className="font-medium text-red-600">
                                    ${item.base.amount.toFixed(2)}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
