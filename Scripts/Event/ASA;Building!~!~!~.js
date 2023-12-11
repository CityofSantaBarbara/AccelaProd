//Added by Gray Quarter per request of Andrew on 4/29/2020 and tracked in zen #500 sharepoint 254
if (!publicUser) { 
	addRefContactToRecord(2982,"Contact");
	//addRefContactToRecord(174,"Business Owner"); // added for zen 1106
	}
	
	editAppSpecific("Plan Review Distribution Count","0");
	/*
	// Added by Gray Quarter for zen #493
	if (publicUser) {  
	var acaFeeMap = getFeeRecsToProcess();
	
	for (var i in acaFeeMap) {
		// add by record type
			var m = acaFeeMap[i];
			for (var j in m.recType) {
				//logDebug("inserting fee for " + m.recType[j]);
				if (appMatch(String(m.recType[j])))
				{
					updateFee(m.feeCode, m.feeSchedule,"FINAL",m.feeAmount, "N");
				}
			}
		}
	}
	*/

if (publicUser) {
    logDebug("Application Received Notification - Begin");

    var capContactResult = aa.people.getCapContactByCapID(capId);
    if (capContactResult.getSuccess()) {
        var toEmail = '';
        var Contacts = capContactResult.getOutput();
        for (var contaxtIdx in Contacts) {
            email = Contacts[contaxtIdx].getEmail();
            if (email != ''){ 
                break;
            }
        }
        toEmail = email;
        var fromEmail = lookup("SCRIPT_EMAIL_FROM", "AGENCY_FROM");
        var ccEmail = ""; //blank for now
        var emailTemplate = "BLD APPLICATION SUBMIT";
        var capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
        conEmailStr = toEmail.join(";");
        ccEmailStr = ccEmail;
        sendNotification(fromEmail, toEmail, ccEmail, emailTemplate, null, null);

        logDebug("BLD APPLICATION SUBMIT: Sent Email template " + emailTemplate + " To Contacts " + conEmailStr);
    } else {
        logDebug("BLD APPLICATION SUBMIT: No contacts found");
    }
    logDebug("Application Received Notification - End");
}
