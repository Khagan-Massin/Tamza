/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef } from 'react';
import { useState } from 'react'

export function Recorder() {
  const [recordedChunks, setRecordedChunks] = useState([] as Blob[])
  const [isRecording, setIsRecording] = useState(false)
  const [recorder, setRecorder] = useState<MediaRecorder| null>(null); 

  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  function hasRecording(): boolean {
    return recordedChunks.length > 0
  }

  function handleStopStart(): void {

    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
    console.log('After: isRecording: ' + isRecording)
  }

  function startRecording() {

    if (isRecording) {
      throw new Error("Already recording")
    }

    setIsRecording(true)
    setRecordedChunks([])

    // TODO: start recording


    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      setRecorder(new MediaRecorder(stream))
      recorder?.addEventListener('dataavailable', (e) => {
        if (e.data.size > 0) {
          setRecordedChunks((prev: Blob[]) => [...prev, e.data])
        }
      });

      recorder?.addEventListener('stop', () => {
        console.log('stop event')
        activateAudioPlayer()
      });
    });
    
 
  }

  function stopRecording() {

    if (!isRecording) {
      throw new Error("Not recording")
    }

    setIsRecording(false)

    recorder?.stop();

    // if you want something to happen after recording stops 
    // put it in the stop event listener not here
  }

  function saveAudio(): string {
    const blob: Blob = new Blob(recordedChunks, { type: 'audio/mp3' });

    const soundfile: string = URL.createObjectURL(blob)

    return soundfile
  }

    function activateAudioPlayer(): void {
      const file = saveAudio()
      audioPlayerRef.current!.src = file
       
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

    function restartRecording() {

  

     

      setIsRecording(false)
      setRecordedChunks([])

      


 

    }


    const html = (
      <div>
        <button onClick={handleStopStart}>{isRecording ? 'Stop' : 'Start'}</button>
        <button onClick={restartRecording}>Restart</button>
        <button onClick={activateAudioPlayer}>Play</button>
        <button onClick={downloadAudio}>Download</button>
        <audio ref={audioPlayerRef} controls />
      </div>
    )

    





    return html


  }












