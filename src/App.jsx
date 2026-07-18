import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Phone, User, CheckCircle, Download, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import IntroVideoGate from './components/IntroVideoGate.jsx';
import musicUrl from './assets/music.mp3';
import accessCardTemplate from './assets/access-card-template.png';



const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/rsvp'; // Fallback for local development

const EVENT_DATE = new Date('2026-10-10T14:00:00'); // Oct 10, 2026, at 2:00 PM

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [showFlash, setShowFlash] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // RSVP form state
  const [salutation, setSalutation] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [registeredGuest, setRegisteredGuest] = useState(null);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const mainSectionRef = useRef(null);


  // Countdown timer math
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const difference = EVENT_DATE - now;

      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Autoplay placeholder music after entering (ignore video audio)
  useEffect(() => {
    if (!hasEntered) return;

    // Ensure any video remains muted
    if (videoRef.current) {
      videoRef.current.muted = true;
    }

    const a = audioRef.current;
    if (!a) return;

    // Attempt autoplay (may be blocked by browser policies)
    a.currentTime = 0;
    a.play().catch(() => {
      // Autoplay might be blocked until a user gesture
    });
  }, [hasEntered]);

  // When switching tabs: mute on hide, restore (toggle back) on show
  const prevMuteRef = useRef(null);
  useEffect(() => {
    const handleVisibilityChange = () => {
      const a = audioRef.current;
      if (!a) return;

      if (document.visibilityState === 'hidden') {
        // Remember what the user had set, then mute.
        prevMuteRef.current = !a.muted;
        a.muted = true;
        setIsMuted(true);
      } else if (document.visibilityState === 'visible') {
        // Restore previous choice.
        const wasUnmuted = prevMuteRef.current === true;
        a.muted = !wasUnmuted;
        setIsMuted(a.muted);

        // Best-effort resume (may be blocked by browser)
        if (wasUnmuted) {
          a.play().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);


  // Flash overlay lifecycle
  useEffect(() => {

    if (!hasEntered) return;
    if (!showFlash) return;

    const t = window.setTimeout(() => setShowFlash(false), 650);
    return () => window.clearTimeout(t);
  }, [hasEntered, showFlash]);

  // Play video smoothly when entering
  const handleEnterWebsite = () => {
    setHasEntered(true);
    setShowFlash(true);

    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.play().catch((err) => console.log('Audio play prevented: ', err));
    }

    // Smooth scroll down to details
    setTimeout(() => {
      mainSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const toggleMute = async () => {
    const a = audioRef.current;
    if (a) {
      a.muted = !a.muted;
    }

    const shouldMute = a ? a.muted : true;
    setIsMuted(shouldMute);
  };


  // Submit RSVP to Express
  const handleRSVP = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salutation, name, phone })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Already registered
          setRegisteredGuest(data.rsvp);
          // confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          return;
        }
        throw new Error(data.error || 'Failed to submit RSVP.');
      }

      setRegisteredGuest(data.rsvp);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      setSubmitError(err.message || 'Server connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Canvas Generator: Load existing card asset, overlay text, initiate download
  const downloadAccessCard = () => {
    if (!registeredGuest) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Load template via Vite asset pipeline (src/assets -> resolved URL)
    img.src = accessCardTemplate;
    img.crossOrigin = 'anonymous';

    img.onerror = (e) => {
      console.error('Failed to load access card template:', e);
    };


    // img.onload = () => {
    //   canvas.width = img.naturalWidth;
    //   canvas.height = img.naturalHeight;

    //   // Draw background template
    //   ctx.drawImage(img, 0, 0);

    //   // --- TEXT RENDERING STYLE SETUP ---
    //   // Elegant Serif font for Guest's Name
    //   ctx.font = 'bold 100px "Playfair Display", Georgia, serif';
    //   ctx.fillStyle = '#fff'; // Burgundy Accent Color
    //   ctx.textAlign = 'center';

    //   // Draw Salutation + Full Name (Centered horizontally, positioned above ADMITS ONE)
    //   const fullName = `${registeredGuest.salutation} ${registeredGuest.name}`.toUpperCase();
    //   ctx.fillText(fullName, canvas.width / 2, canvas.height - 180);

    //   // Access Code Styling
    //   ctx.font = 'bold 24px "Montserrat", sans-serif';
    //   ctx.fillStyle = '#064e3b'; // Emerald Green Accent Color
    //   ctx.letterSpacing = '3px';

    //   // Draw unique Code (Centered near the base border)
    //   ctx.fillText(`ACCESS CODE: ${registeredGuest.accessCode}`, canvas.width / 2, canvas.height - 120);

    img.onload = () => {
      canvas.width = img.naturalWidth;   // This will be 3704
      canvas.height = img.naturalHeight; // This will be 2139

      // Draw background template
      ctx.drawImage(img, 0, 0);

      // --- ACCESS CODE RENDERING STYLE SETUP ---
      // Using a bold sans-serif to match the "10. 10. 26" aesthetic.
      // We scale the font size up to 80px so it is perfectly readable on a 3704px wide canvas.
      ctx.font = 'bold 80px "Montserrat", "Century Gothic", sans-serif';
      ctx.fillStyle = '#fbf0e3'; // Warm cream off-white matched from the original card's logo color

      // Align text to the left so it sits neatly in the corner
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top'; // Easier calculation from the top boundary

      // Add subtle letter spacing to replicate the date style
      if ('letterSpacing' in ctx) {
        ctx.letterSpacing = '6px';
      }

      // Draw unique Code in the top left corner. 
      // Margins of 120px are used so the text doesn't clash with the physical borders.
      const paddingX = 120;
      const paddingY = 120;
      const accessCodeText = `ACCESS CODE: ${registeredGuest.accessCode}`.toUpperCase();

      ctx.fillText(accessCodeText, paddingX, paddingY);
      // Trigger Download
      const link = document.createElement('a');
      link.download = `Wedding_Access_Card_${registeredGuest.name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  return (
    <>
      {!hasEntered ? (
        <IntroVideoGate
          onEnter={() => {
            setTimeout(() => {
              mainSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
              setHasEntered(true);
            }, 3000);
          }}
        />
      ) : (
        <div className="min-h-screen bg-ivory flex flex-col justify-between selection:bg-emerald selection:text-white">
          {showFlash && <div aria-hidden="true" className="flash-in-overlay pointer-events-none" />}

          {/* Background music (placeholder) */}
          <audio
            ref={audioRef}
            src={musicUrl}
            preload="auto"
            loop
          />




          {/* 1. INTRO VIDEO GATE (intro only; rest of page appears after clicking button) */}
          <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[url('./assets/background-mobile.png')] md:bg-[url('./assets/background-desktop.png')] bg-cover bg-center">
            {/* Dynamic Mute/Unmute Overlay Control */}
            <button
              onClick={toggleMute}
              className="absolute top-6 right-6 z-20 bg-burgundy-dark/60 border border-beige p-3 rounded-full text-beige hover:bg-emerald transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <div className="relative z-10 text-center px-4 max-w-xl flex flex-col items-center">
              <span className="text-beige text-xs uppercase tracking-[0.3em] mb-4">You Are Cordially Invited</span>
              <h1 className="text-beige font-serif text-5xl md:text-6xl font-light tracking-wide leading-tight mb-3">
                Mercy & Chidi
              </h1>
              <div className="w-24 h-[1px] bg-beige/40 my-3" />
              <p className="text-beige/90 italic font-serif text-lg md:text-xl mb-8">
                October 10, 2026 • 2:00 PM
              </p>

              <button
                onClick={() => mainSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="text-beige/60 text-xs tracking-widest uppercase hover:text-white transition duration-300 animate-bounce"
              >
                Scroll to RSVP ↓
              </button>
            </div>
          </section>

          {/* 2. MAIN SECTION (Appears smoothly after clicking Reveal) */}
          <div
            ref={mainSectionRef}
            className={`transition-opacity duration-1000 ${hasEntered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            {/* Countdown Timer Banner */}
            <div className="bg-emerald text-beige py-12 px-4 shadow-inner text-center">
              <p className="font-serif italic text-lg mb-4 text-beige/80">Counting down to our forever...</p>
              <div className="flex justify-center space-x-6 md:space-x-12">
                {[
                  { label: 'Days', value: countdown.days },
                  { label: 'Hours', value: countdown.hours },
                  { label: 'Minutes', value: countdown.minutes },
                  { label: 'Seconds', value: countdown.seconds }
                ].map((unit, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-3xl md:text-5xl font-serif text-white">{String(unit.value).padStart(2, '0')}</span>
                    <span className="text-xs uppercase tracking-widest text-beige/70 mt-1">{unit.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Wedding Details Summary */}
            <section className="py-20 px-4 max-w-4xl mx-auto text-burgundy-dark border-b border-beige">
              <div className="space-y-6 w-5/6 md:w-1/2 mx-auto md:text-center">
                <h2 className="text-3xl font-serif font-light text-burgundy">The Celebration</h2>
                <p className="text-stone-600 leading-relaxed">
                  We look forward to sharing our joy with our nearest and dearest. Your presence at our wedding ceremony and reception is the greatest gift we could request.
                </p>
                <div className="space-y-4 pt-2 text-left flex justify-center flex-col md:flex-row md:space-x-12 md:space-y-0">
                  <div className="flex items-center space-x-4">
                    <Calendar className="w-6 h-6 text-emerald" />
                    <div>
                      <h4 className="font-semibold text-sm">WHEN</h4>
                      <p className="text-stone-600 text-sm">October 10, 2026 at 2:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <MapPin className="w-6 h-6 text-emerald" />
                    <div>
                      <h4 className="font-semibold text-sm">WHERE</h4>
                      <p className="text-stone-600 text-sm">See invitation card for details</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLOR THEME DESIGN PANEL */}
              {/* <div className="bg-beige/30 p-8 rounded border border-beige flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl text-burgundy mb-2">Dress Code</h3>
                  <p className="text-sm text-stone-600 mb-6">
                    We kindly invite our guests to match our celebration colors of Emerald Green, Burgundy, Beige and Ivory.
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] uppercase tracking-wider font-semibold">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-emerald mb-2 shadow" />
                    <span>Emerald</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-burgundy mb-2 shadow" />
                    <span>Burgundy</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-ivory border border-beige-dark mb-2 shadow" />
                    <span>Ivory</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-beige border border-beige-dark mb-2 shadow" />
                    <span>Beige</span>
                  </div>
                </div>
              </div> */}
            </section>

            {/* RSVP FORM SECTION & ACCESS CARD DOWNLOAD */}
            <section className="py-20 px-4 bg-beige/10">
              <div className="max-w-2xl mx-auto bg-white border border-beige p-8 md:p-12 rounded-lg shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald via-burgundy to-beige" />

                {!registeredGuest ? (
                  // RSVP Input Screen
                  <div>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-serif text-burgundy mb-2">Kindly RSVP</h2>
                      <p className="text-stone-600 text-sm">Please register your attendance by filling out the form below.</p>
                    </div>

                    <form onSubmit={handleRSVP} className="space-y-6">
                      {submitError && (
                        <div className="bg-burgundy/10 text-burgundy text-sm p-3 rounded border border-burgundy/20">
                          {submitError}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs uppercase tracking-wider font-semibold mb-2 text-stone-600">Salutation</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Mr', 'Mrs', 'Ms'].map((sal) => (
                            <button
                              key={sal}
                              type="button"
                              onClick={() => setSalutation(sal)}
                              className={`py-3 border rounded text-sm font-semibold transition-all ${salutation === sal ? 'bg-burgundy text-white border-burgundy' : 'bg-ivory text-stone-700 border-beige-dark hover:bg-beige/30'}`}
                            >
                              {` ${sal}.`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider font-semibold mb-2 text-stone-600">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3.5 w-5 h-5 text-stone-400" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full pl-11 pr-4 py-3 border border-beige-dark bg-ivory rounded focus:outline-none focus:ring-1 focus:ring-emerald focus:border-emerald text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider font-semibold mb-2 text-stone-600">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3.5 w-5 h-5 text-stone-400" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0801 234 5678"
                            className="w-full pl-11 pr-4 py-3 border border-beige-dark bg-ivory rounded focus:outline-none focus:ring-1 focus:ring-emerald focus:border-emerald text-sm"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!salutation || !name || !phone || isSubmitting}
                        className="w-full py-4 bg-emerald text-white rounded font-sans font-semibold text-sm tracking-widest uppercase hover:bg-emerald-light disabled:bg-stone-300 disabled:cursor-not-allowed transition duration-300 shadow-md"
                      >
                        {isSubmitting ? 'Registering Attendance...' : 'Confirm RSVP'}
                      </button>
                    </form>
                  </div>
                ) : (
                  // Success Screen with dynamically drawn downloadable pass
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald/10 text-emerald mb-2">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-serif text-emerald">We can't wait to see you!</h2>
                    <p className="text-stone-600 max-w-md mx-auto">
                      Thank you,{' '}
                      <span className="font-semibold">
                        {registeredGuest.salutation} {registeredGuest.name}
                      </span>
                      . Your attendance has been locked in, and your entry invitation is generated below.
                    </p>

                    {/* VISUAL LAYOUT PREVIEW FOR USER */}
                    <div className="relative border-4 border-double border-beige p-6 max-w-md mx-auto bg-ivory rounded-lg shadow-sm mt-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald mb-1">Official Access Code</p>
                      <p className="text-3xl font-serif tracking-widest font-semibold text-burgundy mb-2">{registeredGuest.accessCode}</p>
                      <div className="h-[1px] bg-beige-dark w-1/3 mx-auto my-3" />
                      <p className="text-sm font-semibold tracking-wider text-stone-700">
                        {registeredGuest.salutation} {registeredGuest.name.toUpperCase()}
                      </p>
                      <p className="text-[10px] text-stone-500 uppercase mt-2">1 Admit Only • Non-transferable</p>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={downloadAccessCard}
                        className="inline-flex items-center space-x-2 px-8 py-4 bg-burgundy hover:bg-burgundy-light text-beige rounded font-semibold text-xs tracking-widest uppercase transition duration-300 shadow-md"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Access Card</span>
                      </button>
                      <p className="text-xs text-stone-400 mt-2">Please present this digital pass at the entrance gate.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* FOOTER */}
          <footer className="text-center py-10 bg-burgundy-dark text-beige/50 text-xs tracking-widest uppercase border-t border-beige/10">
            © 2026 Mercy & Chidi • Made with Love
          </footer>
        </div>
      )}
    </>
  );
}

