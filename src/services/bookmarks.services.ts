import databaseService from './database.services'
import { ObjectId, WithId } from 'mongodb'
import Bookmark from '~/models/schemas/Bookmark.schema'

class BookmarksService {
    async bookmarkTweet(user_id: string, tweetId: string) {
        const result = await databaseService.bookmarks.findOneAndUpdate(
            {
                user_id: new ObjectId(user_id),
                tweet_id: new ObjectId(tweetId)
            },
            {
                $setOnInsert: new Bookmark({
                    user_id: new ObjectId(user_id),
                    tweet_id: new ObjectId(tweetId)
                })
            },
            {
                upsert: true,
                returnDocument: 'after'
            }
        )
        return result as WithId<Bookmark>
    }
}

const bookmarksService = new BookmarksService()
export default bookmarksService
