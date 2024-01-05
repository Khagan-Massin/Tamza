import { Router } from "./router";
import { MemoService } from "./service/MemoService";
import "./style.css";

// Dom Elements
const stopStartButton = document.querySelector("#stopstart-button") as HTMLButtonElement;
const uploadButton = document.querySelector("#upload-button") as HTMLButtonElement;
const saveButton = document.querySelector("#save-button") as HTMLButtonElement;
const created_audio_link = document.querySelector("#created-audio-link") as HTMLAnchorElement;
const audioPlayer = document.querySelector("#audio-player") as HTMLAudioElement;

// State
let isRecording: boolean = false;
let mediaRecorder: MediaRecorder;
/**
 * The audio chunks either recorded or fetched via routing the user to the listen page
 */
let audioChunks: Blob[] = [];
/**
 * The URI of the memo either recorded or fetched via routing the user to the listen page
 */
let memoURI: string;

// Constants
const mediaConstraints = { audio: true };
const audioType = "audio/mp3";

//Resources
const router = new Router();

router.addRoute("listen", (params) => {
  const id = params["id"];

  MemoService.getMemo(id).then((memo) => {
    const audioUrl = URL.createObjectURL(memo.blob);
    audioPlayer.src = audioUrl;
    audioChunks = [memo.blob];
    memoURI = audioUrl;
  });
});

// Event Listeners
uploadButton.onclick = () => {
  uploadAudio();
  updateRecordingUIState();
};

saveButton.onclick = () => {
  downloadAudio();
  updateRecordingUIState();
};

stopStartButton.onclick = () => {
  isRecording ? stopRecording() : startRecording();
  updateRecordingUIState();
};

updateRecordingUIState();

function hasRecording(): boolean {
  return audioChunks.length > 0 || memoURI != null;
}

/**
 * starts recording
 * sets isRecording to true
 * sets mediaRecorder to a new MediaRecorder
 * adds event listeners to mediaRecorder
 */
function startRecording() {
  if (isRecording) throw new Error("Already recording");

  // reset recorded chunks
  audioChunks = [];

  stopStartButton.innerText = "Stop Recording";

  isRecording = true;

  navigator.mediaDevices.getUserMedia(mediaConstraints).then((stream) => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    mediaRecorder.addEventListener("dataavailable", function (event) {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    });

    mediaRecorder.addEventListener("stop", function () {
      createAudioFile(audioChunks);
      audioPlayer.src = memoURI;
    });
  });
}

function stopRecording() {
  isRecording = false;
  mediaRecorder.stop();
  stopStartButton.innerText = "Start Recording";
}

function uploadAudio() {
  if (!hasRecording()) throw new Error("No recording to save");

  const blob: Blob = new Blob(audioChunks, { type: audioType });

  MemoService.postMemo(blob)
    .then((id) => {
      const uri = window.location.origin + "/listen?id=" + id;

      created_audio_link.innerText = uri;
      created_audio_link.href = uri;
    })
    .catch((error) => {
      alert(error);
    });
}

/**
 * Saves the recorded audio as a sound file and returns the URL of the file.
 * @param chunks The recorded chunks to save.
 * @throws {Error} If there is no recording to upload.
 * @returns {string} The URL of the saved sound file.
 */
function createAudioFile(chunks: Blob[]): string {
  if (!hasRecording()) throw new Error("No recording to file");
  const blob: Blob = new Blob(chunks, { type: audioType });
  const memoURI = URL.createObjectURL(blob);
  return memoURI;
}

/**
 * Downloads the audio file by creating a temporary link element and triggering a click event.
 */
function downloadAudio() {
  const file = createAudioFile(audioChunks);
  const a = document.createElement("a");
  a.href = file;
  a.download = "voicememo.mp3";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 *  Changes the UI state based on the current recording state.
 * Like disabling buttons and changing button text.
 */
function updateRecordingUIState() {
  if (isRecording) {
    stopStartButton.innerText = "Stop Recording";
    uploadButton.disabled = true;
    saveButton.disabled = true;
  } else {
    stopStartButton.innerText = "Start Recording";
    uploadButton.disabled = false;
    saveButton.disabled = false;
  }
}

updateRecordingUIState();
