### josi-access

[coming soon]

	npm install josi-access

This is a framework for connecting all of your robot's various API's, adapters, and environments. This is where you handle all of your per-application authentication and control. These modules depend heavily on environment variables, and will need to evolve to account for easier management over time.

	- josi-access/
		- node_modules/
			- gitJoSi/
			- node-codebase/
			- node-harvest/
			- node-xero/
		- scripts/
			- codebase.coffee
			- harvest.coffee
			- xero.coffee