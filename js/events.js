
var uploadRequestStore = {};

function onPlusButtonClick(element) {
    var input = $(element).siblings('#duration');
    var duration = parseInt(input.val());
    if(duration >= 5) {
        input.val(duration + 5);
    } else {
        input.val(duration + 1);
    }

    meetingHasChanged();
}

function onMinusButtonClick(element) {
    var input = $(element).siblings('#duration');
    var duration = parseInt(input.val());
    if(duration > 5) {
        input.val(duration - 5);
    } else if( duration == 0) {
    } 
    else {
        input.val(duration - 1);
    }

    meetingHasChanged();
}

function onDeleteTopicButtonClick(element) {

    if(numberOfAgendaTopics() == 1) {
        $(element).closest('.sortable-agenda-topic').transition('shake');
    } else {
        $(element).closest('.sortable-agenda-topic').remove();
    }    

    meetingHasChanged();

}

function onAddTopicButtonClick() {
    
    var agendaTopic = $('.sortable-agenda-topic:last').clone();

    var color = getNextAgendaTopicColor();

    $(agendaTopic).css('display', 'none');
    $(agendaTopic).find('#duration').val('5');
    $(agendaTopic).find('.topic-title>input').val('');
    $(agendaTopic).find('.agenda-topic').attr('topic-color', color.Color);
    $(agendaTopic).attr('id', '');
    
    $(agendaTopic).insertAfter('.sortable-agenda-topic:last');

    $(agendaTopic).find('.agenda-topic').css('border-left-color', color.Hex);

    $(agendaTopic).transition({
        animation  : 'fade',
        duration   : '0.5s',
        onComplete : function() {
            $('.sortable-agenda-topic:last').removeClass('transition visible');
        }
      });

    meetingHasChanged();
}

function onNewMeetingButtonClick() {

    newMeeting();

}

function onSaveMeetingButtonClick() {

    var meeting = serializeMeeting();
    var method = '';

    $('#meeting-loader').addClass('active');

    if(gMeetingID == '') {
        method = 'POST';
    } else {
        method = 'PUT';
    }

    var apigClient = apigClientFactory.newClient({
        accessKey: AWS.config.credentials.accessKeyId,
        secretKey: AWS.config.credentials.secretAccessKey,
        sessionToken: AWS.config.credentials.sessionToken
    });
    
    var params = {
        // This is where any modeled request parameters should be added.
        // The key is the parameter name, as it is defined in the API in API Gateway.
    };
    
    var body = meeting;
    
    var additionalParams = {
        // If there are any unmodeled query parameters or headers that must be
        //   sent with the request, add them here.
        headers: {
            'Content-Type': 'application/json'
        },
        queryParams: {}
    };

    AWS.config.credentials.refresh((error) => {
        if (error) {
            console.log(error);
            if(location.hostname == 'localhost' || location.hostname == '') {
                window.location.replace('file:///C:/meet/web/signin.html');
            } else {
                window.location.replace('https://www.gorunway.co/signin.html?retUrl=https://www.gorunway.co/meeting?id=' + gMeetingID);
            }
        } else {
            if(method == 'POST') {
                apigClient.meetingPost(params, body, additionalParams)
                .then(function(result) {
                    gMeetingID = result.MeetingID;
                    gMeetingCreated = result.Created;
                    $('#sidebar-loader').addClass('active');
                    clearSidebar();
                    loadSidebar();
                    $('.meeting-details .icon .save').removeClass('Orange');
                    $('#meeting-loader').removeClass('active');   
                }).catch(function(err) {
                    console.log(err);
                    $('#meeting-loader').removeClass('active');
                });
            } else {
                apigClient.meetingPut(params, body, additionalParams)
                .then(function(result) {
                    $('.meeting-details .icon .save').removeClass('Orange');
                    $('#meeting-loader').removeClass('active');   
                }).catch(function(err) {
                    console.log(err);
                    if(err.message == 'The security token included in the request is expired') {
        
                    }
                    $('#meeting-loader').removeClass('active');
                });
            }
        }
    });
    
    /* $.ajax({
        method: method,
        url: 'https://api.gorunway.co/meeting',
        data: meeting,
        contentType: "application/json",
        headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
          }, 
        success: function(data) {
            if(method == 'POST') {
                gMeetingID = data.MeetingID;
                gMeetingCreated = data.Created;
                $('#sidebar-loader').addClass('active');
                clearSidebar();
                loadSidebar();
            }
            $('.meeting-details .icon .save').removeClass('Orange');
            $('#meeting-loader').removeClass('active');       
        },
        error: function(data) {
            console.log(data);
            $('#meeting-loader').removeClass('active');
        }
    }); */

}

