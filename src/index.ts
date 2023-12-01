import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
const app = express()
const port = 3000

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
app.use(express.json())
databaseService.connect()

app.use('/user', usersRouter)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(400).json({ error: err.message })
})
