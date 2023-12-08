import './style.css'


let isRecording: boolean = false;
const mediaConstraints = { audio: true };
let mediaRecorder: MediaRecorder;
let recordedChunks: Blob[] = [];





document.querySelector('#stopstart-button').addEventListener('click', () => {

  if (!isRecording) {
    startRecording()
    return
  } else {
    stopRecording()
    return  
  }

  throw new Error('Something went wrong and I don\'t know what');
}

)

function startRecording() {

  console.log('start recording')

  isRecording = true

  navigator.mediaDevices.getUserMedia(mediaConstraints).then((stream) => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    mediaRecorder.addEventListener("dataavailable", function (event) {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    });

    mediaRecorder.addEventListener("stop", function () {
      const audioBlob = new Blob(recordedChunks, {
        type: "audio/wav",
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    });
  });

  
}

function stopRecording() {

  console.log('stop recording')

  isRecording = false;
  mediaRecorder.stop();
}
 
