export function jsonToMarkdownTable(columns : { separators: string[], names: string[] }, content : { [key: string]: string; }[] ) {
  return `${ columns.names.join('|') }
${ columns.separators.join('|') }
${ content.map(row =>
                columns.names.map(col => row[col.toLowerCase()].replace(/\|/g, '\\|') || '' )
                       .join('|'))
          .join('\n') }`
}


export function updatedFilesToFilesObj(updatedFiles : UpdateFile[]) : { [key: string]: Files; } {

  return updatedFiles.reduce((acum, curr) =>
    Object.assign(
      acum,
      { [curr.filename]: curr.newContent && {content: curr.newContent, filename: curr.newFilename} }
    )
    , {})
}


export const markAsPending = (str : string) => `**${str}**`
