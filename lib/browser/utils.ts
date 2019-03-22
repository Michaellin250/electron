import { EventEmitter } from 'events'

/**
* Creates a lazy instance of modules that can't be required before the
* app 'ready' event by returning a proxy object to mitigate side effects
* on 'require'
*
* @param {Function} creator - Function that creates a new module instance
* @param {Object} holder - the object holding the module prototype
* @param {Boolean} isEventEmitter - whether or not the module is an EventEmitter
* @returns {Object} - a proxy object for the
*/

export function createLazyInstance (
  creator: Function,
  holder: Object,
  isEventEmitter: Boolean
) {
  let lazyModule: Object
  const module: any = {}
  for (const method in (holder as any).prototype) {
    module[method] = (...args: any) => {
      // create new instance of module at runtime if none exists
      if (!lazyModule) {
        lazyModule = creator()
        if (isEventEmitter) EventEmitter.call(lazyModule as any)
      }
      // ensure that all keys on the prototype are methods
      if (Object.getOwnPropertyDescriptor(lazyModule, method)) {
        throw new Error(`${method} is not a function on the prototype chain`)
      }
      return (lazyModule as any)[method](...args)
    }
  }
  return module
}
