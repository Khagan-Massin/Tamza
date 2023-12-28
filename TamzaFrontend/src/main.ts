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
  isRecording ? stopRecording() : startRecording();
  render();
});

search_button.addEventListener("click", () => {
  fetchAudio();
  id_input.value = "";
  render();
});

// State
let isRecording: boolean = false;
let mediaRecorder: MediaRecorder;
let recordedChunks: Blob[] = [];
let recordedMemoURI: string;


// Constants
const mediaConstraints = { audio: true };
const audioType = "audio/mp3";

render();

function hasRecording(): boolean {
  return recordedChunks.length > 0 || recordedMemoURI != null;
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
      }
    });

    mediaRecorder.addEventListener("stop", function () {
      createRecordedFile();
      audioPlayer.src = recordedMemoURI;
    });
  });
}

function stopRecording() {
  isRecording = false;
  mediaRecorder.stop();

  stopStartButton.innerText = "Start Recording";
}

function playAudio() {
  if (!hasRecording()) throw new Error("No recording to play");
  
  const blob = new Blob(recordedChunks, {type: audioType});

  const audioUrl = URL.createObjectURL(blob);
  const audio = new Audio(audioUrl);
  audio.play();
}

function uploadAudio() {

  if (!hasRecording()) throw new Error("No recording to save");

  const blob: Blob = new Blob(recordedChunks, { type: audioType });

  MemoService.postMemo(blob).then((id) => {
    audioId.innerText = id;
  });
}

/**
 * Saves the recorded audio as a sound file and returns the URL of the file.
 * @throws {Error} If there is no recording to upload.
 * @returns {string} The URL of the saved sound file.
 */
function createRecordedFile(): string {
  if (!hasRecording()) {
    throw new Error("No recording to file");
  }
  const blob: Blob = new Blob(recordedChunks, { type: audioType });

  const soundfile = URL.createObjectURL(blob);

  recordedMemoURI = soundfile;

  return recordedMemoURI;
}

/**
 * Puts the audio file in the player.
 */


/**
 * Downloads the audio file by creating a temporary link element and triggering a click event.
 */
function downloadAudio() {
  const file = createRecordedFile();

  const a = document.createElement("a");
  a.href = file;
  a.download = "audio.mp3";

  document.body.appendChild(a);

  a.click();

  document.body.removeChild(a);
}

function fetchAudio() {
  MemoService.getMemo(id_input.value).then((memo) => {
    const audioUrl = URL.createObjectURL(memo.blob,);
    audioPlayer.src = audioUrl;
  });
}

/**
 * Changes the UI based on the state of the application.
 */
function render() {

  if (isRecording) {
    stopStartButton.innerText = "Stop Recording";
    playButton.disabled = true;
    uploadButton.disabled = true;
    saveButton.disabled = true;
    search_button.disabled = true;
  } else {
    stopStartButton.innerText = "Start Recording";
    playButton.disabled = false;
    uploadButton.disabled = false;
    saveButton.disabled = false;
    search_button.disabled = false;
  }

}
