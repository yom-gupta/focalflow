import { supabase } from './supabase/client'
import { getUserProfile } from './supabase/queries'

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getUserName(): Promise<string | null> {
  const user = await getUser()
  if (!user) return null
  
  const profile = await getUserProfile(user.id)
  return profile?.name || null
}

