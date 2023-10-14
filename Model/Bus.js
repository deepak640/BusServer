const mongoose = require('mongoose');

const busDetailsSchema = new mongoose.Schema({
    no: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    availability: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    fare: {
        type: Number,
        required: true,
    },
    stop: {
        type: String,
        required: true,
    },
});

const BusDetail = mongoose.model('BusDetail', busDetailsSchema);

module.exports = BusDetail;