function onMeetingCardClick(element) {

    $('.sidebar .ui.card').removeClass('yellow');
    $(element).addClass('yellow');
    
    var meetingID = $(element).attr('meeting-id');

    $('#meeting-loader').addClass('active');

    $('.paper').removeClass('hidden');
    $('.desktop-icon').addClass('hidden');

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

function onAddChecklistItemButtonClick() {

    var checkItem = $('.sortable-checklist-item:last').clone();

    $(checkItem).css('display', 'none');
    $(checkItem).find('#checkbox-item').prop('checked', false);
    $(checkItem).find('#checkbox-input').css('text-decoration', 'none');
    $(checkItem).find('#checkbox-input').val('');

    $(checkItem).change(onChecklistItemCheckboxChange);

    $(checkItem).insertAfter('.sortable-checklist-item:last');

    $(checkItem).transition({
        animation  : 'fade',
        duration   : '0.5s',
        onComplete : function() {
            $('.sortable-checklist-item:last').removeClass('transition visible');
        }
      });

    meetingHasChanged();

    updateChecklistProgressBar();

}

function onDeleteCheckItemButtonClick(element) {

    if( numberOfChecklistItems() == 1 ) {
        $(element).parents('.sortable-checklist-item').find('#checkbox-item').prop('checked', false);
        $(element).parents('.sortable-checklist-item').find('#checkbox-input').css('text-decoration', 'none');
        $(element).parents('.sortable-checklist-item').find('#checkbox-input').val('');
    } else {
        $(element).parents('.sortable-checklist-item').remove();
    }

    updateChecklistProgressBar();

}

function onChecklistItemCheckboxChange() {
    if($(this).find('#checkbox-item').is(':checked')) {
        $(this).find('#checkbox-input').css('text-decoration', 'line-through');
    } else {
        $(this).find('#checkbox-input').css('text-decoration', 'none');
    }
    
    updateChecklistProgressBar();
}

function onFileUploadClick(files) {

    if(files.length > 5) {
        showInvalidUploadModal();
        return;
    }

    for(var i = 0 ; i < files.length ; i++) {
        if(files[i].size > 20000000) {
            showInvalidUploadModal();
            return;
        }
    }

    AWS.config.credentials.refresh((error) => {
        if (error) {
            if(location.hostname == 'localhost' || location.hostname == '') {
                window.location.replace('file:///C:/meet/web/signin.html');
            } else {
                window.location.replace('https://www.gorunway.co/signin.html?retUrl=https://www.gorunway.co/meeting?id=' + gMeetingID);
            }
        } else {

            $.each(files, function(index, file) {
            
                var id = generateUUID();

                var attachmentElement = $('.attachment-template').clone();
                $(attachmentElement).removeClass('attachment-template');
                $(attachmentElement).attr('attachment-id', id);
                $(attachmentElement).attr('attachment-name', file.name);
                $(attachmentElement).attr('attachment-size', humanFileSize(file.size, true));
                $(attachmentElement).attr('attachment-date', moment().format('MMM D, YYYY'));
                $(attachmentElement).find('.file-name').html(file.name);
                $(attachmentElement).find('.file-name').css('opacity', '0.5');
                $(attachmentElement).find('.file-size').html(humanFileSize(file.size, true));
                $(attachmentElement).find('.file-size').css('opacity', '0.5');
                $(attachmentElement).find('.file-date').html('Uploaded ' + moment().format('MMM D, YYYY'));
                $(attachmentElement).find('.file-date').css('opacity', '0.5');
                var fileExtension = getFileTypeExtension(file.name);
                var iconName = getFileIconNameByExtension(fileExtension);
                var iconColor = getFileIconColorByExtension(fileExtension);
                $(attachmentElement).find('.attachment-icon i').removeClass();
                $(attachmentElement).find('.attachment-icon i').addClass(iconName);
                $(attachmentElement).find('.attachment-icon i').css('color', iconColor);
                $(attachmentElement).find('.attachment-icon i').css('opacity', '0.5');
                $(attachmentElement).find('.attachment-download a').attr('download', file.name);
                $(attachmentElement).find('.attachment-download a').attr('href', 'https://s3.amazonaws.com/uploads.gorunway.co/' + id + '/' + file.name);
                $(attachmentElement).find('.attachment-download').hide();
                $(attachmentElement).find('.attachment-delete').hide();
                $(attachmentElement).insertAfter('.attachment:last');

                $(attachmentElement).transition({
                    animation  : 'fade',
                    duration   : '0.5s',
                    onComplete : function() {
                        $('.attachment:last').removeClass('transition visible');
                    }
                });

                var s3 = new AWS.S3({
                    apiVersion: '2006-03-01',
                    params: {Bucket: 'uploads.gorunway.co'}
                });

                var request = s3.putObject({
                    Key: id + '/' + file.name,
                    Body: file
                }, function(err,data) {
                    if(err) {
                        console.log(err);
                    } else {

                    }
                });
                
                // Store this request object so we can potentially use it later...
                uploadRequestStore[id] = request;

                request.on('httpUploadProgress', function(progress) {
                    var fields = this.params.Key.split('/');
                    var selector = "div[attachment-id='" + fields[0] + "']"
                    var attachmentElement = $(selector);
                    $(attachmentElement).find('.attachment-progress').progress('set percent', (progress.loaded/progress.total) * 100);
                    if(progress.loaded >= progress.total) {
                        $(attachmentElement).find('.file-name').css('opacity', '1');
                        $(attachmentElement).find('.file-date').css('opacity', '1');
                        $(attachmentElement).find('.file-size').css('opacity', '1');
                        $(attachmentElement).find('.attachment-icon i').css('opacity', '1');
                        $(attachmentElement).find('.attachment-download').show();
                        $(attachmentElement).find('.attachment-delete').show();
                        $(attachmentElement).find('.attachment-cancel').hide();
                        $(attachmentElement).find('.attachment-progress').hide();
                    }
                });

            });
            
        }
    });

}

function onCancelFileButtonClick(element) {

    var attachmentElement = $(element).closest('.attachment');

    var id = $(attachmentElement).attr('attachment-id');

    var request = uploadRequestStore[id];

    request.abort();

    $(attachmentElement).remove();

}

function onDeleteFileButtonClick(element) {

    AWS.config.credentials.refresh((error) => {

        if (error) {
            if(location.hostname == 'localhost' || location.hostname == '') {
                window.location.replace('file:///C:/meet/web/signin.html');
            } else {
                window.location.replace('https://www.gorunway.co/signin.html?retUrl=https://www.gorunway.co/meeting?id=' + gMeetingID);
            }
        } else { 

            var attachmentElement = $(element).closest('.attachment');

            var id = $(attachmentElement).attr('attachment-id');
            var name = $(attachmentElement).attr('attachment-name');

            $(attachmentElement).remove();

            var s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                params: {Bucket: 'uploads.gorunway.co'}
            });

            var request = s3.deleteObject({
                Key: id + '/' + name,
            }, function(err,data) {
                if(err) {
                    console.log(err);
                } else {
                    serializeMeeting();
                    
                }
            });

        }

    });

}

function onDeleteCommentClick(element) {

    var commentElement = $(element).closest('.comment-item');

    $(commentElement).remove();

    var comments = $('.comment-item');

    if(comments.length < 1) {
        $('.no-comments').show();
    }

}
