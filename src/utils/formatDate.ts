export default (date: Date) => {
    function padTo2Digits(num: number) {
        return num.toString().padStart(2, '0');
    }
    return (
        [
            padTo2Digits(date.getMonth() + 1),
            padTo2Digits(date.getDate()),
            date.getFullYear(),
        ].join('/') +
        ' ' +
        [
            padTo2Digits(date.getHours()),
            padTo2Digits(date.getMinutes()),
            padTo2Digits(date.getSeconds()),
        ].join(':')
        );
}

export const convertMsToDHM = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    const result = {
        days: days,
        hours: hours % 24,
        minutes: minutes % 60,
        seconds: seconds % 60
    };
  
    return result;
}

export const convertBytes = (bytes: number) => {
    return bytes >= 1073741824 ? ~~(bytes / (1024 * 1024 * 1024))+"GB" : bytes > 1048576 ? ~~(bytes / (1024 * 1024))+"MB" : bytes > 1024 ? ~~(bytes / (1024))+"KB" : bytes+"B"
}