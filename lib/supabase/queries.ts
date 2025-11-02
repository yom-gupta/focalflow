import { supabase } from './client'
import type { Project, Client, Expense, Goal, UserProfile } from './types'

// Projects
export async function getProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Project[]
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('projects')
    .insert({ ...project, user_id: user.id })
    .select()
    .single()
  
  if (error) throw error
  return data as Project
}

export async function updateProject(id: string, project: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update(project)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Project
}

export async function deleteProject(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Clients
export async function getClients(userId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Client[]
}

export async function createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...client, user_id: user.id })
    .select()
    .single()
  
  if (error) throw error
  return data as Client
}

export async function updateClient(id: string, client: Partial<Client>) {
  const { data, error } = await supabase
    .from('clients')
    .update(client)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Client
}

export async function deleteClient(id: string) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Expenses
export async function getExpenses(userId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  
  if (error) throw error
  return data as Expense[]
}

export async function createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('expenses')
    .insert({ ...expense, user_id: user.id })
    .select()
    .single()
  
  if (error) throw error
  return data as Expense
}

export async function updateExpense(id: string, expense: Partial<Expense>) {
  const { data, error } = await supabase
    .from('expenses')
    .update(expense)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Expense
}

export async function deleteExpense(id: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Goals
export async function getGoals(userId: string) {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Goal[]
}

export async function createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'current_amount'>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('goals')
    .insert({ ...goal, user_id: user.id, current_amount: 0 })
    .select()
    .single()
  
  if (error) throw error
  return data as Goal
}

export async function updateGoal(id: string, goal: Partial<Goal>) {
  const { data, error } = await supabase
    .from('goals')
    .update(goal)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Goal
}

export async function deleteGoal(id: string) {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// User Profiles
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
  return data as UserProfile | null
}

export async function createUserProfile(userId: string, name: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({ id: userId, name })
    .select()
    .single()
  
  if (error) throw error
  return data as UserProfile
}

export async function updateUserProfile(userId: string, name: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({ id: userId, name }, { onConflict: 'id' })
    .select()
    .single()
  
  if (error) throw error
  return data as UserProfile
}

