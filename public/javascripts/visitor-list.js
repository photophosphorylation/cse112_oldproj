var socket = io(window.location.origin);
  
socket.on('checkin', function (data) {
console.log(data);

var apptList = document.getElementById('appointment-list');
var appointment = document.createElement("tr");

var visitorField = document.createElement("td");
visitorField.appendChild( document.createTextNode(data.visitor) );
appointment.appendChild(visitorField);

var doctorField = document.createElement("td");
doctorField.appendChild( document.createTextNode(data.doctor) );
appointment.appendChild(doctorField);

var apptTime = document.createElement("td");
apptTime.appendChild( document.createTextNode(data.apptTime) );
appointment.appendChild(apptTime);

var currTime = document.createElement("td");
currTime.appendChild( document.createTextNode(data.currentTime) );
appointment.appendChild(currTime);

var status = document.createElement("td");
status.appendChild( document.createTextNode(data.status) );
appointment.appendChild(status);

apptList.appendChild(appointment);

});

function highlight() {

    var table = document.getElementById('appointment-list');
    for (var i=0;i < table.rows.length;i++){
        table.rows[i].onclick= function () {
            if(!this.hilite){
                unhighlight();
                this.style.backgroundColor='#f5f5f5';
                this.hilite = true;
            }
            else{
                this.style.backgroundColor="white";
                this.hilite = false;
            }
        }
    }
}

function unhighlight(){
 var table = document.getElementById('appointment-list');
 for (var i=0;i < table.rows.length;i++) {
   var row = table.rows[i];
   row.style.backgroundColor="white";
   row.hilite = false;
 }
}

function checkOut(){
    var table = document.getElementById('appointment-list');
    for(var i=0; i<table.rows.length;i++){
        var row = table.rows[i];
        if(row.hilite){
            row.style.backgroundColor="red";
        }
    }
}
function checkIn(){
    var table = document.getElementById('appointment-list');
    for(var i=0; i<table.rows.length;i++){
        var row = table.rows[i];
        if(row.hilite){
            row.style.backgroundColor="green";
        }
    }
}
function reschedule(){
    var table = document.getElementById('appointment-list');
    for(var i=0; i<table.rows.length;i++){
        var row = table.rows[i];
        if(row.hilite){
            row.style.backgroundColor="yellow";
        }
    }
}