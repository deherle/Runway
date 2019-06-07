aws s3 sync images s3://gorunway.co/images --acl public-read
aws s3 sync css s3://gorunway.co/css --acl public-read
aws s3 sync js s3://gorunway.co/js --acl public-read
aws s3 sync . s3://gorunway.co --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --exclude "*" --include "index.html"
aws s3 sync . s3://gorunway.co --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --exclude "*" --include "favicon.ico"
aws s3 sync . s3://gorunway.co --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --exclude "*" --include "signin.html"
aws s3 sync . s3://gorunway.co --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --exclude "*" --include "signup.html"
aws s3 sync . s3://gorunway.co --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --exclude "*" --include "pricing.html"
aws s3 sync . s3://gorunway.co --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --exclude "*" --include "contact.html"