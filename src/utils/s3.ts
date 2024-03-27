import { S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Response } from 'express'
import fs from 'fs'
import { envConfig } from '~/constants/config'
import HTTP_STATUS from '~/constants/httpStatus'

const s3 = new S3({
    region: envConfig.awsRegion,
    credentials: {
        secretAccessKey: envConfig.awsSecretAccessKey as string,
        accessKeyId: envConfig.awsAccessKeyId as string
    }
})

export const uploadFileToS3 = ({
    filename,
    filepath,
    contentType
}: {
    filename: string
    filepath: string
    contentType: string
}) => {
    const parallelUploads3 = new Upload({
        client: s3,
        params: {
            Bucket: envConfig.s3BucketName as string,
            Key: filename,
            Body: fs.readFileSync(filepath),
            ContentType: contentType
        },
        tags: [
            /*...*/
        ], // optional tags
        queueSize: 4, // optional concurrency configuration
        partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
        leavePartsOnError: false // optional manually handle dropped parts
    })
    return parallelUploads3.done()
}

// parallelUploads3.on('httpUploadProgress', (progress) => {
//   console.log(progress)
// })

// parallelUploads3.done().then((res) => {
//   console.log(res)
// })

export const sendFileFromS3 = async (res: Response, filepath: string) => {
    try {
        const data = await s3.getObject({
            Bucket: envConfig.s3BucketName as string,
            Key: filepath
        })
        ;(data.Body as any).pipe(res)
    } catch (error) {
        res.status(HTTP_STATUS.NOT_FOUND).send('Not found')
    }
}
