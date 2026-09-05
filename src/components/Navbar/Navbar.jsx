import { useEffect, useState } from 'react'
import './Navbar.css'
import logoWithBg from '../../assets/images/logo-with-transparent-bg.png'

const links = [
  { label: 'HOME', href: '#top' },
  { label: 'WORK', href: '#work' },
  { label: 'ABOUT', href: '#about' },
  { label: 'EXPERIENCE', href: '#experience' },
  { label: 'CONTACT', href: '#contact' },
]

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY

    const onScroll = () => {
      const currentY = window.scrollY
      setScrolled(currentY > 80)

      const heroHeight = window.innerHeight // hero is 100vh
      if (currentY < heroHeight) {
        // Still inside the hero — always visible, no hide/show behavior yet.
        setHidden(false)
      } else if (currentY > lastY + 4) {
        // Scrolling down past the hero — hide it.
        setHidden(true)
      } else if (currentY < lastY - 4) {
        // Scrolling up at all, even a little — bring it back.
        setHidden(false)
      }

      lastY = currentY
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile panel automatically if the viewport grows back
  // past the breakpoint (e.g. rotating a tablet).
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 641px)')
    const onChange = (e) => e.matches && setMenuOpen(false)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const handleClick = (e, href) => {
    e.preventDefault()
    setMenuOpen(false)
    const target = href === '#top' ? document.body : document.querySelector(href)
    if (!target) return
    // App.jsx exposes the Lenis instance on window for anchor navigation.
    if (window.__lenis) {
      window.__lenis.scrollTo(target, { duration: 1.4 })
    } else {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}${menuOpen ? ' navbar--open' : ''}${hidden ? ' navbar--hidden' : ''}`}>
        <img className='nav-logo' src={logoWithBg} alt="Logo" />

        <ul className="nav-links">
          {links.map((link) => (
            <li key={link.label} className='nav-link'>
              <a href={link.href} onClick={(e) => handleClick(e, link.href)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
        </button>

        <div className="nav-panel" role="dialog" aria-hidden={!menuOpen}>
          <ul>
            {links.map((link) => (
              <li key={link.label} className='nav-link'>
                <a href={link.href} onClick={(e) => handleClick(e, link.href)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
    </nav>
  )
}

export default Navbar
