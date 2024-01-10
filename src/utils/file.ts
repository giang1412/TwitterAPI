import { Request } from 'express'
import { File } from 'formidable'
import fs from 'fs'
import { UPLOAD_IMAGE_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
    if (!fs.existsSync(UPLOAD_IMAGE_TEMP_DIR)) {
        fs.mkdirSync(UPLOAD_IMAGE_TEMP_DIR, {
            recursive: true // mục đích là để tạo folder nested
        })
    }
}
export const handleUploadImage = async (req: Request) => {
    const formidable = (await import('formidable')).default
    const form = formidable({
        uploadDir: UPLOAD_IMAGE_TEMP_DIR,
        maxFiles: 4,
        keepExtensions: true,
        maxFileSize: 10000 * 1024, // 1000KB
        maxTotalFileSize: 10000 * 1024 * 4,
        filter: function ({ name, originalFilename, mimetype }) {
            const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
            if (!valid) {
                form.emit('error' as any, new Error('File type is not valid') as any)
            }
            return valid
        }
    })
    return new Promise<File[]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                return reject(err)
            }
            // eslint-disable-next-line no-extra-boolean-cast
            if (!Boolean(files.image)) {
                return reject(new Error('File is empty'))
            }
            resolve(files.image as File[])
        })
    })
}

export const getNameFromFullname = (fullname: string) => {
    const namearr = fullname.split('.')
    namearr.pop()
    return namearr.join('')
}
