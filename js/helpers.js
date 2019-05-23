function numberOfAgendaTopics() {
    return $('.agenda-topic').length;
}

function numberOfChecklistItems() {
    return $('.checkitem-wrapper').length;
}

function numberOfCheckedChecklistItems() {
    return $('#checkbox-item:checked').length;
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

function getCognitoUser() {
    var poolData = {
        UserPoolId : 'us-east-1_sGM3cf79D',
        ClientId : '6ls106hn6p6cci7e2b6hch5coa',
        //Storage: new CookieStorage({secure: false, domain: 'gorunway.co'})
    };

    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();

    return cognitoUser;
}

function showUI() {
    $('.ui.top.menu').css('opacity', '1');
    $('.ui.left.sidebar').css('opacity', '1');    
}

function disableUnauthenticatedUserControls() {
    $('.new-meeting-button').prop('disabled', true);
    $('button.account-settings-button').prop('disabled', true);
    $('.hamburger').attr('onClick','');
}

function getUrlParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    //console.log(text + ' ' + font);
    return metrics.width + 2;
}

function getAgendaTopicColorHex(color) {

    switch(color) {
        case 'Green':
            return '#21ba45';
        case 'Orange':
            return '#FF6600';
        case 'Blue':
            return '#0E6EB8';
        case 'Red':
            return '#FF0800';
        case 'Yellow':
            return '#FFD700';
        case 'Purple':
            return '#B413EC';
        case 'Teal':
            return '#008080';
        case 'Brown':
            return '#A52A2A';
        case 'Magenta':
            return '#FF00FF';
        case 'Cyan':
            return '#00FFFF';
        default:
            return '#0E6EB8';
    }

} 

function getNextAgendaTopicColor() {
    
    // Sequence of colors: Green, Orange, Blue, Red, Yellow, Purple, Teal, Brown

    var color;

    var topicColor = $('.agenda-topic').last().attr('topic-color');

    if(gSubscription == "Free") {

        if(topicColor == "Green") {
            color = { 'Color' : 'Purple', 'Hex' : '#B413EC'  };
            return color;
        } else {
            color = { 'Color' : 'Green', 'Hex' : '#21ba45'  };
            return color;
        }

    } else {

        switch(topicColor) {
            case 'Green':
                color = { 'Color' : 'Orange', 'Hex' : '#FF6600'  };
                return color;
            case 'Orange':
                color = { 'Color' : 'Blue', 'Hex' : '#0E6EB8'  };
                return color;
            case 'Blue':
                color = { 'Color' : 'Red', 'Hex' : '#FF0800'  };
                return color;
            case 'Red':
                color = { 'Color' : 'Yellow', 'Hex' : '#FFD700'  };
                return color;
            case 'Yellow':
                color = { 'Color' : 'Purple', 'Hex' : '#B413EC'  };
                return color;
            case 'Purple':
                color = { 'Color' : 'Teal', 'Hex' : '#008080'  };
                return color;
            case 'Teal':
                color = { 'Color' : 'Brown', 'Hex' : '#A52A2A'  };
                return color;
            case 'Brown':
                color = { 'Color' : 'Green', 'Hex' : '#21ba45'  };
                return color;
            default:
                color = { 'Color' : 'Purple', 'Hex' : '#016936'  };
                return color;
        }

    }

}

function meetingHasChanged() {
    
    gMeetingHasChanged = true;

    $('.meeting-details .icon .save').addClass('Orange');

}

function isNewMeeting() {
    if(gMeetingID == '') {
        return true;
    } else {
        return false;
    }
}

