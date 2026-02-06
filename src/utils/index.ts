export function createPageUrl(pageName: string) {
    if (!pageName) return '/';
    // Ensure case consistency and handle the root dashboard correctly
    const path = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    if (path === 'Dashboard') return '/';
    return '/' + path;
}
