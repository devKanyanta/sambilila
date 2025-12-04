import useSWR, { mutate } from 'swr'

const API_BASE = '/api/profile'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    error.message = await res.json()
    error.cause = res.status
    throw error
  }
  return res.json()
}

export function useProfile() {
  const { data, error, isLoading } = useSWR(API_BASE, fetcher)

  const updateProfile = async (updates: any) => {
    const res = await fetch(API_BASE, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })

    if (!res.ok) {
      throw new Error('Failed to update profile')
    }

    mutate(API_BASE)
    return res.json()
  }

  const uploadAvatar = async (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)

    const res = await fetch(`${API_BASE}/avatar`, {
      method: 'POST',
      body: formData
    })

    if (!res.ok) {
      throw new Error('Failed to upload avatar')
    }

    mutate(API_BASE)
    return res.json()
  }

  const deleteAccount = async () => {
    const res = await fetch(`${API_BASE}?confirm=true`, {
      method: 'DELETE'
    })

    if (!res.ok) {
      throw new Error('Failed to delete account')
    }

    return res.json()
  }

  return {
    profile: data,
    isLoading,
    error,
    updateProfile,
    uploadAvatar,
    deleteAccount
  }
}