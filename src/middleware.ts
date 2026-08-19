import { defineMiddleware } from 'astro:middleware';
import { getSessionCookieName, getUserBySessionToken } from './lib/server/auth';

/**
 * Список публичных маршрутов, доступных без авторизации.
 * Пользователь может зайти на эти страницы, даже если у него нет активной сессии.
 */
const PUBLIC_ROUTES = new Set(['/login', '/register', '/forgotPassword', '/verifyCode']);
const DEV_PREVIEW_ROUTES = new Set(['/settings', '/profile', '/mini-game']);

/**
 * Проверяет, является ли путь запросом к статичным файлам Astro (ассеты, скрипты, картинки).
 * @param pathname - URL путь запроса
 * @returns true если это запрос к ассетам
 */
function isAssetRequest(pathname: string) {
	return pathname.startsWith('/_astro/') || pathname === '/favicon.svg';
}

/**
 * Глобальный middleware (перехватчик) запросов Astro.
 * Выполняется при каждом запросе к серверу перед рендерингом страницы.
 * Основная задача: проверка сессии и перенаправление пользователя.
 */
export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;

	// Пропускаем API роуты (они сами проверяют авторизацию) и запросы к ассетам (JS/CSS/картинки).
	if (pathname.startsWith('/api/') || isAssetRequest(pathname)) {
		return next();
	}

	// Извлекаем токен сессии из куки.
	const token = context.cookies.get(getSessionCookieName())?.value;
	// Получаем данные пользователя по токену.
	const user = await getUserBySessionToken(token);
	// Проверяем, относится ли текущий маршрут к списку публичных.
	const isPublicRoute = PUBLIC_ROUTES.has(pathname);
	const isDevPreview = import.meta.env.DEV && DEV_PREVIEW_ROUTES.has(pathname);

	// Если пользователь не авторизован и маршрут не публичный — перенаправляем на страницу входа.
	if (!user && !isPublicRoute && !isDevPreview) {
		return context.redirect('/login');
	}

	// Если пользователь авторизован, но пытается зайти на страницу логина/регистрации — перенаправляем на главную.
	if (user && isPublicRoute) {
		return context.redirect('/');
	}

	// Если проверки пройдены успешно, продолжаем обработку запроса (рендеринг страницы).
	return next();
});
