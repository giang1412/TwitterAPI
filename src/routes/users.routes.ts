import { Router } from 'express'
import {
    verifyEmailController,
    loginController,
    logoutController,
    registerController,
    resendVerifyEmailController,
    forgotPasswordController,
    verifyForgotPasswordController,
    resetPasswordController,
    getMeController,
    updateMeController,
    getProfileController,
    followController
} from '~/controllers/users.controller'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
    accessTokenValidator,
    loginValidator,
    refreshTokenValidator,
    registerValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    emailVerifyTokenValidator,
    verifiedUserValidator,
    updateMeValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
import { wrapRequestHandler } from '~/utils/handlers'
const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Description Register a new user
 * path /register
 * Method: POST
 * Body: {name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601}
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description. Logout a user
 * Path: /logout
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */

usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

// //**
// * Description. Verify email when user client click on the link in email
// * Path: /verify-email
// * Method: POST
// * Body: { email_verify_token: string }
// */
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))

// //**
// * Description. Resend verify email when user client click on the link in email
// * Path: /resend-verify-email
// * Method: POST
// * Header: { Authorization: Bearer <access_token> }
// * Body: {}
// */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

// //**
// * Description. Submit email to reset password, send email to user
// * Path: /forgot-password
// * Method: POST
// * Body: {email: string}
// */
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

// //**
// * Description. Submit email to reset password, send email to user
// * Path: /forgot-password
// * Method: POST
// * Body: {email: string}
// */
usersRouter.post('/forgot-password', wrapRequestHandler(forgotPasswordController))

// //**
// * Description. Verify link in email to reset password
// * Path: /forgot-password
// * Method: POST
// * Body: {forgot_password_token: string}
// */
usersRouter.post('/verify-forgot-password', wrapRequestHandler(verifyForgotPasswordController))

// //**
// * Description. Reset password
// * Path: /reset_password
// * Method: POST
// * Body: {forgot_password_token: string, password: string, confirm_password: string}
// */
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

// //**
// * Description. Get information user
// * Path: /me
// * Method: GET
// * Header: { Authorization: Bearer <access_token> }
// */
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

// //**
// * Description. Update information user
// * Path: /me
// * Method: PATCH
// * Header: { Authorization: Bearer <access_token> }
// * Body: UserSchema
// */
usersRouter.patch(
    '/me',
    accessTokenValidator,
    verifiedUserValidator,
    updateMeValidator,
    filterMiddleware<UpdateMeReqBody>([
        'name',
        'date_of_birth',
        'bio',
        'location',
        'website',
        'username',
        'avatar',
        'cover_photo'
    ]),
    wrapRequestHandler(updateMeController)
)

// //**
// * Description. Get profile user
// * Path: /:username
// * Method: GET
// */
usersRouter.get('/:username', wrapRequestHandler(getProfileController))

// //**
// * Description. Follow someone
// * Path: /follow
// * Method: POST
// * Header: { Authorization: Bearer <access_token> }
// * Body: {followed_user_id: string}
// */
usersRouter.post('/follow', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(followController))
export default usersRouter
