/**
 * Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Transform } from "../types.js";

/**
 * Returns a `Transform` where items are only emitted if `ms` milliseconds
 * pass between emits. When many items are emitted in close succession
 * by the original observable, only the last will be emitted here.
 *
 * @typeparam T Type of items emitted by the observable.
 * @param ms Milliseconds to wait before emitting an item.
 * @returns Transform that emits some items from the original observable.
 */
export function debounce<T>(ms: number): Transform<T> {
  let latestDiscardedChunk: T;
  let hasDiscardedChunk = false;
  let isOnCooldown = false;
  let isClosed = false;

  return new TransformStream({
    transform(chunk, controller) {
      if (!isOnCooldown) {
        isOnCooldown = true;
        setTimeout(() => {
          isOnCooldown = false;
          if (hasDiscardedChunk && !isClosed) {
            this.transform!(latestDiscardedChunk, controller);
            hasDiscardedChunk = false;
          }
        }, ms);
        controller.enqueue(chunk);
      } else {
        latestDiscardedChunk = chunk;
        hasDiscardedChunk = true;
      }
    },
    flush() {
      isClosed = true;
    }
  });
}
