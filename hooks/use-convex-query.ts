// import { useQuery } from 'convex/react';
// import { useEffect, useState } from 'react';
// import { toast } from 'sonner';

// export function useConvexQuery<T>(
//     query: any,
//     args?: any,
// ): {
//     data: T | undefined;
//     isLoading: boolean;
//     error: Error | null;
// } {
//     const result = useQuery(query, args);
//     const [data, setData] = useState<T | undefined>(undefined);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<Error | null>(null);

//     useEffect(() => {
//         if (result === undefined) {
//             setIsLoading(true);
//         } else {
//             try {
//                 setData(result);
//                 setError(null);
//             } catch (err) {
//                 const error = err as Error;
//                 setError(error);
//                 toast.error(error.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         }
//     }, [result]);
//     return {
//         data,
//         isLoading,
//         error,
//     };
// }

// export function useConvexMutation<TArgs extends any[], TResults>(
//     mutation: (...args: TArgs) => Promise<TResults>,
// ): {
//     mutate: (...args: TArgs) => Promise<TResults | undefined>;
//     data: TResults | undefined;
//     isLoading: boolean;
//     error: Error | null;
// } {
//     const mutationFn = useQuery(mutation as any);
//     const [data, setData] = useState<TResults | undefined>(undefined);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<Error | null>(null);

//     const mutate = async (...args: TArgs): Promise<TResults | undefined> => {
//         setIsLoading(true);
//         setError(null);
//         try {
//             const response = await mutationFn(...args);
//             setData(response);
//             return response;
//         } catch (err) {
//             const error = err as Error;
//             setError(error);
//             toast.error(error.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };
//     return { mutate, data, isLoading, error };
// }

import { useQuery } from 'convex/react';
import { useEffect } from 'react';
import { useMutation } from 'convex/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { FunctionReference } from 'convex/server';

export function useConvexQuery<T, Args = any>(
    query: FunctionReference<'query', 'public'>,
    args?: Args,
): {
    data: T | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const result = useQuery(query, args);
    const [data, setData] = useState<T | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (result === undefined) {
            setIsLoading(true);
        } else {
            try {
                setData(result);
                setError(null);
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Unknown error');
                setError(error);
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        }
    }, [result]);

    return { data, isLoading, error };
}

export function useConvexMutation<T, Args = any>(
    mutation: FunctionReference<'mutation', 'public'>,
): {
    mutate: (args?: Args) => Promise<T>;
    data: T | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const mutationFn = useMutation(mutation);
    const [data, setData] = useState<T | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const mutate = async (args?: Args): Promise<T> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await mutationFn(args);
            setData(response);
            return response;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            toast.error(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { mutate, data, isLoading, error };
}