function serializeMeeting() {

    meeting = {};

    meeting.MeetingID = gMeetingID;

    var cognitoUser = getCognitoUser();

    meeting.AccountID = cognitoUser.username;

    meeting.Created = gMeetingCreated;

    meeting.Title = $('.meeting-title input').val() ? $('.meeting-title input').val() : undefined;

    var start = new moment(gMeetingStartDate);
    var combinedStart = start.hour(gMeetingStartTime.get('Hour'));
    combinedStart = start.minute(gMeetingStartTime.get('Minute')); 
    meeting.StartTime = combinedStart.toJSON(); // UTC start time as ISO8601 string

    var end = new moment(gMeetingEndDate);
    var combinedEnd = end.hour(gMeetingEndTime.get('Hour'));
    combinedEnd = end.minute(gMeetingEndTime.get('Minute')); 
    meeting.EndTime = combinedEnd.toJSON(); // UTC end time as ISO8601 string
    
    meeting.Location =  $('.meeting-location input').val() ? $('.meeting-location input').val() : undefined;
    meeting.Attendees = $('.meeting-attendees input').val() ? $('.meeting-attendees input').val() : undefined;

    var topics = $('.agenda-topic');

    meeting.AgendaTopics = [];

    $.each(topics, function(index, item) {
        meeting.AgendaTopics[index] = {
            "Color" : $(item).attr('topic-color'),
            "Duration" :  parseInt($(item).find('#duration').val()),
            "Title" : $(item).find('.topic-title>input').val() ? $(item).find('.topic-title>input').val() : undefined 
        }
    });

    var checkItems = $('.checkitem-wrapper');

    meeting.ChecklistItems = [];

    var checkItemIndex = 0;

    $.each(checkItems, function(index, item) {

        var checkText = $(item).find('#checkbox-input').val();
        var status;

        if ($(item).find('#checkbox-item').is(':checked')) {
            status = "true";
        } else {
            status = "false";

        }

        if(checkText) {

            meeting.ChecklistItems[checkItemIndex] = {
                "Text" : checkText,
                "Status" : status
            }

            checkItemIndex++;

        }

    });

    var attachments = $('.attachment');

    meeting.Attachments = [];

    $.each(attachments, function(index, attachment) {

        if( !$(attachment).hasClass('attachment-template') ) {

            var key = $(attachment).attr('attachment-id');
            var name = $(attachment).attr('attachment-name');
            var size = $(attachment).attr('attachment-size');
            var date = $(attachment).attr('attachment-date');

            meeting.Attachments[index] = {
                "Name" : name,
                "Key" : key,
                "Size" : size,
                "Date" : date
            }
        
        }

    });

    var comments = $('.comment-item');

    meeting.Comments = [];

    $.each(comments, function(index, comment) {

        if( !$(comment).hasClass('comment-template') ) {

            var text = $(comment).find('.text').html();
            var name = $(comment).find('.author').html();
            var color = $(comment).attr('comment-color');
            var date = $(comment).find('.date').html();

            meeting.Comments[index] = {
                "Text" : text,
                "Name" : name,
                "Color" : color,
                "Date" : date
            }
        
        }

    });

    meeting.Notes = $('#trix-input-1').val() ? $('#trix-input-1').val() : undefined;

    return meeting;

}

function clearSidebar() {

    var cards = $('.sidebar .card');

    $.each( cards, function(index, card) {
        if( $(card).attr('id') == 'meeting-card-template') {
            return;
        } else {
            $(card).remove();
        }

    });

}

function loadSidebar() {

    var poolData = {
        UserPoolId : 'us-east-1_sGM3cf79D',
        ClientId : '6ls106hn6p6cci7e2b6hch5coa',
        //Storage: new CookieStorage({secure: false, domain: 'gorunway.co'})
    };

    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();

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
            id : cognitoUser.username
        }
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

            // Appears the AWS object is populated with credential info on call to refresh...
            apigClient = apigClientFactory.newClient({
                accessKey: AWS.config.credentials.accessKeyId,
                secretKey: AWS.config.credentials.secretAccessKey,
                sessionToken: AWS.config.credentials.sessionToken
            });

            apigClient.meetingsGet(params, body, additionalParams)
            .then(function(data) {
                if(data.data.Count == 0) {
                    console.log("No sidebar meetings to render!");
                } else {
                    $.each(data.data.Items, function(index, meeting) {
                       
                        var card = $('#meeting-card-template').clone();
                        $(card).attr('id', '');
                        $(card).find('.header').html(meeting.Title);
                        let momentDate = new moment(meeting.StartTime);
                        var dateString = momentDate.format('MMM D, YYYY');
                        $(card).find('.date').html(dateString);
                        dateString = momentDate.format('h:mma');
                        momentDate = new moment(meeting.EndTime);
                        dateString += ' - ' + momentDate.format('h:mma');
                        $(card).find('.time').html(dateString);
                        $(card).attr('meeting-id', meeting.MeetingID);
                        $(card).removeClass('hidden');
                        $(card).insertAfter('#meeting-card-template');
                        
                    });
    
                    $('#sidebar-loader').removeClass('active');
                } 
            }).catch(function(err) {
                console.log(err);
                $('#meeting-loader').removeClass('active');
            });
            
        }
    });

    /*$.ajax({
        method: 'GET',
        url: 'https://api.gorunway.co/meetings',
        contentType: "application/json",
        success: function(data) {
            
            if(data.length == 0) {

            } else {
                $.each(data.Items, function(index, meeting) {

                    var card = $('#meeting-card-template').clone();
                    $(card).attr('id', '');
                    $(card).find('.header').html(meeting.Title);
                    let momentDate = new moment(meeting.StartTime);
                    var dateString = momentDate.format('MMM D, YYYY');
                    $(card).find('.date').html(dateString);
                    dateString = momentDate.format('h:mma');
                    momentDate = new moment(meeting.EndTime);
                    dateString += ' - ' + momentDate.format('h:mma');
                    $(card).find('.time').html(dateString);
                    $(card).attr('meeting-id', meeting.MeetingID);
                    $(card).removeClass('hidden');
                    $(card).insertAfter('#meeting-card-template');
                    
                });

                $('#sidebar-loader').removeClass('active');
            }
        },
        error: function(data) {
            console.log(data);
            $('#meeting-loader').removeClass('active');
        }
    });*/

}

