// import React, { useEffect, useRef, useState } from 'react';
// import introVideoUrl from '../assets/intro-vid.mp4';
// import introVideoMobileUrl from '../assets/new-intro-video-cropped.mp4';


// export default function IntroVideoGate({ onEnter }) {
//   const isMobile = typeof window !== 'undefined' ? window.matchMedia('(max-width: 640px)').matches : false;
//   const videoRef = useRef(null);

//   const [ready, setReady] = useState(false)
//   const [hasStarted, setHasStarted] = useState(false);

//   useEffect(() => {
//     const v = videoRef.current;
//     if (!v) return;

//     // Keep it muted for autoplay policies.
//     v.muted = true;
//   }, []);

//   const handleEnter = async () => {
//     const v = videoRef.current;
//     if (!v) return;

//     try {
//       // After click we can allow unmute if desired.
//       v.muted = true;
//       await v.play();
//     } catch {
//       // If autoplay w/ sound is blocked, still transition.
//       v.muted = true;
//       // Fallback: Try playing muted if the absolute strict policy rejected it
//       try {
//         await v.play();
//       } catch (e) {
//         console.error(e);

//       }
//     }
//     onEnter?.();
//   };

//   return (
//     <section
//       className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-burgundy-dark">
//       {/* <video
//         ref={videoRef}
//         className="absolute z-0 w-auto min-w-full min-h-full max-w-none filter object-cover"
//         src={introVideoUrl}
//         loop={false}
//         muted
//         playsInline
//         onCanPlay={() => setReady(true)}
//         onEnded={() => onEnter?.()}
//         onClick={(e) => e.target.play()}
//       /> */}

//       <video
//         ref={videoRef}
//         className={`z-0 w-auto min-w-full min-h-full max-w-none filter ${isMobile ? 'scale-[1]' : 'scale-[1.3]'} object-cover
//           }`}
//         src={isMobile ? introVideoMobileUrl : introVideoUrl}
//         loop={false}
//         muted
//         playsInline
//         onCanPlay={() => setReady(true)}
//         onEnded={() => onEnter?.()}
//       /> 

      

//       {/* Only overlay allowed: RSVP button. Hidden once video playback is initiated. */}
//       {!hasStarted && (
//         <button
//           type="button"
//           onClick={handleEnter}
//           disabled={!ready}
//           className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 px-8 py-4 bg-burgundy text-beige hover:bg-emerald font-sans font-semibold text-sm tracking-[0.2em] uppercase rounded border border-beige/40 transition-all duration-300 shadow-2xl transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
//         >
//           {ready ? 'RSVP' : 'Loading…'}
//         </button>
//       )}
//     </section>
//   );
// }




import React, { useEffect, useRef, useState } from 'react';
import introVideoUrl from '../assets/intro-vid.mp4';
import introVideoMobileUrl from '../assets/new-intro-video-cropped.mp4';


export default function IntroVideoGate({ onEnter }) {
  const isMobile = typeof window !== 'undefined' ? window.matchMedia('(max-width: 640px)').matches : false;
  const videoRef = useRef(null);

  const [ready, setReady] = useState(false)
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // Keep it muted for autoplay policies.
    v.muted = true;

    // iOS Safety: Force inline execution flags manually on the underlying engine
    v.setAttribute('playsinline', 'true');
    v.setAttribute('webkit-playsinline', 'true');

    // iOS Safety: Unstuck button if the element already buffered behind the scenes
    if (v.readyState >= 2) {
      setReady(true);
    }
  }, []);

  const handleEnter = async (e) => {

    if (e && e.stopPropagation) e.stopPropagation();
    
    if (hasStarted) return; // Prevent multiple taps from messing with the playback stream

    const v = videoRef.current;
    if (!v) return;

    setHasStarted(true); // Instantly hide the RSVP button layout layer

    try {
      v.muted = true;
      await v.play();
    } catch {
      v.muted = true;
      try {
        await v.play();
      } catch (e) {
        console.error("Playback blocked entirely:", e);
        onEnter?.(); // Safe fallback to webpage if the hardware blocks video entirely
        return;
      }
    }
    // REMOVED onEnter?.() from here so it doesn't instantly skip the video!
  };

  return (
    <section  onClick={handleEnter}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-burgundy-dark">
      {/* <video
        ref={videoRef}
        className="absolute z-0 w-auto min-w-full min-h-full max-w-none filter object-cover"
        src={introVideoUrl}
        loop={false}
        muted
        playsInline
        onCanPlay={() => setReady(true)}
        onEnded={() => onEnter?.()}
        onClick={(e) => e.target.play()}
      /> */}

      <video
        ref={videoRef}
        className={`z-0 w-auto min-w-full min-h-full max-w-none filter ${isMobile ? 'scale-[1]' : 'scale-[1.3]'} object-cover
          }`}
        src={isMobile ? introVideoMobileUrl : introVideoUrl}
        loop={false}
        muted
        playsInline
        webkit-playsinline="true"
        preload="auto"
        onCanPlay={() => setReady(true)}
        onLoadedData={() => setReady(true)} // Double hook backup to guarantee button unlocks on iOS
        onEnded={() => onEnter?.()} // <-- This safely handles transitioning to the page ONLY when video completes!
      /> 

      

      {/* Only overlay allowed: RSVP button. Hidden once video playback is initiated. */}
      {!hasStarted && (
        <button
          type="button"
          onClick={handleEnter}
          disabled={!ready}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 px-8 py-4 bg-burgundy text-beige hover:bg-emerald font-sans font-semibold text-sm tracking-[0.2em] uppercase rounded border border-beige/40 transition-all duration-300 shadow-2xl transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {ready ? 'RSVP' : 'Loading…'}
        </button>
      )}
    </section>
  );
}