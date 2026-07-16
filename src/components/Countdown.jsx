import React, { useEffect, useMemo, useState } from 'react'

function pad2(n) {
  return String(n).padStart(2, '0')
}

export default function Countdown({ target }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const parts = useMemo(() => {
    const diffMs = Math.max(0, target.getTime() - now.getTime())

    const totalMinutes = Math.floor(diffMs / 60000)
    const days = Math.floor(totalMinutes / (60 * 24))
    const hours = Math.floor((totalMinutes - days * 60 * 24) / 60)
    const minutes = totalMinutes - days * 60 * 24 - hours * 60

    return { days, hours, minutes }
  }, [now, target])

  return (
    <div className="countdown" role="timer" aria-label="Countdown to event">
      <div className="countdown__item">
        <div className="countdown__num">{parts.days}</div>
        <div className="countdown__label">Days</div>
      </div>
      <div className="countdown__sep" />
      <div className="countdown__item">
        <div className="countdown__num">{pad2(parts.hours)}</div>
        <div className="countdown__label">Hours</div>
      </div>
      <div className="countdown__sep" />
      <div className="countdown__item">
        <div className="countdown__num">{pad2(parts.minutes)}</div>
        <div className="countdown__label">Minutes</div>
      </div>
    </div>
  )
}

