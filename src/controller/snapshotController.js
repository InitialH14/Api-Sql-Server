const poolPromise = require('../config/db');

exports.getSnapshots = async (req, res) => {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT TOP 1000 [Configuration], [Row], [Tagname], [Servername], [TagGroup],
                      [TagGroupsSec], [Description], [Units], [Alarm_Limits], [Priority], 
                      [Source], [Value], [Value_BeforeOperation], [Value_Timestamp], 
                      [Value_StatusOK], [Alarm_Active], [Alarm_Unacknowledged], 
                      [Alarm_AcknowledgeUser], [Alarm_AcknowledgeDevice], 
                      [Alarm_TimeOfAcknowledge], [Alarm_TimeInAlarm_hhmmss], 
                      [Alarm_TimeOfAlarm], [Alarm_Message], [Alarm_Comment], [Alarm_UID], 
                      [Alarm_Disabled], [Operation], [CustomField_1], [CustomField_2], 
                      [CustomField_3]
      FROM [TopView].[dbo].[Snapshot]
      WHERE Configuration='UPT-SEMARANG' AND Tagname like '%3WLERI%'
    `;

    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching snapshots:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getSnapshotsPooling = async (req, res) => {
    try {
        const pool = await poolPromise;
        const query = `
        SELECT TOP 5 [Configuration], [Row], [Tagname], [Servername], [TagGroup],
                      [Value], [Value_Timestamp]
        FROM [TopView].[dbo].[Snapshot]
        ORDER BY [Value_Timestamp] DESC
        `

        const result = await pool.request().query(query);
        res.json(result.recordset);
    } catch (error){
        console.error('Error fetching snapshots:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.createSnapshot = async (snapshotName, databaseName) => {
  try {
      const pool = await poolPromise;

      const checkSnapshotQuery = `
          SELECT COUNT(*) AS count FROM sys.databases WHERE name = @snapshotName
      `;
      const checkResult = await pool.request()
          .input('snapshotName', sql.NVarChar, snapshotName)
          .query(checkSnapshotQuery);

      if (checkResult.recordset[0].count > 0) {
          return console.log('Snapshot sudah ada');
      }

      const getFileInfoQuery = `
          SELECT TOP 1 name AS logicalName, physical_name AS dataFileName 
          FROM sys.master_files 
          WHERE database_id = DB_ID(@databaseName) AND type = 0
      `;
      const fileInfoResult = await pool.request()
          .input('databaseName', sql.NVarChar, databaseName)
          .query(getFileInfoQuery);

      if (fileInfoResult.recordset.length === 0) {
          return console.log('Database tidak ditemukan atau tidak memiliki file data.');
      }

      const { logicalName, dataFileName } = fileInfoResult.recordset[0];
      const snapshotFile = dataFileName.replace('.mdf', '_snapshot.ss');

      const createSnapshotQuery = `
          CREATE DATABASE [${snapshotName}] ON 
          (NAME = [${logicalName}], FILENAME = '${snapshotFile}') 
          AS SNAPSHOT OF [${databaseName}]
      `;

      await pool.request().query(createSnapshotQuery);

      console.log('Snapshot berhasil dibuat.');

  } catch (error) {
      console.error('Error:', error);
  }
};