function newMeeting() {

    $('#meeting-loader .loader').html('Loading...');
    $('#meeting-loader').addClass('active');

    setTimeout(function() {
        $('#meeting-loader').removeClass('active');
    }, 500);

    $('.meeting-title input').val('');
    $('.meeting-location input').val('');
    $('.meeting-attendees input').val('');

    removeExistingAgendaTopics();

    $('#duration').val('5');
    $('.topic-title input').val('');

    var startDate = new moment();
    startDate.minutes(0);
    startDate.add(1, 'hour');

    $('.meeting-start-date').calendar(
        'set date', startDate.toDate(), updateInput = true, fireChange = true
    );

    $('.meeting-start-time').calendar(
        'set date', startDate.toDate(), updateInput = true, fireChange = true
    );

    startDate.add(1, 'hour');

    $('.meeting-end-date').calendar(
        'set date', startDate.toDate(), updateInput = true, fireChange = true
    );

    $('.meeting-end-time').calendar(
        'set date', startDate.toDate(), updateInput = true, fireChange = true
    );

    var trix = document.querySelector("trix-editor");
    trix.editor.loadHTML('');

    gMeetingCreated = '';
    gMeetingID = '';
    gMeetingHasChanged = false;

    $('.meeting-details .icon .save').removeClass('Orange');

}

function removeExistingAgendaTopics() {

    var agendaTopics = $('.sortable-agenda-topic');

    $.each(agendaTopics, function(index, topic) {
        if(index == 0) {
            return;
        } else {
            $(topic).remove();
        }
    });

}

function removeExistingChecklistItems() {

    var items = $('.sortable-checklist-item');

    $.each(items, function(index, item) {
        if(index == 0) {
            $(item).find('#checkbox-item').prop('checked', false);
            $(item).find('#checkbox-input').css('text-decoration', 'line-none');
            $(item).find('#checkbox-input').val('');
            return;
        } else {
            $(item).remove();
        }
    });

}

function removeExistingAttachments() {

    var items = $('.attachment');

    $.each(items, function(index, item) {
        if(index == 0) {
            return;
        } else {
            $(item).remove();
        }
    });

}

function removeExistingComments() {

    var comments = $('.comment-item');

    $.each(comments, function(index, item) {
        if(index == 0) {
            return;
        } else {
            $(item).remove();
        }
    });

}

