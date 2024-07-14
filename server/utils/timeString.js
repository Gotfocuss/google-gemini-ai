// timeString.js
export function getTimeString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    //console.log(`${year}${month}${date}_${hours}${minutes}${seconds}`);
    return `${year}${month}${date}_${hours}${minutes}${seconds}`;
}
