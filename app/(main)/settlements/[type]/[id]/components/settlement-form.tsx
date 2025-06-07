'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/convex/_generated/api';
import { useConvexMutation, useConvexQuery } from '@/hooks/use-convex-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

const settlementSchema = z.object({
    amount: z
        .string()
        .min(1, 'Amount is required')
        .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: 'Amount must be a positive number',
        }),
    note: z.string().optional(),
    paymentType: z.enum(['youPaid', 'theyPaid']),
});

export default function SettlementForm({ entityType, entityData, onSuccess }: SettlementFormProps) {
    const { data: currentUser } = useConvexQuery<User2 | null>(api.users.getCurrentUser);
    const createSettlement = useConvexMutation(api.settlements.createSettlement);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(settlementSchema),
        defaultValues: {
            amount: '',
            note: '',
            paymentType: 'youPaid',
        },
    });

    const handleUserSettlement = async (data: z.infer<typeof settlementSchema>) => {
        if (!currentUser) {
            toast.error('User not authenticated');
            return;
        }

        const amount = parseFloat(data.amount);

        try {
            if (!('counterpart' in entityData)) {
                toast.error('Invalid entity data for user settlement');
                return;
            }

            const paidByUserId =
                data.paymentType === 'youPaid' ? currentUser._id : entityData.counterpart.userId;

            const receivedByUserId =
                data.paymentType === 'youPaid' ? entityData.counterpart.userId : currentUser._id;

            await createSettlement.mutate({
                amount,
                note: data.note,
                paidByUserId,
                receivedByUserId,
            });

            toast.success('Settlement recorded successfully!');
            if (onSuccess) onSuccess();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            toast.error('Failed to record settlement: ' + errorMessage);
        }
    };

    const handleGroupSettlement = async (
        data: z.infer<typeof settlementSchema>,
        selectedUserId: string,
    ) => {
        if (!currentUser) {
            toast.error('User not authenticated');
            return;
        }

        if (!selectedUserId) {
            toast.error('Please select a group member to settle with');
            return;
        }

        const amount = parseFloat(data.amount);

        try {
            if (!('balances' in entityData)) {
                toast.error('Invalid entity data for group settlement');
                return;
            }
            const selectedUser = entityData.balances.find(
                (balance: { userId: string }) => balance.userId === selectedUserId,
            );

            if (!selectedUser) {
                toast.error('Selected user not found in group');
                return;
            }

            const paidByUserId =
                data.paymentType === 'youPaid' ? currentUser._id : selectedUser.userId;

            const receivedByUserId =
                data.paymentType === 'youPaid' ? selectedUser.userId : currentUser._id;

            await createSettlement.mutate({
                amount,
                note: data.note,
                paidByUserId,
                receivedByUserId,
                groupId: entityData.group.id,
            });

            toast.success('Settlement recorded successfully!');
            if (onSuccess) onSuccess();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            toast.error('Failed to record settlement: ' + errorMessage);
        }
    };

    const onSubmit = async (data: {
        amount: string;
        paymentType: 'youPaid' | 'theyPaid';
        note?: string | undefined;
    }) => {
        if (entityType === 'user') {
            await handleUserSettlement(data);
        } else if (entityType === 'group' && selectedGroupMemberId) {
            await handleGroupSettlement(data, selectedGroupMemberId);
        }
    };

    const [selectedGroupMemberId, setSelectedGroupMemberId] = useState<string | null>(null);

    if (!currentUser) return null;

    if (entityType === 'user' && 'counterpart' in entityData) {
        const otherUser = entityData.counterpart;
        const netBalance = entityData.netBalance;

        return (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Current balance</h3>
                    {netBalance === 0 ? (
                        <p>You are all settled up with {otherUser.name}</p>
                    ) : netBalance > 0 ? (
                        <div className="flex justify-between items-center">
                            <p>
                                <span className="font-medium">{otherUser.name}</span> owes you
                            </p>
                            <span className="text-xl font-bold text-green-600">
                                ${netBalance.toFixed(2)}
                            </span>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <p>
                                You owe <span className="font-medium">{otherUser.name}</span>
                            </p>
                            <span className="text-xl font-bold text-red-600">
                                ${Math.abs(netBalance).toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Who paid?</Label>
                    <RadioGroup
                        defaultValue="youPaid"
                        {...register('paymentType')}
                        className="flex flex-col space-y-2"
                        onValueChange={value => {
                            register('paymentType').onChange({
                                target: { name: 'paymentType', value },
                            });
                        }}
                    >
                        <div className="flex items-center space-x-2 border rounded-md p-3">
                            <RadioGroupItem value="youPaid" id="youPaid" />
                            <Label htmlFor="youPaid" className="flex-grow cursor-pointer">
                                <div className="flex items-center">
                                    <Avatar className="h-6 w-6 mr-2">
                                        <AvatarImage src={currentUser.imageUrl} />
                                        <AvatarFallback>
                                            {currentUser.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>You paid {otherUser.name}</span>
                                </div>
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2 border rounded-md p-3">
                            <RadioGroupItem value="theyPaid" id="theyPaid" />
                            <Label htmlFor="theyPaid" className="flex-grow cursor-pointer">
                                <div className="flex items-center">
                                    <Avatar className="h-6 w-6 mr-2">
                                        <AvatarImage src={otherUser.imageUrl} />
                                        <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{otherUser.name} paid you</span>
                                </div>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input
                            id="amount"
                            placeholder="0.00"
                            type="number"
                            step="0.01"
                            min="0.01"
                            className="pl-7"
                            {...register('amount')}
                        />
                    </div>
                    {errors.amount && (
                        <p className="text-sm text-red-500">{errors.amount.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="note">Note (optional)</Label>
                    <Textarea id="note" placeholder="Dinner, rent, etc." {...register('note')} />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Recording...' : 'Record settlement'}
                </Button>
            </form>
        );
    }

    interface GroupMember {
        userId: string;
        name: string;
        imageUrl: string;
        netBalance: number;
    }

    if (entityType === 'group' && 'balances' in entityData) {
        const groupMembers = entityData.balances;

        return (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <Label>Who are you settling with?</Label>
                    <div className="space-y-2">
                        {groupMembers.map((member: GroupMember) => {
                            const isSelected = selectedGroupMemberId === member.userId;
                            const isOwing = member.netBalance < 0;
                            const isOwed = member.netBalance > 0;

                            return (
                                <div
                                    key={member.userId}
                                    className={`border rounded-md p-3 cursor-pointer transition-colors ${
                                        isSelected
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-muted/50'
                                    }`}
                                    onClick={() => setSelectedGroupMemberId(member.userId)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={member.imageUrl} />
                                                <AvatarFallback>
                                                    {member.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{member.name}</span>
                                        </div>
                                        <div
                                            className={`font-medium ${
                                                isOwing
                                                    ? 'text-green-600'
                                                    : isOwed
                                                      ? 'text-red-600'
                                                      : ''
                                            }`}
                                        >
                                            {isOwing
                                                ? `They owe you $${Math.abs(member.netBalance).toFixed(2)}`
                                                : isOwed
                                                  ? `You owe $${Math.abs(member.netBalance).toFixed(2)}`
                                                  : 'Settled up'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {!selectedGroupMemberId && (
                        <p className="text-sm text-amber-600">
                            Please select a member to settle with
                        </p>
                    )}
                </div>

                {selectedGroupMemberId && (
                    <>
                        <div className="space-y-2">
                            <Label>Who paid?</Label>
                            <RadioGroup
                                defaultValue="youPaid"
                                {...register('paymentType')}
                                className="flex flex-col space-y-2"
                                onValueChange={value => {
                                    register('paymentType').onChange({
                                        target: { name: 'paymentType', value },
                                    });
                                }}
                            >
                                <div className="flex items-center space-x-2 border rounded-md p-3">
                                    <RadioGroupItem value="youPaid" id="youPaid" />
                                    <Label htmlFor="youPaid" className="flex-grow cursor-pointer">
                                        <div className="flex items-center">
                                            <Avatar className="h-6 w-6 mr-2">
                                                <AvatarImage src={currentUser.imageUrl} />
                                                <AvatarFallback>
                                                    {currentUser.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>
                                                You paid{' '}
                                                {
                                                    groupMembers.find(
                                                        (m: { userId: string }) =>
                                                            m.userId === selectedGroupMemberId,
                                                    )?.name
                                                }
                                            </span>
                                        </div>
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2 border rounded-md p-3">
                                    <RadioGroupItem value="theyPaid" id="theyPaid" />
                                    <Label htmlFor="theyPaid" className="flex-grow cursor-pointer">
                                        <div className="flex items-center">
                                            <Avatar className="h-6 w-6 mr-2">
                                                <AvatarImage
                                                    src={
                                                        groupMembers.find(
                                                            (m: { userId: string }) =>
                                                                m.userId === selectedGroupMemberId,
                                                        )?.imageUrl
                                                    }
                                                />
                                                <AvatarFallback>
                                                    {groupMembers
                                                        .find(
                                                            (m: { userId: string }) =>
                                                                m.userId === selectedGroupMemberId,
                                                        )
                                                        ?.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>
                                                {
                                                    groupMembers.find(
                                                        (m: { userId: string }) =>
                                                            m.userId === selectedGroupMemberId,
                                                    )?.name
                                                }{' '}
                                                paid you
                                            </span>
                                        </div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5">$</span>
                                <Input
                                    id="amount"
                                    placeholder="0.00"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    className="pl-7"
                                    {...register('amount')}
                                />
                            </div>
                            {errors.amount && (
                                <p className="text-sm text-red-500">{errors.amount.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="note">Note (optional)</Label>
                            <Textarea
                                id="note"
                                placeholder="Dinner, rent, etc."
                                {...register('note')}
                            />
                        </div>
                    </>
                )}

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || !selectedGroupMemberId}
                >
                    {isSubmitting ? 'Recording...' : 'Record settlement'}
                </Button>
            </form>
        );
    }

    return null;
}
