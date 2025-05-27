'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/convex/_generated/api';
import { useConvexMutation, useConvexQuery } from '@/hooks/use-convex-query';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const groupSchema = z.object({
    name: z.string().min(1, 'Group name is required'),
    description: z.string().optional(),
});

export function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
    const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [commandOpen, setCommandOpen] = useState(false);

    const { data } = useConvexQuery(api.users.getCurrentUser);
    const currentUser = data as User | undefined;

    const createGroup = useConvexMutation(api.contacts.createGroup);
    const { data: searchResults = [], isLoading: isSearching } = useConvexQuery<User[]>(
        api.users.searchUsers,
        {
            query: searchQuery,
        },
    );

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    });

    const addMember = (user: User) => {
        if (!selectedMembers.some(m => m.id === user.id)) {
            setSelectedMembers([...selectedMembers, user]);
        }
        setCommandOpen(false);
    };

    const removeMember = (userId: string) => {
        setSelectedMembers(selectedMembers.filter(m => m.id !== userId));
    };

    const onSubmit = async (data: { name: string; description?: string }) => {
        try {
            console.log('Creating group with data:', data);
            const memberIds = selectedMembers.map(member => member.id);

            const groupId = await createGroup.mutate({
                name: data.name,
                description: data.description,
                members: memberIds,
                home: 'default-home-id-or-string',
            });
            //!! ArgumentValidationError: Object is missing the required field `home`. Consider wrapping the field validator in `v.optional(...)` if this is expected. Object: {description: "", members: ["jd70d2s3kzy3qgx71nag3ennrs7gkh8c", "jd76mshrn986d8xy1n50sfrnbh7gk5by", "jd79a7jg22vtabad19ztzg3m617gkfmj"], name: "ekipp"} Validator: v.object({description: v.optional(v.string()), home: v.string(), members: v.array(v.id("users")), name: v.string()})

            toast.success('Group created successfully!');
            reset();
            setSelectedMembers([]);
            onClose();

            if (onSuccess) {
                onSuccess(groupId as string);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            toast.error('Failed to create group: ' + errorMessage);
        }
    };

    const handleClose = () => {
        reset();
        setSelectedMembers([]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                    {/* <DialogDescription>
                        Add a name, description, and members to create your group.
                    </DialogDescription> */}
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Group Name</Label>
                        <Input id="name" placeholder="Enter group name" {...register('name')} />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter group description"
                            {...register('description')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Members</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {currentUser && (
                                <Badge variant="secondary" className="px-3 py-1">
                                    <Avatar className="h-5 w-5 mr-2">
                                        <AvatarImage src={currentUser.imageUrl} />
                                        <AvatarFallback>
                                            {currentUser.name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>{currentUser.name} (You)</span>
                                </Badge>
                            )}

                            {selectedMembers.map(member => (
                                <Badge key={member.id} variant="secondary" className="px-3 py-1">
                                    <Avatar className="h-5 w-5 mr-2">
                                        <AvatarImage src={member.imageUrl} />
                                        <AvatarFallback>
                                            {member.name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>{member.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeMember(member.id)}
                                        className="ml-2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}

                            <Popover open={commandOpen} onOpenChange={setCommandOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1 text-xs"
                                    >
                                        <UserPlus className="h-3.5 w-3.5" />
                                        Add member
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0" align="start" side="bottom">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search by name or email..."
                                            value={searchQuery}
                                            onValueChange={setSearchQuery}
                                        />
                                        <CommandList>
                                            <CommandEmpty>
                                                {searchQuery.length < 2 ? (
                                                    <p className="py-3 px-4 text-sm text-center text-muted-foreground">
                                                        Type at least 2 characters to search
                                                    </p>
                                                ) : isSearching ? (
                                                    <p className="py-3 px-4 text-sm text-center text-muted-foreground">
                                                        Searching...
                                                    </p>
                                                ) : (
                                                    <p className="py-3 px-4 text-sm text-center text-muted-foreground">
                                                        No users found
                                                    </p>
                                                )}
                                            </CommandEmpty>
                                            <CommandGroup heading="Users">
                                                {searchResults?.map((user: User) => (
                                                    <CommandItem
                                                        key={user.id}
                                                        value={user.name + user.email}
                                                        onSelect={() => addMember(user)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarImage src={user.imageUrl} />
                                                                <AvatarFallback>
                                                                    {user.name?.charAt(0) || '?'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm">
                                                                    {user.name}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {user.email}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        {selectedMembers.length === 0 && (
                            <p className="text-sm text-amber-600">
                                Add at least one other person to the group
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || selectedMembers.length === 0}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Group'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
