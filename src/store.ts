import { writable } from 'svelte/store';

export const accessToken = writable<string>();
export const accessTokenExpireTime = writable<Date>();
