var myCapId = "PBW2019-02388";
var myUserId = "ADMIN";

/* ASA  */  var eventName = "tesasdfasdft";
/* WTUA */  //var eventName = "WorkflowTaskUpdateAfter";  wfTask = "Application Submittal";	  wfStatus = "Admin Approved";  wfDateMMDDYYYY = "01/27/2015";
/* IRSA */  //var eventName = "InspectionResultSubmitAfter" ; inspResult = "Failed"; inspResultComment = "Comment";  inspType = "Roofing"
/* ISA  */  //var eventName = "InspectionScheduleAfter" ; inspType = "Roofing"
/* PRA  */  //var eventName = "PaymentReceiveAfter";  

var useProductScript = true;  // set to true to use the "productized" master scripts (events->master scripts), false to use scripts from (events->scripts)
var runEvent = true; // set to true to simulate the event and run all std choices/scripts for the record type.  

/* master script code don't touch */ aa.env.setValue("EventName",eventName); var vEventName = eventName;  var controlString = eventName;  var tmpID = aa.cap.getCapID(myCapId).getOutput(); if(tmpID != null){aa.env.setValue("PermitId1",tmpID.getID1()); 	aa.env.setValue("PermitId2",tmpID.getID2()); 	aa.env.setValue("PermitId3",tmpID.getID3());} aa.env.setValue("CurrentUserID",myUserId); var preExecute = "PreExecuteForAfterEvents";var documentOnly = false;var SCRIPT_VERSION = 3.0;var useSA = false;var SA = null;var SAScript = null;var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") { 	useSA = true; 		SA = bzr.getOutput().getDescription();	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT"); 	if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }	}if (SA) {	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA,useProductScript));	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",SA,useProductScript));	/* force for script test*/ showDebug = true; eval(getScriptText(SAScript,SA,useProductScript));	}else {	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useProductScript));	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useProductScript));	}	eval(getScriptText("INCLUDES_CUSTOM",null,useProductScript));if (documentOnly) {	doStandardChoiceActions2(controlString,false,0);	aa.env.setValue("ScriptReturnCode", "0");	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");	aa.abortScript();	}var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX",vEventName);var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";var doStdChoices = true;  var doScripts = false;var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice ).getOutput().size() > 0;if (bzr) {	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"STD_CHOICE");	doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"SCRIPT");	doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";	}	function getScriptText(vScriptName, servProvCode, useProductScripts) {	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();	vScriptName = vScriptName.toUpperCase();	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();	try {		if (useProductScripts) {			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);		} else {			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");		}		return emseScript.getScriptText() + "";	} catch (err) {		return "";	}}logGlobals(AInfo); if (runEvent && typeof(doStandardChoiceActions) == "function" && doStdChoices) try {doStandardChoiceActions(controlString,true,0); } catch (err) { logDebug(err.message) } if (runEvent && typeof(doScriptActions) == "function" && doScripts) doScriptActions(); var z = debug.replace(/<BR>/g,"\r");  logDebug(z); 

//
// User code goes here
//

