import { Router } from 'express'
import {
    verifyEmailController,
    loginController,
    logoutController,
    registerController,
    resendVerifyEmailController,
    forgotPasswordController
} from '~/controllers/users.controller'
import {
    accessTokenValidator,
    verifyEmailTokenValidator,
    loginValidator,
    refreshTokenValidator,
    registerValidator,
    forgotPasswordValidator
} from '~/middlewares/users.middlewares'
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
usersRouter.post('/verify-email', verifyEmailTokenValidator, wrapRequestHandler(verifyEmailController))

// //**
// * Description. Resend verify email when user client click on the link in email
// * Path: /resend-verify-email
// * Method: POST
// * Header: { Authorization: Bearer <access_token> }
// * Body: {}
// */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

// //**
// * Description. Resend verify email when user client click on the link in email
// * Path: /resend-verify-email
// * Method: POST
// * Header: { Authorization: Bearer <access_token> }
// * Body: {}
// */
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
export default usersRouter
