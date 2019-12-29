type ProjectMeta = {
  id: number
  name: string
  numberTasks: number
  numberPendingTasks: number
}

type GistFile = {
  filename: string | null
  content: string
}

type ProjectMetaWithGistFile = [ProjectMeta, GistFile]

type TaskContent = {
  tag?: string
  link?: string
  text: string
  [key: string]: string | undefined
}

type Task = {
  checked: boolean
  dateAdded: string
  id: number
  priority: Todoist.PRIORITY_LEVELS
  content: TaskContent
  parentId: number
  sectionId: number
}


// ██╗    ██╗████████╗   ███████╗██╗   ██╗███╗   ██╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗
// ██║    ██║╚══██╔══╝   ██╔════╝██║   ██║████╗  ██║██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║
// ██║ █╗ ██║   ██║█████╗█████╗  ██║   ██║██╔██╗ ██║██║        ██║   ██║██║   ██║██╔██╗ ██║
// ██║███╗██║   ██║╚════╝██╔══╝  ██║   ██║██║╚██╗██║██║        ██║   ██║██║   ██║██║╚██╗██║
// ╚███╔███╔╝   ██║      ██║     ╚██████╔╝██║ ╚████║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║
//  ╚══╝╚══╝    ╚═╝      ╚═╝      ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝

type TodoistAccessResponse = TodoistPartialResponse & {
  total: number
  items: {
    archived: Task[]
  }
  sectionsNameById: SectionMap
}

type TodoistPartialResponse = {
  name: string
  items: {
    done: Task[]
    pending: Task[]
  }
}

type ROOT_SECTION = ":root"

type SectionMap = {
  [key: number]: TaskContent
  "null": ROOT_SECTION
}

type ItemsBySectionName = {
  [key: number]: Task[]
  "null": Task[]
}


// https://developer.todoist.com/sync/v8
namespace TodoistSyncAPI {
  type IntegerAsBool = (1 | 0) // due to Todoist API spec: "where 1 is true and 0 is false"
  type PRIORITY_LEVELS = (1 | 2 | 3 | 4)

  // https://developer.todoist.com/sync/v8/?shell#projects
  type Project = {
    // The id of the project.
    id: number
    // The name of the project.
    name: string
    // Color id. It’s a value between 30 and 49, refer to Colors for more info.
    color: number
    // The id of the parent project. Set to null for root projects.
    parent_id: number | null
    // The order of project. Defines the position of the task among all the projects with the same parent_id
    child_order: number
    // Whether the project’s sub-projects are collapsed (where 1 is true and 0 is false).
    collapsed: IntegerAsBool
    // Whether the project is shared (a true or false value).
    shared: boolean
    // Whether the project is marked as deleted (where 1 is true and 0 is false).
    is_deleted: IntegerAsBool
    // Whether the project is marked as archived (where 1 is true and 0 is false).
    is_archived: IntegerAsBool
    // Whether the project is favorite (where 1 is true and 0 is false).
    is_favorite: IntegerAsBool
    // Whether the project is Inbox (true or otherwise this property is not sent).
    inbox_project: boolean
    // Whether the project is TeamInbox (true or otherwise this property is not sent).
    team_inbox: boolean
  }


  // https://developer.todoist.com/sync/v8/?shell#due-dates
  type DueDate = {
    // Due date in the format of YYYY-MM-DD (RFC 3339). For recurring dates, the date of the current iteration.
    date: string
    // Always set to null.
    timezone: string = null
    // Human-readable representation of due date. String always represents the due object in user’s timezone. Look at our reference to see which formats are supported.
    string: string
    // Lang which has to be used to parse the content of the string attribute. Used by clients and on the server side to properly process due dates when date object is not set, and when dealing with recurring tasks.
    lang: ('en' | 'da' | 'pl' | 'zh' | 'ko' | 'de' | 'pt' | 'ja' | 'it' | 'fr' | 'sv' | 'ru' | 'es' | 'nl')
    // Boolean flag which is set to true is due object represents a recurring due date
    is_recurring: boolean
  }


