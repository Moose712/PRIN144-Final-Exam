const express = require('express');
const { sql } = require('@vercel/postgres');
require('dotenv').config();

const app = express();
app.use(express.json());


app.get('/', (req, res) => {
  res.send('PRIN144-Final-Exam: Mark Gervacio');
});


app.get('/employees', async (req, res) => {
  try {
    const employees = await sql`SELECT * FROM Employees ORDER BY Id;`;
    res.json(employees.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.get('/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await sql`SELECT * FROM Employees WHERE Id = ${id};`;

    if (employee.rowCount > 0) {
      res.json(employee.rows[0]);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.post('/employees', async (req, res) => {
  const { firstName, lastName, position, department, isWorkingFromHome } = req.body;

  if (!firstName || !lastName || !position || !department || isWorkingFromHome === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const result = await sql`
      INSERT INTO Employees (first_name, last_name, position, department, is_working_from_home)
      VALUES (${firstName}, ${lastName}, ${position}, ${department}, ${isWorkingFromHome})
      RETURNING Id;
    `;
    res.status(201).json({ message: 'Employee created', id: result.rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.put('/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, position, department, isWorkingFromHome } = req.body;

  
  const updateFields = {};
  if (firstName) updateFields.first_name = firstName;
  if (lastName) updateFields.last_name = lastName;
  if (position) updateFields.position = position;
  if (department) updateFields.department = department;
  if (isWorkingFromHome !== undefined) updateFields.is_working_from_home = isWorkingFromHome;

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: 'At least one field must be provided to update' });
  }

  try {
    const updateQuery = await sql`
      UPDATE Employees
      SET ${sql(updateFields)}
      WHERE Id = ${id}
      RETURNING *;
    `;

    if (updateQuery.rowCount > 0) {
      res.json(updateQuery.rows[0]);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.delete('/employees/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleteQuery = await sql`DELETE FROM Employees WHERE Id = ${id} RETURNING Id;`;

    if (deleteQuery.rowCount > 0) {
      res.status(204).send(); 
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = app;
