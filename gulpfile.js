// gulpfile.js
var gulp = require('gulp');
var child_process = require('child_process');
var server = require('gulp-express');
var browserSync = require('browser-sync');
var mongobackup = require('mongobackup');

var plugins= require('gulp-load-plugins')({
	pattern: ['gulp-*', 'gulp.*', 'check-*', 
	'jasmine-*', 'mongobackup', , 'yargs'],
	scope: ['dependencies', 'devDependencies'],
	lazy: false

});

var exec = require('child_process').exec;

function execute(command, callback) {
    exec(command, function(error, stdout, stderr){callback(stdout);});
}
gulp.task('clean', function () {
  return gulp.src('build', {read: false})
    .pipe(plugins.clean());
});

gulp.task('lint', function() {
  return gulp.src('./*.js')
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});

gulp.task('vendor', function() {
  return gulp.src('./public/javascripts/*.js')
    .pipe(plugins.concat('vendor.js'))
    .pipe(gulp.dest('./public/javascripts/'))
    .pipe(plugins.uglify())
    .pipe(plugins.rename('vendor.min.js'))
    .pipe(gulp.dest('./public/javascripts/'))
    .on('error', plugins.util.log);
});

gulp.task('build-concat', ['vendor'], function() {
  return gulp.src('./public/stylesheets/*.css')
	.pipe(plugins.minifyCss({keepBreaks:false}))
    	.pipe(plugins.rename('style.min.css'))
    	.pipe(gulp.dest('./build/concat/stylesheets/'));
	});

gulp.task('compress', function() {
  gulp.src('./public/javascripts/*.js')
    .pipe(plugins.uglify())
    .pipe(plugins.rename(function (path) {
        path.basename += ".min";
    }))
    .pipe(gulp.dest('./build/js'));
});

gulp.task('build', ['compress'], function() {
  return gulp.src('./public/stylesheets/*.css')
    .pipe(plugins.minifyCss({keepBreaks:false}))
    .pipe(plugins.rename(function (path) {
        path.basename += ".min";
    }))
    .pipe(gulp.dest('./build/css'));

    //.pipe(minifyCSS({keepBreaks:false}))
});

gulp.task('nodemon', ['lint'], function (cb) {
  var called = false;
  return plugins.nodemon({

    // nodemon our expressjs server
     script: 'bin/www',
    // script: '/Users/Seiji/Desktop/team2/bin/www',
    // watch core server file(s) that require server restart on change
    watch: ['./routes/'],

    ext: 'html js',
    env: { 'NODE_ENV': 'development' }
  })
    .on('start', function onStart() {
      // ensure start only got called once
      if (!called) { cb(); }
      called = true;
    })
    .on('restart', function onRestart() {
      browserSync.reload({
        stream: true
      });
    });
});
gulp.task('browser-sync', ['nodemon'/*, 'mongostart', 'watch-check'*/], function () {

  // for more browser-sync config options: http://www.browsersync.io/docs/options/
  browserSync.init({

    // watch the following files; changes will be injected (css & images) or cause browser to refresh
    files: ['public/**/*.*', 'views/**/*.*', 'public/javascripts/*.js'],

    // informs browser-sync to proxy our expressjs app which would run at the following location
    proxy: 'http://localhost:3000',

    // informs browser-sync to use the following port for the proxied app
    // notice that the default port is 3000, which would clash with our expressjs
    port: 4000,

    //Change whether browser will auto open
    open: true,

    // open the proxied app in chrome
    //browser: ['google chrome']
  });
});

// mongodump - dump all databases on localhost
gulp.task('mongodump', function() {
  mongobackup.dump({
    host : 'localhost',
    out : './dumps/mongo'
  });
});

// mongorestore - restore database to localhost
gulp.task('mongorestore', function() {
  mongobackup.restore({
    host : 'localhost',
    drop : true,
    path : './dumps/mongo'
  });
});



gulp.task('default', ['browser-sync']);


