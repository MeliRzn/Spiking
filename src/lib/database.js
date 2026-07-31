/**
 * Supabase Database Integration
 * 
 * This file provides direct integration with Supabase database
 * for all data operations.
 */

import { supabase } from './supabase'

// ============================================================================
// USER API
// ============================================================================

export const userAPI = {
  // Get user profile
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  // Create or update user profile (upsert)
  upsertProfile: async (userData) => {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        ...userData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update user profile
  updateProfile: async (userId, data) => {
    const { data: updatedData, error } = await supabase
      .from('users')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return updatedData
  },

  // Get user role
  getRole: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data?.role || 'member'
  }
}

// ============================================================================
// GOALS API
// ============================================================================

export const goalsAPI = {
  // Upload goal images
  upload: async (userId, warPointsImage, weeklyPointsImage) => {
    // Upload images to Supabase Storage
    const warPointsFileName = `${userId}/${Date.now()}_war_points.png`
    const weeklyPointsFileName = `${userId}/${Date.now()}_weekly_points.png`

    const [warPointsUpload, weeklyPointsUpload] = await Promise.all([
      supabase.storage.from('goals').upload(warPointsFileName, warPointsImage),
      supabase.storage.from('goals').upload(weeklyPointsFileName, weeklyPointsImage)
    ])

    if (warPointsUpload.error) throw warPointsUpload.error
    if (weeklyPointsUpload.error) throw weeklyPointsUpload.error

    // Get public URLs
    const { data: warPointsUrl } = supabase.storage.from('goals').getPublicUrl(warPointsFileName)
    const { data: weeklyPointsUrl } = supabase.storage.from('goals').getPublicUrl(weeklyPointsFileName)

    // Get current week number
    const now = new Date()
    const weekNumber = getWeekNumber(now)
    const year = now.getFullYear()

    // Create goal record
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        week_number: weekNumber,
        year: year,
        war_points_image: warPointsUrl.publicUrl,
        weekly_points_image: weeklyPointsUrl.publicUrl,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get user's goal history
  getHistory: async (userId) => {
    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        users:user_id (display_name, nick)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get pending uploads (admin)
  getPending: async () => {
    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        users:user_id (display_name, nick, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Approve goal (admin)
  approve: async (goalId, adminId) => {
    const { data, error } = await supabase
      .from('goals')
      .update({
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Reject goal (admin)
  reject: async (goalId, reason) => {
    const { data, error } = await supabase
      .from('goals')
      .update({
        status: 'rejected',
        rejection_reason: reason
      })
      .eq('id', goalId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// ============================================================================
// RANKING API
// ============================================================================

export const rankingAPI = {
  // Get current ranking
  getCurrent: async () => {
    const now = new Date()
    const weekNumber = getWeekNumber(now)
    const year = now.getFullYear()

    const { data, error } = await supabase
      .from('goals')
      .select(`
        user_id,
        users:user_id (display_name, nick, photo_url),
        status
      `)
      .eq('week_number', weekNumber)
      .eq('year', year)
      .eq('status', 'approved')
    
    if (error) throw error

    // Aggregate points by user (you'll need to add points columns to goals table)
    // For now, return the data as is
    return data
  },

  // Get ranking by week
  getByWeek: async (weekNumber, year) => {
    const { data, error } = await supabase
      .from('goals')
      .select(`
        user_id,
        users:user_id (display_name, nick, photo_url),
        status
      `)
      .eq('week_number', weekNumber)
      .eq('year', year)
      .eq('status', 'approved')
    
    if (error) throw error
    return data
  }
}

// ============================================================================
// MEMBERS API (Admin)
// ============================================================================

export const membersAPI = {
  // Get all members
  getAll: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Update member role
  updateRole: async (userId, role) => {
    const { data, error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Remove member
  remove: async (userId) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
    
    if (error) throw error
    return { success: true }
  }
}

// ============================================================================
// ANNOUNCEMENTS API (Admin)
// ============================================================================

export const announcementsAPI = {
  // Get all announcements
  getAll: async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        users:created_by (display_name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create announcement
  create: async (data) => {
    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return announcement
  },

  // Update announcement
  update: async (id, data) => {
    const { data: announcement, error } = await supabase
      .from('announcements')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return announcement
  },

  // Delete announcement
  delete: async (id) => {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  }
}

// ============================================================================
// NOTIFICATIONS API
// ============================================================================

export const notificationsAPI = {
  // Send notification to user
  sendToUser: async (userId, title, message, type = 'info') => {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Send broadcast notification
  broadcast: async (title, message, type = 'info') => {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
    
    if (usersError) throw usersError

    // Create notifications for all users
    const notifications = users.map(user => ({
      user_id: user.id,
      title,
      message,
      type
    }))

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select()
    
    if (error) throw error
    return data
  },

  // Get user notifications
  getUserNotifications: async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// ============================================================================
// STATISTICS API (Admin)
// ============================================================================

export const statisticsAPI = {
  // Get current week statistics
  getCurrentWeek: async () => {
    const now = new Date()
    const weekNumber = getWeekNumber(now)
    const year = now.getFullYear()

    const { data, error } = await supabase
      .from('statistics')
      .select('*')
      .eq('week_number', weekNumber)
      .eq('year', year)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Get statistics by week
  getByWeek: async (weekNumber, year) => {
    const { data, error } = await supabase
      .from('statistics')
      .select('*')
      .eq('week_number', weekNumber)
      .eq('year', year)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Get overall statistics
  getOverall: async () => {
    const { data, error } = await supabase
      .from('statistics')
      .select('*')
      .order('week_number', { ascending: false })
      .limit(10)
    
    if (error) throw error
    return data
  },

  // Calculate and save statistics (admin)
  calculateStatistics: async (weekNumber, year) => {
    // Get total members
    const { data: members, error: membersError } = await supabase
      .from('users')
      .select('id')
    
    if (membersError) throw membersError

    // Get approved goals for the week
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('week_number', weekNumber)
      .eq('year', year)
      .eq('status', 'approved')
    
    if (goalsError) throw goalsError

    const totalMembers = members.length
    const activeMembers = new Set(goals.map(g => g.user_id)).size

    // Calculate statistics (you'll need to add points columns to goals table)
    const statistics = {
      week_number: weekNumber,
      year: year,
      total_members: totalMembers,
      active_members: activeMembers,
      total_war_points: 0,
      total_weekly_points: 0,
      average_war_points: 0,
      average_weekly_points: 0
    }

    const { data, error } = await supabase
      .from('statistics')
      .upsert(statistics)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// ============================================================================
// WEEKLY GOALS API (Admin)
// ============================================================================

export const weeklyGoalsAPI = {
  // Get current weekly goal
  getCurrent: async () => {
    const { data, error } = await supabase
      .from('weekly_goals')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Create weekly goal
  create: async (data) => {
    const { data: goal, error } = await supabase
      .from('weekly_goals')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return goal
  },

  // Create or update weekly goal (upsert)
  upsert: async (data) => {
    const { data: goal, error } = await supabase
      .from('weekly_goals')
      .upsert(data, {
        onConflict: 'week_number,year'
      })
      .select()
      .single()
    
    if (error) throw error
    return goal
  },

  // Update weekly goal
  update: async (id, data) => {
    const { data: goal, error } = await supabase
      .from('weekly_goals')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return goal
  }
}

// ============================================================================
// LINES API
// ============================================================================

export const linesAPI = {
  // Get all lines
  getAll: async () => {
    const { data, error } = await supabase
      .from('lines')
      .select(`
        *,
        leader:leader_id (display_name, nick, photo_url),
        members:line_members(count),
        line_members (
          user_id,
          users:user_id (display_name, nick, photo_url, role_function)
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get line by ID
  getById: async (lineId) => {
    const { data, error } = await supabase
      .from('lines')
      .select(`
        *,
        leader:leader_id (display_name, nick, photo_url),
        line_members (
          user_id,
          joined_at,
          users:user_id (display_name, nick, photo_url, role_function, short_id)
        )
      `)
      .eq('id', lineId)
      .single()
    
    if (error) throw error
    return data
  },

  // Get user's line
  getUserLine: async (userId) => {
    const { data, error } = await supabase
      .from('line_members')
      .select(`
        line_id,
        lines (
          *,
          leader:leader_id (display_name, nick, photo_url)
        )
      `)
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data?.lines
  },

  // Create line
  create: async (data) => {
    const { data: line, error } = await supabase
      .from('lines')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    
    // Add leader as first member
    await supabase.from('line_members').insert({
      line_id: line.id,
      user_id: data.leader_id
    })
    
    return line
  },

  // Update line
  update: async (lineId, data) => {
    const { data: line, error } = await supabase
      .from('lines')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', lineId)
      .select()
      .single()
    
    if (error) throw error
    return line
  },

  // Delete line
  delete: async (lineId) => {
    const { error } = await supabase
      .from('lines')
      .delete()
      .eq('id', lineId)
    
    if (error) throw error
    return { success: true }
  },

  // Add member to line
  addMember: async (lineId, userId) => {
    const { data, error } = await supabase
      .from('line_members')
      .insert({ line_id: lineId, user_id: userId })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Remove member from line
  removeMember: async (lineId, userId) => {
    const { error } = await supabase
      .from('line_members')
      .delete()
      .eq('line_id', lineId)
      .eq('user_id', userId)
    
    if (error) throw error
    return { success: true }
  },

  // Get line member count
  getMemberCount: async (lineId) => {
    const { data, error } = await supabase
      .from('line_members')
      .select('id', { count: 'exact' })
      .eq('line_id', lineId)
    
    if (error) throw error
    return data?.length || 0
  }
}

// ============================================================================
// LINE INVITES API
// ============================================================================

export const lineInvitesAPI = {
  // Send invite
  send: async (lineId, invitedBy, invitedUserId) => {
    const { data, error } = await supabase
      .from('line_invites')
      .insert({
        line_id: lineId,
        invited_by: invitedBy,
        invited_user_id: invitedUserId
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Send notification to invited user
    await notificationsAPI.sendToUser(
      invitedUserId,
      'Convite para Linha',
      'Você recebeu um convite para entrar em uma linha.',
      'info'
    )
    
    return data
  },

  // Get user's pending invites
  getUserInvites: async (userId) => {
    const { data, error } = await supabase
      .from('line_invites')
      .select(`
        *,
        lines (
          id,
          name,
          leader:leader_id (display_name, nick)
        ),
        invited_by_user:invited_by (display_name, nick)
      `)
      .eq('invited_user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Accept invite
  accept: async (inviteId) => {
    // Get invite details
    const { data: invite, error: inviteError } = await supabase
      .from('line_invites')
      .select('*')
      .eq('id', inviteId)
      .single()
    
    if (inviteError) throw inviteError

    // Check if user is already in a line
    const existingLine = await linesAPI.getUserLine(invite.invited_user_id)
    if (existingLine) {
      throw new Error('Você já faz parte de uma linha')
    }

    // Check if line is full (max 8 members)
    const memberCount = await linesAPI.getMemberCount(invite.line_id)
    if (memberCount >= 8) {
      throw new Error('A linha já está cheia')
    }

    // Add user to line
    await linesAPI.addMember(invite.line_id, invite.invited_user_id)

    // Update invite status
    const { data, error } = await supabase
      .from('line_invites')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString()
      })
      .eq('id', inviteId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Reject invite
  reject: async (inviteId) => {
    const { data, error } = await supabase
      .from('line_invites')
      .update({
        status: 'rejected',
        responded_at: new Date().toISOString()
      })
      .eq('id', inviteId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get line's sent invites
  getLineInvites: async (lineId) => {
    const { data, error } = await supabase
      .from('line_invites')
      .select(`
        *,
        invited_user:invited_user_id (display_name, nick, short_id)
      `)
      .eq('line_id', lineId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Cancel invite
  cancel: async (inviteId) => {
    const { error } = await supabase
      .from('line_invites')
      .delete()
      .eq('id', inviteId)
    
    if (error) throw error
    return { success: true }
  }
}

// ============================================================================
// SEARCH API
// ============================================================================

export const searchAPI = {
  // Search users by various fields
  searchUsers: async (query) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`nick.ilike.%${query}%,short_id.ilike.%${query}%,free_fire_id.ilike.%${query}%,display_name.ilike.%${query}%`)
      .is('deleted_at', null)
      .is('is_blocked', false)
    
    if (error) throw error
    return data
  },

  // Search by short ID
  findByShortId: async (shortId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('short_id', shortId)
      .is('deleted_at', null)
      .is('is_blocked', false)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Search by line
  searchByLine: async (lineName) => {
    const { data, error } = await supabase
      .from('lines')
      .select(`
        *,
        leader:leader_id (display_name, nick),
        line_members (
          users:user_id (display_name, nick, role_function, short_id)
        )
      `)
      .ilike('name', `%${lineName}%`)
    
    if (error) throw error
    return data
  },

  // Search by role
  searchByRole: async (role) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .is('deleted_at', null)
      .is('is_blocked', false)
    
    if (error) throw error
    return data
  },

  // Search by function
  searchByFunction: async (roleFunction) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role_function', roleFunction)
      .is('deleted_at', null)
      .is('is_blocked', false)
    
    if (error) throw error
    return data
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}
