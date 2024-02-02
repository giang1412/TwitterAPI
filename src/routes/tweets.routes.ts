import { Router } from 'express'
import { createTweetController, getTweetController } from '~/controllers/tweets.controller'
import { audienceValidator, createTweetValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetsRouter = Router()
/**
 * Description: Create tweets
 * path /
 * Method: POST
 * Body: TweetRequestBody
 */
tweetsRouter.post(
    '/',
    accessTokenValidator,
    verifiedUserValidator,
    createTweetValidator,
    wrapRequestHandler(createTweetController)
)

/**
 * Description: Get tweets detail
 * path /:tweet_id
 * Method: GET
 */
tweetsRouter.get(
    '/:tweet_id',
    tweetIdValidator,
    isUserLoggedInValidator(accessTokenValidator),
    isUserLoggedInValidator(verifiedUserValidator),
    audienceValidator,
    wrapRequestHandler(getTweetController)
)

export default tweetsRouter
