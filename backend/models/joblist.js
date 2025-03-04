const sql = require("mssql");

// Create new job list item
const createJobListItem = async (data) => {
  const { NRP, NAME, JOB_CLASS, JOB_DESC, FACTORY, DUE_DATE, STATUS } = data;

  try {
    await sql.query`
      INSERT INTO [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] (
        NRP, 
        NAME, 
        JOB_CLASS, 
        JOB_DESC, 
        FACTORY, 
        DUE_DATE, 
        STATUS,
        created_at,
        updated_at
      ) VALUES (
        ${NRP}, 
        ${NAME}, 
        ${JOB_CLASS}, 
        ${JOB_DESC}, 
        ${FACTORY}, 
        ${DUE_DATE}, 
        ${STATUS},
        GETDATE(),
        GETDATE()
      )`;
    return { message: "Job list item created successfully" };
  } catch (error) {
    console.error("Error creating job list item:", error.message);
    throw error;
  }
};

// Get all job list items
const getJobListItems = async () => {
  try {
    const result = await sql.query`
      SELECT TOP (1000) 
        NRP,
        NAME,
        JOB_CLASS,
        JOB_DESC,
        FACTORY,
        DUE_DATE,
        STATUS,
        created_at,
        updated_at
      FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] 
      ORDER BY created_at DESC
    `;
    return result.recordset;
  } catch (error) {
    console.error("Error fetching job list items:", error.message);
    throw error;
  }
};

// Update job list item
const updateJobListItem = async (NRP, data) => {
  const { NAME, JOB_CLASS, JOB_DESC, FACTORY, DUE_DATE, STATUS } = data;

  // Validation
  if (!NRP || !NAME) {
    throw new Error("NRP and Name are required.");
  }

  const checkItem = await sql.query`
    SELECT * FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = ${NRP}
  `;
  if (checkItem.recordset.length === 0) {
    throw new Error("Job list item not found");
  }

  try {
    await sql.query`
      UPDATE [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] 
      SET 
        NAME = ${NAME}, 
        JOB_CLASS = ${JOB_CLASS}, 
        JOB_DESC = ${JOB_DESC}, 
        FACTORY = ${FACTORY}, 
        DUE_DATE = ${DUE_DATE}, 
        STATUS = ${STATUS},
        updated_at = GETDATE()
      WHERE NRP = ${NRP}`;
    return { message: "Job list item updated successfully" };
  } catch (error) {
    console.error("Error updating job list item:", error.message);
    throw error;
  }
};

// Delete job list item
const deleteJobListItem = async (NRP) => {
  const checkItem = await sql.query`
    SELECT * FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = ${NRP}
  `;
  if (checkItem.recordset.length === 0) {
    throw new Error("Job list item not found");
  }

  try {
    await sql.query`
      DELETE FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = ${NRP}
    `;
    return { message: "Job list item deleted successfully" };
  } catch (error) {
    console.error("Error deleting job list item:", error.message);
    throw error;
  }
};

module.exports = {
  createJobListItem,
  getJobListItems,
  updateJobListItem,
  deleteJobListItem,
};
