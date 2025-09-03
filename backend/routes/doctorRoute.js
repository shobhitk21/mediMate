const express = require('express')
const doctorRouter = express()
const { doctorList } = require('../controllers/doctorController')

doctorRouter.get('/list', doctorList)


module.exports = doctorRouter;