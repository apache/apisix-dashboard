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

import { DirectiveOptions } from 'vue'

export const elDraggableDialog: DirectiveOptions = {
  bind(el, _, vnode) {
    const dragDom = el.querySelector('.el-dialog') as HTMLElement
    const dialogHeaderEl = el.querySelector('.el-dialog__header') as HTMLElement
    dragDom.style.cssText += ';top:0px;'
    dialogHeaderEl.style.cssText += ';cursor:move;'

    dialogHeaderEl.onmousedown = (e) => {
      const disX = e.clientX - dialogHeaderEl.offsetLeft
      const disY = e.clientY - dialogHeaderEl.offsetTop

      const dragDomWidth = dragDom.offsetWidth
      const dragDomHeight = dragDom.offsetHeight

      const screenWidth = document.body.clientWidth
      const screenHeight = document.body.clientHeight

      const minDragDomLeft = dragDom.offsetLeft
      const maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth

      const minDragDomTop = dragDom.offsetTop
      const maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomHeight

      let styleLeftStr = getComputedStyle(dragDom)['left']
      let styleTopStr = getComputedStyle(dragDom)['top']
      if (!styleLeftStr || !styleTopStr) return
      let styleLeft: number
      let styleTop: number

      // Format may be "##%" or "##px"
      if (styleLeftStr.includes('%')) {
        styleLeft = +document.body.clientWidth * (+styleLeftStr.replace(/%/g, '') / 100)
        styleTop = +document.body.clientHeight * (+styleTopStr.replace(/%/g, '') / 100)
      } else {
        styleLeft = +styleLeftStr.replace(/px/g, '')
        styleTop = +styleTopStr.replace(/px/g, '')
      }

      document.onmousemove = (e) => {
        let left = e.clientX - disX
        let top = e.clientY - disY

        // Handle edge cases
        if (-(left) > minDragDomLeft) {
          left = -minDragDomLeft
        } else if (left > maxDragDomLeft) {
          left = maxDragDomLeft
        }
        if (-(top) > minDragDomTop) {
          top = -minDragDomTop
        } else if (top > maxDragDomTop) {
          top = maxDragDomTop
        }

        // Move current element
        dragDom.style.cssText += `;left:${left + styleLeft}px;top:${top + styleTop}px;`

        // Emit onDialogDrag event
        // See https://stackoverflow.com/questions/49264426/vuejs-custom-directive-emit-event
        if (vnode.componentInstance) {
          vnode.componentInstance.$emit('onDialogDrag')
        } else if (vnode.elm) {
          vnode.elm.dispatchEvent(new CustomEvent('onDialogDrag'))
        }
      }

      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  }
}
