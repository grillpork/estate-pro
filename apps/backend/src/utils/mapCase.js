export function rowToCamel(row) {
    if (!row) return null;
    const newRow = {};
    for (const key of Object.keys(row)) {
        // Convert snake_case to camelCase
        const camelKey = key.replace(/_([a-z0-9])/g, (g) => g[1].toUpperCase());
        newRow[camelKey] = row[key];
    }
    return newRow;
}

export function rowsToCamel(rows) {
    if (!rows || !Array.isArray(rows)) return [];
    return rows.map(rowToCamel);
}
