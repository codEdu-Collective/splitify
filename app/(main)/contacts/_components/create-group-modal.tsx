import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useConvexQuery } from '@/hooks/use-convex-query';
import { api } from '@/convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { Command, CommandInput, CommandList } from '@/components/ui/command';
import { CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from 'cmdk';

type CreateGroupModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (groupId: string) => void;
};

const groupSchema = z.object({
    name: z.string().min(1, 'Group name is required'),
    description: z.string().optional(),
});

type User = {
    id: string;
    name?: string;
    imageUrl?: string;
    email?: string;
};

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [commandOpen, setCommandOpen] = useState(false);

    const { data: currentUser } = useConvexQuery<User, unknown>(api.users.getCurrentUser);

    const { data: searchResults, isLoading: isSearching } = useConvexQuery<User[]>(
        api.users.searchUsers,
        { query: searchQuery },
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
    if (!selectedMembers.some((m) => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
    setCommandOpen(false);
  };

    const handleClose = () => {
        reset();
        setSelectedMembers([]);
        setSearchQuery('');
        onClose();
    };

    const onSubmit = async (data: z.infer<typeof groupSchema>) => {
        if (!currentUser) return;

        try {
            const groupId = await api.groups.createGroup.mutate({
                name: data.name,
                description: data.description,
                memberIds: [currentUser.id, ...selectedMembers.map(m => m.id)],
            });
            onSuccess(groupId);
            reset();
            setSelectedMembers([]);
            setSearchQuery('');
            onClose();
        } catch (error) {
            console.error('Group creation failed', error);
            // İstersen burada kullanıcıya hata mesajı gösterebilirsin.
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account and
                        remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Group Name</Label>
                        <Input id="name" placeholder="Enter a group name" {...register('name')} />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter a group description"
                            {...register('description')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Members</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {currentUser && (
                                <Badge variant="secondary" className="px-3 py-1">
                                    <Avatar>
                                        <AvatarImage src={currentUser.imageUrl} />
                                        <AvatarFallback>
                                            {currentUser.name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>{currentUser.name} (You)</span>
                                </Badge>
                            )}

                            {selectedMembers.map(member => (
                                <Badge
                                    key={member.id}
                                    className="px-3 py-1 cursor-pointer"
                                    onClick={() =>
                                        setSelectedMembers(prev =>
                                            prev.filter(m => m.id !== member.id),
                                        )
                                    }
                                    variant="secondary"
                                >
                                    <Avatar>
                                        <AvatarImage src={member.imageUrl} />
                                        <AvatarFallback>
                                            {member.name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>{member.name}</span>
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
                                                {searchResults?.map(user => (
                                                    <CommandItem
                                                        key={user.id}
                                                        value={user.name + (user.email ?? '')}
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
};

export default CreateGroupModal;


