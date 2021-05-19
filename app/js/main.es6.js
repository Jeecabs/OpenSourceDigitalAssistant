'use strict'

import request from 'superagent'

import Loader from './loader.es6'
import Client from './client.es6'
import Recorder from './recorder.es6'
import listener from './listener.es6'
import { onkeydowndocument, onkeydowninput } from './onkeydown.es6'

const config = {
  app: 'webapp',
  server_host: 'localhost',
  server_port: '1337',
  min_decibels: -40, // Noise detection sensitivity
  max_blank_time: 1000 // Maximum time to consider a blank (ms)
}
const serverUrl = process.env.LEON_NODE_ENV === 'production' ? '' : `${config.server_host}:${config.server_port}`

document.addEventListener('DOMContentLoaded', () => {
  const loader = new Loader()

  loader.start()
  console.log(`${serverUrl}/v1/info`)
  request.get(`http://${serverUrl}/v1/info`)
    .end((err, res) => {
      if (err || !res.ok) {
        console.error(err.response.error.message)
      } else {
        const input = document.querySelector('#query')
        const mic = document.querySelector('button')
        const v = document.querySelector('#version small')
        const logger = document.querySelector('#logger small')
        const client = new Client(config.app, serverUrl, input, res.body)
        let rec = {}
        let chunks = []
        let sLogger = ' enabled, thank you.'

        v.innerHTML += client.info.version
        if (client.info.logger === false) {
          sLogger = ' disabled.'
        }
        logger.innerHTML += sLogger

        client.init()

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            if (MediaRecorder) {
              rec = new Recorder(stream, mic, client.info)
              client.recorder = rec

              rec.ondataavailable((e) => {
                chunks.push(e.data)
              })

              rec.onstart(() => { /* */ })

              rec.onstop(() => {
                const blob = new Blob(chunks)
                chunks = []
                rec.enabled = false

                // Ensure there are some data
                if (blob.size >= 1000) {
                  client.socket.emit('recognize', blob)
                }
              })

              listener.listening(stream, config.min_decibels, config.max_blank_time, () => {
                // Noise detected
                rec.noiseDetected = true
              }, () => {
                // Noise ended

                rec.noiseDetected = false
                if (rec.enabled && !rec.hotwordTriggered) {
                  rec.stop()
                  rec.enabled = false
                  rec.hotwordTriggered = false
                  rec.countSilenceAfterTalk = 0
                }
              })

              client.socket.on('enable-record', () => {
                rec.hotwordTriggered = true
                rec.start()
                setTimeout(() => { rec.hotwordTriggered = false }, config.max_blank_time)
                rec.enabled = true
              })
            } else {
              console.error('MediaRecorder is not supported on your browser.')
            }
          }).catch((err) => {
            console.error('MediaDevices.getUserMedia() threw the following error:', err)
          })
        } else {
          console.error('MediaDevices.getUserMedia() is not supported on your browser.')
        }

        loader.stop()

        document.addEventListener('keydown', (e) => {
          onkeydowndocument(e, () => {
            if (rec.enabled === false) {
              input.value = ''
              rec.start()
              rec.enabled = true
            } else {
              rec.stop()
              rec.enabled = false
            }
          })
        })

        input.addEventListener('keydown', (e) => {
          onkeydowninput(e, client)
        })

        mic.addEventListener('click', (e) => {
          e.preventDefault()

          if (rec.enabled === false) {
            rec.start()
            rec.enabled = true
          } else {
            rec.stop()
            rec.enabled = false
          }
        })
      }
    })
})