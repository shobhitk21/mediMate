const jwt = require('jsonwebtoken')
// admin authentication middleware

const authAdmin = async (req, res, next) => {
    try {

        const { atoken } = req.headers;

        if (!atoken) {
            return res.json({ success: false, message: "Not authorized, Login again" })
        }
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET)
        if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            res.json({ success: false, message: "Invalid Credentials" })
        }
        next()

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

module.exports = authAdmin;
