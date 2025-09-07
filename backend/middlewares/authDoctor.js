const jwt = require('jsonwebtoken')
// Doctor authentication middleware

const authDoctor = async (req, res, next) => {

    const { dtoken } = req.headers
    try {
        if (!dtoken) {
            return res.json({ success: false, message: 'Not Authorized, Login Again' })
        }
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
        req.docId = token_decode.id
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

module.exports = authDoctor;
