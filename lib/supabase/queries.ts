import { supabase } from './client'
import type { Project, Client, Expense, Goal, UserProfile, InspirationFolder, InspirationItem } from './types'

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

// Inspiration Folders
export async function getInspirationFolders(userId: string) {
  const { data, error } = await supabase
    .from('inspiration_folders')
    .select('*')
    .eq('user_id', userId)
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data as InspirationFolder[]
}

export async function createInspirationFolder(folder: Omit<InspirationFolder, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'item_count'>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('inspiration_folders')
    .insert({ ...folder, user_id: user.id, item_count: 0 })
    .select()
    .single()
  
  if (error) throw error
  return data as InspirationFolder
}

export async function updateInspirationFolder(id: string, folder: Partial<InspirationFolder>) {
  const { data, error } = await supabase
    .from('inspiration_folders')
    .update(folder)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as InspirationFolder
}

export async function deleteInspirationFolder(id: string) {
  const { error } = await supabase
    .from('inspiration_folders')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Inspiration Items
export async function getInspirationItems(folderId: string) {
  const { data, error } = await supabase
    .from('inspiration_items')
    .select('*')
    .eq('folder_id', folderId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as InspirationItem[]
}

export async function createInspirationItem(item: Omit<InspirationItem, 'id' | 'created_at' | 'user_id'>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('inspiration_items')
    .insert({ ...item, user_id: user.id })
    .select()
    .single()
  
  if (error) throw error
  return data as InspirationItem
}

export async function updateInspirationItem(id: string, item: Partial<InspirationItem>) {
  const { data, error } = await supabase
    .from('inspiration_items')
    .update(item)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as InspirationItem
}

export async function deleteInspirationItem(id: string) {
  const { error } = await supabase
    .from('inspiration_items')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Update folder thumbnail from items
export async function updateFolderThumbnailFromItems(folderId: string) {
  // Get all items in the folder
  const items = await getInspirationItems(folderId)
  
  // Find the first item with an image (image, screenshot, or link with image_url)
  const imageItem = items.find(item => {
    if (item.type === 'image' || item.type === 'screenshot') {
      return item.image_url
    }
    if (item.type === 'link') {
      return item.image_url
    }
    return false
  })

  // Update folder thumbnail
  if (imageItem && imageItem.image_url) {
    await updateInspirationFolder(folderId, { thumbnail_url: imageItem.image_url })
  } else {
    // If no image items, clear thumbnail
    await updateInspirationFolder(folderId, { thumbnail_url: undefined })
  }
}

