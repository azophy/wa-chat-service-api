import { 
    WAConnection,
    ReconnectMode,
    MessageType,
} from '@adiwajshing/baileys'
import * as QR from 'qrcode-terminal'
import * as fs from 'fs'

async function connectToWhatsApp () {
    const conn = new WAConnection() 
    conn.autoReconnect = ReconnectMode.onConnectionLost // only automatically reconnect when the connection breaks
    conn.logger.level = 'debug' // set to 'debug' to see what kind of stuff you can implement
    // attempt to reconnect at most 10 times in a row
    conn.connectOptions.maxRetries = 10

    conn.on ('credentials-updated', () => {
        // save credentials whenever updated
        console.log (`credentials updated`)
        const authInfo = conn.base64EncodedAuthInfo() // get all the auth info we need to restore this session
        fs.writeFileSync('./auth_info.json', JSON.stringify(authInfo, null, '\t')) // save this info to a file
    })

    fs.existsSync('./auth_info.json') && conn.loadAuthInfo ('./auth_info.json')

    // handler for qr code generation
    conn.regenerateQRIntervalMs = null // no QR regen
    conn.on ('qr', qr => {
        console.log('qr value: ' + qr)
    })

    await conn.connect ()

    console.log('oh hello ' + conn.user.name + ' (' + conn.user.jid + ')')    

    // test sending simple message
    const id = '6282142425544@s.whatsapp.net' // the WhatsApp ID 
    // send a simple text!
    conn.sendMessage (id, 'oh hello there', MessageType.text)
}

// run in main file
connectToWhatsApp ()
.catch (err => console.log("unexpected error: " + err) ) // catch any errors
