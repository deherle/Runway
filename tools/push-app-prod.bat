aws s3 sync images s3://app.gorunway.co/images --acl public-read
aws s3 sync css s3://app.gorunway.co/css --acl public-read
aws s3 sync js s3://app.gorunway.co/js --acl public-read
aws s3 sync . s3://app.gorunway.co --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --exclude "*" --include "app.html"
aws s3 sync . s3://app.gorunway.co --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --exclude "*" --include "favicon.ico"

