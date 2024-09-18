import { unstable_noStore as noStore } from 'next/cache'
import { SignedIn } from '@clerk/nextjs'

import { Main } from '@/components/ui'
import fetcher from '@/lib/fetcher'
import { HydrateClient } from '@/trpc/server'
import ToggleFavoritesButton from './_components/toggleFavoritesButton'
import { getFavorites } from '@/server/actions'

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

type Game = {
  id: string
  name: string
  system: string
}

async function GamesList({ games }: { games: Game[] }) {
  const favorites = await getFavorites()
  const favoriteGames = favorites
    .map(id => games.find(game => game.id === id))
    .filter(game => game !== undefined)
  const otherGames = games.filter(game => !favorites.includes(game.id))
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
          {/* <Link>
            write note
          </Link> */}
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
