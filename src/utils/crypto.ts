import { createHash } from 'node:crypto'
import { envConfig } from '~/constants/config'

/**
 * Returns a SHA256 hash using SHA-2 for the given `content`.
 *
 * @see https://en.wikipedia.org/wiki/SHA-2
 *
 * @param {String} content
 *
 * @returns {String}
 */

export function sha256(content: string) {
    return createHash('sha256').update(content).digest('hex')
}

export function hashPassword(password: string) {
    return sha256(password + envConfig.passwordSecret)
}
