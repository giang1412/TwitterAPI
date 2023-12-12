import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { USERS_MESSAGES } from '~/constants/messages'
config()
class UsersService {
    private signAccessToken(user_id: string) {
        return signToken({
            payload: {
                user_id,
                token_type: TokenType.AccessToken
            },
            privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
            options: {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
            }
        })
    }

    private signRefreshToken(user_id: string) {
        return signToken({
            payload: {
                user_id,
                token_type: TokenType.RefreshToken
            },
            privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
            options: {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
            }
        })
    }

    private signAccessTokenAndRefreshToken(user_id: string) {
        return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
    }

    async register(payload: RegisterReqBody) {
        const user_id = new ObjectId()
        const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
        await databaseService.users.insertOne(
            new User({
                ...payload,
                _id: user_id,
                email_verify_token,
                date_of_birth: new Date(payload.date_of_birth),
                password: hashPassword(payload.password)
            })
        )
        const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id.toString())
        await databaseService.refreshTokens.insertOne(
            new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
        )
        console.log('email_verify_token: ', email_verify_token)
        return {
            access_token,
            refresh_token
        }
    }

    async login(user_id: string) {
        const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)
        await databaseService.refreshTokens.insertOne(
            new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
        )
        return {
            access_token,
            refresh_token
        }
    }

    async logout(refresh_token: string) {
        await databaseService.refreshTokens.deleteOne({ token: refresh_token })
        return {
            message: USERS_MESSAGES.LOGOUT_SUCCESS
        }
    }

    private signEmailVerifyToken(user_id: string) {
        return signToken({
            payload: {
                user_id,
                token_type: TokenType.EmailVerifyToken
            },
            privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
            options: {
                expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
            }
        })
    }
    // Check email có tồn tại hay không
    async checkEmailExist(email: string) {
        const user = await databaseService.users.findOne({ email })
        return Boolean(user)
    }

    async verifyEmail(user_id: string) {
        const [token] = await Promise.all([
            this.signAccessTokenAndRefreshToken(user_id),
            databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
                {
                    $set: {
                        email_verify_token: '',
                        verify: UserVerifyStatus.Verified,
                        updated_at: '$$NOW'
                    }
                }
            ])
        ])
        const [access_token, refresh_token] = token
        return {
            access_token,
            refresh_token
        }
    }

    async resendEmailVerify(user_id: string) {
        // Giả sử thay thế phương thức gửi mail bằng console.log
        const email_verify_token = await this.signEmailVerifyToken(user_id)
        console.log('Resend verify email: ', email_verify_token)

        await databaseService.users.updateOne(
            { id: new ObjectId(user_id) },
            {
                $set: {
                    email_verify_token
                },
                $currentDate: {
                    updated_at: true
                }
            }
        )
        return {
            message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
        }
    }
}
const usersService = new UsersService()
export default usersService
