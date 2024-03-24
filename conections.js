const sql = require('mssql');
const secretsManager = require('aws-sdk/clients/secretsmanager');
const env = require('./env');

async function connectToSqlDatabase(databaseInfo) {
  try {
    const secretsManagerClient = new secretsManager({region: env.REGION});

    const secretResponse = await secretsManagerClient.getSecretValue({
      SecretId: databaseInfo.secretName,
    }).promise();

    const credentials = JSON.parse(secretResponse.SecretString);

    const commonConfig = {
      options: {
        encrypt: false,
        max: 3,
      },
      dialectOptions: {
        instanceName: 'SQLEXPRESS',
      },
      requestTimeout: 30000
    };

    const config = {
      ...commonConfig,
      user: credentials.user || credentials.username,
      password: credentials.password,
      server: credentials.server || credentials.url,
      database: credentials.name_database || credentials.database,
      dialect: 'mssql',
    };

    const pool = new sql.ConnectionPool(config);
    await pool.connect();

    return pool;
  } catch (error) {
    throw error;
  }
}

const databases = {
  db_Aws: {
    secretName: env.SECRET_MANAGER.CONNECTION_DB_AWS,
    connectionFunction: connectToSqlDatabase,
  },
};

module.exports = {
  databases,
  connectToSqlDatabase,
};