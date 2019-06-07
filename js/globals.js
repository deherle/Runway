

var gMeetingHasChanged = false;  // Global flag indicating if meeting has changed or not

var gMeetingID = '';  // Meeting ID for currently loaded meeting

var gMeetingStartDate; // Global fields storing start and end times for currently loaded meeting
var gMeetingStartTime;
var gMeetingEndDate;
var gMeetingEndTime;

var gMeetingCreated; // Date field indicating when meeting was created

var gUserClaims; // JSON object that represents currently authenticated user and their properties

var gLastSerializedMeeting;  // Cached copy of the meeting we last serialized