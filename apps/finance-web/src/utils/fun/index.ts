export async function sleep(t: number = 16) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, t)
  })
}
