const e2ePort = process.env['E2E_HTTP_PORT']
const cmdSuffix = process.platform === 'win32' ? '.cmd' : '';

module.exports = {
  "src_folders" : ["build/e2e"],
  "output_folder" : "reports",
  "custom_commands_path" : "",
  "custom_assertions_path" : "",
  "page_objects_path" : "",
  "globals_path" : "",

  "selenium" : {
    "start_process" : true,
    "server_path" : ".\\node_modules\\selenium-server\\lib\\runner\\selenium-server-standalone-3.9.1.jar",
    "log_path" : "",
    "port" : 4466,
    "cli_args" : {
      "webdriver.chrome.driver" : ".\\node_modules\\.bin\\chromedriver" + cmdSuffix
      ,"webdriver.gecko.driver" : ".\\node_modules\\.bin\\geckodriver" + cmdSuffix
      ,"webdriver.edge.driver" : ".\\node_modules\\.bin\\edgedriver" + cmdSuffix
    }
  },

  "test_settings" : {
    "default" : {
      "launch_url" : "http://localhost",
      "selenium_port"  : 4466,
      "selenium_host"  : "localhost",
      "silent": true,
      "screenshots" : {
        "enabled" : false,
        "path" : ""
      },
      "globals": {
	  },
      "desiredCapabilities": {
		"browserName": "chrome",
        "marionette": true
      }
    },

    "chrome" : {
      "desiredCapabilities": {
        "browserName": "chrome"
      }
    },

    "edge" : {
      "desiredCapabilities": {
        "browserName": "MicrosoftEdge"
      }
    }
  }
};
