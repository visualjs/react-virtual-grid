
export function throttle(func: (...args: any) => void, ms: number, rate: number) {
    let timeout: any;
    let startTime = new Date();

    return function (...args: any) {
        let curTime = new Date();

        clearTimeout(timeout);

        if (curTime.getTime() - startTime.getTime() >= rate) {
            func(...args);
            startTime = curTime;
        } else {
            timeout = setTimeout(() => {
                func(...args);
            }, ms);
        }
    };
};
