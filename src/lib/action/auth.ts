"use server"
import { cookies } from "next/headers";

export async function setAuthToken(token: string) {
  cookies().set("auth_token", token, {
    httpOnly: true, // Supaya lebih aman, tidak bisa diakses dari client-side JS    
    maxAge: 60 * 60 * 24 * 7, // Expired dalam 7 hari
    path: "/",
  });
}

export async function getAuthToken(): Promise<string | undefined> {
    const getCookie = cookies().get("auth_token")?.value
    console.log(getCookie)
  return getCookie;
}

export async function removeAuthToken() {
  cookies().delete("auth_token");
}

export async function setCookieToken(token: string) {
  const cookieStore = await cookies()
 
  cookieStore.set('name', 'lee')
  // or
  cookieStore.set('name', 'lee', { secure: true })
  // or
  cookieStore.set({
    name: 'name',
    value: 'lee',
    httpOnly: true,
    path: '/',
  })
  }