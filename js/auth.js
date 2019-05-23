window.onload = function() {
    $('#password').keydown(function (e) {
        var key = e.which;
        if(key == 13)  // the enter key code
         {
            onSigninButtonClick(); 
         }
       });   
    
}

var cognitoUser;

function onSignupButtonClick() {

    $('.spinner').addClass('active');

    var poolData = {
        UserPoolId : 'us-east-1_sGM3cf79D',
        ClientId : '6ls106hn6p6cci7e2b6hch5coa'
    };
    var userPool = 
    new AmazonCognitoIdentity.CognitoUserPool(poolData);

    var attributeList = [];
 
    var dataEmail = {
        Name : 'email',
        Value : $('#email').val()
    };

    var dataName = {
        Name : 'name',
        Value : $('#name').val()
    };

    var attributeEmail = 
    new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    var attributeName = 
    new AmazonCognitoIdentity.CognitoUserAttribute(dataName);
 
    attributeList.push(attributeEmail);
    attributeList.push(attributeName);
 
    userPool.signUp($('#email').val(), $('#password').val(), attributeList, null, function(err, result){

        $('.spinner').removeClass('active');

        if (err) {
            console.log(err);
            if(err.code == 'UsernameExistsException') {
                $('.duplicate-username').modal({inverted: true}).modal('show');
            }
            return;
        }

        $('#name').val('');
        $('#email').val('');
        $('#password').val('');

        cognitoUser = result.user;
        console.log('user name is ' + cognitoUser.getUsername());

        $('#code-error').hide();

        $('.enter-code').modal({closable: false,
                              inverted: true,
                              onApprove : function() {
                                return onSubmitCodeClick();
                               } }).modal('show');

    });    

    return false;
    
} 

function onSubmitCodeClick() {

    $('#code-error').hide();

    if(!$('#code-input').val()) {
        return false;
    }

    $('.spinner').addClass('active');

    cognitoUser.confirmRegistration($('#code-input').val(), true, function(err, result) {
        if (err) {
            console.log(err);
            if(err.code == 'CodeMismatchException') {
                $('.enter-code').modal({closable: false,
                    inverted: true,
                    onApprove : function() {
                      return onSubmitCodeClick();
                     } }).modal('show');
                $('#code-error').show();
            }
            return false;
        }
        console.log('call result: ' + result);

        setTimeout(function(){

        $('.spinner').removeClass('active');

        $('.code-validated').modal({inverted: true}).modal('show');
        }, 300);

        return true;
    });

    return true;

}

function onSigninButtonClick() {

    $('.spinner').addClass('active');

    var poolData = {
        UserPoolId : 'us-east-1_sGM3cf79D',
        ClientId : '6ls106hn6p6cci7e2b6hch5coa',
        //Storage : new CookieStorage({secure: false, domain: 'gorunway.co'})
    };
    
    var userPool = 
    new AmazonCognitoIdentity.CognitoUserPool(poolData);

    var authenticationData = {
        Username : $('#email').val(), 
        Password : $('#password').val()
    };
    
    var authenticationDetails = 
    new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    
    var userData = {
        Username: $('#email').val(),
        Pool: userPool,
        //Storage: new CookieStorage({secure: false, domain: 'gorunway.co'})
    };

    var cognitoUser = 
    new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            var accessToken = result.getAccessToken().getJwtToken();
            if(location.hostname == 'localhost' || location.hostname == '') {
                window.location.replace('file:///C:/meet/web/app.html');
            } else {
                window.location.replace('https://app.gorunway.co');
            }
        },
        onFailure: function(err) {
            $('.spinner').removeClass('active');
            if(err.code == 'NotAuthorizedException') {
                $('.form').form('add prompt', 'password', 'Invalid credentials.')
            }
            console.log(err);
        }
    });

}

function onSignOutClick() {

    var poolData = {
      UserPoolId : 'us-east-1_sGM3cf79D',
      ClientId : '6ls106hn6p6cci7e2b6hch5coa'
    };
  
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
  
    cognitoUser.signOut();
  
    if(location.hostname == 'localhost' || location.hostname == '') {
      window.location.replace('file:///C:/meet/web/signin.html');
    } else {
      window.location.replace('https://www.gorunway.co/signin.html?retUrl=https://www.gorunway.co/meeting?id=' + gMeetingID);
    }
  
  }

$('#password').keydown(function (e) {
    var key = e.which;
    if(key == 13)  // the enter key code
     {
        onSigninButtonClick(); 
     }
   });   
