Whatsapp Send Chat Service API
==============================

A simple REST API service for sending whatsapp chat. Based on the API used for Whatsapp Web client. Using [@adiwajsing/bailey](https://github.com/adiwajshing/Baileys) package.

## Overview

This API acts as a Whatsapp Web client. Currently it only provide 4 basic endpoint:

- `/login` -> get code string to be generated as qr code and scanned into mobile whatsapp app
- `/status` -> check current connection status
- `/logout` -> log out from current connection
- `/send` -> send message

## Usage

1. Make sure NodeJS already installed.
2. clone this repo, cd to it
3. `npm install`
4. `npm start`, API will be accessible from localhost:3000

## Legal

This code is in no way affiliated with, authorized, maintained, sponsored or endorsed by WhatsApp or any of its affiliates or subsidiaries. This is an independent and unofficial software. Use at your own risk.
