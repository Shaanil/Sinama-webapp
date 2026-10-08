const hasAiredCache = {};

export function hasAired(date) {
    if (!date) return false;
    if (Object.prototype.hasOwnProperty.call(hasAiredCache, date)) {
        return hasAiredCache[date];
    }

    const now = new Date();
    const airDate = new Date(date);
    const aired = !Number.isNaN(airDate.getTime()) && airDate < now;

    hasAiredCache[date] = aired;
    return aired;
}
