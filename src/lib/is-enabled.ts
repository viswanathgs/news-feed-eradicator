import { Sites, Site } from '../sites';
import { SettingsState } from '../background/store/reducer';
import {
	getSiteStatus,
	SiteStatusTag,
	SiteStatus,
} from '../background/store/sites/selectors';

export type EnabledStatus =
	| { type: 'enabled' }
	| { type: 'disabled' }
	| { type: 'disabled-temporarily'; until: number };

export function isEnabled(state: SettingsState): boolean {
	return enabledStatus(state).type === 'enabled';
}

export function isPathEnabled(site: Site, path: string): boolean {
	if (site.allowlist_url_regexp &&
	    site.allowlist_url_regexp.some(regexp => RegExp(regexp).test(window.location.href))) {
		return false;
	}

	if (site.paths.indexOf('_all_') !== -1 || site.paths.indexOf(path) !== -1) {
		return true;
	}

	return false;
}

export function enabledStatus(state: SettingsState): EnabledStatus {
	const siteStatuses = getSiteStatus(state);
	for (let siteId of Object.keys(Sites)) {
		let site: Site = Sites[siteId];
		const siteStatus: SiteStatus = siteStatuses[siteId];
		if (site.domain.find(domain => window.location.host.includes(domain)) != null) {
			// Always disabled if the path doesn't match
			if (!isPathEnabled(site, window.location.pathname)) {
				return { type: 'disabled' };
			}

			if (siteStatus.type === SiteStatusTag.DISABLED) {
				return { type: 'disabled' };
			} else if (siteStatus.type === SiteStatusTag.DISABLED_TEMPORARILY) {
				return { type: 'disabled-temporarily', until: siteStatus.until };
			}

			return { type: 'enabled' };
		}
	}

	return { type: 'disabled' };
}
