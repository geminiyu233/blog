import mongoose from 'mongoose'

const ArticleStatuSchema = new mongoose.Schema({
  id: Number,
  name: {
    type: String,
    required: true
  }
})

const ArticleStatu = mongoose.model('ArticleStatu', ArticleStatuSchema)
export default ArticleStatu
