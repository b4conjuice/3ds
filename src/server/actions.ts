'use server'

import { revalidatePath } from 'next/cache'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from './db'
import { and } from 'drizzle-orm'
import { type Note } from '@/lib/types'
import { games, notes } from './db/schema'

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

export async function getNote(noteId: number) {
  const user = auth()

  if (!user.userId) throw new Error('unauthorized')

  const note = await db.query.notes.findFirst({
    where: (model, { eq }) =>
      and(eq(model.id, noteId), eq(model.author, user.userId)),
  })

  return note
}

const GAME_TAG = '🎮'

export async function saveNote(note: Note) {
  const user = auth()

  if (!user.userId) throw new Error('unauthorized')

  const tags = note?.tags ?? []
  const newTags = tags.includes(GAME_TAG) ? tags : [...tags, GAME_TAG]

  const newNotes = await db
    .insert(notes)
    .values({
      ...note,
      author: user.userId,
      tags: newTags,
    })
    .onConflictDoUpdate({
      target: notes.id,
      set: {
        text: note.text,
        title: note.title,
        body: note.body,
        tags: newTags,
      },
    })
    .returning()

  if (!newNotes || newNotes.length < 0) throw new Error('something went wrong')
  const newNote = newNotes[0]
  if (!newNote) throw new Error('something went wrong')
  return newNote.id
}

export async function getNotes() {
  const user = auth()

  if (!user.userId) throw new Error('unauthorized')

  const notes = await db.query.notes.findMany({
    where: (model, { eq }) => eq(model.author, user.userId),
    orderBy: (model, { desc }) => desc(model.updatedAt),
  })
  return notes
}

export async function getGames() {
  const user = auth()

  if (!user.userId) throw new Error('unauthorized')

  const games = await db.query.games.findMany({
    orderBy: (model, { desc }) => desc(model.updatedAt),
  })
  return games
}

export async function saveGame({
  id: gameId,
  noteId,
}: {
  id: string
  noteId: number
}) {
  const user = auth()

  if (!user.userId) throw new Error('unauthorized')

  await db.insert(games).values({
    id: gameId,
    noteId,
  })
}
