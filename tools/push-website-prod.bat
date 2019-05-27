aws s3 sync ../images s3://gorunway.co/images --acl public-read
aws s3 sync ../css s3://gorunway.co/css --acl public-read
aws s3 sync ../js s3://gorunway.co/js --acl public-read
aws s3 cp ../index.html s3://gorunway.co --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
aws s3 cp ../favicon.ico s3://gorunway.co --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
aws s3 cp ../signin.html s3://gorunway.co --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
aws s3 cp ../signup.html s3://gorunway.co --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers