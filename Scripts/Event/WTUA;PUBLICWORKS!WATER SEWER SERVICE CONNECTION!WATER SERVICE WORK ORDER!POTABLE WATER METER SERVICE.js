//Added by Nicole Folman
//Ticket #SR-87031
//WTUA:PUBLICWORKS/WATER SEWER SERVICE CONNECTION/WATER SERVICE WORK ORDER/POTABLE WATER METER SERVICE
//Site Visit Fees - Paid
//4/15/2024

try{
    if (wfTask == "Site Visit fees" && wfStatus == "Paid") {
        logDebug("*****************Potable Water Meter Service Notification*****************");
        logDebug(">>> Site Visit Fees have been paid. Sending email notification.<BR>")
    //Get Report and Report Parameters
    
        var fromEmail = lookup("SCRIPT_EMAIL_FROM", "AGENCY_FROM");
        var toEmail = "COlesen@santabarbaraca.gov; MHeinrich@santabarbaraca.gov; ABenson@santabarbaraca.gov; DMontalvo@santabarbaraca.gov";
        var ccEmail = "nfolman@santabarbaraca.gov"; //blank for now
        var theURL = "";
        var emailParameters = aa.util.newHashtable();  

        addParameter(emailParameters, "$$RecordID$$", cap.getCapModel().getAltID());

        var addressResult = aa.address.getAddressByCapId(capId);
           if (addressResult.getSuccess()) {
               var addressArray = addressResult.getOutput();
               if (addressArray.length > 0) {
                   var address = addressArray[0];
                   var displayAddress = address.getDisplayAddress();
                   logDebug("Address: " + displayAddress);
                   addParameter(emailParameters, "$$Address$$", displayAddress);
               } else {
                   logDebug("No addresses found for this Cap ID.");
               }
           } else {
               logDebug("**ERROR: Failed to get addresses " + addressResult.getErrorMessage());
           }

        var capModel = cap.getCapModel();
        var workDescModel = capModel.getCapWorkDesModel();
        var workDescription = workDescModel.getDescription();
        logDebug("Work Description: " + workDescription);
        addParameter(emailParameters, "$$WorkDesc$$", workDescription);

        var wfTaskResult = aa.workflow.getTask(capId, wfTask);
            if (wfTaskResult.getSuccess()) {
                wfTask = wfTaskResult.getOutput();
                var wfComment = wfTask.getDispositionComment();
                logDebug("Workflow Comment: " + wfComment);
                addParameter(emailParameters, "$$WorkflowComment$$", wfComment);
            } else {
                logDebug("**ERROR: Failed to get workflow task " + wfTaskResult.getErrorMessage());
            }

        var emailTemplate = "PBW_WD_SITEVISIT_PAID";
        var capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
        var fileNames = [];

        aa.document.sendEmailAndSaveAsDocument(fromEmail, toEmail, ccEmail, emailTemplate, emailParameters, capId4Email, fileNames);
        logDebug( "<BR> >>> Potable Water Meter Service Email template for Paid Site Visit Fees <BR> >>> Email Template: " + emailTemplate);
    }
} catch (err) { 
    logDebug("A JavaScript Error occurred: WTUA:PublicWorks/Water Sewer Service Connection/Water Service Work Order/Flow Testing: " + err.message); 
    logDebug(err.stack);
}

//Added by Nicole Folman
//Ticket #SR-100902
//WTUA:PUBLICWORKS/WATER SEWER SERVICE CONNECTION/WATER SERVICE WORK ORDER/POTABLE WATER METER SERVICE
//Account Classification Review (Water Supply) Workflow task is active
//4/15/2024

try{
    var activeTask = isTaskActive("Account Classification Review (Water Supply)");
    if(activeTask == true){
        logDebug("*****************Potable Water Meter Service Notification*****************");
        logDebug(">>> Account Classification Review (Water Supply) is active. Sending email notification. <BR>")
        //Get Report and Report Parameters
        
        var fromEmail = lookup("SCRIPT_EMAIL_FROM", "AGENCY_FROM");
        var toEmail = "kmunster@santabarbaraca.gov; sbrittain@SantaBarbaraCA.gov";
        var ccEmail = "nfolman@santabarbaraca.gov"; //blank for now
        var theURL = "";
        var emailParameters = aa.util.newHashtable();  
    
        addParameter(emailParameters, "$$RecordID$$", cap.getCapModel().getAltID());
    
        var addressResult = aa.address.getAddressByCapId(capId);
           if (addressResult.getSuccess()) {
               var addressArray = addressResult.getOutput();
               if (addressArray.length > 0) {
                   var address = addressArray[0];
                   var displayAddress = address.getDisplayAddress();
                   logDebug("Address: " + displayAddress);
                   addParameter(emailParameters, "$$Address$$", displayAddress);
               } else {
                   logDebug("No addresses found for this Cap ID.");
               }
           } else {
               logDebug("**ERROR: Failed to get addresses " + addressResult.getErrorMessage());
           }
    
        var capModel = cap.getCapModel();
        var workDescModel = capModel.getCapWorkDesModel();
        var workDescription = workDescModel.getDescription();
        logDebug("Work Description: " + workDescription);
        addParameter(emailParameters, "$$WorkDesc$$", workDescription);
    
        var wfTaskResult = aa.workflow.getTask(capId, wfTask);
            if (wfTaskResult.getSuccess()) {
                wfTask = wfTaskResult.getOutput();
                var wfComment = wfTask.getDispositionComment();
                logDebug("Workflow Comment: " + wfComment);
                addParameter(emailParameters, "$$WorkflowComment$$", wfComment);
            } else {
                logDebug("**ERROR: Failed to get workflow task " + wfTaskResult.getErrorMessage());
            }
    
        var emailTemplate = "PBW_WD_METER_ACCNT";            
        var capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
        var fileNames = [];
    
        aa.document.sendEmailAndSaveAsDocument(fromEmail, toEmail, ccEmail, emailTemplate, emailParameters, capId4Email, fileNames);
        logDebug( "<BR> >>> Potable Water Meter Service Email template for Account Classification Review (Water Supply) >>> <BR> Email Template: " + emailTemplate);
        }
} catch (err) { 
    logDebug("A JavaScript Error occurred: WTUA:PUBLICWORKS/WATER SEWER SERVICE CONNECTION/WATER SERVICE WORK ORDER/POTABLE WATER METER SERVICE: " + err.message); 
    logDebug(err.stack);
}
