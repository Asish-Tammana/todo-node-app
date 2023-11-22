const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(process.env.PORT || 3004, () => {
      console.log("Server Running at http://localhost:3004/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit();
  }
};

initializeDBAndServer();

//API 1: GET all todos

app.get("/todos/", async (request, response) => {
  const givenValues = request.query;
  const { search_q = "", priority = "", status = "" } = givenValues;

  const getAllTodosQuery = `SELECT
      *
    FROM
      todo
      WHERE 
      todo LIKE '%${search_q}%' AND
      priority LIKE '%${priority}%'AND
      status LIKE '%${status}%'
      ;`;
  const dbResponse = await db.all(getAllTodosQuery);
  response.send(dbResponse);
});

//API 2: GET todo based on ID
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo
    WHERE id = ${todoId};`;

  const dbResponse = await db.get(getTodoQuery);
  response.send(dbResponse);
});

//API 3: ADD todo API

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;

  const { todoName, priorityGiven, statusGiven } = todoDetails;

  const addTodoQuery = `INSERT INTO 
  todo(todo,priority,status)
  VALUES(
      '${todoName}',
      '${priorityGiven}',
      '${statusGiven}'
  );
  `;

  await db.run(addTodoQuery);

  response.send("Todo Successfully Added");
});

//API 4: UPDATE todo API
app.put("/todos/:todoId/", async (request, response) => {
  const givenUpdate = request.body;
  const { todoId } = request.params;
  const givenProperty = Object.getOwnPropertyNames(givenUpdate)[0];
  const givenValue = givenUpdate[givenProperty];

  const updateTodoQuery = `
  UPDATE todo
  SET 
  '${givenProperty}' = '${givenValue}'
  WHERE id = ${todoId};`;

  await db.run(updateTodoQuery);

  let responseOutput = givenProperty[0].toUpperCase() + givenProperty.slice(1);

  response.send(`${responseOutput} Updated`);
});

//API 5: DELETE todo API

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo WHERE id = ${todoId};
    `;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

app.put("/sup/", async (req, res) => {
  const incrementQuery = `UPDATE stopT SET stopNum = stopNum + 1;`;
  await db.run(incrementQuery);

  const getStop = `SELECT stopNum FROM stopT;`;
  const dbResponse = await db.get(getStop);
  res.send(dbResponse);
});

app.get("/sdown/", async (req, res) => {
  const incrementQuery = `UPDATE stopT SET stopNum = CASE WHEN stopNum > 0 THEN stopNum - 1 ELSE 0 END;`;
  await db.run(incrementQuery);

  const getStop = `SELECT stopNum FROM stopT;`;
  const dbResponse = await db.get(getStop);
  res.send(dbResponse);
});

app.get("/stopnum/", async (req, res) => {
  const getStop = `SELECT stopNum FROM stopT;`;
  const dbResponse = await db.get(getStop);
  res.send(dbResponse);
});

module.exports = app;
