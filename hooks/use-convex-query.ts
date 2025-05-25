import { useQuery, useMutation } from 'convex/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface UseConvexQueryResult<T> {
    data: T | undefined;
    isLoading: boolean;
    error: Error | null;
}

interface UseConvexMutationResult<TData = unknown, TArgs = any> {
    mutate: (args?: TArgs) => Promise<TData>;
    data: TData | undefined;
    isLoading: boolean;
    error: Error | null;
}

export const useConvexQuery = <T = unknown>(
    query: Parameters<typeof useQuery>[0],
    ...args: Parameters<typeof useQuery> extends [any, ...infer U] ? U : never
): UseConvexQueryResult<T> => {
    const result = useQuery(query, ...args) as T | undefined;
    const [data, setData] = useState<T | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (result === undefined) {
            setIsLoading(true);
        } else {
            try {
                setData(result);
                setError(null);
            } catch (err) {
                setError(err as Error);
                toast.error((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        }
    }, [result]);

    return {
        data,
        isLoading,
        error,
    };
};

export const useConvexMutation = <TData = unknown, TArgs = any>(
    mutation: Parameters<typeof useMutation>[0],
): UseConvexMutationResult<TData, TArgs> => {
    const mutationFn = useMutation(mutation);
    const [data, setData] = useState<TData | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const mutate = async (args?: TArgs): Promise<TData> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await mutationFn(args);
            setData(response);
            return response;
        } catch (err) {
            setError(err as Error);
            toast.error(err instanceof Error ? err.message : String(err));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { mutate, data, isLoading, error };
};
