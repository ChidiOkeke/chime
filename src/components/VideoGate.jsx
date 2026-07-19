// import React, { useEffect, useRef, useState } from 'react'

// export default function VideoGate({ unlocked, onUnlock }) {
//   const videoRef = useRef(null)
//   const [ready, setReady] = useState(false)

//   useEffect(() => {
//     const v = videoRef.current
//     if (!v) return
//     if (unlocked) {
//       // play after unlock
//       v.muted = true
//       v.play().catch(() => {})
//     } else {
//       try {
//         v.pause()
//         v.currentTime = 0
//       } catch {}
//     }
//   }, [unlocked])

//   return (
//     <section className={`videoSection ${unlocked ? 'videoSection--unlocked' : ''}`}>
//       <div className="videoFrame">
//         <video
//           ref={videoRef}
//           className="video"
//           preload="metadata"
//           playsInline
//           muted
//           loop={false}
//           onCanPlay={() => setReady(true)}
//         >
//           <source src="/rsvp-video.mp4" type="video/mp4" />
//         </video>

//         {!unlocked && (
//           <div className="videoOverlay" role="button" tabIndex={0}>
//             <div className="videoOverlay__scrim" />
//             <div className="videoOverlay__content">
//               <div className="videoOverlay__title">RSVP</div>
//               <button
//                 className="btn btn--primary btn--overlay"
//                 onClick={onUnlock}
//                 disabled={!ready}
//               >
//                 {ready ? 'Enter RSVP' : 'Loading…'}
//               </button>
//               <div className="videoOverlay__note">Your RSVP unlocks after you begin the ceremony video.</div>
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   )
// }


// import React, { useRef, useState } from 'react'

// export default function VideoGate({ unlocked, onUnlock }) {
//   const videoRef = useRef(null)
//   // 1. Remove the 'ready' state block so iOS users can always click
//   const [hasClicked, setHasClicked] = useState(false) 

//   const handleRSVPClick = async () => {
//     setHasClicked(true)
//     const v = videoRef.current
    
//     if (v) {
//       // 2. Priming/Playing the video directly inside the user click stack
//       v.muted = true
//       v.playsInline = true
      
//       try {
//         await v.play()
//       } catch (err) {
//         console.error("Playback prevented by iOS restriction:", err)
//       }
//     }
    
//     // 3. Let the parent know the RSVP button was clicked
//     if (onUnlock) {
//       onUnlock()
//     }
//   }

//   return (
//     <section className={`videoSection ${unlocked ? 'videoSection--unlocked' : ''}`}>
//       <div className="videoFrame">
//         <video
//           ref={videoRef}
//           className="video"
//           preload="auto" // 'auto' helps iOS prepare the buffer
//           playsInline    // React camelCase
//           webkit-playsinline="true" // Fallback for strict iOS WebViews
//           muted
//           loop={false}
//         >
//           <source src="/rsvp-video.mp4" type="video/mp4" />
//         </video>

//         {!unlocked && (
//           <div className="videoOverlay" role="button" tabIndex={0}>
//             <div className="videoOverlay__scrim" />
//             <div className="videoOverlay__content">
//               <div className="videoOverlay__title">RSVP</div>
//               <button
//                 className="btn btn--primary btn--overlay"
//                 onClick={handleRSVPClick} // Triggers play immediately
//                 disabled={hasClicked} // Prevent double clicks
//               >
//                 {hasClicked ? 'Loading…' : 'Enter RSVP'}
//               </button>
//               <div className="videoOverlay__note">
//                 Your RSVP unlocks after you begin the ceremony video.
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   )
// }


import React, { useRef, useState } from 'react'

export default function VideoGate({ unlocked, onUnlock }) {
  const videoRef = useRef(null)
  const [hasClicked, setHasClicked] = useState(false) 

  const handleRSVPClick = async () => {
    if (hasClicked) return
    setHasClicked(true)
    
    const v = videoRef.current
    
    if (v) {
      // Correct lowercase property assignment for native DOM elements
      v.muted = true
      v.setAttribute('playsinline', 'true')
      v.setAttribute('webkit-playsinline', 'true')
      
      try {
        // Force iOS to wake up and fetch the source stream
        v.load() 
        await v.play()
      } catch (err) {
        // Log it, but don't block the user from proceeding
        console.warn("Playback prevented or interrupted by iOS:", err)
      }
    }
    
    // Defer the parent state update slightly (100ms)
    // This allows the video thread to initialize cleanly before the DOM shifts
    setTimeout(() => {
      if (onUnlock) {
        onUnlock()
      }
    }, 100)
  }

  return (
    <section className={`videoSection ${unlocked ? 'videoSection--unlocked' : ''}`}>
      <div className="videoFrame">
        <video
          ref={videoRef}
          className="video"
          preload="auto"
          playsInline
          webkit-playsinline="true"
          muted
          loop={false}
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
                onClick={handleRSVPClick}
                disabled={hasClicked}
              >
                {hasClicked ? 'Loading…' : 'Enter RSVP'}
              </button>
              <div className="videoOverlay__note">
                Your RSVP unlocks after you begin the ceremony video.
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}