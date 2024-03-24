/*
 * Copyright Haveno
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * Run a task in a fixed period loop.
 */
export default class TaskLooper {
    
  _fn: () => Promise<void>;
  _isStarted: boolean;
  _isLooping: boolean;
  _timeout: NodeJS.Timeout | undefined;
  
  /**
   * Build the looper with a function to invoke on a fixed period loop.
   * 
   * @param {function} fn - the async function to invoke
   */
  constructor(fn: () => Promise<void>) {
    this._fn = fn;
    this._isStarted = false;
    this._isLooping = false;
  }
  
  /**
   * Start the task loop.
   * 
   * @param {int} periodInMs the loop period in milliseconds
   */
  start(periodInMs: number) {
    if (periodInMs <= 0) throw new Error("Looper period must be greater than 0 ms");
    if (this._isStarted) return;
    this._isStarted = true;
    this._runLoop(periodInMs);
  }
  
  /**
   * Stop the task loop.
   */
  stop() {
    if (!this._isStarted) throw new Error("Cannot stop TaskLooper because it's not started");
    this._isStarted = false;
    clearTimeout(this._timeout!);
    this._timeout = undefined;
  }
  
  async _runLoop(periodInMs: number) {
    this._isLooping = true;
    while (this._isStarted) {
      const startTime = Date.now();
      await this._fn();
      if (this._isStarted) await new Promise((resolve) => { this._timeout = setTimeout(resolve, periodInMs - (Date.now() - startTime)); });
    }
    this._isLooping = false;
  }
}
