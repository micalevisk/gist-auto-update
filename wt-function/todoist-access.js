// @ts-check
const Todoist = require('./todoist');

module.exports = async function todoistAccess(ctx, cb) {
  const query = ctx.query || ctx.data;
  let { projectId } = query;
  const { TODOIST_API_TOKEN } = ctx.secrets;

  const todoist = new Todoist(TODOIST_API_TOKEN);

  if (!projectId) {
    return cb( new Error(`Invalid query parameter 'projectId'.`) );
  }

  projectId = Number(projectId);

  try {
    const sectionsNameById = await todoist.getSectionsGroupedByProjectId(projectId);
    const [projectData, categoryIds] = await todoist.getWellFormattedProjectData(projectId, sectionsNameById);
    const archivedItems = await todoist.getProjectArchivedTasks(projectId, sectionsNameById, categoryIds);

    const items = {
      done: projectData.items.done,
      pending: projectData.items.pending,
      archived: archivedItems,
    };

    /** @type {TodoistAccessResponse} */
    const data = {
      sectionsNameById,
      items,
      total: Object.values(items).reduce((acum, curr) => acum += curr.length, 0),
      name: projectData.name,
    };

    return cb(null, data);
  } catch (err) {
    console.error(err);
    return cb(err);
  }
};
