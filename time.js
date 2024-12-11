function getDatesWithOffset() {
    const now = new Date();
    const currentDateTime = now.toISOString();

    // 设定偏移量的变量，这里初始化为3小时，你可以修改这个值在+12到 - 12之间
    const offsetHours = 3;
    const offsetMilliseconds = offsetHours * 60 * 60 * 1000;
    const offsetDate = new Date(now.getTime() + offsetMilliseconds);
    const offsetDateTime = offsetDate.toISOString();

    return {
        currentDateTime: currentDateTime,
        offsetDateTime: offsetDateTime
    };
}

module.exports = getDatesWithOffset;