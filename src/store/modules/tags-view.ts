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

import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import { Route } from 'vue-router'
import store from '@/store'

export interface ITagView extends Partial<Route> {
  title?: string
}

export interface ITagsViewState {
  visitedViews: ITagView[]
  cachedViews: (string | undefined)[]
}

@Module({ dynamic: true, store, name: 'tagsView' })
class TagsView extends VuexModule implements ITagsViewState {
  public visitedViews: ITagView[] = []
  public cachedViews: (string | undefined)[] = []

  @Mutation
  private ADD_VISITED_VIEW(view: ITagView) {
    if (this.visitedViews.some(v => v.path === view.path)) return
    this.visitedViews.push(
      Object.assign({}, view, {
        title: view.meta.title || 'no-name'
      })
    )
  }

  @Mutation
  private ADD_CACHED_VIEW(view: ITagView) {
    if (this.cachedViews.includes(view.name)) return
    if (!view.meta.noCache) {
      this.cachedViews.push(view.name)
    }
  }

  @Mutation
  private DEL_VISITED_VIEW(view: ITagView) {
    for (const [i, v] of this.visitedViews.entries()) {
      if (v.path === view.path) {
        this.visitedViews.splice(i, 1)
        break
      }
    }
  }

  @Mutation
  private DEL_CACHED_VIEW(view: ITagView) {
    for (const [i, v] of this.cachedViews.entries()) {
      if (v === view.name) {
        this.cachedViews.splice(i, 1)
        break
      }
    }
  }

  @Mutation
  private DEL_OTHERS_VISITED_VIEWS(view: ITagView) {
    this.visitedViews = this.visitedViews.filter(v => {
      return v.meta.affix || v.path === view.path
    })
  }

  @Mutation
  private DEL_OTHERS_CACHED_VIEWS(view: ITagView) {
    for (const [i, v] of this.cachedViews.entries()) {
      if (v === view.name) {
        this.cachedViews = this.cachedViews.slice(i, i + 1)
        break
      }
    }
  }

  @Mutation
  private DEL_ALL_VISITED_VIEWS() {
    // keep affix tags
    const affixTags = this.visitedViews.filter(tag => tag.meta.affix)
    this.visitedViews = affixTags
  }

  @Mutation
  private DEL_ALL_CACHED_VIEWS() {
    this.cachedViews = []
  }

  @Mutation
  private UPDATE_VISITED_VIEW(view: ITagView) {
    for (let v of this.visitedViews) {
      if (v.path === view.path) {
        v = Object.assign(v, view)
        break
      }
    }
  }

  @Action
  public addView(view: ITagView) {
    this.ADD_VISITED_VIEW(view)
    this.ADD_CACHED_VIEW(view)
  }

  @Action
  public addVisitedView(view: ITagView) {
    this.ADD_VISITED_VIEW(view)
  }

  @Action
  public delView(view: ITagView) {
    this.DEL_VISITED_VIEW(view)
    this.DEL_CACHED_VIEW(view)
  }

  @Action
  public delCachedView(view: ITagView) {
    this.DEL_CACHED_VIEW(view)
  }

  @Action
  public delOthersViews(view: ITagView) {
    this.DEL_OTHERS_VISITED_VIEWS(view)
    this.DEL_OTHERS_CACHED_VIEWS(view)
  }

  @Action
  public delAllViews() {
    this.DEL_ALL_VISITED_VIEWS()
    this.DEL_ALL_CACHED_VIEWS()
  }

  @Action
  public delAllCachedViews() {
    this.DEL_ALL_CACHED_VIEWS()
  }

  @Action
  public updateVisitedView(view: ITagView) {
    this.UPDATE_VISITED_VIEW(view)
  }
}

export const TagsViewModule = getModule(TagsView)