try {
	showDebug = true;

	var bizDomScriptArray = aa.bizDomain.getBizDomain("FINAL_INSPECTION_MAPPING").getOutput().toArray();

	var ro = []
	for (var i in bizDomScriptArray) {
		var rt = bizDomScriptArray[i].getBizdomainValue(); // record type
		var inspMap = bizDomScriptArray[i].getDescription(); // mapping

		if (rt.toUpperCase().indexOf("PUBLICWORKS") == 0) { // only do public works

			var rta = rt.split("/");
			var m = JSON.parse(inspMap);

			var insp = m[0].inspection;
			var resu = m[0].result;
			var task = m[0].task;
			var stat = m[0].status;
			var rept = m[0].reportName;

			var sql = "SELECT B.B1_PER_ID1, B.B1_PER_ID2, B.B1_PER_ID3, B.B1_PER_GROUP, B.B1_PER_TYPE, B.B1_PER_SUB_TYPE, B.B1_PER_CATEGORY FROM B1PERMIT B, G6ACTION G WHERE B.SERV_PROV_CODE = 'SANTABARBARA' " +
				"AND B.B1_PER_GROUP = '" + rta[0] + "' " +
				"AND B.B1_PER_TYPE = '" + rta[1] + "' " +
				"AND B.B1_PER_SUB_TYPE = '" + rta[2] + "' " +
				"AND B.B1_PER_CATEGORY = '" + rta[3] + "' " +
				"AND B.B1_PER_ID1 = G.B1_PER_ID1 " +
				"AND B.B1_PER_ID2 = G.B1_PER_ID2 " +
				"AND B.B1_PER_ID3 = G.B1_PER_ID3 " +
				"AND G.G6_ACT_TYP = '" + insp + "' " +
				"AND G.G6_STATUS = '" + resu + "' "

			var s = doSQL(sql);
			
			for (var j in s) {
				
				//testing

				capId = aa.cap.getCapID(s[j].B1_PER_ID1, s[j].B1_PER_ID2, s[j].B1_PER_ID3).getOutput();
				cap = aa.cap.getCap(capId).getOutput();
				
				var o = {}
				o.record =String(capId.getCustomID());
				o.type = String(s[j].B1_PER_GROUP + "/" + s[j].B1_PER_TYPE + "/" + s[j].B1_PER_SUB_TYPE + "/" + s[j].B1_PER_CATEGORY);
				o.status = String(cap.getCapStatus());

				
			
				if (isTaskActive(task)) {
					resultWorkflowTask(task, stat, "", "");
					o.note = "Resulted task: '" + task + "' with status '" + stat +"' ";
					//runReportAttach2(capId, rept,"AGENCY_ALT_ID",capId.getCustomID());
				}
			else {
				o.note = "Task: '" + task + "' is not active";
			}
			
			ro.push(o);
			}
		}
	}
} catch (err) {
	aa.print("A JavaScript Error occured: " + err.message);
}
aa.print(JSON.stringify(ro));

// end user code
//aa.print(debug);

function doSQL(sql) {
	try {
		var array = [];
		var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
		var ds = initialContext.lookup("java:/AA");
		var conn = ds.getConnection();
		var sStmt = conn.prepareStatement(sql);

		if (sql.toUpperCase().indexOf("SELECT") == 0) {
			aa.print("executing " + sql);
			var rSet = sStmt.executeQuery();
			while (rSet.next()) {
				var obj = {};
				var md = rSet.getMetaData();
				var columns = md.getColumnCount();
				for (i = 1; i <= columns; i++) {
					obj[md.getColumnName(i)] = String(rSet.getString(md.getColumnName(i)));
				}
				obj.count = rSet.getRow();
				array.push(obj)
			}
			rSet.close();
			aa.print("...returned " + array.length + " rows");
			aa.print(JSON.stringify(array));
			return array
		} else if (sql.toUpperCase().indexOf("UPDATE") == 0) {
			aa.print("executing update: " + sql);
			var rOut = sStmt.executeUpdate();
			aa.print(rOut + " rows updated");
		} else {
			aa.print("executing : " + sql);
			var rOut = sStmt.execute();
			aa.print(rOut);
		}
		sStmt.close();
		conn.close();
	} catch (err) {
		aa.print(err.message);
	}
}


function runReportAttach2(itemCapId,aaReportName)
	{
	// optional parameters are report parameter pairs
	// for example: runReportAttach(capId,"ReportName","altid",capId.getCustomID(),"months","12");
	

	var reportName = aaReportName;

	reportResult = aa.reportManager.getReportInfoModelByName(reportName);

	if (!reportResult.getSuccess())
		{ aa.print("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage()); return false; }

	var report = reportResult.getOutput(); 

	var itemCap = aa.cap.getCap(itemCapId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");

	report.setModule(appTypeArray[0]); 
	report.setCapId(itemCapId.getID1() + "-" + itemCapId.getID2() + "-" + itemCapId.getID3()); 
	report.getEDMSEntityIdModel().setAltId(itemCapId.getCustomID());

	var parameters = aa.util.newHashMap();              

	for (var i = 2; i < arguments.length ; i = i+2)
		{
		parameters.put(arguments[i],arguments[i+1]);
		aa.print("Report parameter: " + arguments[i] + " = " + arguments[i+1]);
		}	

	report.setReportParameters(parameters);

	var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
	if(permit.getOutput().booleanValue()) 
		{ 
		var reportResult = aa.reportManager.getReportResult(report); 

		aa.print("Report " + aaReportName + " has been run for " + itemCapId.getCustomID());

		}
	else
		aa.print("No permission to report: "+ reportName + " for user: " + currentUserID);
}
