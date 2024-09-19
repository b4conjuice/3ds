import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SignedIn } from '@clerk/nextjs'
import { PencilSquareIcon } from '@heroicons/react/24/outline'

import { Main } from '@/components/ui'
import fetcher from '@/lib/fetcher'
import { HydrateClient } from '@/trpc/server'
import { getFavorites, getGames, saveGame, saveNote } from '@/server/actions'
import { auth } from '@clerk/nextjs/server'
import ToggleFavoritesButton from './_components/toggleFavoritesButton'
import { type Game } from '@/lib/types'

type Systems = {
  yml: Record<
    string,
    {
      games: string[]
    }
  >
}

async function fetchContent<T>(url: string) {
  return await fetcher<T>(url)
}

async function GamesList({ games }: { games: Game[] }) {
  const favorites = await getFavorites()
  const favoriteGames = favorites
    .map(id => games.find(game => game.id === id))
    .filter(game => game !== undefined)
  const otherGames = games.filter(game => !favorites.includes(game.id))
  const user = auth()
  if (!user.userId) {
    return (
      <ul className='divide-y divide-cb-dusty-blue'>
        {[...(favoriteGames ?? []), ...(otherGames ?? [])].map(game => (
          <li key={game.id} className='flex items-center py-4 first:pt-0'>
            <span className='flex grow gap-3'>
              <span>
                {game.name} - {game.system}
              </span>
              <SignedIn>
                <ToggleFavoritesButton id={game.id} />
              </SignedIn>
            </span>
          </li>
        ))}
      </ul>
    )
  }
  const gamesWithNotes = await getGames()
  const gameToNoteMap = gamesWithNotes.reduce(
    (prev, curr) => {
      prev[curr.id] = curr.noteId ?? undefined
      return prev
    },
    {} as Record<string, number | undefined>
  )
  return (
    <ul className='divide-y divide-cb-dusty-blue'>
      {[...(favoriteGames ?? []), ...(otherGames ?? [])].map(game => (
        <li key={game.id} className='flex items-center gap-4 py-4 first:pt-0'>
          <div className='grow'>
            <div className='text-cb-white/50'>{game.system}</div>
            {game.name}
          </div>
          <span className='flex gap-3'>
            <SignedIn>
              <ToggleFavoritesButton id={game.id} />
            </SignedIn>
            {gameToNoteMap[game.id] ? (
              <Link href={`/${gameToNoteMap[game.id]}`}>
                <PencilSquareIcon className='h-6 w-6 text-cb-pink hover:text-cb-pink/75' />
              </Link>
            ) : (
              <form
                action={async () => {
                  'use server'
                  const title = game.name
                  const body = ''
                  const text = `${title}\n\n${body}`
                  const newNote = {
                    text,
                    title,
                    body,
                  }
                  const noteId = await saveNote(newNote)
                  const newGame = {
                    id: game.id,
                    noteId,
                  }
                  await saveGame(newGame)
                  redirect(`/${noteId}`)
                }}
              >
                <button type='submit' className='flex items-center'>
                  <PencilSquareIcon className='h-6 w-6 text-cb-pink hover:text-cb-pink/75' />
                </button>
              </form>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default async function Home() {
  noStore()
  const { yml: systems } = await fetchContent<Systems>(process.env.SYSTEMS_URL!)
  const systemEntries = Object.entries(systems)
  const games = systemEntries.reduce((prev, system) => {
    const [systemName, systemInfo] = system
    const systemGames = systemInfo.games.map(game => ({
      id: `${game}-${systemName}`,
      name: game,
      system: systemName,
    }))
    return [...prev, ...systemGames]
  }, [] as Game[])
  return (
    <HydrateClient>
      <Main className='container mx-auto flex max-w-screen-md flex-col px-4 md:px-0'>
        <div className='flex flex-grow flex-col'>
          <GamesList games={games} />
        </div>
      </Main>
    </HydrateClient>
  )
}
