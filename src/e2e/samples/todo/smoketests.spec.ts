export default {
		/**
		 * Run a simple test going through every page testing
		 * if basic functionality is working
		 */
		'@tags': ['todo', 'smoketest'],
		'Smoke Test': (browser) => {
				browser
						.url('http://localhost:' + browser.globals.httpPort + '/todo/index.html')
						.assert.elementNotPresent('[data-index="0"]')
						.waitForElementVisible('[data-action="create"]')
						.click('[data-action="create"]')
						.waitForElementVisible('input[data-binding-property="title"]')
						.setValue('[data-binding-property="title"]', 'testTitle')
						.setValue('[data-binding-property="description"]', 'testDescription')
						.click('[data-trigger-property="save"')
						.waitForElementVisible('[data-index="0"] [data-action="details"]')
						.click('[data-index="0"] [data-action="details"]')
						.waitForElementVisible('[data-binding-property="title"]')
						.assert.containsText('[data-binding-property="title"]', 'testTitle')
						.waitForElementVisible('[data-binding-property="description"]')
						.assert.containsText('[data-binding-property="description"]', 'testDescription')
						.back()
						.waitForElementVisible('[data-index="0"] [data-action="edit"]')
						.click('[data-index="0"] [data-action="edit"]')
						.waitForElementVisible('[data-binding-property="title"]')
						.setValue('[data-binding-property="title"]', 'new_title')
						.waitForElementVisible('[data-binding-property="description"]')
						.setValue('[data-binding-property="description"]', 'new_desc')
						.waitForElementVisible('[data-trigger-property="save"]')
						.click('[data-trigger-property="save"]')
						.waitForElementVisible('[data-index="0"] [data-action="details"]')
						.click('[data-index="0"] [data-action="details"]')
						.waitForElementVisible('[data-binding-property="title"]')
						.assert.containsText('[data-binding-property="title"]', 'new_title')
						.waitForElementVisible('[data-binding-property="description"]')
						.assert.containsText('[data-binding-property="description"]', 'new_desc')
						.back()
						.waitForElementVisible('[data-index="0"] [data-action="delete"]')
						.click('[data-index="0"] [data-action="delete"]')
						.waitForElementVisible('[data-binding-property="title"]')
						.assert.containsText('[data-binding-property="title"]', 'new_title')
						.waitForElementVisible('[data-trigger-property="delete"]')
						.click('[data-trigger-property="delete"]')
						.waitForElementVisible('[data-action="create"]')
						.assert.elementNotPresent('[data-index="0"]')
						.end();
		}
};
