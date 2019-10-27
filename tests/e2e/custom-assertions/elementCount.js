/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * A custom Nightwatch assertion. The assertion name is the filename.
 *
 * Example usage:
 *   browser.assert.elementCount(selector, count)
 *
 * For more information on custom assertions see:
 *   https://nightwatchjs.org/guide/extending-nightwatch/#writing-custom-assertions
 *
 *
 * @param {string|object} selectorOrObject
 * @param {number} count
 */

exports.assertion = function elementCount(selectorOrObject, count) {
  let selector

  // when called from a page object element or section
  if (typeof selectorOrObject === 'object' && selectorOrObject.selector) {
    // eslint-disable-next-line prefer-destructuring
    selector = selectorOrObject.selector
  } else {
    selector = selectorOrObject
  }

  this.message = `Testing if element <${selector}> has count: ${count}`
  this.expected = count
  this.pass = val => val === count
  this.value = res => res.value
  function evaluator(_selector) {
    return document.querySelectorAll(_selector).length
  }
  this.command = cb => this.api.execute(evaluator, [selector], cb)
}
