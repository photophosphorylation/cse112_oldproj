# web-app [![Code Climate](https://codeclimate.com/github/photophosphorylation/cse112_oldproj/badges/gpa.svg)](https://codeclimate.com/github/photophosphorylation/cse112_oldproj) [![Test Coverage](https://codeclimate.com/github/photophosphorylation/cse112_oldproj/badges/coverage.svg)](https://codeclimate.com/github/photophosphorylation/cse112_oldproj/coverage) [![Issue Count](https://codeclimate.com/github/photophosphorylation/cse112_oldproj/badges/issue_count.svg)](https://codeclimate.com/github/photophosphorylation/cse112_oldproj)

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
