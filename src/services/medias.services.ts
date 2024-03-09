import { Request } from 'express'
import { getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { Media } from '~/models/Other'
import { EncodingStatus, MediaType } from '~/constants/enums'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import databaseService from './database.services'
import { uploadFileToS3 } from '~/utils/s3'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
config()

class Queue {
    items: string[]
    encoding: boolean
    constructor() {
        this.items = []
        this.encoding = false
    }
    async enqueue(item: string) {
        this.items.push(item)
        const idName = getNameFromFullname(item.split('\\').pop() as string)
        await databaseService.videoStatus.insertOne(
            new VideoStatus({
                name: idName,
                status: EncodingStatus.Pending
            })
        )
        this.processEncode()
    }
    async processEncode() {
        if (this.encoding) return
        if (this.items.length > 0) {
            this.encoding = true
            const videoPath = this.items[0]
            const idName = getNameFromFullname(videoPath.split('\\').pop() as string)
            await databaseService.videoStatus.updateOne(
                {
                    name: idName
                },
                {
                    $set: {
                        status: EncodingStatus.Processing
                    },
                    $currentDate: {
                        updated_at: true
                    }
                }
            )
            try {
                await encodeHLSWithMultipleVideoStreams(videoPath)
                this.items.shift()
                await fsPromise.unlink(videoPath)
                await databaseService.videoStatus.updateOne(
                    {
                        name: idName
                    },
                    {
                        $set: {
                            status: EncodingStatus.Succeed
                        },
                        $currentDate: {
                            updated_at: true
                        }
                    }
                )
            } catch (error) {
                await databaseService.videoStatus
                    .updateOne(
                        {
                            name: idName
                        },
                        {
                            $set: {
                                status: EncodingStatus.Failed
                            },
                            $currentDate: {
                                updated_at: true
                            }
                        }
                    )
                    .catch((err) => {
                        console.error('Update video status error', err)
                    })
            }
            this.encoding = false
            this.processEncode()
        } else {
            console.log('Encode video queue is empty!')
        }
    }
}
const queue = new Queue()
class MediasService {
    async uploadImage(req: Request) {
        const files = await handleUploadImage(req)
        const result: Media[] = await Promise.all(
            files.map(async (file) => {
                const newName = getNameFromFullname(file.newFilename)
                const newFullFilename = `${newName}.jpg`
                const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFilename)
                sharp.cache(false)
                await sharp(file.filepath).jpeg().toFile(newPath)
                const mime = (await import('mime')).default
                const s3Result = await uploadFileToS3({
                    filename: newFullFilename,
                    filepath: newPath,
                    contentType: mime.getType(newPath) as string
                })
                await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])
                return {
                    url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
                    type: MediaType.Image
                }
            })
        )
        return result
    }
    async uploadVideo(req: Request) {
        const files = await handleUploadVideo(req)
        const result: Media[] = files.map((file) => {
            return {
                url: isProduction
                    ? `${process.env.HOST}/static/video/${file.newFilename}`
                    : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
                type: MediaType.Video
            }
        })
        return result
    }
    async uploadVideoHLS(req: Request) {
        const files = await handleUploadVideo(req)

        const result: Media[] = await Promise.all(
            files.map(async (file) => {
                const newName = getNameFromFullname(file.newFilename)
                queue.enqueue(file.filepath)
                return {
                    url: isProduction
                        ? `${process.env.HOST}/static/video-hls/${newName}.m3u8`
                        : `http://localhost:${process.env.PORT}/static/video-hls/${newName}.m3u8`,
                    type: MediaType.HLS
                }
            })
        )
        return result
    }
    async getVideoStatus(id: string) {
        const data = await databaseService.videoStatus.findOne({ name: id })
        console.log('data:', data)
        return data
    }
}

const mediasService = new MediasService()

export default mediasService
