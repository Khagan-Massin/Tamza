/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef } from 'react';
import { useState } from 'react'

export function Recorder() {
  const [recordedChunks, setRecordedChunks] = useState([] as Blob[])
  const [isRecording, setIsRecording] = useState(false)
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  // eslint-disable-next-line prefer-const
  let audioRecorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];


  function hasRecording(): boolean {

    const bool = recordedChunks.length > 0

    return bool
  }

  function handleStopStart(): void {

    if (isRecording) {
      stopRecording()

    } else {
      startRecording()
    }

  }

  function startRecording() {

    if (isRecording) {
      throw new Error("Already recording")
    }


    setRecordedChunks([])

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {

        audioRecorder = new MediaRecorder(stream)
        audioRecorder.start()


        audioRecorder.ondataavailable = (e) => {


          console.log('data available')
          
            setRecordedChunks((prev) => [...prev, e.data]);
            console.log(recordedChunks)
          

        };

        audioRecorder.onstop = () => {
          console.log('stop')
          console.log(audioRecorder.state)
          console.log("recorder stopped");
          saveAudio()
        }


        setIsRecording(true)
        setRecorder(audioRecorder)

      })
      .catch(err => {
        console.log('error getting microphone', err);
      });





  }

  function activateAudioPlayer(): void {
    const file = saveAudio()
    if (audioPlayerRef.current) {
      console.log('audioPlayerRef: ', audioPlayerRef.current)
      audioPlayerRef.current.src = file
      return
    }
    throw new Error("audioPlayerRef is null")
  }

  function stopRecording() {

    if (recorder && recorder.state === 'recording') {

      recorder.stop()
      setIsRecording(false)
      return
    }
    throw new Error("audioRecorder is null or not recording")
    // if you want something to happen after recording stops 
    // put it in the stop event listener not here
  }

  function saveAudio(): string {

    console.log('Saving audio with chunks:');

    console.log();

    const blob: Blob = new Blob(recordedChunks, { type: 'audio/mp3' });

    const soundfile: string = URL.createObjectURL(blob)


    console.log(soundfile)

    return soundfile
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

    if (isRecording) {
      throw new Error("Already recording")
    }

    if (!recorder) {
      throw new Error("recorder is null")
    }

    recorder.start()
    setIsRecording(true)


  }


  return (
    <>
      <button onClick={handleStopStart}>{isRecording ? 'Stop' : 'Start'}</button>

      {hasRecording() &&
        <>
          <button onClick={restartRecording}>Restart</button>
          <button onClick={downloadAudio}>Download</button>
        </>
      }

      <br />

      <audio ref={audioPlayerRef} controls />
    </>
  )


}












