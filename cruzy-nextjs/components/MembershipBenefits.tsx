'use client'

import { useState } from 'react'

const benefits = [
  {
    img: 'https://cruzy.com/files/images/Save%20An%20Average%20of%2025_%20on%20Bookings.png',
    title: 'Save an average of 25%',
    desc: 'As a Cruzy+ Member, you can enjoy substantial savings on your cruise bookings—averaging 25%. This means more money to spend on the experiences you love!',
  },
  {
    img: 'https://cruzy.com/files/images/f2f.png',
    title: 'Priority Boarding',
    desc: 'Experience a seamless start to your vacation with the Faster to the Fun™ package, available at no extra charge when available and requested.',
  },
  {
    img: 'https://cruzy.com/files/images/Complimentary%20Upgrades.png',
    title: 'Complimentary Upgrades',
    desc: 'Elevate your cruising experience with complimentary cabin upgrades. Enjoy a better location on the ship, enhancing your comfort and overall journey.',
  },
  {
    img: 'https://cruzy.com/files/images/Concierge%20Call%20Line.png',
    title: 'Concierge Call Line',
    desc: 'Enjoy direct access to a dedicated phone line just for Cruzy+ Members. Whenever you need assistance, a friendly voice is ready to help with your inquiries.',
  },
  {
    img: 'https://cruzy.com/files/images/Referral%20Reward%20Program.png',
    title: 'Referral Reward Program',
    desc: "Share the joy of cruising with your friends! When you refer someone to join Cruzy+, you'll receive a special gift as a thank-you.",
  },
  {
    img: 'https://cruzy.com/files/images/Personal%20Cruise%20Counselor.png',
    title: 'Personal Cruise Counselor',
    desc: 'Experience unparalleled service with your own Personal Cruise Counselor (PCC). Dedicated to providing you with a tailored booking experience on every call.',
  },
  {
    img: 'https://cruzy.com/files/images/Birthday%20Benefit.png',
    title: 'Birthday Benefit',
    desc: 'Cruzy+ Members receive a unique birthday incentive to encourage bookings during their birthday month, making your celebrations even more memorable.',
  },
  {
    img: 'https://cruzy.com/files/images/Friends%20-%20Family%20Discount.png',
    title: 'Friends & Family Discounts',
    desc: 'Cruzy+ Members can extend their special pricing to three authorized users, allowing friends and family to book sailings at the same fantastic rates.',
  },
]

const VISIBLE = 5 // show 5 at a time like the real carousel

export default function MembershipBenefits() {
  const [startIdx, setStartIdx] = useState(0)

  const prev = () => setStartIdx((i) => Math.max(0, i - 1))
  const next = () => setStartIdx((i) => Math.min(benefits.length - VISIBLE, i + 1))

  const visible = benefits.slice(startIdx, startIdx + VISIBLE)

  return (
    <section className="py-10" style={{ background: '#f5f8ff' }}>
      <div className="container mx-auto px-4">
        <div className="relative flex items-center gap-2">
          {/* Prev arrow */}
          <button
            onClick={prev}
            disabled={startIdx === 0}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 transition-all"
            aria-label="Previous"
          >
            <span style={{ fontSize: '18px', color: '#10559a' }}>‹</span>
          </button>

          {/* Cards */}
          <div className="flex-1 grid gap-4" style={{ gridTemplateColumns: `repeat(${VISIBLE}, 1fr)` }}>
            {visible.map((b) => (
              <div
                key={b.title}
                className="bg-white rounded-lg p-4 text-center flex flex-col items-center gap-2"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', minHeight: '200px' }}
              >
                <div className="w-20 h-20 flex items-center justify-center flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.img}
                    alt={b.title}
                    style={{ width: '72px', height: '72px', objectFit: 'contain' }}
                  />
                </div>
                <h3
                  className="font-bold text-sm"
                  style={{ color: '#10559a', fontFamily: 'Poppins, sans-serif' }}
                >
                  {b.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Next arrow */}
          <button
            onClick={next}
            disabled={startIdx >= benefits.length - VISIBLE}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 transition-all"
            aria-label="Next"
          >
            <span style={{ fontSize: '18px', color: '#10559a' }}>›</span>
          </button>
        </div>
      </div>
    </section>
  )
}
