import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
const app = express()
const port = 3000

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
app.use(express.json())
app.use('/user', usersRouter)
databaseService.connect()
