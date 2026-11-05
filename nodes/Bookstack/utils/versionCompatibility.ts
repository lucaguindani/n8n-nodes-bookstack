export type BookstackVersion = number[];

/**
 * Minimum BookStack version that exposes each API feature, keyed by `resource.operation`
 * (or `resource.*` for every operation of a resource). Derived from the BookStack release notes.
 */
export const FEATURE_MIN_VERSIONS: Record<string, string> = {
	'attachment.*': 'v21.10',
	'image.*': 'v23.05',
	'comment.*': 'v25.11',
	'global.search': 'v21.11',
	'global.auditLogList': 'v24.05',
	'global.systemInfo': 'v25.05',
};

/**
 * The `/system` endpoint was added in v25.05. A 404 from it means the instance is older,
 * so detection falls back to this version: just below the first release that has it.
 */
export const PRE_SYSTEM_ENDPOINT_VERSION: BookstackVersion = [25, 4, 999];

/**
 * Parse a BookStack version string such as `v25.11`, `v25.11.1` or `v0.31.2`
 */
export function parseBookstackVersion(raw: unknown): BookstackVersion | null {
	if (typeof raw !== 'string') return null;

	const match = raw.trim().match(/^v?(\d+)\.(\d+)(?:\.(\d+))?/i);
	if (!match) return null;

	return [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)];
}

export function compareVersions(a: BookstackVersion, b: BookstackVersion): number {
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		const diff = (a[i] ?? 0) - (b[i] ?? 0);
		if (diff !== 0) return diff < 0 ? -1 : 1;
	}
	return 0;
}

export function formatVersion(version: BookstackVersion): string {
	const [major, minor, patch = 0] = version;
	const base = `v${major}.${String(minor).padStart(2, '0')}`;
	return patch > 0 ? `${base}.${patch}` : base;
}

export function getRequiredVersion(resource: string, operation: string): string | undefined {
	return FEATURE_MIN_VERSIONS[`${resource}.${operation}`] ?? FEATURE_MIN_VERSIONS[`${resource}.*`];
}

/**
 * Returns an error message when the detected version cannot serve the operation, otherwise null
 */
export function getCompatibilityError(
	detected: BookstackVersion,
	resource: string,
	operation: string,
): string | null {
	const requiredRaw = getRequiredVersion(resource, operation);
	const required = parseBookstackVersion(requiredRaw);
	if (!requiredRaw || !required || compareVersions(detected, required) >= 0) return null;

	const detectedLabel =
		compareVersions(detected, PRE_SYSTEM_ENDPOINT_VERSION) === 0
			? 'older than v25.05'
			: formatVersion(detected);

	return `The "${operation}" operation on "${resource}" requires BookStack ${formatVersion(required)} or newer, but the instance is ${detectedLabel}. If this is wrong, enable Options > Skip Version Check`;
}
