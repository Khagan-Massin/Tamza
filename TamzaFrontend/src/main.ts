import { Router } from "./router";
import { MemoService } from "./service/MemoService";
import "./style.css";

// Dom Elements
const stopStartButton = document.querySelector("#stopstart-button") as HTMLButtonElement;
const uploadButton = document.querySelector("#upload-button") as HTMLButtonElement;
const saveButton = document.querySelector("#save-button") as HTMLButtonElement;
const clipboardButton = document.querySelector("#clipboard-button") as HTMLButtonElement;
const created_audio_link = document.querySelector("#created-audio-link") as HTMLAnchorElement;
const audioPlayer = document.querySelector("#audio-player") as HTMLAudioElement;

const qrcodeImage = document.querySelector("#qrcode") as HTMLImageElement;
const qrcodeModal = document.querySelector("#qrcode-modal") as HTMLDialogElement;
const closeQRcodeModal = document.querySelector("#close-qrcode-modal") as HTMLButtonElement;
const openQRcodeModal = document.querySelector("#open-qrcode-modal") as HTMLButtonElement;

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

//Routing
const router = new Router();

router.addRoute("listen", (params) => {
  const id = params["id"];

  // when the user navigates to the listen page, disable the upload button 
  // will be re-enabled when the user starts recording
  uploadButton.disabled = true;

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
  updateUIState();
};

saveButton.onclick = () => {
  downloadAudio();
  updateUIState();
};

stopStartButton.onclick = () => {
  isRecording ? stopRecording() : startRecording();
  updateUIState();
};

clipboardButton.onclick = () => {
  navigator.clipboard.writeText(created_audio_link.href);
  updateUIState();
};

openQRcodeModal.onclick = () => {

  let link = created_audio_link.href;
  if (link === "") {
    if (isOnListeningPage()) {
      link = window.location.href;
    } else {
      alert("Please record or find a memo first!");
      return;
    }
  }

  qrcodeImage.src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + link;
  qrcodeModal.showModal();
}

closeQRcodeModal.onclick = () => {
  qrcodeModal.close();
}

 
function hasRecording(): boolean {
  return audioChunks.length > 0 || memoURI != null;
}

function isOnListeningPage(): boolean {
  return window.location.href.includes("listen?id=");
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
     
        audioChunks.push(event.data);
        console.log(audioChunks)
    });

    mediaRecorder.addEventListener("stop", function () {
      createAudioFile(audioChunks);
      //because of the async nature of the mediaRecorder, we have to update the UI state here
      updateUIState();
    });
  });
}

function stopRecording() {
  isRecording = false;
  mediaRecorder.stop();
  createAudioFile(audioChunks);
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
  const blob: Blob = new Blob(chunks, { type: audioType });
  const memoURI = URL.createObjectURL(blob);
  //TODO: figure out why you have to set the src here and not in the event listener or stopRecording()
  audioPlayer.src = memoURI;
 
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
function updateUIState() {

  if (isRecording) {
    stopStartButton.innerText = "Stop Recording";
    uploadButton.disabled = true;
    saveButton.disabled = true;
  } else {
    stopStartButton.innerText = "Start Recording";
    uploadButton.disabled = false;
    saveButton.disabled = false;
  }

  if (!hasRecording()) {
    uploadButton.disabled = true;
  }

  if (created_audio_link.href === "" && !isOnListeningPage()) {
    clipboardButton.disabled = true;
  }
}

updateUIState();
