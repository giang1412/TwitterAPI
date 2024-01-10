import { Request } from 'express'
import { getNameFromFullname, handleUploadImage } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { Media } from '~/models/Other'
import { MediaType } from '~/constants/enums'
config()
class MediasService {
    async uploadImage(req: Request) {
        const files = await handleUploadImage(req)
        const result: Media[] = await Promise.all(
            files.map(async (file) => {
                const newName = getNameFromFullname(file.newFilename)
                const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
                sharp.cache(false)
                await sharp(file.filepath).jpeg().toFile(newPath)
                fs.unlinkSync(file.filepath)
                return {
                    url: isProduction
                        ? `${process.env.HOST}/static/image/${newName}.jpg`
                        : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
                    type: MediaType.Image
                }
            })
        )
        return result
    }
}

const mediasService = new MediasService()

export default mediasService
