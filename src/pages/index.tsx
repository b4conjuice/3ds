import type { InferGetStaticPropsType } from 'next'

import { Main, Title } from '@bacondotbuild/ui'

import Layout from '@/components/layout'
import type { List, Config } from '@/utils/fetchContent'
import fetchContent from '@/utils/fetchContent'

export default function Home(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { items } = props
  return (
    <Layout>
      <Main className='flex flex-col p-4'>
        <div className='flex flex-grow flex-col items-center justify-center space-y-4'>
          <Title>3ds</Title>
          <ul className='space-y-4'>
            {items.map(item => (
              <li key={item.name}>
                {item.name} - {item.system}
              </li>
            ))}
          </ul>
        </div>
      </Main>
    </Layout>
  )
}

export const getStaticProps = async () => {
  const { list: items } = await fetchContent<List>(process.env.CONTENT_URL!)
  const { yml: config } = await fetchContent<Config>(process.env.CONFIG_URL!)
  return {
    props: {
      items: items.map(item => {
        const system = config[item]?.system ?? ''
        return {
          name: item,
          system,
        }
      }),
    },
    revalidate: 1,
  }
}
