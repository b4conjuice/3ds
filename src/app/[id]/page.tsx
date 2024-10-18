import { auth } from '@clerk/nextjs/server'

import { Main } from '@/components/ui'
import Textarea from '@/app/_components/textarea'
import { getNote } from '@/server/actions'

export default async function NotePage({ params }: { params: { id: string } }) {
  const user = auth()
  if (!user.userId) {
    return (
      <Main className='container mx-auto flex max-w-screen-md flex-col px-4 md:px-0'>
        <p>you must be logged in to view this note</p>
      </Main>
    )
  }

  const note = await getNote(Number(params.id))
  if (!note) {
    return (
      <Main className='container mx-auto flex max-w-screen-md flex-col px-4 md:px-0'>
        <p>no note found</p>
      </Main>
    )
  }
  return (
    <Main className='container mx-auto flex max-w-screen-md flex-col px-4 pb-4 md:px-0'>
      <div className='flex w-full flex-grow flex-col space-y-4'>
        <h2>{note.title}</h2>
        <Textarea
          note={{
            id: note.id,
            title: note.title,
            body: note.body,
            text: `${note.title}\n\n${note?.body}`,
          }}
        />
      </div>
    </Main>
  )
}
