const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const reqNumber = {
    type: Number,
    required: true
}

const userSchema = mongoose.Schema({
    discordid: reqString,
    stateid: reqNumber,
    districtid: reqNumber,
    age: reqNumber,
    mute: reqNumber,
})

module.exports = mongoose.model('users', userSchema)