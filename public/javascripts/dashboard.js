var resp;
var missedData = []
function dateToString( date ) {
    var monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December' ];
    var month = date.getMonth() ;
    var day = date.getDate();
    var dateOfString = (('' + month).length < 2 ? '' : '') +  monthNames[month] + ' ';
    dateOfString += (('' + day).length < 2 ? '0' : '') + day + ' ';
    dateOfString += date.getFullYear();
    return dateOfString;
}

function getData(callback) {
    var http = new XMLHttpRequest();
    url = '/pullData';
		http.onload = function() {
    	if (http.readyState == 4){
      	if (typeof callback == "function"){
					var missedData = [];
					var missed = 0;
					var onTime = 0

          resp = callback.apply(http);
					for (var i = 0; i <resp.length; i++) {
						if(resp[i].missed == false) {
							onTime += 1;
						}
						else {
							missed += 1;
						}
					}
					missedData.push(onTime);
					missedData.push(missed);

					// appts missed
					data = {
        		datasets: [{
            data: missedData,
            backgroundColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)' ]
        	}],
            labels: [ 'On Time', 'Missed']
        	};
        	var chart1 = new Chart(document.getElementById("chart1"), {
            type: 'doughnut',
            data: data,
            options: {
              	title: {
                  display: true,
                  text: 'Appointments Missed/On Time'
              	}
            	}
        	});

					var twenty = 0;
					var forty = 0;
					var sixty = 0;
					var eighty = 0;
					var oneHundred = 0;
					var ages = [];

					for (var i = 0; i <resp.length; i++) {
						var age = parseInt(resp[i].customerAge);
						if(age < 21) {
							twenty += 1;
						}
						else if (age < 41){
							forty += 1;
						}
						else if (age < 61){
							sixty += 1;
						}
						else if(age < 81){
							eighty += 1;
						}
						else {
							oneHundred += 1;
						}
					}

					ages.push(twenty);
					ages.push(forty);
					ages.push(sixty);
					ages.push(eighty);
					ages.push(oneHundred);

					// age range
					data = {
						datasets: [{
								data: ages,
								backgroundColor: [
									'rgb(255, 206, 86)',
									'rgb(75, 192, 192)',
									'rgb(153, 102, 255)',
									'rgb(255, 159, 64)'],
						}],
						labels: [ '0-20', '21-40', '41-60', '61-80', '81-100']
						};
						var chart1 = new Chart(document.getElementById("chart3"), {
								type: 'pie',
								data: data,
								options: {
									title: {
											display: true,
											text: 'Age of Customers'
									}
								}
						});
          return resp;
        }
      }
      else {
      	console.log(http.statusText);
      }
  }; // end of onload()
  http.open("GET", url, true);
  http.send();
} // end of function

function cb() {
    resp = JSON.parse(this.responseText);
    return resp;
}

function getDate(){
    var currentdate = new Date();
    var datetime= '';
    datetime += dateToString(currentdate );
    var header = $('<span/>');
    header.append(datetime);
    $('#currentDate').replaceWith(header);
}

