import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
config()
databaseService.connect()
const app = express()
const port = process.env.PORT || 4000

initFolder()

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)

///app.use('/static', express.static(UPLOAD_DIR))
app.use('/static', staticRouter)
app.use(defaultErrorHandler)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