function renderMeeting(meeting) {
    
    gMeetingID = meeting.MeetingID;

    gMeetingCreated = meeting.Created;

    meeting.Title ? $('.meeting-title input').val(meeting.Title) : '';

    $('.meeting-start-date').calendar('set date', new Date(meeting.StartTime));
    $('.meeting-start-time').calendar('set date', new Date(meeting.StartTime));
    $('.meeting-end-date').calendar('set date', new Date(meeting.EndTime));
    $('.meeting-end-time').calendar('set date', new Date(meeting.EndTime));

    meeting.Location ? $('.meeting-location input').val(meeting.Location) : '';
    meeting.Attendees ? $('.meeting-attendees input').val(meeting.Attendees) : '';

    removeExistingAgendaTopics();

    $.each(meeting.AgendaTopics, function(index, topic) {
        
        var agendaTopic;

        if(index == 0) {
            agendaTopic = $('.sortable-agenda-topic:last');
        } else {
            agendaTopic = $('.sortable-agenda-topic:last').clone();
            $(agendaTopic).attr('id', '');
        }

        $(agendaTopic).find('#duration').val(topic.Duration);
        $(agendaTopic).find('.topic-title>input').val(topic.Title ? topic.Title : '');
        $(agendaTopic).find('.agenda-topic').attr('topic-color', topic.Color);
        
        $(agendaTopic).insertAfter('.sortable-agenda-topic:last');
    
        $(agendaTopic).find('.agenda-topic').css('border-left-color', getAgendaTopicColorHex(topic.Color));
        
    });

    removeExistingChecklistItems();

    $.each(meeting.ChecklistItems, function(index, item) {
        
        var checkItem;

        if(index == 0) {
            checkItem = $('.sortable-checklist-item:last');
        } else {
            checkItem = $('.sortable-checklist-item:last').clone();
        }

        $(checkItem).find('#checkbox-input').val(item.Text);

        if(item.Status == 'true') {
            $(checkItem).find('#checkbox-item').prop('checked', true);
            $(checkItem).find('#checkbox-input').css('text-decoration', 'line-through');
        } else {
            $(checkItem).find('#checkbox-item').prop('checked', false);
            $(checkItem).find('#checkbox-input').css('text-decoration', 'none');
        }

        $(checkItem).insertAfter('.sortable-checklist-item:last');

        $(checkItem).change(onChecklistItemCheckboxChange);
            
    });

    removeExistingAttachments();

    $.each(meeting.Attachments, function(index, attachment) {

        if(attachment) {

            var attachmentElement = $('.attachment-template').clone();
            $(attachmentElement).css('display', 'block');
            $(attachmentElement).removeClass('attachment-template');
            $(attachmentElement).attr('attachment-id', attachment.Key);
            $(attachmentElement).attr('attachment-name', attachment.Name);
            $(attachmentElement).attr('attachment-size', attachment.Size);
            $(attachmentElement).attr('attachment-date', attachment.Date);
            $(attachmentElement).find('.file-name').html(attachment.Name);
            $(attachmentElement).find('.file-size').html(attachment.Size);
            $(attachmentElement).find('.file-date').html('Uploaded ' + attachment.Date);
            var fileExtension = getFileTypeExtension(attachment.Name);
            var iconName = getFileIconNameByExtension(fileExtension);
            var iconColor = getFileIconColorByExtension(fileExtension);
            $(attachmentElement).find('.attachment-icon i').removeClass();
            $(attachmentElement).find('.attachment-icon i').addClass(iconName);
            $(attachmentElement).find('.attachment-icon i').css('color', iconColor);
            $(attachmentElement).find('.attachment-cancel').hide();
            $(attachmentElement).find('.attachment-progress').hide();
            $(attachmentElement).find('.attachment-download a').attr('download', attachment.Name);
            $(attachmentElement).find('.attachment-download a').attr('href', 'https://s3.amazonaws.com/uploads.gorunway.co/' + attachment.Key + '/' + attachment.Name);
            $(attachmentElement).insertAfter('.attachment:last');

        }

    });

    removeExistingComments();

    $.each(meeting.Comments, function(index, comment) {

        if(comment) {

            var commentElement = $('.comment-template').clone();
            $(commentElement).removeClass('comment-template');
            $(commentElement).addClass('comment-item');
            $(commentElement).attr('user-id', gUserClaims['cognito:username']);
            $(commentElement).attr('comment-color', comment.Color);
            var hex = getAgendaTopicColorHex(comment.Color);
            $(commentElement).find('.avatar').css('background-color', hex);
            $(commentElement).find('.author').html(comment.Name);
            $(commentElement).find('.comment-icon-letter').html(comment.Name[0].toUpperCase());
            $(commentElement).find('.text').html(comment.Text);
            $(commentElement).find('.date').html(comment.Date);
            if(index == 0) {
                $(commentElement).insertAfter('.comment-template');
            } else {
                $(commentElement).insertAfter('.comment-item:last');
            }
            $(commentElement).css('display', 'block');

            $('.no-comments').hide();

        }

    });



    updateChecklistProgressBar();

    var trix = document.querySelector("trix-editor");
    trix.editor.setSelectedRange([0, 0]);
    trix.editor.loadHTML(meeting.Notes ? meeting.Notes : '');
    
}



