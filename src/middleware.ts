import { defineMiddleware } from 'astro:middleware';
import { getSessionCookieName, getUserBySessionToken } from './lib/server/auth';

const PUBLIC_ROUTES = new Set(['/login', '/register', '/forgotPassword', '/verifyCode']);

function isAssetRequest(pathname: string) {
	return pathname.startsWith('/_astro/') || pathname === '/favicon.svg';
}

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;

	if (pathname.startsWith('/api/') || isAssetRequest(pathname)) {
		return next();
	}

	const token = context.cookies.get(getSessionCookieName())?.value;
	const user = await getUserBySessionToken(token);
	const isPublicRoute = PUBLIC_ROUTES.has(pathname);

	if (!user && !isPublicRoute) {
		return context.redirect('/login');
	}

	if (user && isPublicRoute) {
		return context.redirect('/');
	}

	return next();
});
