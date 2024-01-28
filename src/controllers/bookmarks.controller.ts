import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/requests/User.requests'
import { BookmarkTweetReqBody } from '~/models/requests/Bookmark.requests'
import bookmarksService from '~/services/bookmarks.services'
import { BOOKMARK_MESSAGES } from '~/constants/messages'

export const bookmarkTweetController = async (
    req: Request<ParamsDictionary, any, BookmarkTweetReqBody>,
    res: Response
) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await bookmarksService.bookmarkTweet(user_id, req.body.tweet_id)
    return res.json({
        message: BOOKMARK_MESSAGES.BOOKMARK_SUCCESSFULLY,
        result
    })
}

export const unbookmarkTweetController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    await bookmarksService.unBookmarkByTweetId(user_id, req.params.tweet_id)
    return res.json({
        message: BOOKMARK_MESSAGES.UNBOOKMARK_SUCESSFULLY
    })
}
