class Collection {

  constructor() {
    this.items = []
    this.itemIds = {}
  }

  /**
   * Add item at the start of current collection
   * @param item
   * @param key {string|number}
   * @returns {*}
   */
  prepend(item, key) {
    this.items.unshift(item)
    if (key) {
      for (let key in this.itemIds) {
        if (this.itemIds.hasOwnProperty(key)) {
          this.itemIds[key] += 1
        }
      }
      this.itemIds[key] = 0
    }
    return item
  }

  /**
   * Add item at the end of current collection
   * @param item
   * * @param key {string|number}
   * @returns {*}
   */
  append(item, key) {
    this.items.push(item)
    if (key) {
      this.itemIds[key] = this.items.length - 1
    }
    return item
  }

  /**
   * Remove item by index from current collection
   * @param index
   * @returns {*}
   */
  removeByIndex(index) {
    this.items = this.items.splice(index, 1)
  }

  /**
   * Remove item by key [id] from current collection
   * @param key {string|number}
   * @returns {*}
   */
  removeByKey(key) {
    this.items = this.items.splice(this.itemIds[key], 1)
    delete this.itemIds[key]
  }

  /**
   * Get index of item in current collection
   * @param item
   * @returns {number}
   */
  indexOf(item) {
    return this.items.indexOf(item)
  }

  /**
   * Get item by index from current collection
   * @param index
   * @returns {*}
   */
  getByIndex(index) {
    return this.items[index]
  }

  /**
   * Get item by key [id] from current collection
   * @param key {string|number}
   * @returns {*}
   */
  getByKey(key) {
    return this.items[this.itemIds[key]]
  }

  /**
   * Check if item with such name exists in current collection
   * @param key {string|number}
   * @returns {boolean}
   */
  isExist(key) {
    return Boolean(this.getByKey(key))
  }

  /**
   * Get length of current collection
   * @returns {Number}
   */
  get length() {
    return this.items.length
  }
}

export default Collection
