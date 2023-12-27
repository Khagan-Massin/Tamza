import { MemoService } from './service/MemoService'
import './style.css'



// Clear the existing HTML content
 

// ok dont burn me alive for this


const stopStartButton = document.querySelector('#stopstart-button') as HTMLButtonElement

// Dom Elements
const playButton = document.querySelector('#play-button') as HTMLButtonElement
const uploadButton = document.querySelector('#upload-button') as HTMLButtonElement
const saveButton = document.querySelector('#save-button') as HTMLButtonElement
const audioId = document.querySelector('#audio-id') as HTMLParagraphElement
const audioPlayer = document.querySelector('#audio-player') as HTMLAudioElement

// Event Listeners
playButton.addEventListener('click', playAudio)
uploadButton.addEventListener('click', uploadAudio)
saveButton.addEventListener('click', downloadAudio)
stopStartButton.addEventListener('click', stopStartButtonClicked)

// State
let isRecording: boolean = false;
let mediaRecorder: MediaRecorder;
let recordedChunks: Blob[] = [];

// Constants
const mediaConstraints = { audio: true };

// Lets get started
render()

function hasRecording(): boolean {
  console.log('hasRecording: ' + (recordedChunks.length > 0))
  return recordedChunks.length > 0
}



/**
 * called when the stop start button is clicked
 * when recording, stops recording
 * and vice versa
 * keep track of state with isRecording
 */
function stopStartButtonClicked() {
  console.log('stop start button clicked')

  if (!isRecording) {
    startRecording()
    
  } else {
    stopRecording()
    
  }

  console.log('After: isRecording: ' + isRecording)
}

/**
 * starts recording
 * sets isRecording to true
 * sets mediaRecorder to a new MediaRecorder
 * adds event listeners to mediaRecorder
 */
function startRecording() {

  if (isRecording) {
    throw new Error('Already recording')
  }

  // reset recorded chunks
  recordedChunks = []

  stopStartButton.innerHTML = 'Stop Recording'

  isRecording = true

  navigator.mediaDevices.getUserMedia(mediaConstraints).then((stream) => {
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();
 

    mediaRecorder.addEventListener("dataavailable", function (event) {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
       
        console.log(recordedChunks  )
        
      }
    });

    mediaRecorder.addEventListener("stop", function () {
      console.log('recording stopped')
      putAudioInPlayer()
    });
  });
 

}

function stopRecording() {

  isRecording = false;
  mediaRecorder.stop();

  stopStartButton.innerHTML = 'Start Recording'

}


function playAudio() {

  if (!hasRecording()) {
    throw new Error('No recording to play')
  }


  const audioBlob = new Blob(recordedChunks, {
    type: "audio/mp3",
  });

  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
}

function uploadAudio() {

  console.log('uploading audio')

  if (!hasRecording()) {
    throw new Error('No recording to save')
  }
  // put them in a from with key 'file'

  const blob: Blob = new Blob(recordedChunks, { type: 'audio/mp3' });

  const memoService = new MemoService()

  memoService.postMemo(blob).then((id) => {
    audioId.innerHTML = id
   });
  
   
}

function saveAudio() {
  if (!hasRecording()) {
    throw new Error('No recording to upload')
  }
  const blob: Blob = new Blob(recordedChunks, { type: 'audio/mp3' });

  const soundfile = URL.createObjectURL(blob)
 
  return soundfile
}

function putAudioInPlayer() {
  const file = saveAudio()
  audioPlayer.src = file
}

function downloadAudio() {
  const file = saveAudio()

  const a = document.createElement('a')
  a.href = file
  a.download = 'audio.mp3'

  document.body.appendChild(a)

  a.click()

  document.body.removeChild(a)
}

function render() {
  console.log('rendering')

  if (isRecording) {
    stopStartButton.innerHTML = 'Stop Recording'
  }
  else {
    stopStartButton.innerHTML = 'Start Recording'
  }
     

  if (hasRecording()) {
    playButton.disabled = false
    uploadButton.disabled = false
    saveButton.disabled = false
  } else {
    playButton.disabled = true
    uploadButton.disabled = true
    saveButton.disabled = true
  }

  

}

 
