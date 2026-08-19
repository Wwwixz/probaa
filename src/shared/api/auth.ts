import { apiRequest } from './client';

export interface AuthUser {
	id: number;
	email: string;
	displayName: string | null;
}

interface AuthResponse {
	user: AuthUser;
}

export function register(payload: { email: string; password: string }) {
	return apiRequest<AuthResponse>('/api/auth/register', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export function login(payload: { email: string; password: string }) {
	return apiRequest<AuthResponse>('/api/auth/login', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export function getMe() {
	return apiRequest<AuthResponse>('/api/auth/me');
}

export function logout() {
	return apiRequest<void>('/api/auth/logout', {
		method: 'POST'
	});
}
