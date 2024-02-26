import { Request, Response } from 'express'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/requests/User.requests'
import tweetsService from '~/services/tweets.services'
import { TweetType } from '~/constants/enums'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await tweetsService.createTweet(user_id, req.body)
    return res.json({
        message: 'Create Tweet Successfully',
        result
    })
}
export const getTweetController = async (req: Request, res: Response) => {
    const result = await tweetsService.increaseView(req.params.tweet_id, req.decoded_authorization?.user_id)
    const tweet = {
        ...req.tweet,
        guest_views: result.guest_views,
        user_views: result.user_views
    }
    return res.json({
        message: 'Get Tweet Successfully',
        result: tweet
    })
}

export const getTweetChildrenController = async (req: Request, res: Response) => {
    const tweet_type = Number(req.query.tweet_type as string) as TweetType
    const limit = Number(req.query.limit as string)
    const page = Number(req.query.page as string)
    const { total, tweets } = await tweetsService.getTweetChildren({
        tweet_id: req.params.tweet_id,
        tweet_type,
        limit,
        page
    })
    return res.json({
        message: 'Get Tweet Children Successfully',
        result: {
            tweets,
            tweet_type,
            limit,
            page,
            total_page: Math.ceil(total / limit)
        }
    })
}
