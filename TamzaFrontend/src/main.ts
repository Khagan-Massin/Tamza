import { MemoService } from "./service/MemoService";
import "./style.css";

// Dom Elements
const stopStartButton = document.querySelector("#stopstart-button") as HTMLButtonElement;
const playButton = document.querySelector("#play-button") as HTMLButtonElement;
const uploadButton = document.querySelector("#upload-button") as HTMLButtonElement;
const saveButton = document.querySelector("#save-button") as HTMLButtonElement;
const audioId = document.querySelector("#audio-id") as HTMLParagraphElement;
const audioPlayer = document.querySelector("#audio-player") as HTMLAudioElement;
const search_button = document.querySelector("#search-button") as HTMLButtonElement;
const id_input = document.querySelector("#id_input") as HTMLInputElement;

// Event Listeners
playButton.addEventListener("click", () => {
  playAudio();
  render();
});
uploadButton.addEventListener("click", () => {
  uploadAudio();
  render();
});
saveButton.addEventListener("click", () => {
  downloadAudio();
  render();
});

stopStartButton.addEventListener("click", () => {
  stopStartButtonClicked();
  render();
});

search_button.addEventListener("click", () => {
  fetchAudio();
   
});

// State
let isRecording: boolean = false;
let mediaRecorder: MediaRecorder;
let recordedChunks: Blob[] = [];

let recordedMemoURI: string;
let fetchedMemoURI: string;

// Constants
const mediaConstraints = { audio: true };
const audioType = "audio/mp3";

// Lets get started in here
render();

function hasRecording(): boolean {
  console.log("hasRecording: " + (recordedChunks.length > 0));
  return recordedChunks.length > 0;
}

/**
 * called when the stop start button is clicked
 * when recording, stops recording
 * and vice versa
 * keep track of state with isRecording
 */
function stopStartButtonClicked() {
  console.log("stop start button clicked");

  if (!isRecording) {
    startRecording();
  } else {
    stopRecording();
  }

  console.log("After: isRecording: " + isRecording);
}

/**
 * starts recording
 * sets isRecording to true
 * sets mediaRecorder to a new MediaRecorder
 * adds event listeners to mediaRecorder
 */
function startRecording() {
  if (isRecording) {
    throw new Error("Already recording");
  }

  // reset recorded chunks
  recordedChunks = [];

  stopStartButton.innerText = "Stop Recording";

  isRecording = true;

  navigator.mediaDevices.getUserMedia(mediaConstraints).then((stream) => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    mediaRecorder.addEventListener("dataavailable", function (event) {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);

        console.log(recordedChunks);
      }
    });

    mediaRecorder.addEventListener("stop", function () {
      console.log("recording stopped");

      

      putAudioInPlayer();
    });
  });
}

function stopRecording() {
  isRecording = false;
  mediaRecorder.stop();

  stopStartButton.innerText = "Start Recording";
}

function playAudio() {
  if (!hasRecording()) {
    throw new Error("No recording to play");
  }

  const audioBlob = new Blob(recordedChunks, {
    type: audioType,
  });

  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
}

function uploadAudio() {
  console.log("uploading audio");

  if (!hasRecording()) {
    throw new Error("No recording to save");
  }
  // put them in a from with key 'file'

  const blob: Blob = new Blob(recordedChunks, { type: audioType });

  const memoService = new MemoService();

  memoService.postMemo(blob).then((id) => {
    audioId.innerText = id;
  });
}

/**
 * Saves the recorded audio as a sound file and returns the URL of the file.
 * @throws {Error} If there is no recording to upload.
 * @returns {string} The URL of the saved sound file.
 */
function getRecordedAudio() {
  if (!hasRecording()) {
    throw new Error("No recording to upload");
  }
  const blob: Blob = new Blob(recordedChunks, { type: audioType });

  const soundfile = URL.createObjectURL(blob);

  return soundfile;
}

/**
 * Puts the audio file in the player.
 */
function putAudioInPlayer() {
  audioPlayer.src = getRecordedAudio();
}

/**
 * Downloads the audio file by creating a temporary link element and triggering a click event.
 */
function downloadAudio() {
  const file = getRecordedAudio();

  const a = document.createElement("a");
  a.href = file;
  a.download = "audio.mp3";

  document.body.appendChild(a);

  a.click();

  document.body.removeChild(a);
}

function fetchAudio() {
  const memoService = new MemoService();
  memoService.getMemo(id_input.value).then((memo) => {
    const audioUrl = URL.createObjectURL(memo.blob, );
    audioPlayer.src = audioUrl;
  });
} 

 
/**
 * Renders the UI based on the current state of the application.
 */
function render() {

  if (isRecording) {
    stopStartButton.innerText = "Stop Recording";
    playButton.disabled = true;
    uploadButton.disabled = true;
    saveButton.disabled = true;
  } else {
    stopStartButton.innerText = "Start Recording";
    playButton.disabled = false;
    uploadButton.disabled = false;
    saveButton.disabled = false;
  }

}
