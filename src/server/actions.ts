import { revalidatePath } from 'next/cache'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function getFavorites() {
  const user = auth()

  if (!user.userId) return []

  const fullUser = await clerkClient.users.getUser(user.userId)

  const favorites = (fullUser.privateMetadata.favorites as string[]) ?? []

  return favorites
}

export async function toggleFavorite(id: string) {
  const user = auth()

  if (!user.userId) throw new Error('unauthorized')

  const fullUser = await clerkClient.users.getUser(user.userId)

  const favorites = (fullUser.privateMetadata.favorites as string[]) ?? []

  const isFavorite = favorites.find(f => f === id)

  const newFavorites = isFavorite
    ? favorites.filter(f => f !== id)
    : [...favorites, id]

  await clerkClient.users.updateUserMetadata(user.userId, {
    privateMetadata: {
      favorites: newFavorites,
    },
  })

  revalidatePath('/')
}
