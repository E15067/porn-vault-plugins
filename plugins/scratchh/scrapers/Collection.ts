// 'use strict'

// module.exports = class Collection {

//   constructor ({ name, ctx }) {
//     this.name = name
//     this.$logger = ctx.$logger
//     this.client = ctx.$axios.create({
//       baseURL: 'http://localhost:8000/'
//     })
//   }

//   async count () {
//     this.$logger.silly(`Getting collection count: ${this.name}`)
//     const { data } = await this.client.get(`/collection/${this.name}/count`)

//     return data.count
//   }

//   async compact () {
//     this.$logger.silly(`Compacting collection: ${this.name}`)
//     return this.client.post(`/collection/compact/${this.name}`)
//   }

//   async upsert (id, obj) {
//     this.$logger.silly(`Upsert ${id} in collection: ${this.name}`)
//     const { data } = await Axios.post(`/collection/${this.name}/${id}`, obj)

//     return data
//   }

//   async remove (id) {
//     this.$logger.silly(`Remove ${id} in collection: ${this.name}`)
//     const { data } = await this.client.delete(`/collection/${this.name}/${id}`)

//     return data
//   }

//   async getAll ()  {
//     this.$logger.silly(`Get all from collection: ${this.name}`)
//     const { data } = await this.client.get(`/collection/${this.name}`)

//     return data.items
//   }

//   async get (id) {
//     this.$logger.silly(`Getting ${id} from collection: ${this.name}`)
//     try {
//       const { data } = await this.client.get(`/collection/${this.name}/${id}`)
//       return data
//     } catch (error) {
//       const _err = error
//       if (!_err.response) {
//         throw error
//       }
//       if (_err.response.status === 404) {
//         return null
//       }
//       throw _err
//     }
//   }

//   async getBulk(items) {
//     logger.silly(`Getting ${items.length} items in bulk from collection: ${this.name}`)
//     const { data } = await this.client.post(`/collection/${this.name}/bulk`, { items })

//     return data.items
//   }

//   async query (index, key) {
//     this.$logger.silly(`Querying index ${index} by ${key} from collection: ${this.name}`)
//     const { data } = await this.client.get(`/collection/${this.name}/${index}/${key}`)

//     return data.items
//   }
// }
