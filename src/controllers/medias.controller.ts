import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'
import fs from 'fs'
import { sendFileFromS3 } from '~/utils/s3'
export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
    const url = await mediasService.uploadImage(req)
    return res.json({
        message: USERS_MESSAGES.UPLOAD_SUCCESS,
        result: url
    })
}

export const serveImageController = async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params
    return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
        if (err) {
            res.status((err as any).status).send('Not found')
        }
    })
}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
    const url = await mediasService.uploadVideo(req)
    return res.json({
        message: USERS_MESSAGES.UPLOAD_SUCCESS,
        result: url
    })
}

export const uploadVideoHLSController = async (req: Request, res: Response, next: NextFunction) => {
    const url = await mediasService.uploadVideoHLS(req)
    return res.json({
        message: USERS_MESSAGES.UPLOAD_SUCCESS,
        result: url
    })
}

export const serveVideoStreamController = async (req: Request, res: Response, next: NextFunction) => {
    const range = req.headers.range
    if (!range) {
        return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header')
    }
    const { name } = req.params
    const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
    // 1MB = 10^6 bytes (Tính theo hệ 10, đây là thứ mà chúng ta hay thấy trên UI)
    // Còn nếu tính theo hệ nhị phân thì 1MB = 2^20 bytes (1024 * 1024)

    // Dung lượng video (bytes)
    const videoSize = fs.statSync(videoPath).size
    // DUng lượng video cho mỗi phân đoạn stream
    const chunkSize = 10 ** 6 // 1MB
    // Lấy giá trị byte bắt đầu từ header Range (vd: bytes=1048576-)
    const start = Number(range.replace(/\D/g, ''))
    // Lấy giá trị byte kết thúc, vượt quá dung lượng video thì lấy giá trị videoSize
    const end = Math.min(start + chunkSize, videoSize - 1)

    // Dung lượng thực tế cho mỗi đoạn video stream
    // THường đây sẽ là chunkSize, ngoại trừ đoạn cuối cùng
    const contentLength = end - start + 1
    const mime = (await import('mime')).default
    const contentType = mime.getType(videoPath) || 'video/*'
    const headers = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': contentType
    }
    res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
    const videoSteams = fs.createReadStream(videoPath, { start, end })
    videoSteams.pipe(res)
}

export const serveM3u8Controller = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    sendFileFromS3(res, `videos-hls/${id}/master.m3u8`)
}

export const serveSegmentController = (req: Request, res: Response, next: NextFunction) => {
    const { id, v, segment } = req.params
    sendFileFromS3(res, `videos-hls/${id}/${v}/${segment}`)
}
export const videoStatusController = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const result = await mediasService.getVideoStatus(id as string)
    return res.json({
        message: USERS_MESSAGES.GET_VIDEO_STATUS_SUCCESS,
        result: result
    })
}
