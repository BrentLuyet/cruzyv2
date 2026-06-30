'use client'

export default function SiteFooter() {
  return (
    <>
      {/* Red CTA Band */}
      <section style={{ background: '#bd1f34' }} className="py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <h2
            className="text-white font-bold text-2xl md:text-3xl max-w-lg"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Discover Your Dream Getaway with Our Exclusive Cruise Deals!
          </h2>
          <a
            href="https://cruzy.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white font-semibold px-8 py-3 rounded border border-white hover:bg-transparent hover:text-white transition-colors whitespace-nowrap"
            style={{ color: '#333', fontFamily: 'Poppins, sans-serif', fontSize: '15px' }}
          >
            Contact Us
          </a>
        </div>
      </section>

      {/* Main Footer */}
      <footer
        id="site_footer"
        className="relative py-12"
        style={{
          backgroundImage: 'url(https://cruzy.com/files/images/footer_bottom_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: '#0f559a', opacity: 0.85 }}
        />

        <div className="relative z-10 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
            {/* Logo + Contact */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex flex-col leading-none">
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '26px', color: '#fff' }}>
                    Cruzy
                  </span>
                  <span style={{ fontSize: '9px', color: '#7bb3e8', fontWeight: 400 }}>
                    Powered by Carnival
                  </span>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <i className="text-white text-sm">✉</i>
                  <a href="mailto:info@cruzy.com" className="text-white hover:text-red-300 text-sm transition-colors">info@cruzy.com</a>
                </li>
                <li className="flex items-center gap-2">
                  <i className="text-white text-sm">📞</i>
                  <a href="tel:8555147823" className="text-white hover:text-red-300 text-sm transition-colors">855-514-7823</a>
                </li>
                <li className="flex items-center gap-2">
                  <i className="text-white text-sm">📞</i>
                  <a href="tel:5017272475" className="text-white hover:text-red-300 text-sm transition-colors">International: +1 501-727-2475</a>
                </li>
                <li className="flex items-center gap-2">
                  <i className="text-white text-sm">📍</i>
                  <span className="text-white text-sm">PO Box 35<br />Conway, AR 72033</span>
                </li>
              </ul>
            </div>

            {/* Plan Your Cruise */}
            <div>
              <h4 className="text-white font-bold text-lg mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Plan Your Cruise
              </h4>
              <ul className="space-y-2">
                {['Carnival Ships', 'Cruise Planning', 'Join Cruzy+', 'FAQ'].map((item) => (
                  <li key={item}>
                    <a
                      href="https://cruzy.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-red-300 text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-bold text-lg mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Company
              </h4>
              <ul className="space-y-2">
                {[
                  { label: 'About', href: 'https://cruzy.com/about' },
                  { label: 'Privacy & Legal Notice', href: 'https://cruzy.com/privacy-legal-notice' },
                  { label: 'Sitemap', href: 'https://cruzy.com/sitemap' },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-red-300 text-sm transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <hr className="border-white opacity-100 mb-4" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <span className="text-white text-sm">
              Copyright © 2026 <strong>Cruzy</strong>. All Rights Reserved
            </span>
            <span className="text-white text-sm">
              Designed &amp; Hosted by{' '}
              <a href="https://aceone.tech" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-red-300 transition-colors">
                AceOne Technologies
              </a>
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}
