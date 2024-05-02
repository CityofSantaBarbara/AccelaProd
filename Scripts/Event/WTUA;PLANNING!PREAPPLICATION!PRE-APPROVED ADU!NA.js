//Added by Nicole Folman
//WTUA:PLANNING/PREAPPLICATION/PRE-APPROVED ADU/NA
//Send email to Building Counter staff when Planning Approves
//5/2/2024

try{
    if (wfTask == "Planning Final Review" && wfStatus == "Approved - Send to Building") {
        logDebug("*****************Pre-Approved ADU Notification to Building*****************");
        logDebug("Planning Approved, Building Review Required");
    //Get Report and Report Parameters
    
        var fromEmail = lookup("SCRIPT_EMAIL_FROM", "AGENCY_FROM");
        var toEmail = "nfolman@santabarbaraca.gov";
        var ccEmail = "rrutledge@santabarbaraca.gov"; //blank for now
        var theURL = "";
        var emailParameters = aa.util.newHashtable();  

        addParameter(emailParameters, "$$RecordID$$", cap.getCapModel().getAltID());

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

        var emailTemplate = "BLD_PREAPPROVED_ADU";
        var capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
        var fileNames = [];

        aa.document.sendEmailAndSaveAsDocument(fromEmail, toEmail, ccEmail, emailTemplate, emailParameters, capId4Email, fileNames);
        logDebug( ">>> Pre-Approved ADU Email template for Planning Approved send to Building for Review" + emailTemplate);
    }
} catch (err) { 
    logDebug("A JavaScript Error occurred: WTUA:PublicWorks/Water Sewer Service Connection/Water Service Work Order/Flow Testing: " + err.message); 
    logDebug(err.stack);
}

//Create Plan Check Condition
createConditionForPlanReview();

try{
    if (wfTask == "Plans Coordination" && wfStatus == "Corrections Required") {
        logDebug("Correction Required");
        var capContactResult = aa.people.getCapContactByCapID(capId);
        var toEmail = []

         if (capContactResult.getSuccess()) {
            var Contacts = capContactResult.getOutput();
            for (yy in Contacts)
                if (Contacts[yy].getEmail() != null)
                    toEmail.push("" + Contacts[yy].getEmail());

            if (toEmail.length > 0) {
                //Get Report and Report Parameters
                var reportTemplate = "BLD Plan Check Corrections";
                var reportParameters = aa.util.newHashtable();
                addParameter(reportParameters, "PermitNum", capId.getCustomID());
                if (AInfo["Plan Review Distribution Count"] == "1") {
                    addParameter(reportParameters, "Condition_Type", "Review 1");
                }
                if (AInfo["Plan Review Distribution Count"] == "2") {
                    addParameter(reportParameters, "Condition_Type", "Review 2");
                }
                if (AInfo["Plan Review Distribution Count"] == "3") {
                    addParameter(reportParameters, "Condition_Type", "Review 3");
                }
                if (AInfo["Plan Review Distribution Count"] == "4") {
                    addParameter(reportParameters, "Condition_Type", "Review 4");
                }
                if (AInfo["Plan Review Distribution Count"] == "5") {
                    addParameter(reportParameters, "Condition_Type", "Review 5");
                }
                if (AInfo["Plan Review Distribution Count"] == "6") {
                    addParameter(reportParameters, "Condition_Type", "Review 6");
                }
                if (AInfo["Plan Review Distribution Count"] == "7") {
                    addParameter(reportParameters, "Condition_Type", "Review 7");
                }
                if (AInfo["Plan Review Distribution Count"] == "8") {
                    addParameter(reportParameters, "Condition_Type", "Review 8");
                }
                logDebug("in the report template if statement" + reportParameters);
                //
                var rptFile = generateReport4Save(capId, reportTemplate, "Building", reportParameters)
                var fromEmail = lookup("SCRIPT_EMAIL_FROM", "AGENCY_FROM");
                var ccEmail = ""; //blank for now
                var count = (parseInt(AInfo["Plan Review Distribution Count"],10) + 1).toFixed(0);
                var emailParameters = aa.util.newHashtable();
                addParameter(emailParameters, "$$altID$$", cap.getCapModel().getAltID());
                addParameter(emailParameters, "$$recordAlias$$", cap.getCapType().getAlias());
                addParameter(emailParameters, "$$Submittal$$", AInfo["Plan Review Distribution Count"]);
                addParameter(emailParameters, "$$submittalCount$$", count);
                logDebug("in the Email parameters if statement" + emailParameters);
                var emailTemplate = "BLD PLAN CHECK CORRECTIONS";
                var capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
                var fileNames = [];
                if (rptFile) {
                    fileNames.push(String(rptFile));
                }
                conEmailStr = toEmail.join(";");
                ccEmailStr = ccEmail;

                aa.document.sendEmailAndSaveAsDocument(fromEmail, conEmailStr, ccEmailStr, emailTemplate, emailParameters, capId4Email, fileNames);
                logDebug( ": Sent Email template " + emailTemplate + " To Contacts " + conEmailStr);
            }
        }
             else
                logDebug("Couldn't send email to, no valid email address");

    }
} catch (err) {
    logDebug("An error occurred in WTUA:PLANNING/PREAPPLICATION/PRE-APPROVED ADU/NA <br> BLD Plan Check Corrections : " + err.message);
}

function generateReport4Save(itemCap, reportName, module, parameters) {
    //returns the report file which can be attached to an email.
    var user = currentUserID;   // Setting the User Name
    var report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();
    report.setModule(module);
    report.setCapId(itemCap.getCustomID());
    report.setReportParameters(parameters);
    var edms = new com.accela.v360.reports.proxy.EDMSEntityIdModel();
    edms.setCapId(itemCap.getID1() + "-" + itemCap.getID2() + "-" + itemCap.getID3());
    edms.setAltId(itemCap.getCustomID());
    report.setEDMSEntityIdModel(edms)
    var permit = aa.reportManager.hasPermission(reportName, user);
    if (permit.getOutput().booleanValue()) {
        var reportResult = aa.reportManager.getReportResult(report);
        if (reportResult.getSuccess()) {
            reportOutput = reportResult.getOutput();
            if (reportOutput != null) {
                var reportFile = aa.reportManager.storeReportToDisk(reportOutput);
                reportFile = reportFile.getOutput();
                return reportFile;
            }
            else {
                logDebug("ERROR: No temp file available");
                return false;
            }
        } else {
            logDebug("System failed get report: " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
            return false;
        }
    } else {
        logDebug("You have no permission.");
        return false;
    }
}
