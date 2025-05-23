import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useConvexQuery<T>(query: any): {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
}{
const result = useQuery(query);
const [data, setData]= useState<T | undefined>(undefined);
const [isLoading, setisLoading]= useState(true);
const [error,setError]= useState<Error | null>(null);


useEffect (()=> {
  if(result === undefined){
    setisLoading(true);
  }else {
    try{
      setData(result);
      setError(null);
    }catch(err) {
      const error = err as Error;
   setError(error);
   toast.error(error.message);

    }finally {
      setisLoading(false);
    }
  }
},[result]);
return{
  data,
  isLoading,
  error,
};
};

export function useConvexMutation<TArgs extends any[], TResults>( 
mutation:(...args: TArgs)=> Promise<TResults>
):{
  mutate:(...args:TArgs) => Promise<TResults | undefined>;
  data: TResults | undefined;
  isLoading: boolean;
  error: Error | null;
} {
const mutationFn = useQuery(mutation as any);
const [data, setData]= useState<TResults | undefined>(undefined);
const [isLoading, setisLoading]= useState(false);
const [error,setError]= useState<Error | null>(null);


const mutate = async (...args:TArgs): Promise<TResults |undefined> => {
  setisLoading(true);
  setError(null);
  try{
    const response = await mutationFn(...args);
      setData(response);
      return response;
    }catch(err) {
      const error = err as Error
   setError(error);
   toast.error(error.message);

    }finally {
      setisLoading(false);
    }
  };
  return { mutate,data,isLoading,error};
};