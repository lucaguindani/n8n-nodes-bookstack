import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	PRE_SYSTEM_ENDPOINT_VERSION,
	compareVersions,
	formatVersion,
	getCompatibilityError,
	getRequiredVersion,
	parseBookstackVersion,
} from '../nodes/Bookstack/utils/versionCompatibility';

describe('parseBookstackVersion', () => {
	it('parses release versions with and without a patch part', () => {
		assert.deepEqual(parseBookstackVersion('v25.11'), [25, 11, 0]);
		assert.deepEqual(parseBookstackVersion('v25.11.1'), [25, 11, 1]);
		assert.deepEqual(parseBookstackVersion('v26.09.2'), [26, 9, 2]);
		assert.deepEqual(parseBookstackVersion('v0.31.2'), [0, 31, 2]);
		assert.deepEqual(parseBookstackVersion('25.05'), [25, 5, 0]);
	});

	it('ignores suffixes after the version', () => {
		assert.deepEqual(parseBookstackVersion('v25.11.1-dev'), [25, 11, 1]);
	});

	it('returns null for anything that is not a version', () => {
		assert.equal(parseBookstackVersion('garbage'), null);
		assert.equal(parseBookstackVersion(''), null);
		assert.equal(parseBookstackVersion(undefined), null);
		assert.equal(parseBookstackVersion(25.11), null);
	});
});

describe('compareVersions', () => {
	it('orders by major, minor then patch', () => {
		assert.equal(compareVersions([25, 11, 0], [25, 11, 0]), 0);
		assert.equal(compareVersions([25, 11, 1], [25, 11, 0]), 1);
		assert.equal(compareVersions([25, 5, 0], [25, 11, 0]), -1);
		assert.equal(compareVersions([26, 3, 0], [25, 12, 9]), 1);
	});
});

describe('formatVersion', () => {
	it('pads the minor part and drops a zero patch', () => {
		assert.equal(formatVersion([25, 5, 0]), 'v25.05');
		assert.equal(formatVersion([25, 11, 1]), 'v25.11.1');
	});
});

describe('getRequiredVersion', () => {
	it('prefers an exact operation match over the resource wildcard', () => {
		assert.equal(getRequiredVersion('global', 'auditLogList'), 'v24.05');
		assert.equal(getRequiredVersion('comment', 'create'), 'v25.11');
	});

	it('returns undefined for unknown features', () => {
		assert.equal(getRequiredVersion('unknown', 'get'), undefined);
	});
});

describe('getCompatibilityError', () => {
	it('blocks comments below v25.11', () => {
		const message = getCompatibilityError([25, 7, 0], 'comment', 'getAll');
		assert.match(message ?? '', /requires BookStack v25\.11 or newer/);
		assert.match(message ?? '', /instance is v25\.07/);
	});

	it('allows comments on v25.11 and newer', () => {
		assert.equal(getCompatibilityError([25, 11, 0], 'comment', 'getAll'), null);
		assert.equal(getCompatibilityError([26, 9, 2], 'comment', 'getAll'), null);
	});

	it('treats an instance without the system endpoint as older than v25.05', () => {
		const message = getCompatibilityError(PRE_SYSTEM_ENDPOINT_VERSION, 'global', 'systemInfo');
		assert.match(message ?? '', /instance is older than v25\.05/);
	});

	it('still allows features that predate the system endpoint', () => {
		assert.equal(getCompatibilityError(PRE_SYSTEM_ENDPOINT_VERSION, 'global', 'auditLogList'), null);
		assert.equal(getCompatibilityError(PRE_SYSTEM_ENDPOINT_VERSION, 'book', 'getAll'), null);
	});

	it('allows features with no known requirement', () => {
		assert.equal(getCompatibilityError([21, 1, 0], 'unknown', 'get'), null);
	});
});
