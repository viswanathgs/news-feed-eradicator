import injectUI, { isAlreadyInjected } from '../lib/inject-ui';
import { isEnabled } from '../lib/is-enabled';
import { Store } from '../store';
import { removeNode } from '../lib/remove-news-feed';

export function checkSite(): boolean {
  return window.location.host.includes('workplace.com');
}

// Copied from fb-2020.ts
export function eradicate(store: Store) {
	function eradicateRetry() {
		const settings = store.getState().settings;
		if (settings == null) {
			return;
		}

		// Always eradicate sidebars (irrespective of whether path is enabled).
		// Auto-close workplace sidebars.
		document.querySelectorAll<HTMLElement>(
			'[aria-label="Close the menu"]'
		).forEach(i => i.click());

		// Remove right sidebar entirely (trending, etc).
		// Also added to `eradicate.css` to ensure they're hidden before JS loads.
		const trending = document.querySelector('[role=complementary]');
		if (trending != null) {
			removeNode(trending);
		}

		// Remove 'Quick Post Access' in search history.
		/*
		const search_history = document.querySelector('[id=galahad_search_view]');
		if (search_history != null) {
			removeNode(search_history);
		}
		*/

		// Remove likes/reactions.
		/*
		document.querySelectorAll<HTMLElement>(
			'[aria-label="See who reacted to this"]'
		).forEach(function(likes) {
			if (likes.parentElement != null) {
			  removeNode(likes.parentElement);
			}
		});
		*/

		// Eradicate feed and left sidebar only for enabled paths.
		if (!isEnabled(settings)) {
			return;
		}

		// Eradicate feed
		const feed = document.querySelector('[role=feed]');
		if (feed == null) {
			return;
		}

		// Remove left sidebar entirely (notifications, chat, navigation).
		/*
		const navigation = document.querySelector('[role=navigation]');
		if (navigation != null) {
			removeNode(navigation);
		}
		*/

		const container = feed.parentNode;

		// For some reason, removing these nodes are causing CPU usage to
		// sit at 100% while the page is open. Same thing if they're set to
		// display: none in CSS. I suspect it's to do with infinite scroll
		// again, so I'm going to leave the nodes in the tree for now, CSS
		// takes care of hiding them. It just means there's a scrollbar that
		// scrolls into emptiness, but it's better than constantly chewing CPU
		// for now.
		//
		//removeNode(feed);
		//removeNode(stories);

		// Add News Feed Eradicator quote/info panel
		if (container && !isAlreadyInjected()) {
			injectUI(container, store);
		}
	}

	// This delay ensures that the elements have been created by Facebook's
	// scripts before we attempt to replace them
	setInterval(eradicateRetry, 1000);
}
