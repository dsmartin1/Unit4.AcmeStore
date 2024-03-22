require('dotenv').config()

const {
  client,
  createTables,
  createUser,
  createProduct,
  createFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  destroyFavorite
} = require('./db')
const express = require('express')
const app = express()
app.use(express.json())

// GET routes
app.get('/api/users',  async(req, res, next)=> {
  try {
    res.send(await fetchUsers())
  }
  catch(error){
    next(error);
  }
})

app.get('/api/products',  async(req, res, next)=> {
  try {
    res.send(await fetchProducts());
  }
  catch(error){
    next(error)
  }
});

app.get('/api/users/:user_id/favorites',  async(req, res, next)=> {
  try {
    res.send(await fetchFavorites({user_id: req.params.user_id}))
  }
  catch(error){
    next(error)
  }
});

// DELETE routes
app.delete('/api/users/:user_id/favorites/:id',  async(req, res, next)=> {
  try {
    await destroyFavorite({user_id: req.params.user_id, id: req.params.id})
    res.sendStatus(204)
  }
  catch(error){
    next(error)
  }
});

// POST routes
app.post('/api/users/:user_id/favorites',  async(req, res, next)=> {
  try {
    res.status(201).send(await createFavorite({ user_id: req.params.user_id, product_id: req.body.product_id}))
  }
  catch(error){
    next(error)
  }
});

// error handling
app.use((err, req, res, next)=> {
  res.status(err.status || 500).send({ error: err.message || err })
})

// init function
const init = async () => {
  await client.connect()
  console.log('db connected')
  await createTables()
  console.log('tables created')
  const [moe, lucy, ethyl, anvil, safe, bomb] = await Promise.all([
    createUser({ username: 'moe', password: 's3cr3t'}),
    createUser({ username: 'lucy', password: 's3cr3t'}),
    createUser({ username: 'ethyl', password: 'shhh'}),
    createProduct({ name: 'anvil'}),
    createProduct({ name: 'safe'}),
    createProduct({ name: 'bomb'}),
  ])
  console.log(await fetchUsers())
  console.log(await fetchProducts())

  const [favorite] = await Promise.all([
    createFavorite({ user_id: moe.id, product_id: bomb.id}),
    createFavorite({ user_id: moe.id, product_id: safe.id}),
    createFavorite({ user_id: ethyl.id, product_id: safe.id}),
    createFavorite({ user_id: lucy.id, product_id: anvil.id}),
  ])

  await destroyFavorite({ id: favorite.id, user_id: favorite.user_id})
  
  console.log(await fetchFavorites({user_id: moe.id}))
}

// Listener
const port = process.env.PORT || 3000
app.listen(port, ()=> {
  console.log(`listening on port ${port}`)
})

init()