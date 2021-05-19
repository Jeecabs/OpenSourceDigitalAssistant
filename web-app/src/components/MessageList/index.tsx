import React, { useEffect, useRef, useState } from 'react';
import ToolbarButton from '../ToolbarButton';
import Message from '../Message';
import { BOT_ID, config, MY_USER_ID, serverUrl } from '../../utils/config';
import axios from "axios"
import './MessageList.css';
import '../Compose/Compose.css';

import { useForm } from 'react-hook-form';
import { InputTag } from '../../App';
import Recorder from '../../modules/Recorder';
import Client from '../../modules/socketIOClient';


export default function MessageList({ ButtonPressed, status, startRecording, stopRecording, mediaBlobUrl,

  clearBlobUrl }:
  { ButtonPressed: any, status: string, startRecording: Function, stopRecording: Function, mediaBlobUrl: string | null, clearBlobUrl: Function }) {


  const [messages, setMessages] = useState<any[]>([])

  const { register, handleSubmit, setValue } = useForm();

  const client = useRef<Client | null>(null);

  useEffect(() => {
    // TODO Consider removing this.
    axios.get(`http://${serverUrl}/v1/info`)
      .then((res) => {
        if (res.status !== 200) {
          console.error('SOMETHING BROKE BOSS')
        } else {
          let rec: Recorder;
          client.current = new Client(config.app, serverUrl, res.data, setResponseMessage)
          client.current.init()


          rec = new Recorder(startRecording, stopRecording, client.current.info)

          client.current.setRecorder(rec)


          rec.onstart(() => { /* */ })

          rec.onstop(async () => {

            mediaBlobUrl != null && await fetch(mediaBlobUrl).then(async r => {

              // Converts the Audio to BLOB format
              const blob = await r.blob()

              rec.enabled = false
              if (blob !== null) {
                // Ensure there are some data
                if (blob.size >= 1000) {
                  if (client.current != null)
                    client.current.socket.emit('recognize', blob)
                }
              }
            });
            clearBlobUrl()
          })

          // TODO 

          //listener.listening(stream, config.min_decibels, config.max_blank_time, () => {
          //  // Noise detected
          //  rec.noiseDetected = true
          //}, () => {
          //  // Noise ended
          //
          //  rec.noiseDetected = false
          //  if (rec.enabled && !rec.hotwordTriggered) {
          //    rec.stop()
          //    rec.enabled = false
          //    rec.hotwordTriggered = false
          //    rec.countSilenceAfterTalk = 0
          //  }
          //})

          client.current.socket.on('enable-record', () => {
            rec.hotwordTriggered = true
            rec.start()
            setTimeout(() => { rec.hotwordTriggered = false }, config.max_blank_time)
            rec.enabled = true
          })


        }
      });
  }, [])


  const LocalSubmit = (data: any) => {

    setValue("chat", null)

    setResponseMessage(data[InputTag], true)

    client.current?.send("query", data[InputTag])

  }

  const setResponseMessage = (message: string, IS_HUMAN = false) => {

    setMessages(messages.concat({
      id: messages.length + 1,
      author: IS_HUMAN ? MY_USER_ID : BOT_ID,
      message: message,
    }))
  }



  const renderMessages = () => {
    // Honestly this is probably fucking everything up
    let i = 0;
    let tempMessages = [];
    console.log(`MESSAGE LENGTH ${messages.length}`)
    while (i < messages.length) {
      let previous = messages[i - 1];
      let current = messages[i];
      let next = messages[i + 1];
      let isMine = current.author === MY_USER_ID;
      let prevBySameAuthor = false;
      let nextBySameAuthor = false;
      let startsSequence = true;
      let endsSequence = true;


      if (previous) {
        prevBySameAuthor = previous.author === current.author;
        if (prevBySameAuthor) {
          startsSequence = false;
        }
      }

      if (next) {
        nextBySameAuthor = next.author === current.author;
        if (nextBySameAuthor) {
          endsSequence = false;
        }
      }

      tempMessages.push(
        <Message
          key={i}
          isMine={isMine}
          startsSequence={startsSequence}
          endsSequence={endsSequence}
          showTimestamp={false}
          data={current}
        />
      );
      // Proceed to the next message.
      i += 1;
    }
    console.log(`TEMP MESSAGE LENGTH ${tempMessages.length}`)
    return tempMessages;
  }

  return (
    <div className="message-list">
      <div className="message-list-container">{renderMessages()}</div>
      <div className="compose">
        <form onSubmit={handleSubmit(LocalSubmit)}>
          <input
            type="text"
            className="compose-input"
            name={InputTag} ref={register({ required: true })}
            style={{ width: "70vw" }}
          />
          <input type="submit" />
        </form>
        {
          [
            <ToolbarButton key="audio" icon="ion-ios-mic" onClick={ButtonPressed} />,
            <div style={{ paddingLeft: "10px" }}>{status.toString().toUpperCase()}</div>
          ]
        }
      </div>
    </div>
  );
}