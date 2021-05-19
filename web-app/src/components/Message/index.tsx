import React from 'react';
import moment from 'moment';
import './Message.css';

export default function Message({ data, isMine, startsSequence, endsSequence, showTimestamp }: { data: any; isMine: any; startsSequence: any; endsSequence: any; showTimestamp: any; }) {


  const friendlyTimestamp = moment(data.timestamp).format('LLLL');
  return (
    <div className={[
      'message',
      `${isMine ? 'mine' : ''}`,
      `${startsSequence ? 'start' : ''}`,
      `${endsSequence ? 'end' : ''}`
    ].join(' ')}>
 

      <div className="bubble-container">
        <div className="bubble" title={friendlyTimestamp}>
          {data.message}
        </div>
      </div>
    </div>
  );
}