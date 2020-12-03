import { 
    WAConnection,
    ReconnectMode,
    MessageType,
    DisconnectReason,
} from '@adiwajshing/baileys'
import * as QR from 'qrcode-terminal'
import * as fs from 'fs'

var global_conn, global_qrcode = null

async function connectToWhatsApp () {
    const conn = new WAConnection() 
    conn.autoReconnect = ReconnectMode.onConnectionLost // only automatically reconnect when the connection breaks
    conn.logger.level = 'debug' // set to 'debug' to see what kind of stuff you can implement
    // attempt to reconnect at most 10 times in a row
    conn.connectOptions.maxRetries = 3

    conn.on ('credentials-updated', () => {
        // save credentials whenever updated
        console.log (`credentials updated`)
        global_qrcode = null

        const authInfo = conn.base64EncodedAuthInfo() // get all the auth info we need to restore this session
        fs.writeFileSync('./auth_info.json', JSON.stringify(authInfo, null, '\t')) // save this info to a file
    })

    // handler for qr code generation
    conn.regenerateQRIntervalMs = null // no QR regen
    conn.on ('qr', qr => {
        global_qrcode = qr
        console.log('qr value: ' + qr)
    })

    if (fs.existsSync('./auth_info.json')) {
      conn.loadAuthInfo ('./auth_info.json')
      conn.connect()
    }

    return conn
}

function getUsername() {
  var username 

  if (global_conn == undefined) {
    return null
  }

  try {
    username = global_conn.user.name + ' (' + global_conn.user.jid + ')'
  } catch (e) {
    return null 
  } 

  return username
}

// =========== REST API SECTION ==========
import express from 'express'

const PORT = 3000

const app = express()

app.use(express.json())

app.get("/", (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.get("/status", (req, res) => {
  var username = getUsername()

  res.status(200).json({ 
      connected: (username != null),
      current_user: username,
  })
})

app.get("/login", (req, res) => {
  global_conn.connect()

  // wait for 3 second before sending qrcode
  setTimeout(function(){ 
    res.status(200).json({ 
      success: true,
      code: global_qrcode,
    })
  }, 3000);
})

app.get("/logout", (req, res) => {
  if (global_conn != undefined) {
    fs.unlinkSync('./auth_info.json')
    global_conn.closeInternal(DisconnectReason.intentional)
  }

  res.status(200).json({ 
    success: true,
  })
})

app.post("/send", (req, res) => {
  const { target, content } = req.body

  if (getUsername == null) {
    res.status(401).json({ 
      success: false,
      message: "Not Connected",
    })
  } else {
    const id = target + '@s.whatsapp.net' // the WhatsApp ID 
    global_conn.sendMessage (id, content, MessageType.text)

    res.status(200).json({ 
      success: true,
    })
  }
})

app.listen(PORT, () => {
    console.log('Server started')

    // run whatsapp client
    connectToWhatsApp ()
    .then( conn => global_conn = conn )
    .catch (err => console.log("unexpected error: " + err) ) // catch any errors
})
