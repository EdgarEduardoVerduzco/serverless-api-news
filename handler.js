'use strict';
const axios = require('axios');
const sql = require('mssql');
const {connectToSqlDatabase, databases} = require("./conections");
const env = require("./env");


module.exports.getListNews = async (event, context, callback) => {
  try {
    const page = parseInt(event.queryStringParameters?.page) || 1;
    const pageSize = parseInt(event.queryStringParameters?.size) || 8;

    const pool_aws = await connectToSqlDatabase(databases.db_Aws);
    const result = await pool_aws.request()
      .input('PageNumber', sql.TYPES.Int, page)
      .input('PageSize', sql.TYPES.Int, pageSize)
      .query(env.SCRIPTS.SELECT_LIST_NEWS_PAGINATED);

    const countResult = await pool_aws.request().query('SELECT COUNT(*) as total FROM test_news.dbo.news');
    const totalCount = countResult.recordset[0].total;

    await pool_aws.close();

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: result.recordset,
        count: result.recordset.length,
        meta: {page, pageSize, total: totalCount},
      }),
    };
  } catch (error) {
    console.error("Error executing query: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
      }),
    };
  }
};

module.exports.getNewsById = async (event, context, callback) => {
  try {
    const newsId = event.pathParameters.id;

    const pool_aws = await connectToSqlDatabase(databases.db_Aws);
    const result = await pool_aws.request()
      .input('id', sql.TYPES.Int, newsId)
      .query(env.SCRIPTS.SELECT_NEWS_BY_ID);

    await pool_aws.close();

    if (result.recordset.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({error: 'News not found'})
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: result.recordset[0],
      }),
    };
  } catch (error) {
    console.error("Error executing query: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
      }),
    };
  }
};

module.exports.getListUsers = async (event, context, callback) => {
  try {
    const pool_aws = await connectToSqlDatabase(databases.db_Aws);
    const result = await pool_aws.request().query(env.SCRIPTS.SELECT_LIST_USERS);

    await pool_aws.close();

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: result.recordset,
        count: result.recordset.length
      }),
    };
  } catch (error) {
    console.error("Error executing query: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
      }),
    };
  }
};

module.exports.getUserById = async (event, context, callback) => {
  try {
    const newsId = event.pathParameters.id;

    const pool_aws = await connectToSqlDatabase(databases.db_Aws);
    const result = await pool_aws.request()
      .input('id', sql.TYPES.Int, newsId)
      .query(env.SCRIPTS.SELECT_USER_BY_ID);

    await pool_aws.close();

    if (result.recordset.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({error: 'News not found'})
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: result.recordset[0],
      }),
    };
  } catch (error) {
    console.error("Error executing query: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
      }),
    };
  }
};

module.exports.updateUser = async (event) => {
  try {
    const userId = parseInt(event.pathParameters.id, 10);
    const updateData = JSON.parse(event.body);

    const pool_aws = await connectToSqlDatabase(databases.db_Aws);

    const isInsertOperation = userId === 0;
    const sqlQuery = isInsertOperation ? env.SCRIPTS.INSERT_USER : env.SCRIPTS.UPDATE_USER;

    const request = pool_aws.request()
      .input('name', sql.TYPES.VarChar, updateData.name)
      .input('user', sql.TYPES.VarChar, updateData.user)
      .input('password', sql.TYPES.VarChar, updateData.password)
      .input('admin', sql.TYPES.Bit, updateData.admin ? 1 : 0)
      .input('active', sql.TYPES.Bit, updateData.active ? 1 : 0);

    if (!isInsertOperation) {
      request.input('id', sql.TYPES.Int, userId);
    }

    const result = await request.query(sqlQuery);
    await pool_aws.close();

    console.log(result);

    if (result.rowsAffected[0] === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({error: 'User not found or not inserted'})
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: isInsertOperation ? 'User created successfully' : 'User updated successfully'
      }),
    };
  } catch (error) {
    console.error("Error executing query: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
      }),
    };
  }
};

module.exports.deactivateUser = async (event, context, callback) => {
  try {
    const userId = event.pathParameters.id;

    const pool_aws = await connectToSqlDatabase(databases.db_Aws);
    const result = await pool_aws.request()
      .input('id', sql.TYPES.Int, userId)
      .input('removed', sql.TYPES.Bit, 1)
      .query(env.SCRIPTS.DEACTIVATE_USER);

    await pool_aws.close();

    if (result.rowsAffected[0] === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({error: 'User not found'})
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'User updated successfully'
      }),
    };
  } catch (error) {
    console.error("Error executing query: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
      }),
    };
  }
};

module.exports.loginUser = async (event) => {
  try {
    const {user, password} = JSON.parse(event.body);

    const pool = await connectToSqlDatabase(databases.db_Aws);
    const result = await pool.request()
      .input('user', sql.TYPES.VarChar, user)
      .input('password', sql.TYPES.VarChar, password)
      .query(env.SCRIPTS.GET_USER_BY_CREDENTIALS);

    await pool.close();

    if (result.recordset.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({message: "Unauthorized"}),
      };
    }

    const userData = result.recordset[0];

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Login successful",
        userData: {
          name: userData.name,
          user: userData.user,
        }
      }),
    };
  } catch (error) {
    console.error("Error on login: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({message: "Internal Server Error"}),
    };
  }
};