
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logoutThunk, fetchNavMenu, fetchCartMongo } from '../redux/actions'
import { getUserId } from '../utils/userId'
import logo from '../assets/ba-removebg-preview.png'

// ── Media query hook ──────────────────────────────────────────────────────
function useMediaQuery(query) {
  const getMatches = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches : false
  const [matches, setMatches] = useState(getMatches)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener ? mql.addEventListener('change', onChange) : mql.addListener(onChange)
    return () => mql.removeEventListener
      ? mql.removeEventListener('change', onChange) : mql.removeListener(onChange)
  }, [query])
  return matches
}

// ── SVG icons ─────────────────────────────────────────────────────────────
const ChevronRightIcon = () => (
  <svg fill="currentColor" stroke="currentColor" viewBox="0 0 256 512" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.525 36.465l-7.071 7.07c-4.686 4.686-4.686 12.284 0 16.971L205.947 256 10.454 451.494c-4.686 4.686-4.686 12.284 0 16.971l7.071 7.07c4.686 4.686 12.284 4.686 16.97 0l211.051-211.05c4.686-4.686 4.686-12.284 0-16.971L34.495 36.465c-4.686-4.687-12.284-4.687-16.97 0z" />
  </svg>
)
const BackArrowIcon = () => (
  <svg fill="none" viewBox="0 0 16 17" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.12109 15.9141c-.21093.1875-.41015.1875-.59765 0L.175781 8.53125c-.210937-.1875-.210937-.375 0-.5625L7.52344.585938c.1875-.1875.38672-.1875.59765 0l.70313.703122c.1875.1875.1875.38672 0 .59766L3.375 7.33594h11.9883c.2812 0 .4219.14062.4219.42187v.98438c0 .28125-.1407.42187-.4219.42187H3.375l5.44922 5.44924c.1875.2109.1875.4101 0 .5976l-.70313.7032z" fill="currentColor" />
  </svg>
)
const ChevronDownIcon = () => (
  <svg fill="currentColor" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
    <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z" fill="currentColor" />
  </svg>
)
const CartIcon = () => (
  <svg className="m-svg-icon--medium" fill="currentColor" stroke="currentColor" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
    <path d="M352 128C352 57.42 294.579 0 224 0 153.42 0 96 57.42 96 128H0v304c0 44.183 35.817 80 80 80h288c44.183 0 80-35.817 80-80V128h-96zM224 48c44.112 0 80 35.888 80 80H144c0-44.112 35.888-80 80-80zm176 384c0 17.645-14.355 32-32 32H80c-17.645 0-32-14.355-32-32V176h48v40c0 13.255 10.745 24 24 24s24-10.745 24-24v-40h160v40c0 13.255 10.745 24 24 24s24-10.745 24-24v-40h48v256z" />
  </svg>
)
const WishlistIcon = () => (
  <svg className="m-svg-icon--medium" fill="currentColor" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <path d="M458.4 64.3C400.6 15.7 311.3 23 256 79.3 200.7 23 111.4 15.6 53.6 64.3-21.6 127.6-10.6 230.8 43 285.5l175.4 178.7c10 10.2 23.4 15.9 37.6 15.9 14.3 0 27.6-5.6 37.6-15.8L469 285.6c53.5-54.7 64.7-157.9-10.6-221.3zm-23.6 187.5L259.4 430.5c-2.4 2.4-4.4 2.4-6.8 0L77.2 251.8c-36.5-37.2-43.9-107.6 7.3-150.7 38.9-32.7 98.9-27.8 136.5 10.5l35 35.7 35-35.7c37.8-38.5 97.8-43.2 136.5-10.6 51.1 43.1 43.5 113.9 7.3 150.8z" />
  </svg>
)
const AccountIcon = () => (
  <svg className="m-svg-icon--medium" fill="currentColor" stroke="currentColor" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
    <path d="M313.6 304c-28.7 0-42.5 16-89.6 16-47.1 0-60.8-16-89.6-16C60.2 304 0 364.2 0 438.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-25.6c0-74.2-60.2-134.4-134.4-134.4zM400 464H48v-25.6c0-47.6 38.8-86.4 86.4-86.4 14.6 0 38.3 16 89.6 16 51.7 0 74.9-16 89.6-16 47.6 0 86.4 38.8 86.4 86.4V464zM224 288c79.5 0 144-64.5 144-144S303.5 0 224 0 80 64.5 80 144s64.5 144 144 144zm0-240c52.9 0 96 43.1 96 96s-43.1 96-96 96-96-43.1-96-96 43.1-96 96-96z" />
  </svg>
)
const OrdersIcon = () => (
  <svg className="m-svg-icon--medium" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)

