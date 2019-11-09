/**
 * MIT License
 *
 * Copyright (c) 2018 Chong Guo
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
  t /= d / 2
  if (t < 1) {
    return c / 2 * t * t + b
  }
  t--
  return -c / 2 * (t * (t - 2) - 1) + b
}

// requestAnimationFrame for Smart Animating http://goo.gl/sx5sts
const requestAnimFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || (window as any).mozRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60) }
})()

// Because it's so fucking difficult to detect the scrolling element, just move them all
const move = (amount: number) => {
  document.documentElement.scrollTop = amount;
  (document.body.parentNode as HTMLElement).scrollTop = amount
  document.body.scrollTop = amount
}

const position = () => {
  return document.documentElement.scrollTop || (document.body.parentNode as HTMLElement).scrollTop || document.body.scrollTop
}

export const scrollTo = (to: number, duration: number, callback?: Function) => {
  const start = position()
  const change = to - start
  const increment = 20
  let currentTime = 0
  duration = (typeof (duration) === 'undefined') ? 500 : duration
  const animateScroll = function() {
    // increment the time
    currentTime += increment
    // find the value with the quadratic in-out easing function
    const val = easeInOutQuad(currentTime, start, change, duration)
    // move the document.body
    move(val)
    // do the animation unless its over
    if (currentTime < duration) {
      requestAnimFrame(animateScroll)
    } else {
      if (callback && typeof (callback) === 'function') {
        // the animation is done so lets callback
        callback()
      }
    }
  }
  animateScroll()
}
