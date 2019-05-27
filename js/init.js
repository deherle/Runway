

window.onload = function() {

    $("#comment-input").on('keyup', function (e) {
        
        if (e.keyCode == 13) {

            var comment = $('#comment-input').val();
            $('#comment-input').val('');
            
            if(comment) {

                var numExistingComments = $('.comment-item').length;

                var commentElement = $('.comment-template').clone();
                $(commentElement).removeClass('comment-template');
                $(commentElement).addClass('comment-item');
                $(commentElement).attr('user-id', gUserClaims['cognito:username']);
                var color = getNextCommentColor(gUserClaims['cognito:username']);
                $(commentElement).attr('comment-color', color);
                var hex = getAgendaTopicColorHex(color);
                $(commentElement).find('.avatar').css('background-color', hex);
                $(commentElement).find('.author').html(gUserClaims.name);
                $(commentElement).find('.comment-icon-letter').html(gUserClaims.name[0].toUpperCase());
                $(commentElement).find('.text').html(comment);
                $(commentElement).find('.date').html(moment().format('LLLL'));
                if(numExistingComments == 0) {
                    $(commentElement).insertAfter('.comment-template');
                } else {
                    $(commentElement).insertAfter('.comment-item:last');
                }

                $(commentElement).transition({
                    animation  : 'fade',
                    duration   : '0.5s',
                    onComplete : function() {
                        $('.comment-item:last').removeClass('transition visible');
                    }
                });

                $('.no-comments').hide();

            }

        }

    });

    onStartupLogic();

    // Initialize tabs
    $('.menu .item').tab();

    // Make agenda topics sortable
    $("#sortable").sortable();

    // Make check list items sortable
    $("#sortable-check").sortable();

    // Init tab dropdown
    $('.ui.dropdown').dropdown();

    // Init modals
    $('.modal-share-meeting-link').modal();
    $('.modal-account').modal();

    // Init popups
    $('.modal-share-meeting-link button').popup();
    $('.delete-meeting-button').popup();
    $('.save-meeting-button').popup();
    $('.meeting-settings-button').popup();
    $('.account-settings-button').popup();

    // Init sidebar
    $('.ui.sidebar').sidebar({
        context: $('.bottom.segment'), dimPage: false, transition: 'overlay'
        })
        //.sidebar('attach events', '.items .menu')
        ;
    $('.ui.sidebar').sidebar('toggle');

    // Init date and time pickers
    $('.meeting-start-date').calendar({type: "date", formatter: {
        date: function (date, settings) {
          let momentDate = new moment(date);
          return momentDate.format('MMM D, YYYY');
        }
      },
        onChange: function (date, text, mode) {
            let momentDate = new moment(date);
            var dateString = momentDate.format('MMM D, YYYY');
            var font = $('.meeting-start-date input').css("font-size") + ' ' + $('.meeting-start-date input').css("font-family");
            var length = getTextWidth(dateString, font) + 'px';
            $('.meeting-start-date input').css("width", length);
            gMeetingStartDate = momentDate;
            $('.meeting-end-date').calendar(
                'set date', date, updateInput = true, fireChange = true
            );
            meetingHasChanged();
        }
    });
    $('.meeting-end-date').calendar({type: "date", formatter: {
        date: function (date, settings) {
          let momentDate = new moment(date);
          return momentDate.format('MMM D, YYYY');
        }
      },
        onChange: function (date, text, mode) {
            let momentDate = new moment(date);
            var dateString = momentDate.format('MMM D, YYYY');
            var font = $('.meeting-end-date input').css("font-size") + ' ' + $('.meeting-end-date input').css("font-family");
            var length = getTextWidth(dateString, font) + 'px';
            $('.meeting-end-date input').css("width", length);
            gMeetingEndDate = momentDate;
            meetingHasChanged();
        }
    });
    $('.meeting-start-time').calendar({type: "time",
        onChange: function (date, text, mode) {
        let momentDate = new moment(date);
        var dateString = momentDate.format('h:mm A');
        var font = $('.meeting-start-time input').css("font-size") + ' ' + $('.meeting-start-time input').css("font-family");
        var length = getTextWidth(dateString, font) + 'px';
        $('.meeting-start-time input').css("width", length);
        gMeetingStartTime = momentDate;
        $('.meeting-end-time').calendar(
            'set date', momentDate.add(1, "hours").toDate(), updateInput = true, fireChange = true
        );
        meetingHasChanged();
        }
    });
    $('.meeting-end-time').calendar({type: "time",
        onChange: function (date, text, mode) {
        let momentDate = new moment(date);
        var dateString = momentDate.format('h:mm A');
        var font = $('.meeting-end-time input').css("font-size") + ' ' + $('.meeting-end-time input').css("font-family");
        var length = getTextWidth(dateString, font) + 'px';
        $('.meeting-end-time input').css("width", length);
        gMeetingEndTime = momentDate;
        meetingHasChanged();
        }
    });

    // Bind keyup event handlers to meeting title, location and attendee inputs
    $('#meeting-title-input').keyup(function() {
        meetingHasChanged();
    });
    $('.meeting-location input').keyup(function() {
        meetingHasChanged();
    });
    $('.meeting-attendees input').keyup(function() {
        meetingHasChanged();
    });

    // Add event handler for checklist items to add text strikethrough
    $('#checkbox-item').change(onChecklistItemCheckboxChange);

    // Initialize checklist progress bar
    updateChecklistProgressBar();

    newMeeting();

    loadSidebar();

    $('#meeting-loader').removeClass('active');

}