// ── Foxkit CSS variable presets ───────────────────────────────────────────
const FOXKIT_STYLE = {
  "--f-item-space": "30", "--f-menu-container-width": "300",
  "--f-menu-text": "rgba(34, 34, 34, 0.6)", "--f-menu-text-hover": "rgba(34, 34, 34, 1)",
  "--f-submenu-bg": "rgba(255,255,255,1)", "--f-submenu-text": "rgba(85,85,85,1)",
  "--f-submenu-text-hover": "rgba(0,0,0,1)",
}
const FOXKIT_MOBILE_STYLE = {
  "--f-item-space": "36", "--f-menu-container-width": "300",
  "--f-menu-text": "rgba(34, 34, 34, 0.6)", "--f-menu-text-hover": "rgba(0,0,0,1)",
  "--f-submenu-bg": "rgba(255,255,255,1)", "--f-submenu-text": "rgba(85,85,85,1)",
  "--f-submenu-text-hover": "rgba(0,0,0,1)",
}

// Keep URL clean: filter is passed via sessionStorage, not query params.
const ALL_PRODUCTS_PATH = "/AllProducts"

const cleanCategoryIds = (categoryIds) => {
  const ids = Array.isArray(categoryIds) ? categoryIds : []
  return ids.map((v) => String(v).trim()).filter(Boolean)
}

const setAllProductsCategoryFilter = (categoryIds) => {
  const cleaned = cleanCategoryIds(categoryIds)
  try {
    if (cleaned.length) sessionStorage.setItem("navCategoryIds", cleaned.join(","))
    else sessionStorage.removeItem("navCategoryIds")
  } catch {
    // ignore storage errors
  }
}

const isAllProductsNavItem = (navItem) => {
  const label = String(navItem?.label || "").trim().toLowerCase();
  const href = String(navItem?.href || navItem?.url || "").trim();
  return label === "all products" || label === "all product" || href === "/AllProducts";
};

const collectCategoryIdsFromArray = (arr) => (
  Array.isArray(arr)
    ? arr.flatMap((v) => (Array.isArray(v?.categoryIds) ? v.categoryIds : []))
    : []
)

const collectGroupCategoryIds = (group) => {
  const own = Array.isArray(group?.categoryIds) ? group.categoryIds : []
  if (own.length) return own
  return collectCategoryIdsFromArray(group?.items || [])
}

const collectNavItemCategoryIds = (navItem) => {
  const own = Array.isArray(navItem?.categoryIds) ? navItem.categoryIds : []
  if (own.length) return own

  const fromItems = collectCategoryIdsFromArray(navItem?.items || [])
  const fromGroups = Array.isArray(navItem?.groups)
    ? navItem.groups.flatMap(g => collectGroupCategoryIds(g))
    : []

  return [...fromItems, ...fromGroups]
}




const MegaLevel1Item = ({ id, label, href, labelStyle, onClick }) => (
  <foxkit-menu-dropdown
    class="f-menu__item f-menu__item--mega f-menu__item-parent f-menu__item--container-full"
    data-layout="mega"
    data-level="1"
    data-trigger="hover"
    id={id}
    role="menuitem"
  >
    <a
      className="f-menu__link f-menu__link--level-1"
      href={href}
      title={label}
      onClick={onClick}
    >
      <span className="f-menu__label" style={labelStyle}>
        {label}
      </span>
    </a>
  </foxkit-menu-dropdown>
)

const MegaLevel2Item = ({ id, label, href, labelStyle, onClick }) => (
  <foxkit-menu-dropdown
    class="f-menu__item f-menu__item--dropdown f-menu__subitem"
    data-layout="dropdown"
    data-level="2"
    data-trigger="hover"
    id={id}
    role="menuitem"
  >
    <a
      className="f-menu__link f-menu__link--level-2 f-menu__sublink"
      href={href}
      title={label}
      onClick={onClick}
    >
      <span className="f-menu__label" style={labelStyle}>
        {label}
      </span>
    </a>
  </foxkit-menu-dropdown>
)

