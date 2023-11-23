import { MongoClient, ServerApiVersion } from 'mongodb'
import { config } from 'dotenv'
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
    constructor() {
        this.client = new MongoClient(uri)
    }
    async connect() {
        try {
            // Connect the client to the server	(optional starting in v4.7)
            await client.connect()
            // Send a ping to confirm a successful connection
            await client.db('admin').command({ ping: 1 })
            console.log('Pinged your deployment. You successfully connected to MongoDB!')
        } finally {
            // Ensures that the client will close when you finish/error
            await client.close()
        }
    }
}

// Tạo Object từ class DatabaseService
const databaseService = new DataService()
export default databaseService
