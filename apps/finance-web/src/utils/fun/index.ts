type CallOnece = (...args: unknown[]) => unknown
function callOneceFn<T extends CallOnece>(fn: CallOnece): (...args: unknown[]) => unknown {
  let isCalled = false

  return (...args) => {
    if (isCalled) return

    isCalled = true
    return fn(...args)
  }
}
