
//********************************************************************************************************
//Script 		Email Applicant on Fee Invoice  ********* Script #27
//Record Types:	*/*/*/*
//
//Event: 		IFA
//
//Desc:			When a fee is invoiced let the Applicant know.
//
//Assumptions:
//				If an applicant does not have an email this script will return a warning to the User
//
//
//Created By: Silver Lining Solutions 
//********************************************************************************************************
// Change Log
//         		Date		Name		Modification
//			09/11/2018	Eric		orig
//			12/07/2018	Chad		took out "return null" when no staff found, send email anyway
//			02/12/2019	Chad		adding aca url to parameters for template - city can use this as example.
//			05/08/2020	Chad		new template, new parameters
//			06/01/2020	Chad		new requirement 05/27/2020 -check to see if the fee has been voided.  If so, do not send a notice!
//********************************************************************************************************
function emailApplicantOnFeeInvoice()
{
	logDebug("Script 27 Email Applicant on Fee Invoice - Begin");

	if (!publicUser) handleFeeInvoiceNotificationEmail();
	logDebug("Script 27 Email Applicant on Fee Invoice - End");
}

function getPayFeesACAUrl(){

	// returns the path to the record on ACA.  Needs to be appended to the site

	itemCap = capId;
	if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args
   	var acaUrl = "";
	var id1 = capId.getID1();
	var id2 = capId.getID2();
	var id3 = capId.getID3();
	var cap = aa.cap.getCap(capId).getOutput().getCapModel();

	acaUrl += "/urlrouting.ashx?type=1009";
	acaUrl += "&Module=" + cap.getModuleName();
	acaUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
	acaUrl += "&agencyCode=" + aa.getServiceProviderCode();
	return acaUrl;
}
