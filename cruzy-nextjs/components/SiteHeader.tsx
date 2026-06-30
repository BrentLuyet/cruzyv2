'use client'

interface SiteHeaderProps {
  bookYourCruiseHref?: string
  bookYourCruiseTarget?: '_self' | '_blank'
}

export default function SiteHeader({ bookYourCruiseHref, bookYourCruiseTarget }: SiteHeaderProps = {}) {
  const portalHome = 'https://portal.cruzyv2.luyetcompanies.com'
  const portalLogin = 'https://portal.cruzyv2.luyetcompanies.com/login'
  const bookingHref = bookYourCruiseHref || portalLogin
  const defaultTarget: '_blank' | '_self' = bookYourCruiseHref ? (/^https?:\/\//i.test(bookingHref) ? '_blank' : '_self') : '_self'
  const bookingTarget = bookYourCruiseTarget || defaultTarget
  const bookingRel = bookingTarget === '_blank' ? 'noopener noreferrer' : undefined

  return (
    <header style={{ background: '#10559a' }} className="w-full">
      <div className="container mx-auto px-4 flex items-center justify-between" style={{ height: '80px' }}>
        {/* Logo */}
        <a href={portalHome} className="flex items-center gap-2">
          <img
            src="https://cruzyv2.luyetcompanies.com/files/images/logo-cruzy.png"
            alt="Cruzy logo"
            style={{ height: '46px', width: 'auto' }}
          />
        </a>

        {/* Nav links — hidden on mobile */}
        <nav className="hidden xl:flex items-center gap-1">
          {['Plans', 'Explore', 'Ships', 'Things You Need', 'Contact'].map((item) => (
            <a
              key={item}
              href={`https://cruzy.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 text-white font-medium hover:text-red-400 transition-colors"
              style={{ fontSize: '16px', fontFamily: 'Poppins, sans-serif' }}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right side: phone + buttons */}
        <div className="flex items-center">
          <a
            href="tel:8554147823"
            className="hidden md:block text-white mr-4 hover:text-red-300 transition-colors"
            style={{ fontSize: '16px', fontFamily: 'Poppins, sans-serif' }}
          >
            855-514-7823
          </a>
          <a
            href={portalLogin}
            className="hidden md:block text-white mr-4 hover:text-red-300 transition-colors"
            style={{ fontSize: '15px' }}
          >
            Login
          </a>
          {/* Book Your Cruise — red button */}
          <a
            href={bookingHref}
            target={bookingTarget}
            rel={bookingRel}
            className="flex flex-col items-center justify-center text-white font-bold text-center leading-tight px-4 md:px-6 lg:px-8 self-stretch"
            style={{ background: '#bd1f34', fontSize: '15px', fontFamily: 'Poppins, sans-serif', minWidth: '120px' }}
          >
            <span>Book Your</span>
            <span>Cruise</span>
          </a>
          {/* Join Cruzy+ — navy button */}
          <a
            href={portalHome}
            className="hidden lg:flex flex-col items-center justify-center text-white font-bold text-center leading-tight px-6 lg:px-8 self-stretch"
            style={{ background: '#10559a', fontSize: '15px', fontFamily: 'Poppins, sans-serif', minWidth: '100px', borderLeft: '2px solid rgba(255,255,255,0.2)' }}
          >
            <span>Join</span>
            <span>Cruzy+</span>
          </a>
        </div>
      </div>
    </header>
  )
}
