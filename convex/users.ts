import { internalQuery, mutation } from './_generated/server';

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

export const getCurrentUser = internalQuery({
    handler: async (ctx)=> {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity){
            throw new Error ("Not authenticated");
        }
        
        const user = await ctx.db.query("users").withIndex("by_token", (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
        .first();
        if(!user){
            throw new Error("Error not found");
        }
        return user;
    },
})