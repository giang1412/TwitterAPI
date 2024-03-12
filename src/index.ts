import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import cors from 'cors'
import tweetsRouter from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import likesRouter from './routes/likes.routes'
import searchRouter from './routes/search.routes'
import { createServer } from 'http'
import { Server } from 'socket.io'
// import '~/utils/fake'

config()

databaseService.connect().then(() => {
    databaseService.indexUsers()
    databaseService.indexRefreshTokens()
    databaseService.indexVideoStatus()
    databaseService.indexFollowers()
    databaseService.indexTweets()
})
const app = express()
const httpServer = createServer(app)
const port = process.env.PORT || 4000

initFolder()

app.use(express.json())
app.use(cors())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likesRouter)
app.use('/search', searchRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

app.use(defaultErrorHandler)

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000'
    }
})

const users: {
    [key: string]: {
        socket_id: string
    }
} = {}
io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected`)
    const user_id = socket.handshake.auth._id
    users[user_id] = {
        socket_id: socket.id
    }
    console.log(users)
    socket.on('private message', (data) => {
        const receiver_socket_id = users[data.to].socket_id
        socket.to(receiver_socket_id).emit('receive private message', {
            content: data.content,
            from: user_id
        })
    })
    socket.on('disconnect', () => {
        delete users[user_id]
        console.log(`user ${socket.id} disconnected`)
        console.log(users)
    })
})

httpServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
