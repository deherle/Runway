aws s3 sync images s3://test.app.gorunway.co/images
aws s3 sync css s3://test.app.gorunway.co/css
aws s3 sync js s3://test.app.gorunway.co/js
aws s3 sync . s3://test.app.gorunway.co --exclude "*" --include "app.html"
aws s3 sync . s3://test.app.gorunway.co --exclude "*" --include "favicon.ico"
