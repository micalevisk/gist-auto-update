// require('dotenv').config({path: require('path').join(__dirname, '../.env')})

import * as Gists from 'gists'
import { updatedFilesToFilesObj } from './utils'


export default function attachGist(credentials : Credentials, gistId : string) {

  const gists = new Gists(credentials)

  function edit({newDescription, updatedFiles} : { newDescription ?:string, updatedFiles : UpdateFile[] }) : Promise<Files> {
    if (!gistId) throw new Error(`GIST ID (${gistId}) INVÁLIDO`)

    return gists.edit(gistId, {
      description: newDescription,
      files: updatedFilesToFilesObj(updatedFiles)
    })
    .then(res => res.body.files)
  }

  function getFilenames() : Promise<string[]> {
    if (!gistId) throw new Error(`GIST ID (${gistId}) INVÁLIDO`)

    return gists.get(gistId).then(res => Object.keys(res.body.files)).catch(err => [])
  }

  return {
    edit,
    getFilenames,
  }

}
