import { NextFunction, Request, Response } from 'express'
import { handleUploadSingleImage } from '~/constants/file'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
    const data = await handleUploadSingleImage(req)
    return res.json({
        result: data
    })
}
