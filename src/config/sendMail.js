const nodemailer = require('nodemailer')
const { OAuth2Client } = require('google-auth-library')

const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground'

const sendEmail = async (to, url, txt = 'Hãy xác minh email của bạn tại đây') => {
    console.log(url)
    const CLIENT_ID = `${process.env.CLIENT_ID}`
    const CLIENT_SECRET = `${process.env.CLIENT_SECRET}`
    const REFRESH_TOKEN = `${process.env.REFRESH_TOKEN}`
    const SENDER_MAIL = `${process.env.SENDER_MAIL_ADDRESS}`

    const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, OAUTH_PLAYGROUND)
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

    try {
        const access_token = await oAuth2Client.getAccessToken()
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: SENDER_MAIL,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                access_token,
            },
        })

        const mailOptions = {
            from: SENDER_MAIL,
            to: to,
            subject: 'blog',
            html: `
                    <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
                    <h2 style="text-align: center; text-transform: uppercase;color: teal;">Hi, mình là Athetics Huynh</h2>
                    <p>Chúc mừng bạn đã đăng ký thành công. Bạn có thể sử dụng Blog của mình.
                        Hãy nhấn vào nút phía dưới để xác nhận email của bạn.
                    </p>
                    
                    <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;" target="_blank">${txt}</a>
                
                    <p>Nếu nhấn vào nút không được thì bạn hãy click vào đường link phía dưới này.</p>
                
                    <div>${url}</div>
                    </div>
                  `,
        }

        const result = await transport.sendMail(mailOptions)
        return result
    } catch (error) {
        console.log(error)
    }
}

module.exports = { sendEmail }