function updateChecklistProgressBar() {

    var checked = numberOfCheckedChecklistItems();
    var items = numberOfChecklistItems();

    $('#checklist-progress').progress({
        text: {
            active  : 'Completed ' + checked + ' of ' + items + ' items',
            success : items + ' items completed!'
        },
        total: items,
        value: checked
    });

}

function getFileTypeExtension(fileName) {
    var a = fileName.split(".");
    if( a.length === 1 || ( a[0] === "" && a.length === 2 ) ) {
        return "";
    }
    return a.pop().toLowerCase();
}

function getFileIconNameByExtension(extension) {
    switch(extension) {
        case 'txt':
        case '':
        default:
            return 'file alternate outline icon';
        case 'pdf':
            return 'file pdf outline icon';
        case 'wav':
        case 'mp3':
        case 'aiff':
        case 'aac':
        case 'flac':
        case 'ogg':
        case 'wma':
            return 'file audio outline icon';
        case 'mp4':
        case 'avi':
        case 'flv':
        case 'wmv':
        case 'mov':
        case 'webm':
            return 'file video outline icon';
        case 'doc':
        case 'docx':
            return 'file word outline icon';
        case 'js':
        case 'html':
        case 'css':
        case 'java':
        case 'py':
        case 'cs':
        case 'cpp':
            return 'file code outline icon';
        case 'xls':
        case 'xlsx':
        case 'csv':
            return 'file excel outline icon';
        case 'gif':
        case 'jpeg':
        case 'png':
        case 'bmp':
        case 'ai':
            return 'file image outline icon';
        case 'ppt':
        case 'pptx':
            return 'file powerpoint outline icon ';
        case 'gzip':
        case 'zip':
        case 'tar':
        case '7z':
        case 'bz':
        case 'jar':
        case 'rar':
        case 'gz':
            return 'file archive outline';
    }

}

function getFileIconColorByExtension(extension) {
    switch(extension) {
        case 'pdf':
            return '#ff0000';
        case 'wav':
        case 'mp3':
        case 'aiff':
        case 'aac':
        case 'flac':
        case 'ogg':
        case 'wma':
        case 'txt':
        case '':
        default:
        case 'mp4':
        case 'avi':
        case 'flv':
        case 'wmv':
        case 'mov':
        case 'js':
        case 'html':
        case 'css':
        case 'java':
        case 'py':
        case 'cs':
        case 'cpp':
        case 'gif':
        case 'jpeg':
        case 'png':
        case 'bmp':
        case 'ai':
        case 'gzip':
        case 'zip':
        case 'tar':
        case '7z':
        case 'bz':
        case 'jar':
        case 'rar':
        case 'gz':
            return '#000000';
        case 'doc':
        case 'docx':
            return '#00a1f1';
        case 'xls':
        case 'xlsx':
        case 'csv':
            return '#257746';
        case 'ppt':
        case 'pptx':
            return '#f65314';   
    }

}

function humanFileSize(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = decodeURIComponent(atob(base64Url).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(base64);
};

function getNextCommentColor(username) {

    var comments = $('.comment-item');

    if(comments.length == 0) {

        // First comment for this meeting, use a random color to start...
        return getRandomCommentColor();

    } else {

        var numComments = getNumberCommentsFromUser(username);

        if(numComments > 0) {

            var selector = '.comment-item[user-id="' + username + '"]:last';

            var comment = $(selector);

            return $(comment).attr('comment-color');

        } else {

            return getRandomCommentColor();

        }

    }


}

function getRandomCommentColor() {

    var colors = ['Green', 'Orange', 'Blue', 'Red', 'Yellow', 'Purple', 'Teal', 'Brown', 'Magenta', 'Cyan'];

    var index = Math.floor(Math.random() * 10);

    return colors[index];

}

function getNumberCommentsFromUser(username) {

    var selector = '.comment-item[user-id="' + username + '"]'

    var comments = $(selector);

    return comments.length;
    
}


