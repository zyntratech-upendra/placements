import { useState, useEffect, useRef } from 'react'
import './InterviewScreen.css'

function InterviewScreen({ sessionData, onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [recording, setRecording] = useState(false)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0)
  const [totalTimeLeft, setTotalTimeLeft] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [recordingStopped, setRecordingStopped] = useState(false)

  // ⛔ NEW → Controls Interview Timer
  const [isTimerRunning, setIsTimerRunning] = useState(true)

  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)
  const questionTimerRef = useRef(null)
  const totalTimerRef = useRef(null)
  const totalInterviewTimeRef = useRef(sessionData.duration_seconds || 300)

  const questions = sessionData.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const timePerQuestion = Math.floor(totalInterviewTimeRef.current / totalQuestions)

  useEffect(() => {
    startCamera()
    setTotalTimeLeft(totalInterviewTimeRef.current)

    return () => {
      stopCamera()
      if (questionTimerRef.current) clearInterval(questionTimerRef.current)
      if (totalTimerRef.current) clearInterval(totalTimerRef.current)
    }
  }, [])

  // Start new recording for each question
  useEffect(() => {
    if (cameraReady && currentQuestion && !recordingStopped) {
      startRecording()
    }
  }, [currentQuestionIndex, cameraReady])

  // ⛔ UPDATED TOTAL INTERVIEW TIMER (Pauses when uploading)
  useEffect(() => {
    if (!isTimerRunning) return; // ⛔ Stop timer while uploading

    totalTimerRef.current = setInterval(() => {
      setTotalTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(totalTimerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(totalTimerRef.current)
  }, [isTimerRunning])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraReady(true)
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Please allow camera and microphone access to continue')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }

  const startRecording = async () => {
    if (!streamRef.current || recording) return

    audioChunksRef.current = []
    setRecordingStopped(false)

    try {
      const audioStream = new MediaStream(streamRef.current.getAudioTracks())

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4"

      const mediaRecorder = new MediaRecorder(audioStream, { mimeType })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = handleRecordingStop

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setRecording(true)

      setQuestionTimeLeft(timePerQuestion)

      if (questionTimerRef.current) clearInterval(questionTimerRef.current)

      questionTimerRef.current = setInterval(() => {
        setQuestionTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      setRecordingStopped(true)

      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current)
        questionTimerRef.current = null
      }
    }
  }

  const handleRecordingStop = async () => {
    if (audioChunksRef.current.length === 0) return

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
    await uploadAnswer(audioBlob)
  }

  const handleNextQuestion = () => {
    if (!recordingStopped) return
    if (uploading) return

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setRecordingStopped(false)
    } else {
      analyzeInterview()
    }
  }

  // ⛔ FIXED → Upload pauses interview timer
  const uploadAnswer = async (audioBlob) => {
    setUploading(true)
    setIsTimerRunning(false) // ⛔ Pause total timer

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'answer.webm')

      const response = await fetch(
        `http://localhost:8000/api/upload-answer/${sessionData.session_id}/${currentQuestion.id}`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Failed to upload answer')
      }
    } catch (error) {
      console.error('Error uploading answer:', error)
      alert('Failed to upload answer. Please try again.')
    } finally {
      setUploading(false)
      setIsTimerRunning(true) // ▶ Resume timer
    }
  }

  const analyzeInterview = async () => {
    setAnalyzing(true)
    stopCamera()

    try {
      const response = await fetch(
        `http://localhost:8000/api/analyze/${sessionData.session_id}`,
        { method: 'POST' }
      )

      if (!response.ok) {
        throw new Error('Failed to analyze interview')
      }

      onComplete()
    } catch (error) {
      console.error('Error analyzing interview:', error)
      alert('Failed to analyze interview. Please check results manually.')
      onComplete()
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="interview-screen">
      <div className="interview-header">
        <div className="progress-info">
          <span className="question-number">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
              }}
            />
          </div>
        </div>
        <div className="time-info">
          <span className="total-time-label">Interview Time:</span>
          <span className="total-time">{formatTime(totalTimeLeft)}</span>
        </div>
      </div>

      <div className="interview-content">
        <div className="video-section">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="video-feed"
          />
          {recording && (
            <div className="recording-indicator">
              <span className="recording-dot"></span>
              Recording
            </div>
          )}
          <div className="timer-container">
            <div className="question-timer">
              <span className="timer-label">Question Time</span>
              <span className="timer-value">{formatTime(questionTimeLeft)}</span>
            </div>
          </div>
        </div>

        <div className="question-section">
          <h2 className="question-title">Your Question</h2>
          <p className="question-text">{currentQuestion?.text}</p>

          {uploading && (
            <div className="status-message uploading">
              <span className="upload-spinner"></span>
              Uploading your answer...
            </div>
          )}

          {analyzing && (
            <div className="status-message analyzing">
              <span className="upload-spinner"></span>
              Analyzing your interview... This may take a moment.
            </div>
          )}

          {recordingStopped && !uploading && !analyzing && (
            <div className="action-section">
              <p className="action-message">Recording complete!</p>
              <button
                className="next-button"
                onClick={handleNextQuestion}
                disabled={uploading}
              >
                {currentQuestionIndex < questions.length - 1
                  ? 'Next Question'
                  : 'Finish Interview'}
              </button>
            </div>
          )}

          {recording && (
            <div className="recording-message">
              <button className="stop-button" onClick={stopRecording}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="interview-footer">
        <div className="question-grid">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className={`question-indicator ${
                index < currentQuestionIndex
                  ? 'completed'
                  : index === currentQuestionIndex
                  ? 'active'
                  : ''
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default InterviewScreen
