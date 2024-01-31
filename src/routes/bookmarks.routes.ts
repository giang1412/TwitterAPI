import { Router } from 'express'
import { bookmarkTweetController, unbookmarkTweetController } from '~/controllers/bookmarks.controller'
import { createTweetController } from '~/controllers/tweets.controller'
import { createTweetValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRouter = Router()
/**
 * Description: Create tweets
 * path /
 * Method: POST
 * Body: TweetRequestBody
 * Header: {Authorization: Bearer <access_token>}
 */
bookmarksRouter.post(
    '',
    accessTokenValidator,
    verifiedUserValidator,
    tweetIdValidator,
    wrapRequestHandler(bookmarkTweetController)
)

/**
 * Description: Create tweets
 * path /tweets/:tweet_id
 * Method: DELETE
 * Body: TweetRequestBody
 * Header: {Authorization: Bearer <access_token>}
 */
bookmarksRouter.delete(
    '/tweets/:tweet_id',
    accessTokenValidator,
    verifiedUserValidator,
    tweetIdValidator,
    wrapRequestHandler(unbookmarkTweetController)
)

export default bookmarksRouter
