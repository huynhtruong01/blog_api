const { Twilio } = require('twilio')

const sendSms = async (to, body, txt) => {
    try {
        const accountSid = `${process.env.TWILIO_ACCOUNT_SID}`
        const authToken = `${process.env.TWILIO_AUTH_TOKEN}`
        const from = `${process.env.TWILIO_PHONE_NUMBER}`

        const client = new Twilio(accountSid, authToken)

        return client.messages
            .create({
                body: `Blog ${txt} - ${body}`,
                from,
                to,
            })
            .then((message) => console.log(message))
    } catch (error) {
        console.log(error)
    }
}

module.exports = { sendSms }
