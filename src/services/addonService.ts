import { supabase } from '../lib/supabase'
import type { Addon } from '../types/database.types'

// Fetch all active add-ons for booking checkout

export async function getActiveAddons(): Promise<Addon[]> {
  const { data, error } = await supabase
    .from('addons')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) throw error
  return data as Addon[]
}

// Admin: fetch all add-ons including inactive

export async function getAllAddons(): Promise<Addon[]> {
  const { data, error } = await supabase
    .from('addons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Addon[]
}