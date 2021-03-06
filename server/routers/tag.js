import TagModel from '../controller/tag'
import Router from 'koa-router'

const router = new Router()
router.prefix('/tag')

//checkToken作为中间件存在
const checkToken = require('../token/checkToken.js');

router.get('/all', checkToken, TagModel.getAllTag)

export default router