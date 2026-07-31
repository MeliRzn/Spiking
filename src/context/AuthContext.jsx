import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { userAPI } from '../lib/database'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const createOrUpdateProfile = async (authUser) => {
    try {
      // Check if profile exists
      const existingProfile = await userAPI.getProfile(authUser.id)

      // Always sync photo_url from Discord
      const photoUrl = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null

      if (existingProfile) {
        // Update profile if photo_url changed
        if (existingProfile.photo_url !== photoUrl) {
          const updatedProfile = await userAPI.updateProfile(authUser.id, { photo_url: photoUrl })
          setProfile(updatedProfile)
          return updatedProfile
        }
        setProfile(existingProfile)
        return existingProfile
      }

      // Create new profile only if doesn't exist
      const newProfile = await userAPI.upsertProfile({
        id: authUser.id,
        email: authUser.email,
        display_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0],
        photo_url: photoUrl,
        nick: null,
        free_fire_id: null,
        role: 'member',
        created_at: new Date().toISOString()
      })

      setProfile(newProfile)
      return newProfile
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        createOrUpdateProfile(session.user)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        await createOrUpdateProfile(session.user)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithDiscord = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: window.location.origin
        }
      })
      
      if (error) throw error
      return data.user
    } catch (error) {
      console.error('Error signing in with Discord:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithDiscord, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