function startTime() {
  var today = new Date();
  var h     = today.getHours();
  var m     = today.getMinutes();
  var s     = today.getSeconds();
  var dn    = 'AM';
    if( h > 12 ) {
        dn = 'PM';
        h  = h-12;
    }
  m = checkTime(m);
  s = checkTime(s);
  $('#txt').html(h+':'+m+':'+s+ ' '+ dn);
  setTimeout(function(){startTime();},500);
}
function checkTime( i ) {
    if( i < 10 ) { i = '0' + i; }  // add zero in front of numbers < 10
    return i;
}
//function to get the appointment's time in a formatted string
function getAppDate( date ){
  var appDate = new Date(date);
  //parsing to get time
  var fhours = appDate.getHours();
  var appTime;
  if(fhours/12 < 1){
    var hours = ('0'+appDate.getHours()).slice(-2); //returns 0-
    var minutes = ('0'+appDate.getMinutes()).slice(-2); //returns 0-59
    appTime = hours+':'+minutes + ' AM';
  }
  else{
    var pmHours = appDate.getHours()%12;
    if(pmHours === 0) {
       pmHours = 12;
    }
    var hoursPM = ('0'+pmHours).slice(-2); //returns 0-
    var minutesPM = ('0'+appDate.getMinutes()).slice(-2); //returns 0-59
    appTime = hoursPM+':'+minutesPM + ' PM';
  }
  return appTime;
}
$(document).ready(function() {
  getDate();
    // addTasks();
    // function addTasks() {
    //  appointments.forEach(function callback(currentValue, index, array) {
    //      task ="<div class='task-container'><div class='task-header col-md-3'>" +
    //                currentValue.apptTime +
  //            "</div><div class='task col-md-9'>"
    //                currentValue.visitor + " " + currentValue.checkedIn;
  //            "</div></div>"
    //      $("#tasks").append(task);
    //  });
    // }
    Chart.defaults.global.legend.position = "bottom";
			addMissedVsOnTime();
    function addMissedVsOnTime() {
        getData(cb);
    }
    addCalendar();
    function addCalendar() {
        $('#calendar').fullCalendar({
            header: {
                    left: '',
                    center: 'prev title next',
                    right: ''
            }
        })
    }
    addNumUsers();
    function addNumUsers() {
      data = {
        datasets: [{
            label: "Appointments",
            data: [30, 50, 40, 60, 63, 70, 60, 65, 80, 66, 77],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(255,99,132,1)',
            borderWidth: 3
            }],
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'December']
        };
      var myLineChart = new Chart(document.getElementById("chart2"), {
        type: 'line',
        data: data,
        options: {
            title: {
                display: true,
                text: 'Number of Users Online Per Month'
            }
        }
      });
    }
    // addTypeOfAppointment();
    // function addTypeOfAppointment() {
    //   data = {
    //     datasets: [{
    //         data: [54, 22, 11, 5],
    //         backgroundColor: [
    //           'rgba(255, 99, 132, 0.2)',
    //           'rgba(54, 162, 235, 0.2)',
    //           'rgba(255, 206, 86, 0.2)',
    //           'rgba(75, 192, 192, 0.2)',
    //           'rgba(255, 159, 64, 0.2)'],
    //         borderColor: [
    //           'rgba(255, 99, 132, 0.2)',
    //           'rgba(54, 162, 235, 0.2)',
    //           'rgba(255, 206, 86, 0.2)',
    //           'rgba(75, 192, 192, 0.2)',
    //           'rgba(255, 159, 64, 1)'
    //         ]
    //     }],
    //     labels: ['Recruiting', 'Press', 'Logistics', 'Personal']
    //     };
    //     var chart1 = new Chart(document.getElementById("chart4"), {
    //         type: 'pie',
    //         data: data,
    //         options: {
    //           title: {
    //               display: true,
    //               text: 'Reason for Appointment'
    //           }
    //         }
    //     });
    // }
    // addRating();
    // function addRating() {
    //   data = {
    //     datasets: [{
    //         data: [10, 30, 42, 50, 40],
    //         backgroundColor: [
    //           'rgba(255, 99, 132, 0.2)',
    //           'rgba(54, 162, 235, 0.2)',
    //           'rgba(255, 206, 86, 0.2)',
    //           'rgba(75, 192, 192, 0.2)',
    //           'rgba(255, 159, 64, 0.2)'],
    //         borderColor: [
    //           'rgba(255, 99, 132, 0.2)',
    //           'rgba(54, 162, 235, 0.2)',
    //           'rgba(255, 206, 86, 0.2)',
    //           'rgba(75, 192, 192, 0.2)',
    //           'rgba(255, 159, 64, 1)'
    //         ]
    //     }],
    //     labels: [ '1', '2', '3', '4', '5']
    //     };
    //     var chart1 = new Chart(document.getElementById("chart5"), {
    //         type: 'pie',
    //         data: data,
    //         options: {
    //           title: {
    //               display: true,
    //               text: 'Ratings received in feedback'
    //           }
    //         }
    //     });
    // }
    addTypeOfMessagingUsed();
    function addTypeOfMessagingUsed() {
      data = {
        datasets: [{
            data: [20, 10, 40, 20],
            backgroundColor: [
              'rgb(255, 206, 86)',
              'rgb(75, 192, 192)',
              'rgb(153, 102, 255)',
              'rgb(255, 159, 64)'],
        }],
        labels: [ 'SMS', 'Email', 'Phone', 'Messenger']
        };
        var chart1 = new Chart(document.getElementById("chart3"), {
            type: 'pie',
            data: data,
            options: {
              title: {
                  display: true,
                  text: 'Method of Communication'
              }
            }
        });
    }
	});
