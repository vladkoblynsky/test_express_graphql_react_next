import { useMeQuery } from "../generated/graphql";
import { useEffect } from "react";
import { useRouter } from "next/router";

export const useIsAuth = () => {
  const { data, loading } = useMeQuery();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !data?.me) {
      router.push("/login?next=/create-post");
    }
  }, [data, loading, router]);
};
