import fetcher from '@/utils/fetcher'

export type List = {
  list: string[]
}

export type Config = {
  yml: Record<string, { system: string }>
}

export default async function fetchContent<T>(url: string) {
  return await fetcher<T>(url)
}
