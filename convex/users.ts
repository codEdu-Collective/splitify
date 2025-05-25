import { internal } from './_generated/api';
import { internalQuery} from './_generated/server';
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const store = mutation({
    args: {},
    handler: async ctx => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error('Called storeUser without authentication present');
        }

        const user = await ctx.db
            .query('users')
            .withIndex('by_token', q => q.eq('tokenIdentifier', identity.tokenIdentifier))
            .unique();
        if (user !== null) {
            if (user.name !== identity.name) {
                await ctx.db.patch(user._id, { name: identity.name });
            }
            return user._id;
        }
        return await ctx.db.insert('users', {
            name: identity.name ?? 'Anonymous',
            tokenIdentifier: identity.tokenIdentifier,
            email: identity.email ?? '',
            imageUrl: identity.pictureUrl,
        });
    },
});

//? export const getCurrentUser = internalQuery({
export const getCurrentUser = query({
    handler: async ctx => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error('Not authenticated');
        }

        const user = await ctx.db
            .query('users')
            .withIndex('by_token', q => q.eq('tokenIdentifier', identity.tokenIdentifier))
            .first();
        if (!user) {
            throw new Error('Error not found');
        }
        return user;
    },
});

//? SOLVE: Evet, getCurrentUser fonksiyonun Convex backend'inde tanımlı. Ancak, React tarafında bu fonksiyonu kullanabilmek için Convex fonksiyonunu bir query olarak tanımlamanız gerekir, internalQuery olarak değil. Hem React hem de Convex fonksiyonları içinde kullanmak istiyorsanız: getCurrentUser fonksiyonunu query olarak tanımlayın:

type UserResult = {
    id: string;
    name: string;
    imageUrl?: string;
    email: string;
};

export const searchUsers = query({
    args: { query: v.string() },
    handler: async (
        ctx: any,
        args: { query: string }
    ): Promise<UserResult[]> => {
        const currentUser = await ctx.runQuery(getCurrentUser);
        if (args.query.length > 2) {
            return [];
        }
        const nameResults = await ctx.db
            .query('users')
            .withSearchIndex('search_name', (q: any) => q.search('name', args.query))
            .collect();
        const emailResults = await ctx.db
            .query('users')
            .withSearchIndex('search_email', (q: any) => q.search('email', args.query))
            .collect();
        const users = [
            ...nameResults,
            ...emailResults.filter(
                (email: any) => !nameResults.some((name: any) => name._id === email._id),
            ),
        ];
        return users
            .filter((user: any) => user._id !== currentUser._id)
            .map((user: any) => {
                return {
                    id: user._id,
                    name: user.name,
                    imageUrl: user.imageUrl,
                    email: user.email,
                };
            });
    },
});
