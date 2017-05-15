'use strict';

//used for debugging, set debugging to true to view debug statements
function debug(String)
{
  var debugging = true;
  if (debugging)
    {console.log(String)}
}

//MixpanelScript
(function(e,b){if(!b.__SV){var a,f,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=e.createElement("script");a.type="text/javascript";a.async=!0;a.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";f=e.getElementsByTagName("script")[0];f.parentNode.insertBefore(a,f)}})(document,window.mixpanel||[]);
mixpanel.init("8085e4b16fa22b0385a211fa528036a1");

function initializePage() {
  $("button.sign1Btn").click(sign1Click);
  $("button.sign2Btn").click(sign2Click);
  $("button.buyBtn").click(buyClick);
  $("button.tryBtn").click(tryClick);
}

function sign1Click(e) {
  mixpanel.track("Sign Up 1 Clicks");
  debug("SignUp1.");
  //ga("send", "event", "sign1", "click");
    //console.log(ga.getByName('sign1'));
}

function sign2Click(e) {
  mixpanel.track("Sign Up 2 Clicks");
  debug("Sign up 2 pushed.");
  //ga("send", "event", "sign2", "click");
}

function buyClick(e) {
  mixpanel.track("Buy Clicks");
  debug("Buy Now Clicked");
  //console.log("Buy now pushed.");
  //ga("send", "event", "buy", "click");
  //_trackEvent("buyc", "test");
}

function tryClick(e) {
  mixpanel.track("TryItToday Clicks");
  debug("Try It Today pushed.");
  //ga("send", "event", "try", "click");
}

//analytics for page views
// dashboard
//  <script src='/javascripts/analytics.js'></script> 
//  page counter homepage
//        <div><body onload="view('homepage')"></body></div>


  function homeview()
  {
      debug("Home Page Viewed");
      mixpanel.track('Home Page Views', 
      {
          'page name' : document.title,
          'url' : window.location.pathname
      });
  }
  function registerview()
  {
      debug("Register Page Viewed");
      mixpanel.track('Register Page Views', 
      {
          'page name' : document.title,
          'url' : window.location.pathname
      });
  }

  function loginview()
  {
      debug("Login Page Viewed");
      mixpanel.track('Login Page Views', 
      {
          'page name' : document.title,
          'url' : window.location.pathname
      });
  }

//Peter's Dashboard



/*
//250148758589-j9755pn3n5rhrogvjj0tu0r52rrut58m.apps.googleusercontent.com
//google dashboard

(function(w,d,s,g,js,fs){
  g=w.gapi||(w.gapi={});g.analytics={q:[],ready:function(f){this.q.push(f);}};
  js=d.createElement(s);fs=d.getElementsByTagName(s)[0];
  js.src='https://apis.google.com/js/platform.js';
  fs.parentNode.insertBefore(js,fs);js.onload=function(){g.load('analytics');};
}(window,document,'script'));

gapi.analytics.ready(function() {


  gapi.analytics.auth.authorize({
    container: 'embed-api-auth-container',
    clientid: '250148758589-j9755pn3n5rhrogvjj0tu0r52rrut58m.apps.googleusercontent.com'
  });


  var viewSelector = new gapi.analytics.ViewSelector({
    container: 'view-selector-container'
  });

  // Render the view selector to the page.
  viewSelector.execute();



  var dataChart = new gapi.analytics.googleCharts.DataChart({
    query: {
      metrics: 'ga:Pageviews',
      dimensions: 'ga:date',
      'start-date': '10daysAgo',
      'end-date': 'today'
    },
    chart: {
      container: 'chart-container',
      type: 'LINE',
      options: {
        width: '100%'
      }
    }
  });




  viewSelector.on('change', function(ids) {
    dataChart.set({query: {ids: ids}}).execute();
  });
});

//chart 2
gapi.analytics.ready(function() {


  gapi.analytics.auth.authorize({
    container: 'embed-api-auth-container',
    clientid: '250148758589-j9755pn3n5rhrogvjj0tu0r52rrut58m.apps.googleusercontent.com'
  });



  var viewSelector = new gapi.analytics.ViewSelector({
    container: 'view-selector-container'
  });

  // Render the view selector to the page.
  viewSelector.execute();


  var mainChart = new gapi.analytics.googleCharts.DataChart({
    query: {
      'dimensions': 'ga:browser',
      'metrics': 'ga:sessions',
      'sort': '-ga:sessions',
      'max-results': '6'
    },
    chart: {
      type: 'PIE',
      container: 'main-chart-container',
      options: {
        width: '100%'
      }
    }
  });





  var mainChartRowClickListener;


  viewSelector.on('change', function(ids) {
    var options = {query: {ids: ids}};

    // Clean up any event listeners registered on the main chart before
    // rendering a new one.
    if (mainChartRowClickListener) {
      google.visualization.events.removeListener(mainChartRowClickListener);
    }

    mainChart.set(options).execute();
    //breakdownChart.set(options);

    // Only render the breakdown chart if a browser filter has been set.
    //if (breakdownChart.get().query.filters) breakdownChart.execute();
  });



  mainChart.on('success', function(response) {

    var chart = response.chart;
    var dataTable = response.dataTable;

    // Store a reference to this listener so it can be cleaned up later.
    mainChartRowClickListener = google.visualization.events
        .addListener(chart, 'select', function(event) {

      // When you unselect a row, the "select" event still fires
      // but the selection is empty. Ignore that case.
      if (!chart.getSelection().length) return;

      var row =  chart.getSelection()[0].row;
      var browser =  dataTable.getValue(row, 0);
      var options = {
        query: {
          filters: 'ga:browser==' + browser
        },
        chart: {
          options: {
            title: browser
          }
        }
      };

      breakdownChart.set(options).execute();
    });
  });
});

*/