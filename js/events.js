
var uploadRequestStore = {};

function onPlusButtonClick(element) {
    var input = $(element).siblings('#duration');
    var duration = parseInt(input.val());
    if(duration >= 5) {
        input.val(duration + 5);
    } else {
        input.val(duration + 1);
    }
f
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

function onSaveMeetingEvent() {

    var meeting = serializeMeeting();
    var method = '';

    //$('#meeting-loader').addClass('active');
    $('.meeting-save-status .loader').css('opacity','1');

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
    
    var params = {};
    
    var body = meeting;
    
    var additionalParams = {
        headers: {
            'Content-Type': 'application/json'
        },
        queryParams: {}
    };

    AWS.config.credentials.refresh((error) => {
        if (error) {
            console.log(error);
            if(location.hostname == 'localhost' || location.hostname == '') {
                window.location.replace('http://localhost/signin.html');
            } else {
                window.location.replace('https://www.gorunway.co/signin.html?retUrl=https://app.gorunway.co/meeting?id=' + gMeetingID);
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
                    $('.meeting-save status .loader').css('opacity','0');
                    var fromNow = moment(meeting.LastModified).fromNow();
                    $('.meeting-save-message').val('Meeting saved ' + fromNow + ' ago.');
                }).catch(function(err) {
                    console.log(err);
                });
            } else {
                apigClient.meetingPut(params, body, additionalParams)
                .then(function(result) {
                    $('.meeting-save status .loader').css('opacity','0');
                    var fromNow = moment(meeting.LastModified).fromNow();
                    $('.meeting-save-message').val('Meeting saved ' + fromNow + ' ago.');
                }).catch(function(err) {
                    console.log(err);
                    if(err.message == 'The security token included in the request is expired') {
        
                    }
                    $('.meeting-save status .loader').css('opacity','0');
                });
            }
        }
    });

}

function onMeetingCardClick(element) {

    $('.sidebar .ui.card').removeClass('yellow');
    $(element).addClass('yellow');
    
    var meetingID = $(element).attr('meeting-id');

    $('#meeting-loader').addClass('active');

    $('.paper').removeClass('hidden');
    $('.desktop-icon').addClass('hidden');

    var apigClient;
    
    var params = {};

    var body = null;
    
    var additionalParams = {
        // If there are any unmodeled query parameters or headers that must be
        //   sent with the request, add them here.
        headers: {
            'Content-Type': 'application/json'
        },
        queryParams: {
            id : meetingID
        }
    };

    AWS.config.credentials.refresh((error) => {
        if (error) {
            console.log(error);
            window.location.replace(window.hostname + '/signin.html?retUrl=' + window.hostname + '/meeting?id=' + meetingID);
        } else {

            // Appears the AWS object is populated with credential info on call to refresh...
            apigClient = apigClientFactory.newClient({
                accessKey: AWS.config.credentials.accessKeyId,
                secretKey: AWS.config.credentials.secretAccessKey,
                sessionToken: AWS.config.credentials.sessionToken
            });

            apigClient.meetingGet(params, body, additionalParams)
            .then(function(data) {
                renderMeeting(data.data.Item);
                localStorage.setItem('runway_last_meeting_id', meetingID);
                $('#meeting-loader').removeClass('active');
            }).catch(function(err) {
                console.log(err);
                $('#meeting-loader').removeClass('active');
            });
            
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
                window.location.replace('http://localhost/signin.html');
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
                window.location.replace('http://localhost/signin.html');
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

    onSaveMeetingEvent();

}
