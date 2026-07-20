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

//     // iOS Safety: Force inline execution flags manually on the underlying engine
//     v.setAttribute('playsinline', 'true');
//     v.setAttribute('webkit-playsinline', 'true');

//     // iOS Safety: Unstuck button if the element already buffered behind the scenes
//     if (v.readyState >= 2) {
//       setReady(true);
//     }
//   }, []);

//   const handleEnter = async (e) => {

//     if (e && e.stopPropagation) e.stopPropagation();

//     if (hasStarted) return; // Prevent multiple taps from messing with the playback stream

//     const v = videoRef.current;
//     if (!v) return;

//     setHasStarted(true); // Instantly hide the RSVP button layout layer

//     try {
//       v.muted = true;
//       await v.play();
//     } catch {
//       v.muted = true;
//       try {
//         await v.play();
//       } catch (e) {
//         console.error("Playback blocked entirely:", e);
//         onEnter?.(); // Safe fallback to webpage if the hardware blocks video entirely
//         return;
//       }
//     }
//     // REMOVED onEnter?.() from here so it doesn't instantly skip the video!
//   };

//   return (
//     <section  onClick={handleEnter}
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
//         webkit-playsinline="true"
//         preload="auto"
//         onCanPlay={() => setReady(true)}
//         onLoadedData={() => setReady(true)} // Double hook backup to guarantee button unlocks on iOS
//         onEnded={() => onEnter?.()} // <-- This safely handles transitioning to the page ONLY when video completes!
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


// import React, { useEffect, useRef, useState } from 'react';
// import introVideoUrl from '../assets/intro-vid.mp4';
// import introVideoMobileUrl from '../assets/new-intro-video-cropped.mp4';

// export default function IntroVideoGate({ onEnter }) {
//   const videoRef = useRef(null);

//   const [ready, setReady] = useState(false);
//   const [hasStarted, setHasStarted] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [isOperaMini, setIsOperaMini] = useState(false);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const mediaQuery = window.matchMedia('(max-width: 640px)');
//       setIsMobile(mediaQuery.matches);

//       const handler = (e) => setIsMobile(e.matches);
//       mediaQuery.addEventListener('change', handler);

//       const isMini = Object.prototype.toString.call(window.operamini) === '[object OperaMini]' || 
//                      navigator.userAgent.includes('Opera Mini');
//       setIsOperaMini(isMini);

//       // Core Fix: If it's a normal browser (like iOS Safari), assume capability.
//       // Do not force the user to wait for unstable loading hooks on old hardware.
//       setReady(true);

//       return () => mediaQuery.removeEventListener('change', handler);
//     }
//   }, []);

//   useEffect(() => {
//     const v = videoRef.current;
//     if (!v || isOperaMini) return;

//     // Force iOS properties explicitly directly onto the element
//     v.muted = true;
//     v.setAttribute('playsinline', 'true');
//     v.setAttribute('webkit-playsinline', 'true');
//   }, [isOperaMini]);

//   const handleEnter = async (e) => {
//     if (e && e.stopPropagation) e.stopPropagation();
//     if (hasStarted) return; 

//     setHasStarted(true); 

//     const v = videoRef.current;
//     if (!v || isOperaMini) {
//       onEnter?.();
//       return;
//     }

//     try {
//       v.muted = true;
//       // Core iOS Fix: playsinline requires synchronous execution on the click thread
//       await v.play();
//     } catch (err) {
//       console.warn("Playback blocked or interrupted by iOS:", err);
//       // Fail gracefully: If Low Power Mode or iOS restrictions block execution, transition immediately
//       onEnter?.(); 
//     }
//   };

//   return (
//     <section onClick={handleEnter}
//       className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-burgundy-dark">

//       {!isOperaMini && (
//         <video
//           ref={videoRef}
//           className={`z-0 w-auto min-w-full min-h-full max-w-none filter ${isMobile ? 'scale-[1]' : 'scale-[1.3]'} object-cover`}
//           src={isMobile ? introVideoMobileUrl : introVideoUrl}
//           loop={false}
//           muted
//           playsInline
//           webkitPlaysInline={true} // React-safe camelCase attribute pass-through
//           preload="metadata" // Safer choice for iOS Low Power Mode
//           onEnded={() => onEnter?.()} 
//         />
//       )}

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
// PRO-TIP: Import a lightweight compressed JPG/WebP snapshot of the first frame
import videoPosterUrl from '../assets/intro-poster.jpg'; 

export default function IntroVideoGate({ onEnter }) {
  const videoRef = useRef(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVideoSupported, setIsVideoSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(max-width: 640px)');
      setIsMobile(mediaQuery.matches);
      const handler = (e) => setIsMobile(e.matches);
      mediaQuery.addEventListener('change', handler);

      const videoElement = document.createElement('video');
      const canPlayVideo = !!(videoElement.canPlayType && videoElement.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"').replace(/no/, ''));
      const isOperaMini = Object.prototype.toString.call(window.operamini) === '[object OperaMini]' || 
                         navigator.userAgent.includes('Opera Mini');

      if (!canPlayVideo || isOperaMini) {
        setIsVideoSupported(false);
      }

      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVideoSupported) return;

    v.muted = true;
    v.defaultMuted = true; 
    v.setAttribute('playsinline', 'true');
    v.setAttribute('webkit-playsinline', 'true');
  }, [isVideoSupported]);

  const handleEnter = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (hasStarted) return; 

    setHasStarted(true); 

    const v = videoRef.current;
    if (!v || !isVideoSupported) {
      onEnter?.();
      return;
    }

    try {
      v.muted = true;
      await v.play();
    } catch (err) {
      console.warn("Media playback interrupted or unsupported by hardware:", err);
      onEnter?.(); 
    }
  };

  return (
    <section 
      onClick={handleEnter}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-burgundy-dark select-none"
    >

      {isVideoSupported && (
        <video
          ref={videoRef}
          className={`z-0 w-auto min-w-full min-h-full max-w-none filter ${isMobile ? 'scale-[1]' : 'scale-[1.3]'} object-cover`} 
          src={isMobile ? introVideoMobileUrl : introVideoUrl}
          loop={false}
          muted
          playsInline
          webkitPlaysInline={true}
          autoPlay={false}

          // FIX 1: Change to "auto" so standard browsers buffer and paint the first frame immediately
          preload="auto" 

          // FIX 2 (Optional but Highly Recommended): Add a poster image fallback.
          // This ensures a beautiful thumbnail shows instantly even on slow connections 
          // or mobile data saving modes that ignore preload="auto".
          poster={videoPosterUrl}
          onEnded={() => onEnter?.()}
          
        />
      )}

      {!hasStarted && (
        <button
          type="button"
          onClick={handleEnter}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 px-8 py-4 bg-burgundy text-beige hover:bg-emerald font-sans font-semibold text-sm tracking-[0.2em] uppercase rounded border border-beige/40 transition-all duration-300 shadow-2xl transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          RSVP
        </button>
      )}
    </section>
  );
}