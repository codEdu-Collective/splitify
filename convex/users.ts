import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { internal } from './_generated/api';

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
            throw new Error('User not found');
        }

        return user;
    },
});

export const searchUsers = query({
    args: {
        query: v.string(),
    },
    handler: async (
        ctx,
        args,
    ): Promise<Array<{ id: string; name: string; email: string; imageUrl: string }>> => {
        // @ts-expect-error: False-Positive
        const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

        if (args.query.length < 2) {
            return [];
        }

        const nameResults = await ctx.db
            .query('users')
            .withSearchIndex('search_name', q => q.search('name', args.query))
            .collect();

        const emailResults = await ctx.db
            .query('users')
            .withSearchIndex('search_email', q => q.search('email', args.query))
            .collect();

        const users = [
            ...nameResults,
            ...emailResults.filter(email => !nameResults.some(name => name._id === email._id)),
        ];

        return users
            .filter(user => user._id !== currentUser._id)
            .map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                imageUrl: user.imageUrl ?? '',
            }));
    },
});
