const mongoose = require('../databases').mongoose;
const Schema = mongoose.Schema;

var marketRatingSchema = new Schema(
    {
        _id: { type: Schema.Types.ObjectId, select: false },
        symbol: String, name: String, ranking: String,
        accuracy: Number, short_accuracy: Number,
        long_accuracy: Number, daily_prediction: Number,
        weekly_prediction: Number, monthly_prediction: Number,
    }
);

module.exports = mongoose.model(
    'MarketRating', marketRatingSchema, 'market_rating'
);
