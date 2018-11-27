declare module 'gists' {

  interface GitHub {}

  interface GistResponse {
    body:{
      files:Files
      // TODO: completar
    }
  }

  interface Gists extends GitHub {
    create(options:object) : Promise<GistResponse>
    get(gist_id:string, options?:object) : Promise<GistResponse>
    list(username:string, options?:object) : Promise<GistResponse>
    all(options?:object) : Promise<GistResponse>
    public(options?:object) : Promise<GistResponse>
    starred(options?:object) : Promise<GistResponse>
    revision(gist_id:string, sha:string, options?:object) : Promise<GistResponse>
    commits(gist_id:string, options?:object) : Promise<GistResponse>
    forks(gist_id:string, options?:object) : Promise<GistResponse>
    fork(gist_id:string, options?:object) : Promise<GistResponse>
    edit(gist_id:string, options?:object) : Promise<GistResponse>
    delete(gist_id:string, options?:object) : Promise<GistResponse>
    star(gist_id:string, options?:object) : Promise<GistResponse>
    unstar(gist_id:string, options?:object) : Promise<GistResponse>
    isStarred(gist_id:string, options?:object) : Promise<GistResponse>
    createComment(gist_id:string, options?:object) : Promise<GistResponse>
    getComment(gist_id:string, comment_id:string, options?:object) : Promise<GistResponse>
    listComments(gist_id:string, options?:object) : Promise<GistResponse>
    editComment(gist_id:string, comment_id:string, options?:object) : Promise<GistResponse>
    deleteComment(gist_id:string, comment_id:string, options?:object) : Promise<GistResponse>
  }

  interface GistsAPI {
    new (options:object) : Gists
  }

  const Gists : GistsAPI;

  export = Gists;

}
