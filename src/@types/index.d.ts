/// <reference path="gists/index.d.ts" />

interface Credentials {
  username: string
  password: string
}

interface TaskContent {
  tag?: string
  link: string
  text: string
  [key: string]: string|undefined
}

interface Task {
  indent: number
  checked: number
  dateAdded: string
  id: number
  priority: number
  content: TaskContent
}

interface UpdateFile {
  filename: string
  newContent: string|null
  newFilename?: string
}

/*
"hello_world.rb": {
  "filename": "hello_world.rb",
  "type": "application/x-ruby",
  "language": "Ruby",
  "raw_url": "https://gist.githubusercontent.com/octocat/6cad326836d38bd3a7ae/raw/db9c55113504e46fa076e7df3a04ce592e2e86d8/hello_world.rb",
  "size": 167
}
*/
interface File {
  filename: string
  type: string
  language: string
  raw_url: string
  size: number
}

interface Files {
  [filename: string]: File|null;
}
