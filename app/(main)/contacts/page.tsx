'use client';


import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { useConvexQuery } from '@/hooks/use-convex-query';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Link, Plus, User, Users } from 'lucide-react';
import React, { useState } from 'react'
import { BarLoader } from 'react-spinners';

type UserType = {
  imageUrl: string | Blob | undefined;
  id: string;
  name: string;
  email: string;
};

type GroupsType = {
  id: string;
  title: string;
  memberCount: number;
};

type ContactResponse = {
  users: UserType [];
  groups: GroupsType [];
}

const ContactsPage: React.FC = () => {
 const [isCreateGroupModelOpen, setIsCreateGroupModelOpen]= useState(false);


  const {data, isLoading} = useConvexQuery<ContactResponse>
  (api.contacts.getAllContacts);

 const safeData = data || { users: [], groups: [] };
const { users, groups } = safeData;

  if (isLoading){
    return (
      <div className='container mx-auto py-12'>
      <BarLoader width={"100%"} color='#182929' />
      </div>
    );
  }



  return (
    <div className='container mx-auto py-6'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-5xl gradient-title'>Contacts</h1>
        <Button
        onClick={()=> setIsCreateGroupModelOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create Group
        </Button>
      </div>

      <div >
        <div>
          <h2 className='text-xl font-bold mb-4 flex items-center'>
            <User className='mr-2 h-5 w-5'/>
             People</h2>
             {users && users.length===0? (
              <Card>
                <CardContent className='py-6 text-center text-muted-foreground'>
                There is no contacts available. Kindly add an expense with someone to able to see.
                </CardContent>
              </Card>
            ):(
              <div className='flex flex-col gap-4'>
                {users && users.map((user)=> (
             <Link key={user.id} href={`/person/${user.id}`}>
               <Card className='hover:bg-muted/30 transition-colors cursor-pointer'>
                <CardContent className='py-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-10 w-10'>
                        <AvatarImage src={user.imageUrl as string}/>
                          <AvatarFallback>
                            {user.name.charAt(0)}
                          </AvatarFallback>
                       
                      </Avatar>
                      <div>
                        <p className='font-medium'>{user.name}</p>
                        <p className='text-sm text-muted-foreground'>{user.email}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                </Card>
                  </Link>
                ))}
                
              </div>
            )}
        </div>


        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <h2 className='text-xl font-bold mb-4 flex items-center'>
            <Users className='mr-2 h-5 w-5'/>
            Group
            </h2>
            {groups && groups.length===0? (
              <Card>
                <CardContent className='py-6 text-center text-muted-foreground'>
                There is no groups available. Kindly create a group to start sharing expenses.
                </CardContent>
              </Card>
            ):(
              <div className='flex flex-col gap-4'>
                {groups && groups.map((group)=> (
                  <Link key={group.id} href={`/groups/${group.id}`}>
               <Card className='hover:bg-muted/30 transition-colors cursor-pointer'>
                <CardContent className='py-4'>
                
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                       <div className='bg-primary/10 p-2 rounded-md'>
                      <Users className='h-6 w-6 text-primary'/>
                      </div>
                      <div>
                        <p className='font-medium'>{group.title}</p>
                        <p className='text-sm text-muted-foreground'>{group.memberCount} Members</p>
                        
                      </div>
                    </div>
                  </div>
                </CardContent>
                </Card>
                  </Link>
                ))}
                
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default ContactsPage