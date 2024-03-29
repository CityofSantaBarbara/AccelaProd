//PRA;BUILDING!OVER THE COUNTER!HVAC!NA.js
//PRA:BUILDING/OVER THE COUNTER/HVAC/NA
//Added by Gray Quarter
//Start - New On Demand HVAC record for ACA
if (publicUser) {
  closeTask("Application Submittal", "Ready to Issue");
  closeTask("Permit Issuance", "Issued");

//END - New On Demand HVAC record for ACA

//START Santa Barbara Sharepoint #266
logDebug("County Assessor permit issuance email");
//Get Report and Report Parameters

var fromEmail = lookup("SCRIPT_EMAIL_FROM", "AGENCY_FROM");
  var toEmail = "citypermits@co.santa-barbara.ca.us";
  var ccEmail = ""; //blank for now
  var theURL = "https://landuse.santabarbaraca.gov/CitizenAccess";
  var emailParameters = aa.util.newHashtable();
addParameter(emailParameters, "$$altID$$", cap.getCapModel().getAltID());
  addParameter(emailParameters, "$$recordAlias$$", cap.getCapType().getAlias());
  addParameter(emailParameters, "$$acaRecordUrl$$", getACARecordURL(theURL));
  
  var emailTemplate = "BLD_PERMIT_ISSUED_ASSESSOR";
  var capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
  var fileNames = [];
 
  aa.document.sendEmailAndSaveAsDocument(fromEmail, toEmail, ccEmail, emailTemplate, emailParameters, capId4Email, fileNames);
  logDebug( ": Sent Email template " + emailTemplate + " To Contacts ");
}

function generateReportForASyncEmail(itemCap, reportName, module, parameters) {
//returns the report file which can be attached to an email.
var vAltId;
var user = currentUserID; // Setting the User Name
var report = aa.reportManager.getReportInfoModelByName(reportName);
var permit;
var reportResult;
var reportOutput;
var vReportName;
report = report.getOutput();
report.setModule(module);
report.setCapId(itemCap);
report.setReportParameters(parameters);

vAltId = itemCap.getCustomID();
report.getEDMSEntityIdModel().setAltId(vAltId);

permit = aa.reportManager.hasPermission(reportName, user);
if (permit.getOutput().booleanValue()) {
reportResult = aa.reportManager.getReportResult(report);
if (!reportResult.getSuccess()) {
logDebug("System failed get report: " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
return false;
} else {
reportOutput = reportResult.getOutput();
vReportName = reportOutput.getName();
logDebug("Report " + vReportName + " generated for record " + itemCap.getCustomID() + ". " + parameters);
return vReportName;
}
} else {
logDebug("Permissions are not set for report " + reportName + ".");
return false;
}
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

//END Santa Barbara Sharepoint #266	