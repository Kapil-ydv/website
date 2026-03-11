import React, { useState } from "react";
import FilterAccordionSection from "./FilterAccordionSection";

export default function CollectionFilters() {
  const [openSections, setOpenSections] = useState({ 1: true, 2: false, 3: true, 4: true, 5: false, 6: false });
  const toggle = (i) => setOpenSections((s) => ({ ...s, [i]: !s[i] }));
  const [sortBy, setSortBy] = useState("best-selling");
  return (
    <div className="m-collection-filters-form m-filter--widget">
      <form id="CollectionFiltersForm">
        <div className="m:hidden" data-form-sorting>
          <select
            name="sort_by"
            aria-describedby="a11y-refresh-page-message"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="manual" data-index={0}>
              Featured
            </option>
            <option value="best-selling" data-index={1}>
              Best selling
            </option>
            <option value="title-ascending" data-index={2}>
              Alphabetically, A-Z
            </option>
            <option value="title-descending" data-index={3}>
              Alphabetically, Z-A
            </option>
            <option value="price-ascending" data-index={4}>
              Price, low to high
            </option>
            <option value="price-descending" data-index={5}>
              Price, high to low
            </option>
            <option value="created-ascending" data-index={6}>
              Date, old to new
            </option>
            <option value="created-descending" data-index={7}>
              Date, new to old
            </option>
          </select>
        </div>
        <FilterAccordionSection isOpen={openSections[1]} onToggle={() => toggle(1)} title="Availability" dataIndex={1}>
            <ul
              className="m-facets m-filter--scroll-content m-scrollbar--vertical"
              role="list"
              style={{ "--max-height": "300px" }}
            >
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Availability-1"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.availability"
                    defaultValue={1}
                    id="Filter-Availability-1"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">In stock</span>
                  <span className="m-facet--product-count">
                    (204)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Availability-2"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.availability"
                    defaultValue={0}
                    id="Filter-Availability-2"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">
                    Out of stock
                  </span>
                  <span className="m-facet--product-count">
                    (26)
                  </span>
                </label>
              </li>
            </ul>
        </FilterAccordionSection>
        <FilterAccordionSection isOpen={openSections[2]} onToggle={() => toggle(2)} title="Product type" dataIndex={2}>
            <ul
              className="m-facets m-filter--scroll-content m-scrollbar--vertical"
              role="list"
              style={{ "--max-height": "300px" }}
            >
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Product type-1"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.product_type"
                    defaultValue="Accessories & Bags"
                    id="Filter-Product type-1"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">
                    Accessories &amp; Bags
                  </span>
                  <span className="m-facet--product-count">
                    (8)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Product type-2"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.product_type"
                    defaultValue="Outwear"
                    id="Filter-Product type-2"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Outwear</span>
                  <span className="m-facet--product-count">
                    (7)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Product type-3"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.product_type"
                    defaultValue="Pants"
                    id="Filter-Product type-3"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Pants</span>
                  <span className="m-facet--product-count">
                    (7)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Product type-4"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.product_type"
                    defaultValue="Polo"
                    id="Filter-Product type-4"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Polo</span>
                  <span className="m-facet--product-count">
                    (4)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Product type-5"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.product_type"
                    defaultValue="Shirts"
                    id="Filter-Product type-5"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Shirts</span>
                  <span className="m-facet--product-count">
                    (11)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Product type-6"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.product_type"
                    defaultValue="Shoes"
                    id="Filter-Product type-6"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Shoes</span>
                  <span className="m-facet--product-count">
                    (3)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Product type-7"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.product_type"
                    defaultValue="Shorts"
                    id="Filter-Product type-7"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Shorts</span>
                  <span className="m-facet--product-count">
                    (8)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Product type-8"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.product_type"
                    defaultValue="Sweaters"
                    id="Filter-Product type-8"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Sweaters</span>
                  <span className="m-facet--product-count">
                    (4)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Product type-9"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.product_type"
                    defaultValue="T-Shirts"
                    id="Filter-Product type-9"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">T-Shirts</span>
                  <span className="m-facet--product-count">
                    (10)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Product type-10"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.product_type"
                    defaultValue="Video"
                    id="Filter-Product type-10"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Video</span>
                  <span className="m-facet--product-count">
                    (1)
                  </span>
                </label>
              </li>
            </ul>
        </FilterAccordionSection>
        <FilterAccordionSection isOpen={openSections[3]} onToggle={() => toggle(3)} title="Price" dataIndex={3}>
            <div
              className="m-facets-price price-range"
              style={{ "--from": "0.0%", "--to": "100.0%" }}
            >
              <div className="m-facets-price--ranges">
                <input
                  className="m-facets-price--range m-facets-price--range-min"
                  type="range"
                  min={0}
                  max={350}
                  step={1}
                  defaultValue={0}
                />
                <input
                  className="m-facets-price--range m-facets-price--range-max"
                  type="range"
                  min={0}
                  max={350}
                  step={1}
                  defaultValue={350}
                />
              </div>
              <div className="m-facets-price--input">
                <div className="m-facets-price--field">
                  <span className="m:visually-hidden">From</span>
                  <span className="m-facets-price--field-currency">
                    $
                  </span>
                  <input
                    className="form-field form-field--input m:text-right"
                    type="number"
                    inputMode="numeric"
                    name="filter.v.price.gte"
                    autoComplete="off"
                    placeholder={0}
                    min={0}
                    max={350}
                    step={1}
                  />
                </div>
                <span className="m-facets-price--to">To</span>
                <div className="m-facets-price--field">
                  <span className="m:visually-hidden">To</span>
                  <span className="m-facets-price--field-currency">
                    $
                  </span>
                  <input
                    className="form-field form-field--input m:text-right"
                    type="number"
                    inputMode="numeric"
                    name="filter.v.price.lte"
                    autoComplete="off"
                    placeholder={350}
                    min={0}
                    max={350}
                    step={1}
                  />
                </div>
              </div>
            </div>
        </FilterAccordionSection>
        <FilterAccordionSection isOpen={openSections[4]} onToggle={() => toggle(4)} title="Color" dataIndex={4}>
            <ul
              className="m-facets m-filter--scroll-content m-scrollbar--vertical m-filter--swatches m-filter--swatches-list"
              role="list"
              style={{ "--max-height": "300px" }}
            >
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-1" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Beige"
                    className="m:visually-hidden"
                    id="Filter-Color-1"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#ebe6db",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Beige
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Beige
                    <span className="m-facet--product-count">
                      (6)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-2" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Black"
                    className="m:visually-hidden"
                    id="Filter-Color-2"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#000000",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Black
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Black
                    <span className="m-facet--product-count">
                      (50)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-3" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Blue"
                    className="m:visually-hidden"
                    id="Filter-Color-3"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#8db4d2",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Blue
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Blue
                    <span className="m-facet--product-count">
                      (8)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-4" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Brown"
                    className="m:visually-hidden"
                    id="Filter-Color-4"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#836953",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Brown
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Brown
                    <span className="m-facet--product-count">
                      (21)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-5" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Charcoal"
                    className="m:visually-hidden"
                    id="Filter-Color-5"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#8b8b8b",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Charcoal
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Charcoal
                    <span className="m-facet--product-count">
                      (1)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-6" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Coca"
                    className="m:visually-hidden"
                    id="Filter-Color-6"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#c7babd",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Coca
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Coca
                    <span className="m-facet--product-count">
                      (3)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-7" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Cream"
                    className="m:visually-hidden"
                    id="Filter-Color-7"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#f1f2e2",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Cream
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Cream
                    <span className="m-facet--product-count">
                      (11)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-8" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Dark Blue"
                    className="m:visually-hidden"
                    id="Filter-Color-8"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#063e66",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Dark Blue
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Dark Blue
                    <span className="m-facet--product-count">
                      (6)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-9" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Dark Grey"
                    className="m:visually-hidden"
                    id="Filter-Color-9"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#aca69f",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Dark Grey
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Dark Grey
                    <span className="m-facet--product-count">
                      (1)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-10" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Floral"
                    className="m:visually-hidden"
                    id="Filter-Color-10"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "floral",
                      "background-image":
                        "url(../cdn/shop/t/10/assets/filter_color3db90.html?17046)",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Floral
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Floral
                    <span className="m-facet--product-count">
                      (1)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-11" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Gingham"
                    className="m:visually-hidden"
                    id="Filter-Color-11"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "gingham",
                      "background-image":
                        "url(../cdn/shop/t/10/assets/filter_color150be.png?v=147458027895443808701708482571)",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Gingham
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Gingham
                    <span className="m-facet--product-count">
                      (2)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-12" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Gold"
                    className="m:visually-hidden"
                    id="Filter-Color-12"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "gold",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Gold
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Gold
                    <span className="m-facet--product-count">
                      (1)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-13" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Green"
                    className="m:visually-hidden"
                    id="Filter-Color-13"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#c1e1c1",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Green
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Green
                    <span className="m-facet--product-count">
                      (3)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-14" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Grey"
                    className="m:visually-hidden"
                    id="Filter-Color-14"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#e0e0e0",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Grey
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Grey
                    <span className="m-facet--product-count">
                      (21)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-15" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Heathered Blue"
                    className="m:visually-hidden"
                    id="Filter-Color-15"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#3c3c3c",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Heathered Blue
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Heathered Blue
                    <span className="m-facet--product-count">
                      (1)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-16" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Heathered Cashew"
                    className="m:visually-hidden"
                    id="Filter-Color-16"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#bdb59f",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Heathered Cashew
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Heathered Cashew
                    <span className="m-facet--product-count">
                      (3)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-17" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Heathered Charcoal"
                    className="m:visually-hidden"
                    id="Filter-Color-17"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#8b8b8b",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Heathered Charcoal
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Heathered Charcoal
                    <span className="m-facet--product-count">
                      (2)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-18" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Heathered Green"
                    className="m:visually-hidden"
                    id="Filter-Color-18"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#534d36",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Heathered Green
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Heathered Green
                    <span className="m-facet--product-count">
                      (5)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-19" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Heathered Grey"
                    className="m:visually-hidden"
                    id="Filter-Color-19"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#555c62",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Heathered Grey
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Heathered Grey
                    <span className="m-facet--product-count">
                      (4)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-20" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Heathered Oat"
                    className="m:visually-hidden"
                    id="Filter-Color-20"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#d3c1aa",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Heathered Oat
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Heathered Oat
                    <span className="m-facet--product-count">
                      (4)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-21" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="heathered oat"
                    className="m:visually-hidden"
                    id="Filter-Color-21"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#d3c1aa",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      heathered oat
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    heathered oat
                    <span className="m-facet--product-count">
                      (1)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-22" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Jean Blue"
                    className="m:visually-hidden"
                    id="Filter-Color-22"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#515d6d",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Jean Blue
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Jean Blue
                    <span className="m-facet--product-count">
                      (3)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-23" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Kalamata"
                    className="m:visually-hidden"
                    id="Filter-Color-23"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#808487",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Kalamata
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Kalamata
                    <span className="m-facet--product-count">
                      (1)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-24" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Lead"
                    className="m:visually-hidden"
                    id="Filter-Color-24"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#6c6b6c",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Lead
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Lead
                    <span className="m-facet--product-count">
                      (2)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-25" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Light Blue"
                    className="m:visually-hidden"
                    id="Filter-Color-25"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#b1c5d4",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Light Blue
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Light Blue
                    <span className="m-facet--product-count">
                      (1)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-26" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Light Brown"
                    className="m:visually-hidden"
                    id="Filter-Color-26"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#b5651d",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Light Brown
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Light Brown
                    <span className="m-facet--product-count">
                      (1)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-27" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Light Pink"
                    className="m:visually-hidden"
                    id="Filter-Color-27"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#fbcfcd",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Light Pink
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Light Pink
                    <span className="m-facet--product-count">
                      (1)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-28" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Light Purple"
                    className="m:visually-hidden"
                    id="Filter-Color-28"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#c6aec7",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Light Purple
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Light Purple
                    <span className="m-facet--product-count">
                      (3)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-29" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Mint"
                    className="m:visually-hidden"
                    id="Filter-Color-29"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#bedce3",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Mint
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Mint
                    <span className="m-facet--product-count">
                      (1)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-30" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Navy"
                    className="m:visually-hidden"
                    id="Filter-Color-30"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#484d5b",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Navy
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Navy
                    <span className="m-facet--product-count">
                      (9)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-31" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Pale Grey"
                    className="m:visually-hidden"
                    id="Filter-Color-31"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#878785",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Pale Grey
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Pale Grey
                    <span className="m-facet--product-count">
                      (2)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-32" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Pelican"
                    className="m:visually-hidden"
                    id="Filter-Color-32"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#e1d6c5",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Pelican
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Pelican
                    <span className="m-facet--product-count">
                      (5)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-33" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Pink"
                    className="m:visually-hidden"
                    id="Filter-Color-33"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#ffd1dc",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Pink
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Pink
                    <span className="m-facet--product-count">
                      (1)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-34" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Rose Gold"
                    className="m:visually-hidden"
                    id="Filter-Color-34"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#ecc5c0",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Rose Gold
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Rose Gold
                    <span className="m-facet--product-count">
                      (2)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-35" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Rosy Brown"
                    className="m:visually-hidden"
                    id="Filter-Color-35"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#c4a287",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Rosy Brown
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Rosy Brown
                    <span className="m-facet--product-count">
                      (1)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-36" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Sand"
                    className="m:visually-hidden"
                    id="Filter-Color-36"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#f2d2a9",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Sand
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Sand
                    <span className="m-facet--product-count">
                      (5)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-37" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Silver"
                    className="m:visually-hidden"
                    id="Filter-Color-37"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#eeeeef",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Silver
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Silver
                    <span className="m-facet--product-count">
                      (1)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-38" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Slate Grey"
                    className="m:visually-hidden"
                    id="Filter-Color-38"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#484d5b",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Slate Grey
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Slate Grey
                    <span className="m-facet--product-count">
                      (1)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-39" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Tan"
                    className="m:visually-hidden"
                    id="Filter-Color-39"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#e9d1bf",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">Tan</span>
                  </span>
                  <span className="m-facet--color-name">
                    Tan
                    <span className="m-facet--product-count">
                      (4)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-40" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Toasted Coconut"
                    className="m:visually-hidden"
                    id="Filter-Color-40"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#9c7b58",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Toasted Coconut
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Toasted Coconut
                    <span className="m-facet--product-count">
                      (4)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-41" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="White"
                    className="m:visually-hidden"
                    id="Filter-Color-41"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#ffffff",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      White
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    White
                    <span className="m-facet--product-count">
                      (29)
                    </span>
                  </span>
                </label>
              </li>
              <li className="m-facet--item m-facet--color">
                <label htmlFor="Filter-Color-42" className>
                  <input
                    type="checkbox"
                    name="filter.v.option.color"
                    defaultValue="Yellow"
                    className="m:visually-hidden"
                    id="Filter-Color-42"
                  />
                  <span
                    className="m-facet--color-label m-bg-lazy"
                    style={{
                      "background-color": "#fdda76",
                      "background-image": "url()",
                      "background-size": "cover",
                    }}
                  >
                    <span className="m:visually-hidden">
                      Yellow
                    </span>
                  </span>
                  <span className="m-facet--color-name">
                    Yellow
                    <span className="m-facet--product-count">
                      (1)
                    </span>
                  </span>
                </label>
              </li>
            </ul>
        </FilterAccordionSection>
        <FilterAccordionSection isOpen={openSections[5]} onToggle={() => toggle(5)} title="Size" dataIndex={5}>
            <ul
              className="m-facets m-filter--scroll-content m-scrollbar--vertical"
              role="list"
              style={{ "--max-height": "300px" }}
            >
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Size-1"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.option.size"
                    defaultValue="S"
                    id="Filter-Size-1"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">S</span>
                  <span className="m-facet--product-count">
                    (11)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Size-2"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.option.size"
                    defaultValue="Small"
                    id="Filter-Size-2"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Small</span>
                  <span className="m-facet--product-count">
                    (2)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Size-3"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.option.size"
                    defaultValue="M"
                    id="Filter-Size-3"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">M</span>
                  <span className="m-facet--product-count">
                    (12)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Size-4"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.option.size"
                    defaultValue="Medium"
                    id="Filter-Size-4"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Medium</span>
                  <span className="m-facet--product-count">
                    (2)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Size-5"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.option.size"
                    defaultValue="L"
                    id="Filter-Size-5"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">L</span>
                  <span className="m-facet--product-count">
                    (12)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Size-6"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.option.size"
                    defaultValue="Large"
                    id="Filter-Size-6"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Large</span>
                  <span className="m-facet--product-count">
                    (2)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Size-7"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.option.size"
                    defaultValue="XL"
                    id="Filter-Size-7"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">XL</span>
                  <span className="m-facet--product-count">
                    (2)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Size-8"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.option.size"
                    defaultValue="XXL"
                    id="Filter-Size-8"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">XXL</span>
                  <span className="m-facet--product-count">
                    (1)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Size-9"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.option.size"
                    defaultValue={35}
                    id="Filter-Size-9"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">35</span>
                  <span className="m-facet--product-count">
                    (1)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Size-10"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.option.size"
                    defaultValue={36}
                    id="Filter-Size-10"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">36</span>
                  <span className="m-facet--product-count">
                    (2)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Size-11"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.option.size"
                    defaultValue={37}
                    id="Filter-Size-11"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">37</span>
                  <span className="m-facet--product-count">
                    (2)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Size-12"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.option.size"
                    defaultValue={38}
                    id="Filter-Size-12"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">38</span>
                  <span className="m-facet--product-count">
                    (2)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Size-13"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.option.size"
                    defaultValue={39}
                    id="Filter-Size-13"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">39</span>
                  <span className="m-facet--product-count">
                    (1)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Size-14"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.option.size"
                    defaultValue={40}
                    id="Filter-Size-14"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">40</span>
                  <span className="m-facet--product-count">
                    (2)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Size-15"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.option.size"
                    defaultValue={41}
                    id="Filter-Size-15"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">41</span>
                  <span className="m-facet--product-count">
                    (1)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Size-16"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.v.option.size"
                    defaultValue="X"
                    id="Filter-Size-16"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">X</span>
                  <span className="m-facet--product-count">
                    (1)
                  </span>
                </label>
              </li>
            </ul>
        </FilterAccordionSection>
        <FilterAccordionSection isOpen={openSections[6]} onToggle={() => toggle(6)} title="Brand" dataIndex={6}>
            <ul
              className="m-facets m-filter--scroll-content m-scrollbar--vertical"
              role="list"
              style={{ "--max-height": "300px" }}
            >
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Brand-1"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.vendor"
                    defaultValue="Bags"
                    id="Filter-Brand-1"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Bags</span>
                  <span className="m-facet--product-count">
                    (33)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Brand-2"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.vendor"
                    defaultValue="Foxecom"
                    id="Filter-Brand-2"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Foxecom</span>
                  <span className="m-facet--product-count">
                    (1)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Brand-3"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.vendor"
                    defaultValue="Minimog"
                    id="Filter-Brand-3"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Minimog</span>
                  <span className="m-facet--product-count">
                    (7)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Brand-4"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.vendor"
                    defaultValue="Minimog Fashion Store"
                    id="Filter-Brand-4"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">
                    Minimog Fashion Store
                  </span>
                  <span className="m-facet--product-count">
                    (49)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Brand-5"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.vendor"
                    defaultValue="Minimog NEXT demo"
                    id="Filter-Brand-5"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">
                    Minimog NEXT demo
                  </span>
                  <span className="m-facet--product-count">
                    (59)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Brand-6"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.vendor"
                    defaultValue="Outwears"
                    id="Filter-Brand-6"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Outwears</span>
                  <span className="m-facet--product-count">
                    (5)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Brand-7"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.vendor"
                    defaultValue="Pants"
                    id="Filter-Brand-7"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Pants</span>
                  <span className="m-facet--product-count">
                    (11)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Brand-8"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.vendor"
                    defaultValue="Shoes"
                    id="Filter-Brand-8"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Shoes</span>
                  <span className="m-facet--product-count">
                    (9)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Brand-9"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.vendor"
                    defaultValue="Shorts"
                    id="Filter-Brand-9"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Shorts</span>
                  <span className="m-facet--product-count">
                    (1)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Brand-10"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.vendor"
                    defaultValue="Sunglasses"
                    id="Filter-Brand-10"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">
                    Sunglasses
                  </span>
                  <span className="m-facet--product-count">
                    (5)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Brand-11"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.vendor"
                    defaultValue="Sweaters"
                    id="Filter-Brand-11"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Sweaters</span>
                  <span className="m-facet--product-count">
                    (11)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Brand-12"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.vendor"
                    defaultValue="Tops"
                    id="Filter-Brand-12"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">Tops</span>
                  <span className="m-facet--product-count">
                    (13)
                  </span>
                </label>
              </li>
              <li className="m-facet--item">
                <label
                  htmlFor="Filter-Brand-13"
                  className="m-facet--checkbox"
                >
                  <input
                    type="checkbox"
                    name="filter.p.vendor"
                    defaultValue="Women Shorts"
                    id="Filter-Brand-13"
                  />
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width={17}
                      height={17}
                      stroke="currentColor"
                    />
                    <path
                      d="M4.875 9.75L7.5 12.375L13.5 6.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="m-facet--label">
                    Women Shorts
                  </span>
                  <span className="m-facet--product-count">
                    (9)
                  </span>
                </label>
              </li>
            </ul>
        </FilterAccordionSection>
      </form>
    </div>
  );
}
