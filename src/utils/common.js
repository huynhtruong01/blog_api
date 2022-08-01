// ====================== Date ===========================
export const getMonthText = (time) => {
    const monthList = [
        'jan',
        'feb',
        'mar',
        'apr',
        'may',
        'jun',
        'jul',
        'aug',
        'sep',
        'oct',
        'nov',
        'dec',
    ]
    const month = new Date(time).getMonth()

    return monthList[month]
}

export const getYearText = (time) => {
    const year = `y${new Date(time).getFullYear()}`
    return year
}

export const getYear = (time) => {
    const year = new Date(time).getFullYear()
    return year
}
