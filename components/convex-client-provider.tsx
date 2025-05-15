'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import type { ReactNode } from 'react';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type ConvexClientProviderProps = {
    children: ReactNode;
};

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