const MobileNavItem = ({ navItem, index, activeMobileMenu, setActiveMobileMenu }) => {
  const navigate = useNavigate()
  const menuId = navItem._id || navItem.key
  const hasSubmenu = !!(navItem.items || navItem.groups)
  if (!hasSubmenu) return (
    <li className="m-menu-mobile__item" data-index={index}>
      <a
        className="m-menu-mobile__link"

        onClick={(e) => {
          e.preventDefault()
          if (isAllProductsNavItem(navItem)) setAllProductsCategoryFilter([])
          else setAllProductsCategoryFilter(collectNavItemCategoryIds(navItem))
          navigate(ALL_PRODUCTS_PATH,{state:{menuId:navItem._id || navItem.key}})
        }}
      >
        <span>{navItem.label}</span>
      </a>
    </li>
  )
  return (
    <li className="m-menu-mobile__item" data-index={index}>
      <a
        className="m-menu-mobile__link"

        onClick={(e) => {
          e.preventDefault()
          if (isAllProductsNavItem(navItem)) setAllProductsCategoryFilter([])
          else setAllProductsCategoryFilter(collectNavItemCategoryIds(navItem))
          navigate(ALL_PRODUCTS_PATH,{state:{menuId:navItem._id || navItem.key}})
          setActiveMobileMenu(null)
        }}
      >
        <span>{navItem.label}</span>
      </a>
      <span className="m-menu-mobile__toggle-button" onClick={() => setActiveMobileMenu(menuId)}>
        <ChevronRightIcon />
      </span>
      <div className={`m-megamenu-mobile m-megamenu-mobile--level-1${activeMobileMenu === menuId ? ' open' : ''}`}>
        <div className="m-megamenu-mobile__wrapper">
          <button className="m-menu-mobile__back-button" onClick={() => setActiveMobileMenu(null)}>
            <BackArrowIcon /><span>{navItem.label}</span>
          </button>
          <foxkit-menu class="f-menu-mobile f-menu f-menu--vertical f-menu--container-fill"
            data-layout="mobile" role="menu" style={FOXKIT_MOBILE_STYLE}>
            {navItem.groups
              ? navItem.groups.flatMap(g => [
                <MegaLevel1Item
                  key={`m-${g.id}`}
                  id={`m-${g.id}`}

                  label={g.label}
                  labelStyle={{ fontWeight: 'bold', fontSize: '5rem' }}
                  onClick={(e) => {
                    e.preventDefault()
                    setAllProductsCategoryFilter(collectGroupCategoryIds(g))
                    navigate(ALL_PRODUCTS_PATH,{state:{menuId:navItem._id || navItem.key}})
                  }}
                />,
                ...g.items.map(item => (
                  <MegaLevel2Item
                    key={`m-${item.id}`}
                    id={`m-${item.id}`}

                    label={`— ${item.label}`}
                    labelStyle={{ paddingLeft: '16px' }}
                    onClick={(e) => {
                      e.preventDefault()
                      setAllProductsCategoryFilter(item.categoryIds)
                      navigate(ALL_PRODUCTS_PATH,{state:{menuId:navItem._id || navItem.key}})
                    }}
                  />
                )),
              ])
              : navItem.items.map(item => (
                <MegaLevel2Item
                  key={`m-${item.id}`}
                  id={`m-${item.id}`}

                  label={item.label}
                  onClick={(e) => {
                    e.preventDefault()
                    setAllProductsCategoryFilter(item.categoryIds)
                    navigate(ALL_PRODUCTS_PATH,{state:{menuId:navItem._id || navItem.key}})
                  }}
                />
              ))
            }
          </foxkit-menu>
        </div>
      </div>
    </li>
  )
}

