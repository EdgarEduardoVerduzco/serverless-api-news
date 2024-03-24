'use strict'
//#region script
const SELECT_LIST_NEWS_PAGINATED = `SELECT id, title, news, link, date, image 
FROM test_news.dbo.news
ORDER BY id ASC
OFFSET (@PageNumber - 1) * @PageSize ROWS FETCH NEXT @PageSize ROWS ONLY;`

const SELECT_NEWS_BY_ID = `SELECT id, title, news, link, date, image
FROM test_news.dbo.news
WHERE id = @id;`

const SELECT_LIST_USERS = `SELECT id, name, [user], active, image, admin
FROM test_news.dbo.users
WHERE removed = 0`

const SELECT_USER_BY_ID = `SELECT id, name, [user], active, image, admin, password
FROM test_news.dbo.users
WHERE id = @id;`

const UPDATE_USER = `UPDATE test_news.dbo.users
SET [user]   = @user,
    name     = @name,
    admin    = @admin,
    password = @password,
    active   = @active
WHERE id = @id`

const INSERT_USER = `INSERT INTO test_news.dbo.users (name, password, active, image, admin, [user], removed)
VALUES (@name, @password, @active, null, @admin, @user, 0);`

const DEACTIVATE_USER = `UPDATE test_news.dbo.users
SET removed = @removed
WHERE id = @id;`

const GET_USER_BY_CREDENTIALS = `
  SELECT *
  FROM test_news.dbo.users
  WHERE [user] = @user AND password = @password AND active = 1 AND removed = 0
`;
//#endregion

module.exports = {
  SCRIPTS: {
    SELECT_LIST_NEWS_PAGINATED,
    SELECT_NEWS_BY_ID,
    SELECT_LIST_USERS,
    SELECT_USER_BY_ID,
    UPDATE_USER,
    INSERT_USER,
    DEACTIVATE_USER,
    GET_USER_BY_CREDENTIALS
  },
  SECRET_MANAGER: {
    CONNECTION_DB_AWS: 'aws_database_credentials',
  },
  REGION: 'us-east-1'
}