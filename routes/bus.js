var express = require('express');
var router = express.Router();
const authenticateToken = require('../middleware/auth');
const BusDetail = require('../Model/Bus')

router.post('/busDetails', async (req, res) => {
    try {
        const { no } = req.body
        let exist = await BusDetail.findOne({ no })
        if (exist) {
            return res.json({ error: "bus number already exist" })
        }
        const newBusDetail = new BusDetail(req.body);
        const savedBusDetail = await newBusDetail.save();
        res.json(savedBusDetail);
    } catch (error) {
        res.status(400).json({ error: 'Error saving bus details.' });
    }
});

router.get('/busDetails', async (req, res) => {
    try {
        const busDetails = await BusDetail.find();
        res.json(busDetails);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching bus details.' });
    }
});
module.exports = router;