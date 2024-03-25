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
import Conversation from './models/schemas/Conversions.schema'
import conversationsRouter from './routes/conversations.routes'
import { ObjectId } from 'mongodb'
import { TokenPayload } from './models/requests/User.requests'
import { UserVerifyStatus } from './constants/enums'
import { ErrorWithStatus } from './models/Error'
import { USERS_MESSAGES } from './constants/messages'
import HTTP_STATUS from './constants/httpStatus'
import { verifyAccessToken } from './utils/common'
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
app.use('/conversations', conversationsRouter)
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

io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth
    const access_token = Authorization?.split(' ')[1]
    try {
        const decoded_authorization = await verifyAccessToken(access_token)
        const { verify } = decoded_authorization as TokenPayload
        if (verify !== UserVerifyStatus.Verified) {
            throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_VERIFIED,
                status: HTTP_STATUS.FORBIDDEN
            })
        }
        // Truyền decoded_authorization vào socket để sử dụng ở các middleware khác
        socket.handshake.auth.decoded_authorization = decoded_authorization
        socket.handshake.auth.access_token = access_token
        next()
    } catch (error) {
        next({
            message: 'Unauthorized',
            name: 'UnauthorizedError',
            data: error
        })
    }
})

io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected`)
    const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload
    users[user_id] = {
        socket_id: socket.id
    }

    socket.use(async (packet, next) => {
        const { access_token } = socket.handshake.auth
        try {
            await verifyAccessToken(access_token)
            next()
        } catch (error) {
            next(new Error('Unauthorized'))
        }
    })
    socket.on('error', (error) => {
        if (error.message === 'Unauthorized') {
            socket.disconnect()
        }
    })
    socket.on('send_message', async (data) => {
        const { receiver_id, sender_id, content } = data.payload
        const receiver_socket_id = users[receiver_id]?.socket_id

        const conversation = new Conversation({
            sender_id: new ObjectId(sender_id),
            receiver_id: new ObjectId(receiver_id),
            content: content
        })
        const result = await databaseService.conversations.insertOne(conversation)
        conversation._id = result.insertedId
        if (!receiver_socket_id) {
            socket.to(receiver_socket_id).emit('receive_message', {
                payload: conversation
            })
        }
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
