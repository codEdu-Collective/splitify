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

declare type Group2 = { id: string; name: string; members: Participant[] };

declare type CreateGroupModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (groupId: string) => void;
};

declare type UserEntityData = {
    counterpart: {
        userId: string;
        name: string;
        imageUrl: string;
    };
    netBalance: number;
};

declare type GroupEntityData = {
    balances: Array<{
        userId: string;
        name: string;
        imageUrl: string;
        netBalance: number;
    }>;
    group: {
        id: string;
        name: string;
    };
};

declare type Participant = {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
};

declare type CurrentUser = {
    _id: string;
    name: string;
    email: string;
    imageUrl?: string;
};

declare type Split = { userId: string; amount: number; paid?: boolean };

declare type User2 = {
    _id: string;
    name: string;
    imageUrl: string;
};

declare type SettlementFormProps = {
    entityType: 'user' | 'group';
    entityData: UserEntityData | GroupEntityData;
    onSuccess?: () => void;
};
