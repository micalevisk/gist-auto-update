import GistWithTodoist from './gistWithTodoist'

/**
 *
 * @param {WebtaskContext} ctx https://webtask.io/docs/context
 * @param {Function} cb Callback
 */
function updateGistWithTodoistTasks(ctx : any, cb : Function) {
  const {
    GIST_USERNAME,
    GIST_PASSWORD,
    GIST_ID
  } = ctx.secrets

  const user = GistWithTodoist({
    username: GIST_USERNAME,
    password: GIST_PASSWORD
  })

  user.updateGist(GIST_ID)
      .then((res : string[]) => cb(null, res))
      .catch((err : Error) => cb(err))
}

export default updateGistWithTodoistTasks
