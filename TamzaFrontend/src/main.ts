import './style.css'

const stopStartButton = document.querySelector('#stopstart-button')
const playButton = document.querySelector('#play-button')
const saveButton = document.querySelector('#save-button')


let isRecording: boolean = false;

const mediaConstraints = { audio: true };
let mediaRecorder: MediaRecorder;
let recordedChunks: Blob[] = [];

function hasRecording(): boolean {
  return recordedChunks.length > 0
}

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

  if (isRecording) {
    throw new Error('Already recording')
  }

  stopStartButton.innerHTML = 'Stop Recording'

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
      
    });
  });

  
}

function stopRecording() {
  isRecording = false;
  mediaRecorder.stop();

  stopStartButton.innerHTML = 'Stop Recording'
}
 

function playAudio() {

  if (!hasRecording()) {
    throw new Error('No recording to play')
  }

  console.log('play audio')
  const audioBlob = new Blob(recordedChunks, {
    type: "audio/wav",
  });
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
}

function saveAudio() {
  if (!hasRecording()) {
    throw new Error('No recording to save')
  }
  // put them in a from with key 'file'

  const form: FormData = new FormData();

  const blob: Blob = new Blob(recordedChunks, { type: 'audio/mp3' });

  form.append('file', blob, 'audio.mp3');

  // TODO: figure out how uri works
   fetch('/api/Memo', {
    method: 'POST',
    body: form
  }).then(
    (response) => {
      console.log(response)

      if (response.status === 200) {

          response.json().then((data) => {
            document.querySelector('#audio-id').innerHTML = data;
          })
         
    
        }
    
}
)
}


