
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["Lost", "Found", "Claimed", "Returned"],
        default: "Lost"
    },

    contact: {
        type: String,
        required: true
    },

    dateReported: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Item", itemSchema);
