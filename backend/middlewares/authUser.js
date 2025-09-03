const jwt = require('jsonwebtoken')
// User authentication middleware

const authUser = async (req, res, next) => {

    const { token } = req.headers
    try {
        if (!token) {
            return res.json({ success: false, message: 'Not Authorized, Login Again' })
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = token_decode.id
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

module.exports = authUser;
