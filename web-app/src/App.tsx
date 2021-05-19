import './App.css';
import { useReactMediaRecorder } from "react-media-recorder";


import MessageList from './components/MessageList';

export const InputTag = "chat";
function App() {
 

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl
  } = useReactMediaRecorder({ video: false, audio: true });

  const bottonPressed = () => {
    if (status !== "recording") {
      startRecording()
    } else {
      stopRecording()

    }
  }



  return (
    < >

      <div className="scrollable content">
        <MessageList  ButtonPressed={bottonPressed} status={status} startRecording={startRecording} stopRecording={stopRecording}
          mediaBlobUrl={mediaBlobUrl} clearBlobUrl={clearBlobUrl} />
      </div>
    </ >

  );
}

export default App;
