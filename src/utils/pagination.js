const pagination = (params) => {
    // if (!params || Object.keys(params).length === 0) return {}

    const page = Number.parseInt(params.page) * 1 || 1
    const limit = Number.parseInt(params.limit) * 1 || 10
    const skip = (Number.parseInt(page) - 1) * limit * 1 || 0

    return { page, limit, skip }
}

module.exports = pagination
