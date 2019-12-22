type GistFile = {
  filename: string|null
  content: string
}

type TaskContent = {
  tag?: string
  link: string
  text: string
  [key: string]: string|undefined
}

type Task = {
  indent: number
  checked: number
  dateAdded: string
  id: number
  priority: number
  content: TaskContent
}

type GistFileWithPercent = [number, GistFile]
