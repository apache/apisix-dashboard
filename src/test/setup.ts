/**
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

// Extends Vitest's `expect` with jest-dom DOM assertions
// e.g. toBeInTheDocument(), toHaveValue(), toBeDisabled()
import '@testing-library/jest-dom/vitest';

// ---------------------------------------------------------------------------
// Browser API stubs required by Mantine in jsdom
// ---------------------------------------------------------------------------

// Mantine's color-scheme detection calls window.matchMedia.
// jsdom does not implement it; provide a no-op stub.
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},       // deprecated but still called by some libs
        removeListener: () => {},    // deprecated
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    }),
});

// ResizeObserver is used by Mantine's scroll-area and other layout components.
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};
