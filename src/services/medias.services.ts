import { Request } from 'express'
import { getNameFromFullname, handleUploadSingleImage } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'

class MediasService {
    async handleUploadSingleImage(req: Request) {
        const file = await handleUploadSingleImage(req)
        const newName = getNameFromFullname(file.newFilename)
        const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
        console.log('file: ', file)
        console.log('newName: ', newName)
        console.log('newPath: ', newPath)
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)
        return `http://localhost:3000/uploads/${newName}.jpg`
    }
}

const mediasService = new MediasService()

export default mediasService
