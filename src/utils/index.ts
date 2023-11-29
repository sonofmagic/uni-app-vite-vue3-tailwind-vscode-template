export function getRect(vm: unknown, selector: string, all?: true) {
  // console.log(vm)
  const method = all ? 'selectAll' : 'select'
  return new Promise((resolve) => {
    uni
      .createSelectorQuery()
      .in(vm)
      // eslint-disable-next-line no-unexpected-multiline
      [method](selector)
      .boundingClientRect((rect) => {
        if (all && Array.isArray(rect) && rect.length) {
          resolve(rect)
        }
        if (!all && rect) {
          resolve(rect)
        }
      })
      .exec()
  })
}