// prerequisites - must have heroku command line tools installed
//               - must be authenticated with heroku
//               - must have git installed and be in application root directory
//               - must be authenticated with git so that password does not have to be entered on push
gulp.task('stage', ['test'], function(){ 
    execute('git symbolic-ref --short HEAD', function(br){
        console.log('deploying current branch: ' + br);
        var timer; 
        return gulp.src('')
                .pipe(plugins.shell([
                    '<%= setKillTimer() %>',
                    'heroku git:remote -a robobetty-test<%= getArg()%> -r test<%= getArg() %>',
                    '<%= clearKillTimer() %>',
                    'git push -f test<%= getArg() %> <%= determineBranch() %>'
                ], {
                    templateData: {
                        determineBranch: function() {
                            var n_remote = br.trim() + ':master';
                            return n_remote;
                        },
                        getArg: function() {
                            var n = plugins.yargs.test;
                            if (n === null) {
                                n = "1";
                            }
                            return n;
                        },
                        setKillTimer: function() {
                            timer = setTimeout(function(){
                            console.error('ERROR: Wasn\'t able to deploy server.  Are you logged in? Please run "heroku login" and authenticate with Git.');
                            process.exit(1);
                            }, 5000);
                            return "";
                        },
                        clearKillTimer: function() {
                            clearTimeout(timer);
                            return "";
                        }
                    }
                }));
    }); 
});

// check pages on local
gulp.task('checkLocal', ['lint'], function(callback) {

  var options = {
    pageUrls: [
      'http://localhost:4000/',
      'http://localhost:4000/register',
      'http://localhost:4000/login'
    ],
    checkLinks: true,
    onlySameDomain: true,
    queryHashes: true,
    noRedirects: true,
    noLocalLinks: true,
    linksToIgnore: [
      // 'http://localhost:4000/ignore.html'
    ],
    checkXhtml: true,
    checkCaching: true,
    checkCompression: true,
    maxResponseTime: 200,
    summary: true
  };

  callback = function() {
    console.log('Done checking local.');
  };

  plugins.checkPages(console, options, callback);
});

// check pages on development
gulp.task('checkDev', ['lint'], function(callback) {
  var options = {
    pageUrls: [
      'http://robobetty-dev.herokuapp.com/',
      'http://robobetty-dev.herokuapp.com/register',
      'http://robobetty-dev.herokuapp.com/login'
    ],
    checkLinks: true,
    maxResponseTime: 500,
    summary: true
  };

  callback = function() {
    console.log('Done checking development.');
  };

  plugins.checkPages(console, options, callback);
});

// check pages on production
gulp.task('checkProd', function(callback) {
  var options = {
    pageUrls: [
      'http://robobetty.com/',
      'http://robobetty.com/register',
      'http://robobetty.com/login'
    ],
    checkLinks: true,
    maxResponseTime: 500,
    summary: true
  };

  callback = function() {
    console.log('Done checking production.');
  };

plugins.checkPages(console, options, callback);

});

// Generate API Doc
var gulp = require('gulp'),
    apidoc = require('gulp-apidoc');

gulp.task('apidoc', function(){
          plugins.apidoc.exec({
            src: "routes/api",
            dest: "apidoc/"
          });
});

// Deploy API Docs to gh pages
var deploy = require('gulp-gh-pages');

gulp.task('deploy-gh', function () {
   	var currentdate = new Date();    
	/*var timeString = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();*/
    var options = {
        message :  "Update API Doc --skip-ci"
    };
    return gulp.src('./apidoc/**/*')
        .pipe(plugins.deploy(options));
});

var open = require('gulp-open');

// Open API Docs
gulp.task('apidoc-url', function(){
  var options = {
    url: 'http://cse112-goldteam.github.io/web-app/'
  };
  return gulp.src('./README.md')
  .pipe(plugins.open('', options));
});
gulp.task('doc-deploy', ['apidoc','deploy-gh','apidoc-url']);