const DesktopNavItem = ({ navItem, index, activeDesktopMenu, openMega, closeMega }) => {
  const navigate = useNavigate()
  const menuId = navItem._id || navItem.key
  const isActive = activeDesktopMenu === menuId
  const hasSubmenu = !!(navItem.items || navItem.groups)
  if (!hasSubmenu) return (
    <li className="m-menu__item" data-index={index}>
      <a className="m-menu__link m-menu__link--main"

        onClick={(e) => {
          e.preventDefault()
          if (isAllProductsNavItem(navItem)) setAllProductsCategoryFilter([])
          else setAllProductsCategoryFilter(collectNavItemCategoryIds(navItem))
          navigate(ALL_PRODUCTS_PATH,{state:{menuId:navItem._id || navItem.key}})
        }}>
        {navItem.label}
      </a>
    </li>
  )
  return (
    <li
      className={`m-menu__item m-menu__item--parent m-menu__item--has-submenu m-menu__item--mega${isActive ? ' m-menu__item--active' : ''}`}
      data-index={index}
      onMouseEnter={() => openMega(menuId)}
      onFocus={() => openMega(menuId)}
      onBlur={closeMega}>
      <a className="m-menu__link m-menu__link--main"

        onClick={(e) => {
          e.preventDefault()
          if (isAllProductsNavItem(navItem)) setAllProductsCategoryFilter([])
          else setAllProductsCategoryFilter(collectNavItemCategoryIds(navItem))
          navigate(ALL_PRODUCTS_PATH,{state:{menuId:navItem._id || navItem.key}})
        }}>
        {navItem.label}
        <span className="m-menu__arrow"><ChevronDownIcon /></span>
      </a>
      <div
        className="m-mega-menu m-gradient m-color-default"
        style={{
          "--total-columns": navItem.groups
            ? Math.max(2, Math.min(4, navItem.groups.length || 3))
            : 3,
        }}
      >
        <div className="m-mega-menu__container container-fluid">
          <div className="m-mega-menu__inner"
            style={navItem.groups
              ? { display: 'flex', flexDirection: 'row', gap: '40px', alignItems: 'flex-start' }
              : undefined}>
            {navItem.groups
              ? navItem.groups.map(g => (
                <foxkit-menu
                  key={g.id}
                  class="f-menu f-menu--vertical"
                  role="menu"
                  style={{ ...FOXKIT_STYLE, "--f-menu-container-width": g.items.length ? "160" : "120" }}
                >
                  <MegaLevel1Item
                    key={g.id}
                    id={`d-${g.id}`}

                    label={g.label}
                    labelStyle={{ fontWeight: 'bold' }}
                    onClick={(e) => {
                      e.preventDefault()
                      setAllProductsCategoryFilter(collectGroupCategoryIds(g))
                      navigate(ALL_PRODUCTS_PATH,{state:{menuId:navItem._id || navItem.key}})
                    }}
                  />
                  {g.items.map(item => (
                    <MegaLevel2Item
                      key={item.id}
                      id={`d-${item.id}`}

                      label={item.label}
                      onClick={(e) => {
                        e.preventDefault()
                        setAllProductsCategoryFilter(item.categoryIds)
                        navigate(ALL_PRODUCTS_PATH,{state:{menuId:navItem._id || navItem.key}})
                      }}
                    />
                  ))}
                </foxkit-menu>
              ))
              : (
                <foxkit-menu class="f-menu f-menu--vertical f-menu--container-fill" role="menu" style={FOXKIT_STYLE}>
                  {navItem.items.map(item => (
                    <MegaLevel2Item
                      key={item.id}
                      id={`d-${item.id}`}

                      label={item.label}
                      onClick={(e) => {
                        e.preventDefault()
                        setAllProductsCategoryFilter(item.categoryIds)
                        navigate(ALL_PRODUCTS_PATH,{state:{menuId:navItem._id || navItem.key}})
                      }}
                    />
                  ))}
                </foxkit-menu>
              )
            }
          </div>
        </div>
      </div>
    </li>
  )
}

