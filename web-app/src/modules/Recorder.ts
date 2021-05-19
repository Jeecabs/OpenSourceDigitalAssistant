export default class Recorder {
  recorder: any;
  info: any;
  enabled: boolean;
  hotwordTriggered: boolean;
  noiseDetected: boolean;
  countSilenceAfterTalk: number;
  //playSound: boolean;
  audioOn: any;
  //el: any;
  audioOff: any;
  startRecording: Function;
  playSound: any;
  stopRecording: Function;
  constructor(startRecording: Function, stopRecording: Function, info: any) {
    // this.el = el; TODO WAS A CONTROLLER FOR A BUTTON
    //this.audioOn = new Audio("../sounds/on.mp3");
    //this.audioOff = new Audio("../sounds/off.mp3");
    //this.playSound = true;
    this.info = info;
    this.enabled = false;
    this.hotwordTriggered = false;
    this.noiseDetected = false;
    this.countSilenceAfterTalk = 0;
    this.startRecording = startRecording;
    this.stopRecording = stopRecording;
  }

  start(playSound = true) {
    if (this.info.stt.enabled === false) {
      console.warn("Speech-to-text disabled");
    } else {
      this.startRecording();
      //this.playSound = playSound;
      this.recorder.start(playSound);
    }
  }

  stop(playSound = true) {
    if (this.info.stt.enabled === false) {
      console.warn("Speech-to-text disabled");
    } else {
      //this.playSound = playSound;
      //this.recorder.stop(playSound);
      this.stopRecording();
    }
  }

  onstart(cb: Function) {
    //if (this.playSound) {
    //  this.audioOn.play();
    //}
    //this.el.classList.add("enabled");
  }

  onstop(cb: Function) {
    // if (this.playSound) {
    //   this.audioOff.play();
    // }
    //this.el.classList.remove("enabled");
  }

  //ondataavailable(cb) {
  //  this.recorder.ondataavailable = (e) => {
  //    cb(e);
  //  };
  //}
}
