import React, { useEffect, useRef, useState } from 'react'

export default function VideoGate({ unlocked, onUnlock }) {
  const videoRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (unlocked) {
      // play after unlock
      v.muted = true
      v.play().catch(() => {})
    } else {
      try {
        v.pause()
        v.currentTime = 0
      } catch {}
    }
  }, [unlocked])

  return (
    <section className={`videoSection ${unlocked ? 'videoSection--unlocked' : ''}`}>
      <div className="videoFrame">
        <video
          ref={videoRef}
          className="video"
          preload="metadata"
          playsInline
          muted
          loop={false}
          onCanPlay={() => setReady(true)}
        >
          <source src="/rsvp-video.mp4" type="video/mp4" />
        </video>

        {!unlocked && (
          <div className="videoOverlay" role="button" tabIndex={0}>
            <div className="videoOverlay__scrim" />
            <div className="videoOverlay__content">
              <div className="videoOverlay__title">RSVP</div>
              <button
                className="btn btn--primary btn--overlay"
                onClick={onUnlock}
                disabled={!ready}
              >
                {ready ? 'Enter RSVP' : 'Loading…'}
              </button>
              <div className="videoOverlay__note">Your RSVP unlocks after you begin the ceremony video.</div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

