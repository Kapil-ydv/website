import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchShopCategories } from "../redux/actions";

const ALL_PRODUCTS_PATH = "/AllProducts";
const MOBILE_CARD_W = "calc(72vw - 24px)";

const isRootCategory = (c) =>
  c == null || c.parentId == null || c.parentId === undefined;

const ShopCatogries = () => {
  const dispatch = useDispatch();
  const categories = useSelector((s) => s.shopCategories || []);

  const rootCategories = useMemo(() => {
    const roots = categories.filter(isRootCategory);
    roots.sort(
      (a, b) =>
        (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) ||
        (Number(a.id) || 0) - (Number(b.id) || 0)
    );
    return roots;
  }, [categories]);

  const categoryIdQuery = (category) => {
    const id = category.id;
    const childIds = categories
      .filter((c) => Number(c.parentId) === Number(id))
      .map((c) => c.id);
    return childIds.length ? [id, ...childIds].join(",") : String(id);
  };

  const totalSlides = rootCategories.length;

  const getPerView = () => {
    if (typeof window === "undefined") return 5;
    if (window.innerWidth >= 1280) return 5;
    if (window.innerWidth >= 768) return 4;
    return 1;
  };

  const [perView, setPerView] = useState(getPerView);
  const [page, setPage] = useState(0);
  const isMobile = perView === 1;

  const scrollRef = useRef(null);
  const scrollInnerRef = useRef(null);

  useEffect(() => { dispatch(fetchShopCategories()); }, [dispatch]);

  useEffect(() => {
    const update = () => setPerView(getPerView());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* Center first/last slides — original logic unchanged */
  useLayoutEffect(() => {
    const wrap = scrollRef.current;
    const inner = scrollInnerRef.current;
    if (!wrap || !inner) return undefined;
    const clear = () => {
      inner.style.paddingLeft = "";
      inner.style.paddingRight = "";
      wrap.style.scrollPaddingLeft = "";
      wrap.style.scrollPaddingRight = "";
    };
    if (!isMobile || totalSlides === 0) { clear(); return undefined; }
    const syncPad = () => {
      const slide = wrap.querySelector(".sbc-slide");
      if (!slide) { clear(); return; }
      const wrapW = wrap.clientWidth;
      const slideW = slide.getBoundingClientRect().width;
      const pad = Math.max(12, Math.round((wrapW - slideW) / 2));
      inner.style.paddingLeft = `${pad}px`;
      inner.style.paddingRight = `${pad}px`;
      wrap.style.scrollPaddingLeft = `${pad}px`;
      wrap.style.scrollPaddingRight = `${pad}px`;
    };
    syncPad();
    requestAnimationFrame(syncPad);
    const ro = new ResizeObserver(syncPad);
    ro.observe(wrap);
    window.addEventListener("resize", syncPad);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncPad);
      clear();
    };
  }, [isMobile, totalSlides, rootCategories.length]);

  /* Page from scroll — original logic unchanged */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const updatePage = () => {
      const maxScroll = Math.max(el.scrollWidth - el.clientWidth, 0);
      if (maxScroll === 0) { setPage(0); return; }
      setPage(Math.round((el.scrollLeft / maxScroll) * Math.max(totalSlides - 1, 0)));
    };
    updatePage();
    el.addEventListener("scroll", updatePage, { passive: true });
    return () => el.removeEventListener("scroll", updatePage);
  }, [totalSlides, perView]);

  const scrollByCard = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    let delta;
    if (isMobile) {
      const slide = el.querySelector(".sbc-slide");
      delta = slide ? slide.getBoundingClientRect().width + 12 : el.clientWidth * 0.72;
    } else {
      delta = el.clientWidth / Math.max(perView, 1);
    }
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  };

  /* ── Desktop layout helpers ──────────────────────────────────────────── */
  // Always show exactly perView cols per row, 2 rows max
  const cols = Math.max(perView, 4);
  const row1 = rootCategories.slice(0, cols);
  const row2 = rootCategories.slice(cols, cols * 2);

  return (
    <>
      <style>{`
        /* ─── design tokens (aligned with modern header blues) ─── */
        .sbc-section {
          --sbc-bg: #ffffff;
          --sbc-bg2: #ffffff;
          --sbc-text: #0f172a;
          --sbc-muted: #64748b;
          --sbc-accent: #2563eb;
          --sbc-accent-soft: rgba(37, 99, 235, 0.12);
          --sbc-card-bg: #ffffff;
          --sbc-img-placeholder: #e2e8f0;
        }

        /* ─── scrollbar hide ─────────────────────────── */
        .sbc-scroll-hide { -ms-overflow-style:none; scrollbar-width:none; }
        .sbc-scroll-hide::-webkit-scrollbar { display:none; }

        /* ─── section ────────────────────────────────── */
        .sbc-section {
          background: #ffffff;
          padding: 80px 0 96px;
        }
        @media (max-width:767px) { .sbc-section { padding:48px 0 64px; } }

        .sbc-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 56px;
        }
        @media (max-width:1023px) { .sbc-inner { padding: 0 32px; } }
        @media (max-width:767px)  { .sbc-inner { padding: 0 16px; } }

        /* ─── section header ─────────────────────────── */
        .sbc-hdr {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 48px;
        }
        @media (max-width:767px) { .sbc-hdr { margin-bottom: 24px; } }

        .sbc-title {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .sbc-title h2 {
          font-size: clamp(1.5rem, 2.2vw, 2.2rem);
          font-weight: 300;
          letter-spacing: -0.03em;
          color: var(--sbc-text);
          line-height: 1;
          margin: 0;
        }
        .sbc-title h2 em {
          font-style: italic;
          font-weight: 400;
          color: var(--sbc-accent);
        }
        .sbc-underline {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .sbc-underline span:nth-child(1) {
          width: 32px; height: 2px; background: var(--sbc-accent); border-radius: 2px;
        }
        .sbc-underline span:nth-child(2) {
          width: 6px; height: 6px; background: #7c3aed;
          border-radius: 50%;
        }

        /* ─── view all ───────────────────────────────── */
        .sbc-view-all {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--sbc-muted);
          text-decoration: none;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: color 0.2s;
          padding-bottom: 2px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.12);
        }
        .sbc-view-all:hover { color: var(--sbc-accent); border-bottom-color: var(--sbc-accent); }
        .sbc-view-all .arr { transition: transform 0.2s; }
        .sbc-view-all:hover .arr { transform: translateX(4px); }

        /* ─── desktop grid ───────────────────────────── */
        .sbc-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .sbc-row {
          display: grid;
          grid-template-columns: repeat(var(--cols, 4), 1fr);
          gap: 20px;
        }

        /* ─── card ───────────────────────────────────── */
        .sbc-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: var(--sbc-card-bg);
          border: 1px solid rgba(15, 23, 42, 0.06);
          cursor: pointer;
          animation: sbcUp 0.55s cubic-bezier(0.22,1,0.36,1) both;
          animation-delay: calc(var(--i, 0) * 55ms);
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.4s ease;
          box-shadow:
            0 2px 12px rgba(15, 23, 42, 0.06),
            0 1px 3px rgba(15, 23, 42, 0.04);
        }
        @keyframes sbcUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .sbc-card:hover {
          transform: translateY(-6px);
          box-shadow:
            0 20px 48px rgba(37, 99, 235, 0.12),
            0 8px 24px rgba(15, 23, 42, 0.08);
          border-color: rgba(37, 99, 235, 0.18);
        }

        /* image container — fixed aspect ratio 3/4 */
        .sbc-card__img-wrap {
          display: block;
          position: relative;
          width: 100%;
          aspect-ratio: 3/4;
          overflow: hidden;
          background: var(--sbc-img-placeholder);
          text-decoration: none;
        }
        .sbc-card__img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94);
          display: block;
        }
        .sbc-card:hover .sbc-card__img { transform: scale(1.07); }

        /* gradient scrim — always visible, deepens on hover */
        .sbc-card__scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(15, 23, 42, 0.72) 0%,
            rgba(15, 23, 42, 0.22) 40%,
            transparent 68%
          );
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .sbc-card:hover .sbc-card__scrim {
          background: linear-gradient(
            to top,
            rgba(37, 99, 235, 0.35) 0%,
            rgba(15, 23, 42, 0.55) 42%,
            transparent 72%
          );
        }

        /* text overlay inside image — luxe bottom placement */
        .sbc-card__body {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px 18px 18px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 10px;
          z-index: 2;
        }

        .sbc-card__name {
          flex: 1 1 auto;
          min-width: 0;
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          letter-spacing: 0.01em;
          line-height: 1.3;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        .sbc-card__name a {
          color: inherit;
          text-decoration: none;
        }

        /* CTA arrow button */
        .sbc-card__cta {
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.35);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .sbc-card:hover .sbc-card__cta {
          background: rgba(255,255,255,0.95);
          border-color: transparent;
          color: var(--sbc-accent);
          transform: scale(1.08);
        }
        .sbc-card__cta svg { display: block; }

        /* category number badge — subtle top-left */
        .sbc-card__badge {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 2;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.7);
          text-transform: uppercase;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        /* ─── mobile carousel ────────────────────────── */
        .sbc-carousel {
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        .sbc-carousel-inner {
          display: flex;
          flex-wrap: nowrap;
          gap: 12px;
        }
        .sbc-slide {
          flex: 0 0 ${MOBILE_CARD_W};
          max-width: ${MOBILE_CARD_W};
          flex-shrink: 0;
          scroll-snap-align: center;
        }

        /* mobile card — square aspect on mobile */
        .sbc-slide .sbc-card__img-wrap { aspect-ratio: 3/4; }

        /* ─── mobile controls ────────────────────────── */
        .sbc-ctrls {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sbc-btn {
          width: 38px; height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #fff;
          color: var(--sbc-muted);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
        }
        .sbc-btn:hover {
          background: var(--sbc-accent);
          color: #fff;
          border-color: var(--sbc-accent);
        }
        .sbc-frac {
          font-size: 12px; color: var(--sbc-muted);
          letter-spacing: 0.06em; min-width: 40px;
          text-align: center; user-select: none;
        }

        /* ─── mobile view-all ────────────────────────── */
        .sbc-mob-all {
          display: flex;
          justify-content: center;
          margin-top: 32px;
        }
      `}</style>

      <section className="sbc-section">
        <div className="sbc-inner">

          {/* ── HEADER ─────────────────────────────────────────────── */}
          <div className="sbc-hdr">
            <div className="sbc-title">
              <h2>Shop by Categories</h2>
              {/* <div className="sbc-underline">
                <span /><span />
              </div> */}
            </div>

            {isMobile ? (
              <div className="sbc-ctrls">
                <button type="button" aria-label="Previous" className="sbc-btn" onClick={() => scrollByCard(-1)}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="sbc-frac">{totalSlides > 0 ? `${page + 1} / ${totalSlides}` : "0 / 0"}</span>
                <button type="button" aria-label="Next" className="sbc-btn" onClick={() => scrollByCard(1)}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link to={ALL_PRODUCTS_PATH} className="sbc-view-all">
                View All
                <svg className="arr" width="11" height="10" viewBox="0 0 14 13" fill="none">
                  <path d="M6.78594.789062c.16406-.145833.31901-.145833.46484 0L12.9656 6.53125c.1641.14583.1641.29167 0 .4375L7.25078 12.7109c-.14583.1459-.30078.1459-.46484 0l-.54688-.5468c-.05469-.0547-.08203-.1276-.08203-.2188 0-.0911.02734-.1732.08203-.2461l4.23824-4.23826H1.15312c-.218745 0-.32812-.10938-.32812-.32813v-.76562c0-.21875.109375-.32813.32812-.32813h9.32418L6.23906 1.80078c-.14583-.16406-.14583-.31901 0-.46484l.54688-.546878z" fill="currentColor" />
                </svg>
              </Link>
            )}
          </div>

          {/* ── DESKTOP TWO-ROW GRID ─────────────────────────────────── */}
          {!isMobile && (
            <div className="sbc-grid">
              {/* Row 1 */}
              {row1.length > 0 && (
                <div className="sbc-row" style={{ "--cols": cols }}>
                  {row1.map((cat, idx) => (
                    <DesktopCard
                      key={cat.id ?? idx}
                      category={cat}
                      href={`${ALL_PRODUCTS_PATH}?categoryId=${categoryIdQuery(cat)}`}
                      index={idx}
                    />
                  ))}
                </div>
              )}
              {/* Row 2 */}
              {row2.length > 0 && (
                <div className="sbc-row" style={{ "--cols": cols }}>
                  {row2.map((cat, idx) => (
                    <DesktopCard
                      key={cat.id ?? (idx + cols)}
                      category={cat}
                      href={`${ALL_PRODUCTS_PATH}?categoryId=${categoryIdQuery(cat)}`}
                      index={cols + idx}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── MOBILE CAROUSEL ──────────────────────────────────────── */}
          {isMobile && (
            <>
              <div ref={scrollRef} className="sbc-carousel sbc-scroll-hide">
                <div ref={scrollInnerRef} className="sbc-carousel-inner">
                  {rootCategories.map((cat, idx) => (
                    <div key={cat.id ?? idx} className="sbc-slide">
                      <DesktopCard
                        category={cat}
                        href={`${ALL_PRODUCTS_PATH}?categoryId=${categoryIdQuery(cat)}`}
                        index={idx}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="sbc-mob-all">
                <Link to={ALL_PRODUCTS_PATH} className="sbc-view-all">
                  View All Categories
                  <svg className="arr" width="11" height="10" viewBox="0 0 14 13" fill="none">
                    <path d="M6.78594.789062c.16406-.145833.31901-.145833.46484 0L12.9656 6.53125c.1641.14583.1641.29167 0 .4375L7.25078 12.7109c-.14583.1459-.30078.1459-.46484 0l-.54688-.5468c-.05469-.0547-.08203-.1276-.08203-.2188 0-.0911.02734-.1732.08203-.2461l4.23824-4.23826H1.15312c-.218745 0-.32812-.10938-.32812-.32813v-.76562c0-.21875.109375-.32813.32812-.32813h9.32418L6.23906 1.80078c-.14583-.16406-.14583-.31901 0-.46484l.54688-.546878z" fill="currentColor" />
                  </svg>
                </Link>
              </div>
            </>
          )}

        </div>
      </section>
    </>
  );
};

/* ── Card sub-component ────────────────────────────────────────────────── */
const ArrowSvg = () => (
  <svg fill="none" height="12" viewBox="0 0 14 13" width="12" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.78594.789062c.16406-.145833.31901-.145833.46484 0L12.9656 6.53125c.1641.14583.1641.29167 0 .4375L7.25078 12.7109c-.14583.1459-.30078.1459-.46484 0l-.54688-.5468c-.05469-.0547-.08203-.1276-.08203-.2188 0-.0911.02734-.1732.08203-.2461l4.23824-4.23826H1.15312c-.218745 0-.32812-.10938-.32812-.32813v-.76562c0-.21875.109375-.32813.32812-.32813h9.32418L6.23906 1.80078c-.14583-.16406-.14583-.31901 0-.46484l.54688-.546878z" fill="currentColor" />
  </svg>
);

const DesktopCard = ({ category, href, index }) => (
  <div className="sbc-card" style={{ "--i": index }}>
    {/* Number badge */}
    {/* <div className="sbc-card__badge" aria-hidden="true">
      {String(index + 1).padStart(2, "0")}
    </div> */}

    {/* Image */}
    <Link to={href} aria-label={category.ariaLabel ?? category.title} className="sbc-card__img-wrap">
      <img
        alt={category.title}
        src={category.image}
        width={906}
        height={1269}
        loading="lazy"
        fetchPriority="low"
        sizes="(min-width:1280px) 18vw, (min-width:990px) calc((100vw - 120px)/4), (min-width:768px) calc((100vw - 100px)/3), 72vw"
        className="sbc-card__img"
      />
      {/* Gradient scrim */}
      <div className="sbc-card__scrim" aria-hidden="true" />

      {/* Overlaid text + CTA */}
      <div className="sbc-card__body">
        <h3 className="sbc-card__name">
          <Link to={href}>{category.title}</Link>
        </h3>
        <Link
          to={href}
          aria-label={`Shop ${category.title}`}
          className="sbc-card__cta"
          onClick={e => e.stopPropagation()}
        >
          <ArrowSvg />
        </Link>
      </div>
    </Link>
  </div>
);

export default ShopCatogries;