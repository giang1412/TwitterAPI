import { error } from 'console'
import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import usersService from '~/services/users.services'
import { validate } from '~/utils/validate'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({
            error: 'Missing email or password'
        })
    }
    next()
}
export const registerValidator = validate(
    checkSchema({
        name: {
            notEmpty: true,
            isString: true,
            isLength: {
                options: {
                    min: 1,
                    max: 100
                }
            },
            trim: true
        },
        email: {
            notEmpty: true,
            isString: true,
            isEmail: true,
            trim: true,
            custom: {
                options: async (value) => {
                    const isEmailExist = await usersService.checkEmailExist(value)
                    if (isEmailExist) {
                        throw new Error('Email đã tồn tại')
                    }
                    return true
                }
            }
        },
        password: {
            notEmpty: true,
            isLength: {
                options: {
                    min: 6,
                    max: 50
                }
            },
            isStrongPassword: {
                options: {
                    minLength: 6,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1
                },
                errorMessage:
                    'Mật khẩu phải có độ dài ít nhất 6 kí tự, trong đó bao gồm chữ hoa, chữ thường và kí tự đặc biệt'
            }
        },
        confirm_password: {
            notEmpty: true,
            isLength: {
                options: {
                    min: 6,
                    max: 50
                }
            },
            isStrongPassword: {
                options: {
                    minLength: 6,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1
                },
                errorMessage:
                    'Mật khẩu phải có độ dài ít nhất 6 kí tự, trong đó bao gồm chữ hoa, chữ thường và kí tự đặc biệt'
            },
            custom: {
                options: (value, { req }) => {
                    if (value !== req.body.password) {
                        throw new Error('Password confirmation does not match password')
                    }
                    return true
                }
            }
        },
        date_of_birth: {
            isISO8601: {
                options: {
                    strict: true,
                    strictSeparator: true
                }
            }
        }
    })
)
