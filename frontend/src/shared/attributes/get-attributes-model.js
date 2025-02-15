/**
 * Util to transform extract the default property from attributes and create a new object
 */
export default (record) => {
  return Object.entries(record?.attributes || {}).reduce(
    (obj, [key, val]) => {
      if (
        val.default === undefined ||
        val.default === null
      ) {
        return obj
      }

      return {
        ...obj,
        [key]: val.default
      }
    },
    {}
  )
}
