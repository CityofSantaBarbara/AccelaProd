
//********************************************************************************************************
//Script 		notification
//Record Types:	?*/*/*/*
//
//Event: 		WFTA
//
//Desc:			this script will provide the Agency with a 'configurable' strategy for sending 
//				emails to both internal users and contacts using the Notification templates
//
//
//				A standard choice table (NOTIFICATION_RULES) will be used with entries as follows
//		
//		lookup Value							
//		AppType|Task|Status					
//
//		lookup Result
//		NotificationTemplate|<toList>|<ccList>
//
//				the NotificationTemplate will then be used in the call to send and attach the emailParameters
//				the <toList> and <ccList> information will provide the ability to customize the list of people
//				to be contacted and will be parsed as follows:
//
//		<toList> = person,person,person...
//		where person may be:	AppStaff,WFStaff,Owner,ContactType
//
//			AppStaff: the user assigned to the recordAlias$$
//			WFStaff:  the user assigned to the WF task (will only work fow WF)
//			Owner:  the APO Owner
//			ContactType:  from the list of Contacts the contact type's email will be applied
//						for example - Applicant, Agent, etc.
//
//
// EXAMPLES
//	Fire/*/*/|Application Submittal|Submitted		SubmittalNotification|Applicant|AppStaff
//
//
//Created By: Silver Lining Solutions 
//********************************************************************************************************
// Change Log
//         		Date		Name			Modification
//				9/212018	Eric			Original Development
//				??			??				someone added the fromEmail lookup 
//				9/18/2019	Eric			Completed the script for workflow
//********************************************************************************************************
function notification(triggerEvent)
{

	var fromEmail = lookup("SCRIPT_EMAIL_FROM","AGENCY_FROM");	
	var toEmail = "";
	var ccEmail = "";
	var notificationTemplateName = "";
	var reportFile = [];  // empty set for the file list
	var capID4Email = aa.cap.createCapIDScriptModel(capId.getID1(),capId.getID2(),capId.getID3());
	var emailParameters = aa.util.newHashtable();
	var staff = null;
	var lookupTable = "NOTIFICATION_RULES";
	var lookupResult = null;
	var lookupValue = wfTask + "|" + wfStatus;

	showMessage = true;
// do not force the debug window open within scripts.  This should only be set in includes_custom_globals
// leaving showMessage for now, but this should be set to true to send the comment to the screen and then back to false when done
//	showDebug = true;
	logDebug("notification - Begin");
	logDebug("controlString = " + controlString);
	logDebug("triggerEvent = " + triggerEvent);
	logDebug("lookupTable = " + lookupTable);
	logDebug("lookupValue = " + lookupValue);
	logDebug("appTypeString = " + appTypeString);

	lookupResult = appTypePriorityLookup(lookupTable,lookupValue,appTypeString);
	
	if (lookupResult)
	{
		var lookupResultArray = lookupResult.split("|");
		notificationTemplateName = lookupResultArray[0];
		logDebug("template name = " + notificationTemplateName);
		var toEmailList=lookupResultArray[1];
		var ccEmailList=lookupResultArray[2];
		
		logDebug("calling notificationParamBuild");
		emailParameters = notificationParamBuild(emailParameters);
		logDebug("emailParameters = " + emailParameters);

		logDebug("calling notificationDistributionBuild");
		toEmail = notificationDistributionBuild(toEmailList);
		logDebug("toEmail = " + toEmail);

		logDebug("calling notificationDistributionBuild");
		ccEmail = notificationDistributionBuild(ccEmailList);
		logDebug("ccEmail = " + ccEmail);
	
		logDebug("email params = " + emailParameters);
	// send Notification
		logDebug("calling sendNotification");
		var sendResult = sendNotification(fromEmail,toEmail,ccEmail,notificationTemplateName,emailParameters,reportFile,capID4Email);
		logDebug("sendResult = " + sendResult);

		if (!sendResult) 
			{ logDebug("UNABLE TO SEND NOTICE!  ERROR: "+sendResult); }
		else
			{ logDebug("Sent Notification"); }  
	}		
	
	logDebug("notification - End");
}
