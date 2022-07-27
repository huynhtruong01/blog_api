const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const {
    generateActiveToken,
    generateAccessToken,
    generateRefreshToken,
} = require('../config/generateToken')
const { sendEmail } = require('../config/sendMail')
const { validateEmail, validPhone } = require('../middleware/isValid')
const { sendSms } = require('../config/sendSMS')
const jwt = require('jsonwebtoken')
const { hashPassword } = require('../utils/hashPassword')

const AuthController = {
    // register
    register: async (req, res) => {
        try {
            // if user registered
            const user = await User.findOne({ email: req.body.email })
            if (user) {
                return res.status(400).json({
                    message:
                        'Email hoặc số điện thoại của bạn đã tồn tại. Vui lòng đăng nhập để vào trang web',
                })
            }

            const newUser = { ...req.body }

            const baseUrl = `${process.env.BASE_URL}`
            const activeToken = generateActiveToken({ newUser })
            const url = `${baseUrl}/active/${activeToken}`

            if (validateEmail(req.body.email)) {
                await sendEmail(req.body.email, url, 'Xác minh email của bạn')
                return res.status(200).json({
                    user: newUser,
                    message: 'Đã đăng ký thành công. Vui lòng kiểm tra email của bạn để xác minh',
                    activeToken,
                })
            }

            if (validPhone(req.body.email)) {
                await sendSms(req.body.email, url, 'Xác minh số điện thoại của bạn')
                return res.status(200).json({
                    user: newUser,
                    message:
                        'Đã đăng ký thành công. Vui lòng kiểm tra điện thoại của bạn để xác minh',
                    activeToken,
                })
            }
        } catch (error) {
            res.status(500).json({
                error: error.message,
                message: 'Đăng ký thất bại. Vui lòng đăng ký lại',
            })
        }
    },
    // active token when register
    activeToken: async (req, res) => {
        try {
            const decoded = jwt.verify(req.body.activeToken, process.env.ACTIVE_TOKEN_SECRET)

            if (!decoded || Object.keys(decoded).length === 0) {
                return res.status(400).json({ message: 'Token không hợp lệ. Vui lòng đăng ký lại' })
            }

            const { newUser } = decoded

            // check email
            const hasEmail = await User.findOne({ email: newUser.email })
            if (hasEmail) {
                return res.status(400).json({
                    message:
                        'Email hoặc số điện thoại này đã tồn tại. Vui lòng đăng nhập để vào trang web',
                })
            }

            // add user
            const salt = await bcrypt.genSalt(Number.parseInt(process.env.SALT_ROUND))
            const password = await bcrypt.hash(newUser.password, salt)
            const user = new User({ ...newUser, password })
            await user.save()

            res.status(200).json({ user: user, message: 'Đăng ký thành công' })
        } catch (error) {
            res.status(500).json({
                error: error.message,
                message: 'Đăng ký thất bại. Vui lòng đăng ký lại',
            })
        }
    },
    // login
    login: async (req, res) => {
        try {
            // check email
            const user = await User.findOne({ email: req.body.email }).populate('role')
            if (!user) {
                return res
                    .status(404)
                    .json({ message: 'Tài khoản này không tồn tại. Vui lòng đăng ký tài khoản' })
            }

            // compare password
            const isValidPassword = await bcrypt.compare(req.body.password, user.password)

            if (!isValidPassword) {
                return res.status(400).json({ message: 'Mật khẩu khồng đúng. Vui lòng thử lại' })
            }

            const accessToken = generateAccessToken({ _id: user._id })
            const refreshToken = generateRefreshToken({ _id: user._id }, res)

            // add refresh token
            await User.findOneAndUpdate(
                { email: req.body.email },
                {
                    $set: {
                        rf_token: refreshToken,
                    },
                },
                {
                    new: true,
                }
            )

            res.status(200).json({ user, accessToken, message: 'Đăng nhập thành công' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Đăng nhập thất bại' })
        }
    },
    // logout
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshToken', { path: '/api/auth/refresh-token' })
            await User.findByIdAndUpdate(
                { _id: req.body._id },
                {
                    $set: {
                        rf_token: '',
                    },
                },
                {
                    new: true,
                }
            )

            res.status(200).json({ message: 'Đăng xuất thành công' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Đăng xuất thất bại' })
        }
    },
    // refresh token
    refreshToken: async (req, res) => {
        try {
            const getRefreshToken = req.cookies.refreshToken
            // has token?
            if (!getRefreshToken) {
                return res.status(404).json({ message: 'Vui lòng đăng nhập tài khoản' })
            }

            // is valid token?
            const isValidToken = jwt.verify(getRefreshToken, process.env.REFRESH_TOKEN_SECRET)
            if (!isValidToken || Object.keys(isValidToken).length === 0)
                return res.status(400).json({ message: 'Vui lòng đăng nhập tài khoản lại' })

            const user = await User.findById({ _id: isValidToken._id }).select(
                '+rf_token -password'
            )
            if (!user) {
                return res.status(404).json({
                    message: 'Không tìm thấy người dùng này. Vui lòng đăng ký để đăng nhập',
                })
            }

            if (getRefreshToken !== user.rf_token) {
                return res.status(400).json({ message: 'Vui lòng đăng nhập tài khoản của bạn' })
            }

            const accessToken = generateAccessToken({ _id: user._id })
            const refreshToken = generateRefreshToken({ _id: user._id }, res)

            const newUser = await User.findByIdAndUpdate(
                { _id: user._id },
                {
                    $set: {
                        rf_token: refreshToken,
                    },
                },
                {
                    new: true,
                }
            )

            res.status(200).json({ user: newUser, accessToken })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Khởi tạo token thất bại' })
        }
    },
    // verify email dashboard
    verifyEmailDashboard: async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email })

            if (!user) {
                return res.status(404).json({
                    message: 'Not found this user by email or phone number. Please create account',
                })
            }

            res.status(200).json({ message: 'Verify email successfully' })
        } catch (error) {
            res.status(500).json({
                error: error.message,
                message: 'Error when verify email',
            })
        }
    },
    // verify email client
    verifyEmailClient: async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email })
            if (!user) {
                return res.status(404).json({
                    message:
                        'Không tìm thấy tài khoản của bạn. Vui lòng tạo tài khoản để đăng nhập vào trang',
                })
            }

            res.json(200).json({ message: 'Xác nhận email hoặc số điện thoại thành công' })
        } catch (error) {
            res.status(500).json({
                error: error.message,
                message: 'Đã có lỗi trong việc xác nhân email hoặc số điện thoại',
            })
        }
    },
    // forgot password
    forgotPassword: async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email })
            if (!user) {
                return res.status(404).json({ message: 'Not found user. Please create account' })
            }

            const password = await hashPassword(req.body.password)
            await User.findOneAndUpdate(
                { email: req.body.email },
                {
                    $set: {
                        password,
                    },
                },
                {
                    new: true,
                }
            )

            res.status(200).json({ message: 'Reset password successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Reset password failed' })
        }
    },
}

module.exports = AuthController
