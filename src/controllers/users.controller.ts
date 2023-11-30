/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests'

import usersService from '~/services/users.services'

export const loginController = (req: Request, res: Response) => {
    const { email, password } = req.body
    if (email == 'hng@gmail.com' && password == '123123') {
        return res.json({
            message: 'Login success'
        })
    }
    return res.status(400).json({
        message: 'Login fail'
    })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
    try {
        const result = await usersService.register(req.body)
        return res.json({
            message: 'Register success',
            result
        })
    } catch (error) {
        return res.status(400).json({
            message: 'Register fail',
            error
        })
    }
}
