$(document).ready(function () {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyCIy6pWG7T8NpdQ216WsSIxnrlfhwxHiQ4",
        authDomain: "trainschedule-9f8d2.firebaseapp.com",
        databaseURL: "https://trainschedule-9f8d2.firebaseio.com",
        projectId: "trainschedule-9f8d2",
        storageBucket: "trainschedule-9f8d2.appspot.com",
        messagingSenderId: "584367220454"
    };

    firebase.initializeApp(config);

    var database = firebase.database();

    function currentTime() {
        var current = moment().format('hh:mm');
        $('#currentTime').html(current);
        setTimeout(currentTime, 1000);
    };

    $('.form-field').on('keyup', function () {
        var trainTemp = $('#train-name').val().trim();
        var cityTemp = $('#destination').val().trim();
        var timeTemp = $('#first-train').val().trim();
        var freqTemp = $('#frequency').val().trim();

        sessionStorage.setItem('train', trainTemp);
        sessionStorage.setItem('city', cityTemp);
        sessionStorage.setItem('time', timeTemp);
        sessionStorage.setItem('freq', freqTemp);
    });

    $("#train-name").val(sessionStorage.getItem("train"));
    $("#destination").val(sessionStorage.getItem("city"));
    $("#first-train").val(sessionStorage.getItem("time"));
    $("#frequency").val(sessionStorage.getItem("freq"));

    $("#submit").on("click", function (event) {
        event.preventDefault();

        var trainName = $("#train-name").val().trim();
        var destination = $("#destination").val().trim();
        var startTime = $("#first-train").val().trim();
        var frequency = $("#frequency").val().trim();

        if (trainName === "" ||
            destination === "" ||
            startTime === "" ||
            frequency === "") {

            $('#missingDataModal').modal();

        } else {

            $(".form-field").val("");

            database.ref().push({
                trainName: trainName,
                destination: destination,
                frequency: frequency,
                startTime: startTime,
                dateAdded: firebase.database.ServerValue.TIMESTAMP
            });

            sessionStorage.clear();
        }

    });

    database.ref().on("child_added", function (childSnapshot) {
        var startTimeConverted = moment(childSnapshot.val().startTime, "hh:mm").subtract(1, "years");
        var timeDiff = moment().diff(moment(startTimeConverted), "minutes");
        var timeRemain = timeDiff % childSnapshot.val().frequency;
        var minToArrival = childSnapshot.val().frequency - timeRemain;
        var nextTrain = moment().add(minToArrival, "minutes");
        var key = childSnapshot.key;

        var newrow = $("<tr>");
        newrow.append($("<td>" + childSnapshot.val().trainName + "</td>"));
        newrow.append($("<td>" + childSnapshot.val().destination + "</td>"));
        newrow.append($("<td class='text-center'>" + childSnapshot.val().frequency + "</td>"));
        newrow.append($("<td class='text-center'>" + moment(nextTrain).format("LT") + "</td>"));
        newrow.append($("<td class='text-center'>" + minToArrival + "</td>"));
        newrow.append($("<td class='text-center'><button class='arrival btn btn-danger btn-xs' data-key='" + key + "'>X</button></td>"));

        if (minToArrival < 6) {
            newrow.addClass("info");
        }

        $("#train-table-rows").append(newrow);

    });

    $(document).on("click", ".arrival", function () {
        keyref = $(this).attr("data-key");
        database.ref().child(keyref).remove();
        window.location.reload();
    });

    currentTime();

    setInterval(function () {
        window.location.reload();
    }, 60000);


    // //----------------------------------------------------------------
    //     // Assumptions
    //     var tFrequency = 3;

    //     // Time is 3:30 AM
    //     var firstTime = "03:30";

    //     // First Time (pushed back 1 year to make sure it comes before current time)
    //     var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
    //     console.log(firstTimeConverted);

    //     // Current Time
    //     var currentTime = moment();
    //     console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

    //     // Difference between the times
    //     var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    //     console.log("DIFFERENCE IN TIME: " + diffTime);

    //     // Time apart (remainder)
    //     var tRemainder = diffTime % tFrequency;
    //     console.log(tRemainder);

    //     // Minute Until Train
    //     var tMinutesTillTrain = tFrequency - tRemainder;
    //     console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

    //     // Next Train
    //     var nextTrain = moment().add(tMinutesTillTrain, "minutes");
    //     console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));

});