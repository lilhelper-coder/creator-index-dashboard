import { supabase } from '../config/supabase'

export interface Creator {
  id: string
  platform: string
  platform_id: string
  username: string
  display_name: string
  followers: number
  category: string
  cepi_score?: number
  primary_sector: string
  created_at: string
}

export interface AgentActivity {
  id: string
  agent_name: string
  task: string
  status: string
  notes: string
  created_at: string
}

export interface DashboardMetrics {
  total_creators: number
  active_blockers: number
  total_employees: number
  platforms: Record<string, number>
}

export async function getCreators(limit = 100): Promise<Creator[]> {
  try {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .order('followers', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Creators fetch error:', error)
    return []
  }
}

export async function getRecentActivity(limit = 20): Promise<AgentActivity[]> {
  try {
    const { data, error } = await supabase
      .from('agent_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Activity fetch error:', error)
    return []
  }
}

export async function getMetrics(): Promise<DashboardMetrics> {
  try {
    // Get creator count
    const { count: creatorCount } = await supabase
      .from('creators')
      .select('*', { count: 'exact', head: true })

    // Get creators by platform
    const { data: creators } = await supabase
      .from('creators')
      .select('platform')

    const platforms: Record<string, number> = {}
    if (creators) {
      for (const c of creators) {
        platforms[c.platform] = (platforms[c.platform] || 0) + 1
      }
    }

    // Get employee count
    const { count: employeeCount } = await supabase
      .from('ai_employees')
      .select('*', { count: 'exact', head: true })

    return {
      total_creators: creatorCount || 0,
      active_blockers: 0,
      total_employees: employeeCount || 0,
      platforms
    }
  } catch (error) {
    console.error('Metrics fetch error:', error)
    return { total_creators: 0, active_blockers: 0, total_employees: 0, platforms: {} }
  }
}

export async function getTopCreators(limit = 10): Promise<Creator[]> {
  try {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .order('followers', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Top creators fetch error:', error)
    return []
  }
}
