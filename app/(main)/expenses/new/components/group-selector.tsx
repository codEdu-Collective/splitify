'use client';

import { useState, useEffect, SetStateAction } from 'react';
import { useConvexQuery } from '@/hooks/use-convex-query';
import { api } from '@/convex/_generated/api';
import { BarLoader } from 'react-spinners';
import { Users } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Group = {
    members: string[];
    id: string;
    name: string;
    memberCount: number;
};

type GroupQueryData = {
    groups: Group[];
    selectedGroup?: Group;
};

export function GroupSelector({ onChange }: { onChange?: (group: Group) => void }) {
    const [selectedGroupId, setSelectedGroupId] = useState('');

    const { data, isLoading } = useConvexQuery<GroupQueryData>(
        api.groups.getGroupOrMembers,
        selectedGroupId ? { groupId: selectedGroupId } : {},
    );

    useEffect(() => {
        if (data?.selectedGroup && onChange) {
            onChange(data.selectedGroup);
        }
    }, [data, onChange]);

    const handleGroupChange = (groupId: SetStateAction<string>) => {
        setSelectedGroupId(groupId);
    };

    if (isLoading) {
        return <BarLoader width={'100%'} color="#36d7b7" />;
    }

    if (!data?.groups || data.groups.length === 0) {
        return (
            <div className="text-sm text-amber-600 p-2 bg-amber-50 rounded-md">
                You need to create a group first before adding a group expense.
            </div>
        );
    }

    return (
        <div>
            <Select value={selectedGroupId} onValueChange={handleGroupChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                    {data.groups.map(group => (
                        <SelectItem key={group.id} value={group.id}>
                            <div className="flex items-center gap-2">
                                <div className="bg-primary/10 p-1 rounded-full">
                                    <Users className="h-3 w-3 text-primary" />
                                </div>
                                <span>{group.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    ({group.memberCount} members)
                                </span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {isLoading && selectedGroupId && (
                <div className="mt-2">
                    <BarLoader width={'100%'} color="#36d7b7" />
                </div>
            )}
        </div>
    );
}