function toggleSidebar() {
    $('.ui.sidebar').sidebar('toggle');
}

function onStartupLogic() {

    // Accomodate the following cases:
    // 1. Unauthenticated user with valid meeting id in url
    // 2. Authenticated user with valid meeting id in url
    // 3. Unauthenticated user with no valid parameters in url
    // 4. Unauthenticated or authenticated user with invalid meeting id in URL
    // 5. Authenticated user with no id in url, and a meeting id in local storage
    // 6. Authenticated user with no id in url, no meeting id in local storage, and saved meetings
    // 7. Authenticated user with no id in url, no meeting id in local storage, no saved meetings

    var meetingID = getUrlParameterByName('id', window.location.href);

    if(meetingID == null) {

        var poolData = {
            UserPoolId : 'us-east-1_sGM3cf79D',
            ClientId : '6ls106hn6p6cci7e2b6hch5coa',
            Storage: new AmazonCognitoIdentity.CookieStorage({secure: false, domain: 'gorunway.co'})
        };
    
        var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        var cognitoUser = userPool.getCurrentUser();
    
        if (cognitoUser != null) {
            cognitoUser.getSession(function(err, session) {

                if (err) {
                    // TODO - handle this error more gracefully?
                    console.log(err);
                }
                if(session.isValid()) {

                    gUserClaims = parseJwt(session.idToken.jwtToken); // parse the JWT token to deserialize the Cognito User/Runway account object.

                    // Add the User's Id Token to the Cognito credentials login map.
                    AWS.config.region = 'us-east-1';
                    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                        IdentityPoolId: 'us-east-1:b5a6850c-e5cf-436b-8aed-ebe2c01ec68d',
                        Logins: {
                            'cognito-idp.us-east-1.amazonaws.com/us-east-1_sGM3cf79D': session.getIdToken().getJwtToken()
                        }
                    });

                    AWS.config.credentials.get(function(err){
                        if (err) {
                            console.log(err);
                        }
                    });

                    var lastMeetingID = localStorage.getItem('runway_last_meeting_id');

                    if(lastMeetingID) {
                    
                        // Try and retrieve the last meeting the user was viewing...
                        $.ajax({
                            method: 'GET',
                            url: 'https://api.gorunway.co/meeting?id=' + lastMeetingID,
                            contentType: "application/json",
                            headers: {
                                "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                                "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
                            }, 
                            success: function(data) {
                                renderMeeting(data.Item);
                                $('#meeting-loader').removeClass('active');       
                            },
                            error: function(data) {
                                console.log(data);
                                $('#meeting-loader').removeClass('active');
                            }
                        });
                        
                    } else {

                        // Load sidebar and  display latest meeting, if any exists

                    }

                } else {

                    // Have user login
                    if(location.hostname == 'localhost' || location.hostname == '') {
                        window.location.replace('file:///C:/meet/web/signin.html');
                    } else {
                        //window.location.replace('https://www.gorunway.co/signin.html');
                    }

                }
                
            });

        } else {

            // Have user login
            if(location.hostname == 'localhost' || location.hostname == '') {
                window.location.replace('file:///C:/meet/web/signin.html');
            } else {
                //window.location.replace('https://www.gorunway.co/signin.html');
            }
            
        }

    } else {

        var poolData = {
            UserPoolId : 'us-east-1_sGM3cf79D',
            ClientId : '6ls106hn6p6cci7e2b6hch5coa',
            Storage: new CookieStorage({secure: false, domain: 'gorunway.co'})
        };
    
        var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        var cognitoUser = userPool.getCurrentUser();
    
        if (cognitoUser != null) {
            cognitoUser.getSession(function(err, session) {

                if (err) {
                    // TODO - handle this error more gracefully?
                    console.log(err);
                }

                if(!session.isValid()) {
                    // Disable and hide other UI controls
                    $('.ui.top.menu').css('opacity', '0');
                    disableUnauthenticatedUserControls();
                } 

                $.ajax({
                    method: 'GET',
                    url: 'https://api.gorunway.co/meeting?id=' + meetingID,
                    contentType: "application/json",
                    headers: {
                        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                        "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
                      }, 
                    success: function(data) {
                        renderMeeting(data.Item);
                        localStorage.setItem('runway_last_meeting_id', meetingID);
                        $('#meeting-loader').removeClass('active');       
                    },
                    error: function(data) {
                        console.log(data);
                        $('#meeting-loader').removeClass('active');
                    }
                });

            });

        } else {

            // TODO: We need to show a login button to authenticate...
            //

            // Disable and hide other UI controls
            $('.ui.top.menu').css('opacity', '0');
            disableUnauthenticatedUserControls();

            $.ajax({
                method: 'GET',
                url: 'https://api.gorunway.co/meeting?id=' + meetingID,
                contentType: "application/json",
                headers: {
                    "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
                  }, 
                success: function(data) {
                    renderMeeting(data.Item);
                    localStorage.setItem('runway_last_meeting_id', meetingID);
                    $('#meeting-loader').removeClass('active');       
                },
                error: function(data) {
                    console.log(data);
                    $('#meeting-loader').removeClass('active');
                }
            });

        }

    }

        


}

