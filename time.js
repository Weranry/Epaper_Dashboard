
    const now = new Date();
    const currentDateTime = now.toISOString();

    // 设定偏移量的变量，这里初始化为3小时，你可以修改这个值在+12到 - 12之间
    const offsetHours = 8;
    const offsetMilliseconds = offsetHours * 60 * 60 * 1000;
    const offsetDate = new Date(now.getTime() + offsetMilliseconds);
    const offsetDateTime = offsetDate.toISOString();





        console.log(now);
console.log(offsetDateTime);