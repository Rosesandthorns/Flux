'use client';
import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const AUTH_ROUTES = ['/login', '/signup'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        const isAuthRoute = AUTH_ROUTES.includes(pathname);

        if (!user && !isAuthRoute) {
            router.push('/login');
        } else if (user && isAuthRoute) {
            router.push('/');
        }
    }, [user, loading, router, pathname]);

    if (loading || (pathname && AUTH_ROUTES.includes(pathname) && user) || (pathname && !AUTH_ROUTES.includes(pathname) && !user)) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return <>{children}</>;
}
