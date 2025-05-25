// To declare types without importing or exporting them
declare type User = {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
};

declare type Group = {
    id: string;
    title: string;
    name?: string;
    memberCount: number;
};

declare type CreateGroupModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (groupId: string) => void;
};
