function ApiFeatures(query, queryString) {
    this.query = query
    this.queryString = queryString

    // pagination
    this.pagination = () => {
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 10
        const skip = limit * (page - 1) * 1 || 0
        this.query = this.query.limit(limit).skip(skip)

        return this
    }

    // sort
    this.sort = () => {
        if (this.queryString.sort) {
            const sort = this.queryString.sort.toLowerCase().trim()
            this.query = this.query.sort(sort)
            return this
        }
        this.query = this.query.sort('-createdAt')

        return this
    }

    // search
    this.search = () => {
        if (this.queryString.search) {
            const search = this.queryString.search.trim()
            console.log(this.queryString.search)
            this.query = this.query.find({ $text: { $search: search } })
            return this
        }

        return this
    }

    // filter
    this.filter = () => {
        const keyList = ['limit', 'page', 'sort', 'search', 'id']
        const queryStringObj = { ...this.queryString }

        for (const key in queryStringObj) {
            if (keyList.includes(key)) {
                delete queryStringObj[key]
            }
        }

        if (Object.keys(queryStringObj).length > 0) {
            let queryStr = JSON.stringify(queryStringObj)
            queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, (match) => '$' + match)

            console.log(queryStr)
            this.query = this.query.find(JSON.parse(queryStr))
            return this
        }

        return this
    }
}

module.exports = ApiFeatures
