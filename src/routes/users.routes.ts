import { Router } from 'express'
import { loginController } from '~/controllers/uses.controller'
import { loginValidator } from '~/middlewares/users.middlewares'
const usersRouter = Router()

usersRouter.use('/login', loginValidator, loginController)

export default usersRouter