// ── Main Header ───────────────────────────────────────────────────────────
const Header = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDesktopMenu, setActiveDesktopMenu] = useState(null)
  const [activeMobileMenu, setActiveMobileMenu] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })
  const [cartCount, setCartCount] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const user = useSelector(s => s.auth?.user)
  const dbNavMenu = useSelector(s => s.navMenu)
  const navItems = dbNavMenu
  const avatarRef = useRef(null)
  const dropdownRef = useRef(null)
  const userId = getUserId()

  const openMega = key => setActiveDesktopMenu(key)
  const closeMega = () => setActiveDesktopMenu(null)

  const menuItemStyle = {
    display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px',
    background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: '#111', textAlign: 'left',
  }

  // Nav is built from Shop Categories (same API as carousel); /api/nav-menu derives from categories
  useEffect(() => { dispatch(fetchNavMenu()) }, [dispatch])

  // Dynamic cart count for header icon
  useEffect(() => {
    let alive = true

    const refreshCartCount = async () => {
      if (!user || !userId) {
        if (alive) setCartCount(0)
        return
      }
      try {
        const res = await fetchCartMongo(userId)
        const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : [])
        const count = items.reduce((sum, item) => sum + Math.max(0, Number(item?.quantity) || 0), 0)
        if (alive) setCartCount(count)
      } catch {
        if (alive) setCartCount(0)
      }
    }

    refreshCartCount()
    const timer = user ? setInterval(refreshCartCount, 4000) : null
    return () => {
      alive = false
      if (timer) clearInterval(timer)
    }
  }, [user, userId, location.pathname])

  // Close profile on outside click
  useEffect(() => {
    if (!profileOpen) return
    const handler = e => {
      if (!avatarRef.current?.contains(e.target) && !dropdownRef.current?.contains(e.target))
        setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [profileOpen])

  // Escape closes mobile menu
  useEffect(() => {
    if (!isMenuOpen) return
    const fn = e => e.key === 'Escape' && setIsMenuOpen(false)
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [isMenuOpen])

  // Lock scroll when drawer open
  useEffect(() => {
    if (!isMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isMenuOpen])

  // Cleanup on resize
  useEffect(() => {
    if (isDesktop) setIsMenuOpen(false)
    else setActiveDesktopMenu(null)
  }, [isDesktop])

  const openDropdown = () => {
    if (avatarRef.current) {
      const r = avatarRef.current.getBoundingClientRect()
      setDropdownPos({ top: r.bottom + 8, right: Math.max(8, window.innerWidth - r.right) })
    }
    setProfileOpen(v => !v)
  }
  const handleLogout = () => { dispatch(logoutThunk()); setProfileOpen(false); navigate('/') }

  const initials = u => `${(u?.firstName?.[0] || 'U').toUpperCase()}${(u?.lastName?.[0] || '').toUpperCase()}`

  return (
    <div className="m-header__wrapper">

      {/* ── Mobile ──────────────────────────────────────────────────── */}
      {!isDesktop && (
        <header className="m-header__mobile m-header--compact container-fluid m:flex m:items-center m-gradient m-color-default"
          data-screen="m-header__mobile" data-transparent="false">

          {/* Hamburger */}
          <span className="m-menu-button m:flex m:flex-1 m:w-3/12">
            <button type="button"
              className={`m-hamburger-box${isMenuOpen ? ' active' : ''}`}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-haspopup="dialog" aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(v => !v)}
              style={{ background: 'transparent', padding: '10px 0', lineHeight: 0 }}>
              {isMenuOpen && (
                <span className="m-hamburger-close">
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              )}
              <span className="m-hamburger-box__inner" />
            </button>
          </span>

          {/* Logo */}
          <div className="m-logo m-logo--mobile m:justify-center m:w-6/12 m-logo--has-image">
            <a className="m-logo__image m:block" href="/" title="Minimog Fashion Store">
              <div className="m-logo__image-default m:display-flex m-image"
                style={{ "--aspect-ratio": "3.3684210526315788", "--aspect-ratio-mobile": "3.3684210526315788" }}>
                <img alt="Minimog Fashion Store" className="m:inline-block m-header-logo--compact-mobile" height="60" src={logo} />
              </div>
            </a>
          </div>

          {/* Right icons */}
          <div className="m-header__mobile-right m:w-3/12 m:flex m:flex-1 m:justify-end">
            {user && (
              <button
                type="button"
                aria-label="Orders"
                className="m-header__orders"
                onClick={() => navigate('/orders')}
              >
                <span className="m-tooltip m:block m-tooltip--bottom m-tooltip--style-2">
                  <OrdersIcon /><span className="m-tooltip__content">Orders</span>
                </span>
              </button>
            )}
            <a aria-haspopup="dialog" aria-label="1" className="m-cart-icon-bubble" href="/cart" role="button">
              <span className="m-tooltip m:block m-tooltip--bottom m-tooltip--style-2">
                <CartIcon /><span className="m-tooltip__content">Cart</span>
              </span>
              {cartCount > 0 && (
                <m-cart-count class="m-cart-count-bubble m-cart-count">{cartCount}</m-cart-count>
              )}
            </a>
          </div>

          {/* Drawer */}
          <div className={`m-menu-drawer${isMenuOpen ? ' open is-open' : ''}`} id="m-menu-drawer"
            hidden={!isMenuOpen} role="dialog" aria-modal="true" aria-hidden={!isMenuOpen}>
            <div className="m-menu-drawer__backdrop" onClick={() => setIsMenuOpen(false)} />
            <div className="m-menu-drawer__wrapper">
              <div className="m-menu-drawer__content">
                <ul className="m-menu-drawer__navigation m-menu-mobile">
                  {navItems.map((item, i) => (
                    <MobileNavItem key={item.key} navItem={item} index={i}
                      activeMobileMenu={activeMobileMenu} setActiveMobileMenu={setActiveMobileMenu} />
                  ))}
                </ul>
                <div className="m-menu-customer">
                  <div className="m-menu-customer__wrapper">
                    <div className="m-menu-customer__label">My Account</div>
                    {user ? (
                      <>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 0 12px',
                          }}
                        >
                          <div
                            aria-hidden="true"
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg,#1a1a1a,#333)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {initials(user)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 800, color: '#111', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {user?.firstName || 'User'} {user?.lastName ? user.lastName : ''}
                            </div>
                            <div style={{ fontSize: 12, color: 'rgba(17,17,17,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {user?.email}
                            </div>
                            {user?.role === 0 && (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, padding: '3px 8px', background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 20, fontSize: 10, fontWeight: 800 }}>
                                ✦ ADMIN
                              </div>
                            )}
                          </div>
                        </div>
                        <a
                          className="m-button m-button--primary m-signin-button"
                          href="/orders"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          My orders
                        </a>
                        <a
                          className="m-button m-button--secondary m-register-button"
                          href="/"
                          onClick={(e) => {
                            e.preventDefault()
                            setIsMenuOpen(false)
                            handleLogout()
                          }}
                        >
                          Log out
                        </a>
                      </>
                    ) : (
                      <>
                        <a
                          className="m-button m-button--primary m-signin-button"
                          data-tab="signin"
                          href="/login"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Log in
                        </a>
                        <a
                          className="m-button m-button--secondary m-register-button"
                          data-tab="register"
                          href="/register"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Register
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* ── Desktop ─────────────────────────────────────────────────── */}
      {isDesktop && (
        <header className="m-header__desktop m-header--compact logo-center-menu-left m-gradient m-color-default"
          data-screen="m-header__desktop" data-transparent="false" onMouseLeave={closeMega}>
          <div className="m-header__bg m-gradient m-color-default" />
          <div className="m-header__dropdown-bg m-gradient m-color-default" />
          <div className="m-header__container container-fluid">
            <div className="m-header__inner">

              {/* Nav */}
              <div className="m-header__left m:w-5/12">
                <div className="m-header__menu">
                  <ul className="m-menu">
                    {navItems.map((item, i) => (
                      <DesktopNavItem key={item.key} navItem={item} index={i}
                        activeDesktopMenu={activeDesktopMenu} openMega={openMega} closeMega={closeMega} />
                    ))}
                  </ul>
                </div>
              </div>

              {/* Logo */}
              <div className="m-header__center" style={{ height: 80 }}>
                <h1 className="m-header__logo m-logo m-logo--has-imag p-3" style={{ height: 80 }}>
                  <a className="m-logo__image m:block" href="/" title="Minimog Fashion Store">
                    <div className="m-logo__image-defaul m-imag">
                      <img alt="Minimog Fashion Store" className="m:inline-block m-header-logo--compact-deskto" src={logo} />
                    </div>
                  </a>
                </h1>
              </div>

              {/* Right icons */}
              <div className="m-header__right m:w-5/12">
                {/* Profile / Account */}
                {user ? (
                  <>
                    <button ref={avatarRef} type="button" aria-label="Profile" onClick={openDropdown}
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 36, height: 36, borderRadius: '50%', background: profileOpen ? '#333' : '#111',
                        color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
                        border: `2px solid ${profileOpen ? '#111' : 'transparent'}`,
                        cursor: 'pointer', transition: 'border-color 0.2s', outline: 'none', padding: 0,
                      }}>
                      {initials(user)}
                    </button>

                    {profileOpen && createPortal(
                      <>
                        <div onClick={() => setProfileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99990 }} />
                        <div ref={dropdownRef} style={{
                          position: 'fixed', top: dropdownPos.top, right: dropdownPos.right,
                          zIndex: 99999, width: 260, background: '#fff', borderRadius: 14,
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 20px 50px -5px rgba(0,0,0,0.18)',
                          border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden', fontFamily: 'inherit',
                          animation: 'profileDropIn 0.15s ease',
                        }}>
                          <style>{`
                            @keyframes profileDropIn {
                              from { opacity:0; transform:translateY(-8px) scale(0.97) }
                              to   { opacity:1; transform:translateY(0) scale(1) }
                            }
                            .profile-menu-btn:hover { background:#f5f5f5 !important }
                            .profile-menu-btn-danger:hover { background:#fff0f0 !important; color:#e53935 !important }
                          `}</style>

                          {/* Header */}
                          <div style={{ padding: '18px 16px 14px', background: 'linear-gradient(135deg,#1a1a1a,#333)', color: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                                {initials(user)}
                              </div>
                              <div style={{ overflow: 'hidden', flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.firstName} {user.lastName}</div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                                {user.role === 0 && (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, padding: '3px 8px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>✦ ADMIN</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Menu items */}
                          <div style={{ padding: '8px 0' }}>
                            {user.role === 0 && (
                              <button type="button" className="profile-menu-btn" onClick={() => { setProfileOpen(false); navigate('/admin') }} style={{ ...menuItemStyle, color: '#111' }}>
                                <span style={{ width: 32, height: 32, borderRadius: 8, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 }}>
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                                    <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
                                  </svg>
                                </span>
                                <span>Admin Panel</span>
                              </button>
                            )}
                            <button type="button" className="profile-menu-btn" onClick={() => { setProfileOpen(false); navigate('/orders') }} style={{ ...menuItemStyle, color: '#111' }}>
                              <span style={{ width: 32, height: 32, borderRadius: 8, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
                                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </span>
                              <span>My Orders</span>
                            </button>
                            <button type="button" className="profile-menu-btn" onClick={() => { setProfileOpen(false); navigate('/wishlist') }} style={{ ...menuItemStyle, color: '#111' }}>
                              <span style={{ width: 32, height: 32, borderRadius: 8, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 }}>
                                <svg width="15" height="15" viewBox="0 0 512 512" fill="#111">
                                  <path d="M458.4 64.3C400.6 15.7 311.3 23 256 79.3 200.7 23 111.4 15.6 53.6 64.3-21.6 127.6-10.6 230.8 43 285.5l175.4 178.7c10 10.2 23.4 15.9 37.6 15.9 14.3 0 27.6-5.6 37.6-15.8L469 285.6c53.5-54.7 64.7-157.9-10.6-221.3z" />
                                </svg>
                              </span>
                              <span>Wishlist</span>
                            </button>
                            <div style={{ margin: '6px 14px', borderTop: '1px solid #f0f0f0' }} />
                            <button type="button" className="profile-menu-btn-danger" onClick={handleLogout} style={{ ...menuItemStyle, color: '#e53935' }}>
                              <span style={{ width: 32, height: 32, borderRadius: 8, background: '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e53935" strokeWidth="2">
                                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                                </svg>
                              </span>
                              <span>Log Out</span>
                            </button>
                          </div>
                        </div>
                      </>,
                      document.body
                    )}
                  </>
                ) : (
                  <button type="button" aria-label="Account" className="m-header__account" onClick={() => navigate('/login')}>
                    <span className="m-tooltip m:block m-tooltip--bottom m-tooltip--style-2">
                      <AccountIcon /><span className="m-tooltip__content">Account</span>
                    </span>
                  </button>
                )}

                <button type="button" aria-label="Wishlist" className="m-header__wishlist" onClick={() => navigate('/wishlist')}>
                  <span className="m-tooltip m:block m-tooltip--bottom m-tooltip--style-2">
                    <WishlistIcon /><span className="m-tooltip__content">Wishlist</span>
                  </span>
                  <sup className="m-wishlist-count m:hidden">10</sup>
                </button>

                {user && (
                  <button type="button" aria-label="Orders" className="m-header__orders" onClick={() => navigate('/orders')}>
                    <span className="m-tooltip m:block m-tooltip--bottom m-tooltip--style-2">
                      <OrdersIcon /><span className="m-tooltip__content">Orders</span>
                    </span>
                  </button>
                )}

                <button type="button" aria-haspopup="dialog" aria-label="Cart" className="m-cart-icon-bubble" onClick={() => navigate('/cart')}>
                  <span className="m-tooltip m:block m-tooltip--bottom m-tooltip--style-2">
                    <CartIcon /><span className="m-tooltip__content">Cart</span>
                  </span>
                  {cartCount > 0 && (
                    <m-cart-count class="m-cart-count-bubble m-cart-count">{cartCount}</m-cart-count>
                  )}
                </button>
              </div>

            </div>
          </div>
        </header>
      )}
    </div>
  )
}

export default Header
