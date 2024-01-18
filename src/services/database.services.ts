import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter-dev.wxgvvxz.mongodb.net/?retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
})

class DataService {
    private client: MongoClient
    private db: Db
    constructor() {
        this.client = new MongoClient(uri)
        this.db = client.db(process.env.DB_NAME)
    }
    async connect() {
        try {
            // Connect the client to the server	(optional starting in v4.7)
            await client.connect()
            // Send a ping to confirm a successful connection
            await this.db.command({ ping: 1 })
            console.log('Pinged your deployment. You successfully connected to MongoDB!')
        } catch (error) {
            // Ensures that the client will close when you finish/error
            console.log('Error', error)
            throw error
        }
    }

    indexUser() {
        this.users.createIndex({ email: 1, password: 1 })
        this.users.createIndex({ email: 1 }, { unique: true })
        this.users.createIndex({ username: 1 }, { unique: true })
    }

    get users(): Collection<User> {
        return this.db.collection(process.env.DB_USER_COLLECTION as string)
    }

    get refreshTokens(): Collection<RefreshToken> {
        return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
    }

    get followers(): Collection<Follower> {
        return this.db.collection(process.env.DB_FOLLOWER_COLLECTION as string)
    }

    get videoStatus(): Collection<VideoStatus> {
        return this.db.collection(process.env.DB_VIDEO_STATUS_COLLECTION as string)
    }
}

// Tạo Object từ class DatabaseService
const databaseService = new DataService()
export default databaseService
