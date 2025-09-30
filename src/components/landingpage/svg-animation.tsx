"use client";
import React from "react";
import { motion } from "motion/react";

export const SvgAnimation = () => {
  return (
    <div className="absolute  top-36 left-20 z-10 flex flex-col items-center justify-center px-4">
      <div className="relative mx-auto my-12 hidden h-full max-h-70 min-h-80 max-w-[67rem] grid-cols-2 p-4 lg:grid">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-10">
            <div className="relative flex items-center gap-2">
              {/* Manufacturing Plant Icon */}
              <svg
                width="16"
                height="17"
                viewBox="0 0 16 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 13.5H14V15.5H2V13.5ZM3 6.5L5 4.5V8.5H7V3.5L9 1.5V8.5H11V5.5L13 3.5V11.5H3V6.5Z"
                  stroke="currentColor"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle cx="4" cy="10" r="0.5" fill="currentColor" />
                <circle cx="6" cy="10" r="0.5" fill="currentColor" />
                <circle cx="8" cy="10" r="0.5" fill="currentColor" />
                <circle cx="10" cy="10" r="0.5" fill="currentColor" />
                <circle cx="12" cy="10" r="0.5" fill="currentColor" />
              </svg>
              <span className="text-charcoal-700 text-sm font-medium dark:text-neutral-200">
                Drug Manufacturing
              </span>
              <svg
                width="312"
                height="33"
                viewBox="0 0 312 33"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute top-2 -right-84"
              >
                <line
                  x1="0.5"
                  y1="1"
                  x2="311.5"
                  y2="1"
                  stroke="var(--color-line)"
                  strokeLinecap="round"
                ></line>
                <line
                  x1="311.5"
                  y1="1"
                  x2="311.5"
                  y2="32"
                  stroke="var(--color-line)"
                  strokeLinecap="round"
                ></line>
                <line
                  x1="0.5"
                  y1="1"
                  x2="311.5"
                  y2="1"
                  stroke="url(#line-one-gradient)"
                  strokeLinecap="round"
                ></line>
                <defs>
                  <motion.linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="line-one-gradient"
                    initial={{
                      x1: "0%",
                      x2: "20%",
                    }}
                    animate={{
                      x1: "90%",
                      x2: "100%",
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "linear",
                    }}
                  >
                    <stop stopColor="var(--color-line)"></stop>
                    <stop offset="0.33" stopColor="#22C55E"></stop>
                    <stop offset="0.66" stopColor="#22C55E"></stop>
                    <stop offset="1" stopColor="var(--color-line)"></stop>
                  </motion.linearGradient>
                </defs>
              </svg>
            </div>
            <div className="relative flex items-center gap-2">
              {/* QR Scanner Icon */}
              <svg
                width="16"
                height="17"
                viewBox="0 0 16 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="2"
                  y="2.5"
                  width="5"
                  height="5"
                  stroke="currentColor"
                  strokeWidth="1.33"
                />
                <rect
                  x="9"
                  y="2.5"
                  width="5"
                  height="5"
                  stroke="currentColor"
                  strokeWidth="1.33"
                />
                <rect
                  x="2"
                  y="9.5"
                  width="5"
                  height="5"
                  stroke="currentColor"
                  strokeWidth="1.33"
                />
                <rect x="3" y="3.5" width="3" height="3" fill="currentColor" />
                <rect x="10" y="3.5" width="3" height="3" fill="currentColor" />
                <rect x="3" y="10.5" width="3" height="3" fill="currentColor" />
                <rect x="9" y="9.5" width="1" height="1" fill="currentColor" />
                <rect x="11" y="9.5" width="1" height="1" fill="currentColor" />
                <rect x="13" y="9.5" width="1" height="1" fill="currentColor" />
                <rect x="9" y="11.5" width="1" height="1" fill="currentColor" />
                <rect
                  x="11"
                  y="11.5"
                  width="1"
                  height="1"
                  fill="currentColor"
                />
                <rect
                  x="13"
                  y="11.5"
                  width="1"
                  height="1"
                  fill="currentColor"
                />
                <rect x="9" y="13.5" width="1" height="1" fill="currentColor" />
                <rect
                  x="11"
                  y="13.5"
                  width="1"
                  height="1"
                  fill="currentColor"
                />
                <rect
                  x="13"
                  y="13.5"
                  width="1"
                  height="1"
                  fill="currentColor"
                />
              </svg>
              <span className="text-charcoal-700 text-sm font-medium dark:text-neutral-200">
                Product Scanning
              </span>
              <svg
                width="323"
                height="2"
                viewBox="0 0 323 2"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute top-2 -right-84"
              >
                <line
                  x1="0.5"
                  y1="1"
                  x2="322.5"
                  y2="1"
                  stroke="var(--color-line)"
                  strokeLinecap="round"
                ></line>
                <line
                  x1="0.5"
                  y1="1"
                  x2="322.5"
                  y2="1"
                  stroke="url(#line-two-gradient)"
                  strokeLinecap="round"
                ></line>
                <defs>
                  <motion.linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="line-two-gradient"
                    initial={{
                      x1: "0%",
                      x2: "20%",
                    }}
                    animate={{
                      x1: "90%",
                      x2: "100%",
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "linear",
                    }}
                  >
                    <stop stopColor="var(--color-line)"></stop>
                    <stop
                      offset="0.33"
                      stopColor="var(--color-blue-500)"
                    ></stop>
                    <stop
                      offset="0.66"
                      stopColor="var(--color-blue-500)"
                    ></stop>
                    <stop offset="1" stopColor="var(--color-line)"></stop>
                  </motion.linearGradient>
                </defs>
              </svg>
            </div>
            <div className="relative flex items-center gap-2">
              {/* Laboratory Testing Icon */}
              <svg
                width="16"
                height="17"
                viewBox="0 0 16 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 2.5V6.5L3 13.5H13L10 6.5V2.5H6Z"
                  stroke="currentColor"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M6 2.5H10"
                  stroke="currentColor"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                />
                <circle
                  cx="5"
                  cy="11.5"
                  r="0.8"
                  fill="currentColor"
                  opacity="0.6"
                />
                <circle
                  cx="7"
                  cy="12.5"
                  r="0.6"
                  fill="currentColor"
                  opacity="0.8"
                />
                <circle
                  cx="9"
                  cy="11.5"
                  r="0.7"
                  fill="currentColor"
                  opacity="0.7"
                />
              </svg>
              <span className="text-charcoal-700 text-sm font-medium dark:text-neutral-200">
                Quality Testing
              </span>
              <svg
                width="326"
                height="32"
                viewBox="0 0 326 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute -right-84 bottom-2"
              >
                <line
                  y1="31"
                  x2="325"
                  y2="31"
                  stroke="var(--color-line)"
                ></line>
                <line
                  x1="325.5"
                  y1="31"
                  x2="325.5"
                  y2="1"
                  stroke="var(--color-line)"
                  strokeLinecap="round"
                ></line>
                <line
                  y1="31"
                  x2="325"
                  y2="31"
                  stroke="url(#line-three-gradient)"
                ></line>
                <defs>
                  <motion.linearGradient
                    id="line-three-gradient"
                    gradientUnits="userSpaceOnUse"
                    initial={{
                      x1: "0%",
                      x2: "20%",
                    }}
                    animate={{
                      x1: "90%",
                      x2: "100%",
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "linear",
                    }}
                  >
                    <stop stopColor="var(--color-line)"></stop>
                    <stop offset="0.33" stopColor="#EF4444"></stop>
                    <stop offset="0.66" stopColor="#EF4444"></stop>
                    <stop offset="1" stopColor="var(--color-line)"></stop>
                  </motion.linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <div className="relative h-16 w-16 overflow-hidden rounded-md bg-gray-200 p-px shadow-xl dark:bg-neutral-700">
            <div className="absolute inset-0 scale-[1.4] animate-spin rounded-full bg-conic [background-image:conic-gradient(at_center,transparent,var(--color-blue-500)_20%,transparent_30%)] [animation-duration:2s]"></div>
            <div className="absolute inset-0 scale-[1.4] animate-spin rounded-full [background-image:conic-gradient(at_center,transparent,var(--color-brand)_20%,transparent_30%)] [animation-delay:1s] [animation-duration:2s]"></div>
            <div className="relative z-20 flex h-full w-full items-center justify-center rounded-[5px] bg-white dark:bg-neutral-900">
              {/* Blockchain Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 109.06 122.88"
                className="size-10 text-foreground"
              >
                <path
                  d="M34.43 47.86L52.8 37.6V18.31a9.233 9.233 0 01-5.46-3.16L17.91 32.18c.35.98.54 2.03.54 3.13 0 .92-.13 1.8-.38 2.64l16.36 9.91zm11.35-35.38a9.231 9.231 0 01-.59-3.25c0-2.55 1.03-4.86 2.7-6.53S51.87 0 54.42 0c2.55 0 4.86 1.03 6.53 2.7a9.205 9.205 0 012.7 6.53c0 1.12-.2 2.19-.56 3.18l29.57 17.1c.21-.25.42-.5.65-.73a9.205 9.205 0 016.53-2.7c2.55 0 4.86 1.03 6.53 2.7a9.205 9.205 0 012.7 6.53c0 2.55-1.03 4.85-2.7 6.52a9.194 9.194 0 01-5.32 2.62v33.91c2.07.27 3.92 1.22 5.32 2.62 1.67 1.67 2.7 3.98 2.7 6.52a9.222 9.222 0 01-9.23 9.23 9.205 9.205 0 01-7.15-3.39l-29.61 17.12c.36.99.56 2.06.56 3.18 0 2.55-1.03 4.86-2.7 6.53a9.205 9.205 0 01-6.53 2.7c-2.55 0-4.86-1.03-6.53-2.7s-2.7-3.98-2.7-6.53c0-1.14.21-2.24.59-3.25L16.35 93.38a9.205 9.205 0 01-7.13 3.36c-2.55 0-4.86-1.03-6.53-2.7C1.03 92.37 0 90.06 0 87.51s1.03-4.85 2.7-6.52a9.242 9.242 0 015.25-2.62V44.44a9.18 9.18 0 01-5.25-2.62A9.164 9.164 0 010 35.3c0-2.55 1.03-4.86 2.7-6.53a9.205 9.205 0 016.53-2.7 9.205 9.205 0 017.16 3.4l29.39-16.99zm15.76 2.61a9.192 9.192 0 01-5.55 3.23V37.6l18.33 10.62 16.85-9.74c-.37-.99-.56-2.07-.56-3.18 0-1.08.19-2.13.53-3.09l-29.6-17.12zm36.69 29.3a9.159 9.159 0 01-4.92-2.56c-.19-.19-.37-.38-.54-.59l-16.82 9.72v20.78l16.89 9.75c.15-.17.3-.34.46-.5a9.194 9.194 0 014.92-2.56V44.39h.01zm-7.07 46.27c-.36-.98-.55-2.04-.55-3.14 0-1.16.21-2.27.61-3.3l-16.34-9.43-18.89 10.98v18.79a9.192 9.192 0 015.55 3.23l29.62-17.13zm-43.82 17.06a9.233 9.233 0 015.46-3.16V85.68l-18.96-11-16.09 9.29c.45 1.09.71 2.29.71 3.55 0 1.12-.2 2.19-.56 3.18l29.44 17.02zM10.76 78.41c1.93.32 3.66 1.25 4.99 2.58.1.1.19.2.28.3l16.39-9.46V50.36L16.64 40.8c-.27.37-.57.71-.89 1.03a9.255 9.255 0 01-4.99 2.58v34zM9.24 41.34c.04 0 .08-.01.12-.01h.08a6 6 0 004.06-1.76 6.023 6.023 0 001.77-4.27c0-1.67-.68-3.18-1.77-4.27-1.09-1.09-2.6-1.77-4.27-1.77s-3.18.68-4.27 1.77a6.023 6.023 0 00-1.77 4.27c0 1.67.68 3.18 1.77 4.27a6.03 6.03 0 004.28 1.77zm49.44 68.05a6.023 6.023 0 00-4.27-1.77c-1.67 0-3.18.68-4.27 1.77-1.09 1.09-1.77 2.6-1.77 4.27s.68 3.18 1.77 4.27 2.6 1.77 4.27 1.77c1.67 0 3.18-.68 4.27-1.77 1.09-1.09 1.77-2.6 1.77-4.27s-.67-3.18-1.77-4.27zm0-104.43a6.023 6.023 0 00-4.27-1.77c-1.67 0-3.18.68-4.27 1.77s-1.77 2.6-1.77 4.27c0 1.67.68 3.18 1.77 4.27a6.023 6.023 0 004.27 1.77c1.67 0 3.18-.68 4.27-1.77a6.023 6.023 0 001.77-4.27c0-1.67-.67-3.18-1.77-4.27zm45.42 78.29a6.023 6.023 0 00-4.27-1.77c-1.67 0-3.18.68-4.27 1.77a6.023 6.023 0 00-1.77 4.27c0 1.67.68 3.18 1.77 4.27a6.023 6.023 0 004.27 1.77c1.67 0 3.18-.68 4.27-1.77a6.023 6.023 0 001.77-4.27c0-1.67-.67-3.18-1.77-4.27zm-90.6 0c-1.09-1.09-2.6-1.77-4.27-1.77s-3.18.68-4.27 1.77a6.023 6.023 0 00-1.77 4.27c0 1.67.68 3.18 1.77 4.27s2.6 1.77 4.27 1.77 3.18-.68 4.27-1.77a6.023 6.023 0 001.77-4.27 6.065 6.065 0 00-1.77-4.27zm80.95-45.22c.08.08.14.18.2.28.06.1.1.2.14.31.23.34.49.66.77.95a6.023 6.023 0 004.27 1.77c1.67 0 3.18-.68 4.27-1.77a6.023 6.023 0 001.77-4.27c0-1.67-.68-3.18-1.77-4.27a6.023 6.023 0 00-4.27-1.77c-1.67 0-3.18.68-4.27 1.77a6.023 6.023 0 00-1.77 4.27c.01.99.25 1.91.66 2.73zM35.41 71.49a1.687 1.687 0 01.43.88l17.13 10.07V62.56L35.41 52.11v19.38zm37.56-19.11L55.96 62.57v19.89l17.01-10.05V52.38zM54.39 39.99l-16.6 9.93 16.69 10.05 16.21-9.84-16.3-10.14z"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="relative flex h-full w-full items-center justify-start">
          <svg
            width="314"
            height="2"
            viewBox="0 0 314 2"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="0.5"
              y1="1"
              x2="313.5"
              y2="1"
              stroke="var(--color-line)"
              strokeLinecap="round"
            ></line>
            <line
              x1="0.5"
              y1="1"
              x2="313.5"
              y2="1"
              stroke="url(#horizontal-line-gradient)"
              strokeLinecap="round"
            ></line>
            <defs>
              <motion.linearGradient
                id="horizontal-line-gradient"
                gradientUnits="userSpaceOnUse"
                initial={{
                  x1: "0%",
                  x2: "20%",
                }}
                animate={{
                  x1: "90%",
                  x2: "100%",
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear",
                }}
              >
                <stop stopColor="var(--color-line)"></stop>
                <stop offset="0.5" stopColor="var(--color-blue-500)"></stop>
                <stop offset="1" stopColor="var(--color-line)"></stop>
              </motion.linearGradient>
            </defs>
          </svg>
          <div className="relative flex flex-col items-center gap-2">
            <span className="relative z-20 rounded-sm border border-blue-500 bg-blue-50 px-2 py-0.5 text-xs text-blue-500 dark:bg-blue-900 dark:text-white">
              Verified
            </span>
            <div className="absolute inset-x-0 -top-30 flex h-full flex-col items-center">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-white shadow-md dark:border-neutral-600 dark:bg-neutral-900">
                {/* Pharmacy Icon */}
                <svg
                  viewBox="0 0 1024 1024"
                  className="size-8"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M384.99328 394.09152l242.77504 242.80576-232.86272 232.86272c-33.536 33.50528-77.46048 50.28864-121.38496 50.28864s-87.84896-16.78336-121.38496-50.28864c-67.072-67.04128-67.072-175.76448 0-242.80576l232.8576-232.86272z"
                    fill="#5FCEFF"
                  />
                  <path
                    d="M846.848 175.0016c58.2144 58.2144 58.2144 152.9344 0 211.1488l-219.0848 219.0848-211.1488-211.1488 219.0848-219.0848c28.16-28.2112 65.6896-43.7248 105.5744-43.7248 39.8848 0 77.3632 15.5136 105.5744 43.7248z m-53.76 42.7008c3.9936-11.6736-2.2528-24.4224-13.9264-28.416a133.248 133.248 0 0 0-78.7456-2.4064 22.38976 22.38976 0 0 0-16.4864 21.5552c0 1.9456 0.256 3.9424 0.8192 5.9392 3.2256 11.9296 15.5648 18.944 27.4944 15.6672 17.3568-4.7616 35.4816-4.1984 52.3776 1.5872 2.4064 0.8192 4.864 1.2288 7.2704 1.2288 9.5744 0 18.0736-6.0928 21.1968-15.1552z m-151.6544 66.816a22.34368 22.34368 0 0 0 0-31.6416c-8.704-8.704-22.8864-8.704-31.6416 0l-94.1056 94.1056a22.41024 22.41024 0 0 0 15.8208 38.2464c5.9392 0 11.6224-2.3552 15.8208-6.5536l94.1056-94.1568z"
                    fill="#FFFFFF"
                  />
                  <path
                    d="M878.4896 143.36c75.6736 75.6736 75.6736 198.8096 0 274.432l-467.7632 467.8144c-36.7104 36.608-85.4016 56.832-137.216 56.832-51.7632 0-100.5056-20.1728-137.216-56.832-36.6592-36.6592-56.832-85.4016-56.832-137.2672 0-51.8144 20.1728-100.5568 56.832-137.216L604.0576 143.36c36.608-36.6592 85.3504-56.832 137.216-56.832s100.5568 20.1728 137.216 56.832z m-31.6416 242.7904c58.2144-58.2144 58.2144-152.9344 0-211.1488-28.2112-28.2112-65.6896-43.7248-105.5744-43.7248-39.8848 0-77.4144 15.5136-105.5744 43.7248L416.6144 394.0864l211.1488 211.1488 219.0848-219.0848z m-467.7632 467.7632l217.0368-217.0368-211.1488-211.1488-217.0368 217.0368c-28.2112 28.2112-43.7248 65.6896-43.7248 105.5744 0 39.8848 15.5136 77.4144 43.7248 105.5744 28.2624 28.2112 65.7408 43.776 105.5744 43.776s77.3632-15.5648 105.5744-43.776z"
                    fill="#4F46A3"
                  />
                  <path
                    d="M779.1616 189.2864c11.6736 3.9936 17.92 16.7424 13.9264 28.416a22.43072 22.43072 0 0 1-21.1968 15.1552c-2.4064 0-4.864-0.4096-7.2704-1.2288-16.896-5.7856-35.0208-6.3488-52.3776-1.5872-11.9296 3.2768-24.2688-3.7376-27.4944-15.6672-0.5632-1.9968-0.8192-3.9936-0.8192-5.9392 0-9.8304 6.5536-18.8416 16.4864-21.5552 26.0608-7.168 53.248-6.2976 78.7456 2.4064zM641.4336 252.8768a22.34368 22.34368 0 0 1 0 31.6416L547.328 378.6752c-4.1984 4.1984-9.8816 6.5536-15.8208 6.5536a22.41024 22.41024 0 0 1-15.8208-38.2464l94.1056-94.1056c8.7552-8.704 22.9376-8.704 31.6416 0z"
                    fill="#4F46A3"
                  />
                </svg>
              </div>
              <svg
                width="1"
                height="81"
                viewBox="0 0 1 81"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <line
                  y1="-0.5"
                  x2="80"
                  y2="-0.5"
                  transform="matrix(0 -1 -1 0 0 80.5)"
                  stroke="var(--color-line)"
                ></line>
                <line
                  y1="-0.5"
                  x2="80"
                  y2="-0.5"
                  transform="matrix(0 -1 -1 0 0 80.5)"
                  stroke="url(#vertical-line-gradient)"
                ></line>
                <defs>
                  <motion.linearGradient
                    id="vertical-line-gradient"
                    gradientUnits="userSpaceOnUse"
                    x1="0"
                    x2="2"
                    y1="76.07369%"
                    y2="95.09211%"
                    initial={{
                      y1: "0%",
                      y2: "20%",
                    }}
                    animate={{
                      y1: "90%",
                      y2: "100%",
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "linear",
                    }}
                  >
                    <stop stopColor="var(--color-line)"></stop>
                    <stop offset="0.5" stopColor="#22C55E"></stop>
                    <stop offset="1" stopColor="var(--color-line)"></stop>
                  </motion.linearGradient>
                </defs>
              </svg>
              <svg
                width="1"
                height="81"
                viewBox="0 0 1 81"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <line
                  y1="-0.5"
                  x2="80"
                  y2="-0.5"
                  transform="matrix(0 -1 -1 0 0 80.5)"
                  stroke="var(--color-line)"
                ></line>
                <line
                  y1="-0.5"
                  x2="80"
                  y2="-0.5"
                  transform="matrix(0 -1 -1 0 0 80.5)"
                  stroke="url(#vertical-line-gradient-2)"
                ></line>
                <defs>
                  <motion.linearGradient
                    id="vertical-line-gradient-2"
                    gradientUnits="userSpaceOnUse"
                    x1="0"
                    x2="2"
                    y1="76.07369%"
                    y2="95.09211%"
                    initial={{
                      y1: "0%",
                      y2: "20%",
                    }}
                    animate={{
                      y1: "90%",
                      y2: "100%",
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "linear",
                    }}
                  >
                    <stop stopColor="var(--color-line)"></stop>
                    <stop offset="0.5" stopColor="#3B82F6"></stop>
                    <stop offset="1" stopColor="var(--color-line)"></stop>
                  </motion.linearGradient>
                </defs>
              </svg>
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-white shadow-md dark:border-neutral-600 dark:bg-neutral-900">
                {/* Patient Mobile App Icon */}
                <svg
                  viewBox="-12.54 0 64 64"
                  className="size-8"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g
                    id="Group_146"
                    data-name="Group 146"
                    transform="translate(-449.185 -305.835)"
                  >
                    <g id="XMLID_13_">
                      <g id="Group_145" data-name="Group 145">
                        <path
                          id="Path_145"
                          data-name="Path 145"
                          d="M488.105,307.835v60a2.006,2.006,0,0,1-2,2h-34.92a2.006,2.006,0,0,1-2-2v-60a2.006,2.006,0,0,1,2-2H486.1A2.006,2.006,0,0,1,488.105,307.835Zm-4,58v-6h-30.92v6h30.92Zm0-10v-40.25h-30.92v40.25Zm0-44.25v-1.75h-30.92v1.75Z"
                          fill="#03373d"
                        />
                        <path
                          id="Path_146"
                          data-name="Path 146"
                          d="M484.105,359.835v6h-12.08v-1a2,2,0,0,0,0-4v-1Z"
                          fill="#b6cbe3"
                        />
                        <path
                          id="Path_147"
                          data-name="Path 147"
                          d="M484.105,334.8v21.03h-30.92V334.8h2.46a13,13,0,1,0,26,0Z"
                          fill="#ccc"
                        />
                        <path
                          id="Path_148"
                          data-name="Path 148"
                          d="M484.105,315.585V334.8h-2.46a13,13,0,0,0-26,0h-2.46v-19.22Z"
                          fill="#ccc"
                        />
                        <rect
                          id="Rectangle_9"
                          data-name="Rectangle 9"
                          width="30.92"
                          height="1.75"
                          transform="translate(453.185 309.835)"
                          fill="#b6cbe3"
                        />
                        <path
                          id="Path_149"
                          data-name="Path 149"
                          d="M468.645,321.8a13,13,0,1,1-13,13A13.012,13.012,0,0,1,468.645,321.8Zm9,13a9,9,0,1,0-9,9A9.014,9.014,0,0,0,477.645,334.8Z"
                          fill="#1be053"
                        />
                        <path
                          id="Path_150"
                          data-name="Path 150"
                          d="M474.555,332.435v4.74h-3.54v3.54h-4.74v-3.54h-3.54v-4.74h3.54v-3.54h4.74v3.54Z"
                          fill="#ef472e"
                        />
                        <path
                          id="Path_151"
                          data-name="Path 151"
                          d="M472.025,360.835a2,2,0,0,1,0,4h-6.88a2,2,0,0,1,0-4Z"
                          fill="#1be053"
                        />
                        <path
                          id="Path_152"
                          data-name="Path 152"
                          d="M472.025,364.835v1h-18.84v-6h18.84v1h-6.88a2,2,0,0,0,0,4Z"
                          fill="#b6cbe3"
                        />
                      </g>
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <div className="2 absolute -top-4 right-30 flex h-full flex-col items-center">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-white shadow-md dark:border-neutral-600 dark:bg-neutral-900">
              {/* Supply Chain Tracker Icon */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-6"
              >
                <rect
                  x="1"
                  y="3"
                  width="15"
                  height="13"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M16 8H20L23 11V16H16V8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="5.5"
                  cy="18.5"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="18.5"
                  cy="18.5"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path d="M8 18H16" stroke="currentColor" strokeWidth="2" />
                <circle cx="6" cy="8" r="1" fill="currentColor" />
                <circle cx="10" cy="8" r="1" fill="currentColor" />
                <circle cx="6" cy="12" r="1" fill="currentColor" />
                <circle cx="10" cy="12" r="1" fill="currentColor" />
              </svg>
            </div>
            <svg
              width="1"
              height="81"
              viewBox="0 0 1 81"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <line
                y1="-0.5"
                x2="80"
                y2="-0.5"
                transform="matrix(0 -1 -1 0 0 80.5)"
                stroke="var(--color-line)"
              ></line>
              <line
                y1="-0.5"
                x2="80"
                y2="-0.5"
                transform="matrix(0 -1 -1 0 0 80.5)"
                stroke="url(#vertical-line-gradient-3)"
              ></line>
              <defs>
                <motion.linearGradient
                  id="vertical-line-gradient-3"
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  x2="2"
                  y1="76.07369%"
                  y2="95.09211%"
                  initial={{
                    y1: "0%",
                    y2: "20%",
                  }}
                  animate={{
                    y1: "90%",
                    y2: "100%",
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear",
                  }}
                >
                  <stop stopColor="var(--color-line)"></stop>
                  <stop offset="0.5" stopColor="#F59E0B"></stop>
                  <stop offset="1" stopColor="var(--color-line)"></stop>
                </motion.linearGradient>
              </defs>
            </svg>
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-white shadow-md dark:border-neutral-600 dark:bg-neutral-900">
              {/* Alert System Icon */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-6"
              >
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <line
                  x1="12"
                  y1="9"
                  x2="12"
                  y2="13"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="12" cy="17" r="1" fill="currentColor" />
              </svg>
            </div>
          </div>
          <svg
            width="314"
            height="2"
            viewBox="0 0 314 2"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="0.5"
              y1="1"
              x2="313.5"
              y2="1"
              stroke="var(--color-line)"
              strokeLinecap="round"
            ></line>
            <line
              x1="0.5"
              y1="1"
              x2="313.5"
              y2="1"
              stroke="url(#horizontal-line-gradient-2)"
              strokeLinecap="round"
            ></line>
            <defs>
              <motion.linearGradient
                id="horizontal-line-gradient-2"
                gradientUnits="userSpaceOnUse"
                y1="0"
                y2="1"
                x1="85.68008%"
                x2="95.68008%"
                initial={{
                  x1: "0%",
                  x2: "20%",
                }}
                animate={{
                  x1: "90%",
                  x2: "100%",
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear",
                }}
              >
                <stop stopColor="var(--color-line)"></stop>
                <stop offset="0.5" stopColor="var(--color-blue-500)"></stop>
                <stop offset="1" stopColor="var(--color-line)"></stop>
              </motion.linearGradient>
            </defs>
          </svg>
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-white shadow-md dark:border-neutral-600 dark:bg-neutral-900">
            {/* FDA Compliance Icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-6 text-green-300"
            >
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
