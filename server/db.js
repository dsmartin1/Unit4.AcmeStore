const pg = require('pg')
const client = new pg.Client(process.env.DATABASE_URL || `postgres://localhost/${process.env.DB_NAME}`)
const uuid = require('uuid')
const bcrypt = require('bcrypt')

// seeding tables
const createTables = async () => {
  const SQL = /*SQL*/ `
  DROP TABLE IF EXISTS favorites;
  DROP TABLE IF EXISTS products;
  DROP TABLE IF EXISTS users;

  CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
  );
  CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
  );
  CREATE TABLE favorites (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    CONSTRAINT unique_user_id_product_id UNIQUE (user_id, product_id)
  );
`
await client.query(SQL)
}

// POST functions
const createUser = async ({ username, password }) => {
const SQL = /*SQL*/`
  INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *;
`
const response = await client.query(SQL, [uuid.v4(), username, await bcrypt.hash(password, 5)])
return response.rows[0]
}

const createProduct = async(name)=> {
const SQL = /*SQL*/`
  INSERT INTO products(id, name) VALUES($1, $2) RETURNING *;
`
const response = await client.query(SQL, [uuid.v4(), name])
return response.rows[0];
}

const createFavorite = async({ product_id, user_id })=> {
const SQL = /*SQL*/`
  INSERT INTO favorites(id, product_id, user_id) VALUES($1, $2, $3) RETURNING *;
`
const response = await client.query(SQL, [uuid.v4(), product_id, user_id])
return response.rows[0]
}

// GET functions
const fetchUsers = async()=> {
const SQL = /*SQL*/`
  SELECT *
  FROM users;
`
const response = await client.query(SQL)
return response.rows
};

const fetchProducts = async()=> {
const SQL = /*SQL*/`
  SELECT *
  FROM products;
`
const response = await client.query(SQL)
return response.rows
};

const fetchFavorites = async({ user_id })=> {
const SQL = /*SQL*/`
  SELECT *
  FROM favorites
  WHERE user_id = $1;
`
const response = await client.query(SQL, [user_id])
return response.rows
}

// DELETE functions
const destroyFavorite = async({ id, user_id }) => { 
console.log(id, user_id)
const SQL = /*SQL*/`
  DELETE FROM favorites
  WHERE id = $1 AND user_id=$2;
`;
await client.query(SQL, [id, user_id])
}

// exports
module.exports = {
  client,
  createTables,
  createUser,
  createFavorite,
  createProduct,
  fetchProducts,
  fetchUsers,
  fetchFavorites,
  destroyFavorite
}