  // https://developer.todoist.com/sync/v8/?shell#items
  type Item = {
    // The id of the task.
    id: number
    // The owner of the task.
    user_id: number
    // Project that the task resides in
    project_id: number
    // The text of the task
    content: string
    // The due date of the task. See the Due dates section for more
    due: DueDate
    // The priority of the task (a number between 1 and 4, 4 for very urgent and 1 for natural). Note: Keep in mind that very urgent is the priority 1 on clients. So, p1 will return 4 in the API.
    priority: PRIORITY_LEVELS
    // The id of the parent task. Set to null for root tasks
    parent_id: number
    // The order of task. Defines the position of the task among all the tasks with the same parent_id
    child_order: number
    // The id of the section. Set to null for tasks not belonging to a section.
    section_id: number
    // The order of the task inside the Today or Next 7 days view (a number, where the smallest value would place the task at the top).
    day_order: number
    // Whether the task’s sub-tasks are collapsed (where 1 is true and 0 is false).
    collapsed: IntegerAsBool
    // The tasks labels (a list of label ids such as [2324,2525]).
    labels: number[]
    // The id of the user who created the current task. This makes sense for shared projects only. For tasks, created before 31 Oct 2019 the value is set to null. Cannot be set explicitly or changed via API.
    added_by_uid: number
    // The id of the user who assigns the current task. This makes sense for shared projects only. Accepts any user id from the list of project collaborators. If this value is unset or invalid, it will automatically be set up to your uid.
    assigned_by_uid: number | null
    // The id of user who is responsible for accomplishing the current task. This makes sense for shared projects only. Accepts any user id from the list of project collaborators or null or an empty string to unset.
    responsible_uid: number | null
    // Whether the task is marked as completed (where 1 is true and 0 is false).
    checked: IntegerAsBool
    // Whether the task has been marked as completed and is marked to be moved to history, because all the child tasks of its parent are also marked as completed (where 1 is true and 0 is false)
    in_history: IntegerAsBool
    // Whether the task is marked as deleted (where 1 is true and 0 is false).
    is_deleted: IntegerAsBool
    // A special id for shared tasks (a number or null if not set). Used internally and can be ignored.
    sync_id: number | null
    // The date when the task was completed (or null if not completed).
    date_completed: string | null
    // The date when the task was created.
    date_added: string | null
  }


  // https://developer.todoist.com/sync/v8/?shell#sections
  type Section = {
    // The id of the section.
    id: number
    // The name of the section.
    name: string
    // Project that the section resides in
    project_id: number
    // The order of section. Defines the position of the section among all the sections in the project
    section_order: number
    // Whether the section’s tasks are collapsed (where 1 is true and 0 is false).
    collapsed: IntegerAsBool
    // A special id for shared sections (a number or null if not set). Used internally and can be ignored.
    sync_id: number | null
    // Whether the section is marked as deleted (where 1 is true and 0 is false).
    is_deleted: IntegerAsBool
    // Whether the section is marked as archived (where 1 is true and 0 is false).
    is_archived: IntegerAsBool
    // The date when the section was archived (or null if not archived).
    date_archived: string | null
    // The date when the section was created.
    date_added: string
  }

  type FileAttachment = {
    // The name of the file.
    file_name: string
    // The size of the file in bytes.
    file_size: number
    // MIME type (for example text/plain or image/png).
    file_type: string
    // The URL where the file is located. Note that we don’t cache the remote content on our servers and stream or expose files directly from third party resources. In particular this means that you should avoid providing links to non-encrypted (plain HTTP) resources, as exposing this files in Todoist may issue a browser warning.
    file_url: string
    // Upload completion state (for example pending or completed).
    upload_state: string
  }


  // https://developer.todoist.com/sync/v8/?shell#project-notes
  type ProjectNote = {
    // The id of the note.
    id: number
    // The id of the user that posted the note.
    posted_uid: number
    // The project which the note is part of.
    project_id: number
    // The content of the note.
    content: string
    // A file attached to the note.
    file_attachment: FileAttachment
    // A list of user ids to notify.
    uids_to_notify: number[]
    // Whether the note is marked as deleted (where 1 is true and 0 is false).
    is_deleted: IntegerAsBool
    // The date when the note was posted.
    posted: string
    // List of emoji reactions and corresponding user ids.
    reactions: object
  }


  // Response of https://developer.todoist.com/sync/v8/?shell#get-project-data
  type ProjectData = {
    project: Project
    items: Item[]
    // sections: Section[]
    // project_notes:   []
  }


  type ArchivedProjectData = {
    completed_info: any
    items: Item[]
    total: number
    has_more: boolean
    next_cursor?: string
  }
}
