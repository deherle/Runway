function showMeetingLinkModal() {
    $('.modal-share-meeting-link')
    .modal({
      inverted: true
    })
    .modal('show')
  ;
}

function showAccountModal() {
  $('.modal-account')
  .modal({
    inverted: true,
    allowMultiple: true
  })
  .modal('show')
;
}

function showDeleteAccountModal() {
  $('.modal-delete-account')
  .modal({
    inverted: true,
  })
  .modal('show')
;
}

function copyMeetingLink() {

    var copyText = document.getElementById("copy-meeting-link-input");
    copyText.select();
    document.execCommand("copy");

}

function showDeleteMeetingModal() {

  $('.modal-delete-meeting')
  .modal({
    inverted: true,
    onApprove: onDeleteMeetingModalOKButtonClick,
    onDeny: onDeleteMeetingModalCancelButtonClick
  })
  .modal('show');

}

function showInvalidUploadModal() {

  $('.modal-invalid-upload')
  .modal({
    inverted: true
  })
  .modal('show');

}

function onDeleteMeetingModalOKButtonClick() {

  $('#meeting-loader').addClass('active');

  var apigClient = apigClientFactory.newClient({
    accessKey: AWS.config.credentials.accessKeyId,
    secretKey: AWS.config.credentials.secretAccessKey,
    sessionToken: AWS.config.credentials.sessionToken
  });

  var params = {};

  var body = {};

  var additionalParams = {
    // If there are any unmodeled query parameters or headers that must be
    //   sent with the request, add them here.
    headers: {
        'Content-Type': 'application/json'
    },
    queryParams: {
      "id" : gMeetingID
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
        apigClient.meetingDelete(params, body, additionalParams)
        .then(function(result) {
            $('#sidebar-loader').addClass('active');
            $('.paper').addClass('hidden');
            $('.desktop-icon').removeClass('hidden');
            $('.ui.sidebar').sidebar('toggle');
            $('#meeting-loader').addClass('active');
            clearSidebar();
            loadSidebar();       
        }).catch(function(err) {
            console.log(err);
            $('#meeting-loader').removeClass('active');
        });
      }
    }
  );

}

function onDeleteMeetingModalCancelButtonClick() {

}
