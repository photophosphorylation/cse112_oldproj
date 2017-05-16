# web-app [![Code Climate](https://codeclimate.com/github/photophosphorylation/cse112_oldproj/badges/gpa.svg)](https://codeclimate.com/github/photophosphorylation/cse112_oldproj)

# web-app [![Test Coverage](https://codeclimate.com/github/photophosphorylation/cse112_oldproj/badges/coverage.svg)](https://codeclimate.com/github/photophosphorylation/cse112_oldproj/coverage)

First Run
----------------------------
1. Setup Account with [mLab](https://mlab.com/)
2. Copy mongoDB access point into app.js:

        $ var mongoURI = process.env.MONGOLAB_URI || 'YOUR MONGODB CONNECTION ON mLAB';
        
2. Install [Node.js](http://nodejs.org/download/)
3. Navigate to the root directory
4. Install npm dependencies:

        $ npm install
        $ npm install --global gulp

6. Use ``gulp`` to run the application
7. Navigate your browser to [http://localhost:4000](http://localhost:4000/)

Push to testing environment
----------------------------
1. Simply push your experimental changes to the ``develop`` branch.
2. Changes may be view on the [staging site](http://fubar-staging.herokuapp.com/).

Logging in as Peter
----------------------------
In order to login as peter, use the following credentials

	username: peter@enque.com
	password: peter
	
The live app can be found [here](http://team-fubar.herokuapp.com/).
	
Slack Integration can be found here

	team-fubar.slack.com
	
	username: gev@ucsd.edu
	password: teamfubar

Access to CI platform on Codeship
----------------------------
Go to the [Codeship](http://codeship.io) website.
Use the following credentials:

	username: gev@ucsd.edu
	password: teamfubar

Click the restart button on the latest build to rebuild it.
