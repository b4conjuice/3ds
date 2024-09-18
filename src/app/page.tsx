import { unstable_noStore as noStore } from 'next/cache'

import { Main, Title } from '@/components/ui'
import fetcher from '@/lib/fetcher'
import { HydrateClient } from '@/trpc/server'

type List = {
  list: string[]
}

type Config = {
  yml: Record<string, { system: string }>
}

async function fetchContent<T>(url: string) {
  return await fetcher<T>(url)
}

export default async function Home() {
  noStore()
  const { list: items } = await fetchContent<List>(process.env.LIST_URL!)
  const { yml: config } = await fetchContent<Config>(process.env.CONFIG_URL!)
  const games = items.map(item => {
    const system = config[item]?.system ?? ''
    return {
      name: item,
      system,
    }
  })
  return (
    <HydrateClient>
      <Main className='flex flex-col p-4'>
        <div className='flex flex-grow flex-col items-center justify-center space-y-4'>
          <Title>3ds</Title>
          <ul className='space-y-4'>
            {games.map(game => (
              <li key={game.name}>
                {game.name} - {game.system}
              </li>
            ))}
          </ul>
        </div>
      </Main>
    </HydrateClient>
  )
}
