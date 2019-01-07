import GistAPI from './gistAPI'
import { jsonToMarkdownTable, markAsPending, removeYouTubeKeyword } from './utils'
import fetch from 'node-fetch'

const EMOJIS = Object.create(null, {
  'get': {
    value(label : string) : string {
      return (label && this[ label.toLowerCase() ]) || '';
    }
  },

  'book'    : { value: '📖' },
  'read'    : { value: '🧐' },
  'learn'   : { value: '🧠' },
  'vide'    : { value: '👀' },
  'playlist': { value: '💾' },
});


const API_URL = 'https://wt-89c6c15cc2042eb4fe4b1fb85909cac3-0.sandbox.auth0-extend.com/todoist-access'

const projectNames = ['Artigos', 'YouTube', 'GitHub']

const colunas = {
  separators: [':-:', ':-:', ':-'],
  names: [
    '#',
    'TAG',
    'NAME',
  ]
}

function updateGist(credentials : Credentials, gistId : string) {

  const gist = GistAPI(credentials, gistId)

  async function editarGist(updatedFiles : UpdateFile[]) : Promise<Files> {
    const filenames = await gist.getFilenames()

    return gist.edit({
      newDescription: `Todoist.com - my tasks (last update: ${new Date().toLocaleTimeString('pt-BR', {timeZone: 'America/Manaus'})} [America/Manaus])`,
      updatedFiles: [
        ...filenames.map(filename => ({ filename, newContent: null })), // apagar todos os arquivos correntes
        ...updatedFiles
      ]
    })
  }


  function createTaskRow(name : string, tasks : Task[]) : UpdateFile {

    let qtdTasksPending = 0

    const conteudo = tasks.map(({ checked, content }, index) => {
      const row = {
        '#': `${index + 1}`,
        'name': `[${ removeYouTubeKeyword(content.text) }](${content.link})`,
        'tag': EMOJIS.get(content.tag),
      }

      if (!checked) { // tarefa pendente
        row['#'] = markAsPending(row['#'])
        row['name'] = markAsPending(row['name'])
        qtdTasksPending++ // bad way
      }

      return row
    })

    const qtdTasks = conteudo.length
    const qtdTasksDone = qtdTasks - qtdTasksPending

    return {
      filename: `${name}_${qtdTasks}.md`,
      newFilename: `${name}_${qtdTasks}.md`,
      newContent: `# ${name} (${qtdTasksDone}/${qtdTasks}) \n\n${jsonToMarkdownTable(colunas, conteudo)}`
    }

  }

  return Promise.all(
    projectNames.map(projectName =>
      fetch(`${API_URL}?projectName=${projectName}`)
        .then(data => data.json())
        .then((tasks : Task[]) => createTaskRow(projectName, tasks))
    )
  )
  .then(updatedFiles =>
    editarGist(updatedFiles)
      .then(files => Object.keys(files))
  )

}


export default function (credentials : Credentials) : { updateGist: Function } {
  return {
    updateGist: updateGist.bind(null, credentials)
  }
}
