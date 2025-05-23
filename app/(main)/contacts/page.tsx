'use client';


import { api } from '@/convex/_generated/api';
import { useConvexQuery } from '@/hooks/use-convex-query';
import { useQuery } from 'convex/react';
import React from 'react'
import { BarLoader } from 'react-spinners';

const ContactsPage = () => {
  const {data, isLoading} = useConvexQuery(api.contacts.getAllContacts)

  if (isLoading){
    return (
      <div className='container mx-auto py-12'>
      <BarLoader width={"100%"} color='#36d7d7' />
      </div>
    )
  }

  return (
    <div>ContactsPage</div>
  )
}

export default ContactsPage