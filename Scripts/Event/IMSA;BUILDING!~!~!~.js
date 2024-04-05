//InspectionMultipleScheduleAfter is a BACK OFFICE (AA) script

try{
  if(inspType != 'Final Landscape Design' || 'Rough Fire Sprinkler' || 'Fire High Fire Landscaping' || 'Fire Final'){
	  var inspAssignArea = String(getGISInfoSB("SantaBarbara", "Building Permit Inspection Areas", "Region", "-5"));

	  if (inspId && inspAssignArea.length > 0) {
	  	var inspectorId = String(lookup("BLD_INSP_ASSIGNMENT_MAPPING", inspAssignArea));
	  	if (inspectorId.length > 0) {
	  		assignInspection(inspId, inspectorId);
	  	}
    }
  }
} catch(ISAex){
	logDebug("Error in ISA event: "+ ISAex);
	showDebug=true;
}

function getGISInfoSB(svc,layer,attributename) {
	
	var distanceType = "feet";
	var retString;
   	
	var bufferTargetResult = aa.gis.getGISType(svc,layer); // get the buffer target
	if (bufferTargetResult.getSuccess())
		{
		var buf = bufferTargetResult.getOutput();
		buf.addAttributeName(attributename);
		}
	else
		{ logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()) ; return false }
			
	var gisObjResult = aa.gis.getCapGISObjects(capId); // get gis objects on the cap
	if (gisObjResult.getSuccess()){ 	
		var fGisObj = gisObjResult.getOutput();
		aa.print(fGisObj);
		}
	else
		{ logDebug("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }

	for (a1 in fGisObj) // for each GIS object on the Cap.  We'll only send the last value
		{
		var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], "0", distanceType, buf);

		if (bufchk.getSuccess())
			var proxArr = bufchk.getOutput();
		else
			{ logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()) ; return false }	
		
		for (a2 in proxArr)
			{
			var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
			for (z1 in proxObj)
				{
				var v = proxObj[z1].getAttributeValues()
				retString = v[0];
				}
			
			}
		}
	return retString
}







//Added by Nicole Folman


try{
  if (inspType == 'Underground Gas Piping') {
    var rInspArr = new Array('Erosion Control [Required for UG Gas Piping]');
    addComboInspection(rInspArr);

    var incrementedInspId = (parseInt(inspId, 10) + 1).toString();
    assignInspectionBasedOnArea(incrementedInspId);

    if(incrementedInspId){
      var inspector = inspectorId;
    }
  }
  if (inspType == 'Underground Electrical') {
    var rInspArr = new Array('Erosion Control [Required for UG Electrical]');
    addComboInspection(rInspArr);

    var incrementedInspId = (parseInt(inspId, 10) + 1).toString();
    assignInspectionBasedOnArea(incrementedInspId);

    if(incrementedInspId){
      var inspector = inspectorId;
    }
  }
  if (inspType == 'Underground Plumbing') {
    var rInspArr = new Array('Erosion Control [Required for UG Plumbing]');
    addComboInspection(rInspArr);

    var incrementedInspId = (parseInt(inspId, 10) + 1).toString();
    assignInspectionBasedOnArea(incrementedInspId);

    if(incrementedInspId){
      var inspector = inspectorId;
    }
  }
  if (inspType == 'Foundation') {
    var rInspArr = new Array('Erosion Control [Required for Foundation]');
    addComboInspection(rInspArr);

    var incrementedInspId = (parseInt(inspId, 10) + 1).toString();
    assignInspectionBasedOnArea(incrementedInspId);

    if(incrementedInspId){
      var inspector = inspectorId;
    }
  }
  if (inspType == 'Reinforcement Steel') {
    var rInspArr = new Array('Erosion Control [Required for Reinforcement Steel]');
    addComboInspection(rInspArr);

    var incrementedInspId = (parseInt(inspId, 10) + 1).toString();
    assignInspectionBasedOnArea(incrementedInspId);

    if(incrementedInspId){
      var inspector = inspectorId;
    }
  }
  if (inspType == 'Rough Grading') {
    var rInspArr = new Array('Erosion Control [Required for Rough Grading]');
    addComboInspection(rInspArr);

    var incrementedInspId = (parseInt(inspId, 10) + 1).toString();
    assignInspectionBasedOnArea(incrementedInspId);

    if(incrementedInspId){
      var inspector = inspectorId;
    }
  }

  if(inspType == 'Final Landscape Design'){ //If Final Landscape Design, assign to Jasmine Showers
    var inspectorId = aa.person.getUser('JSHOWERS').getOutput().getUserID();
    assignInspection(inspId, inspectorId);
  } else
  
  if(inspType == 'Rough Fire Sprinkler' || 'Fire High Fire Landscaping' || 'Fire Final'){
    var fireInspector = aa.person.getUser('ALYNN').getOutput().getUserID();
    assignInspection(inspId, fireInspector);
  }
  
}
catch(err){
  logDebug("Error in ISA event *Schedule second inspection*: "+ err + " occurred on line " + err.lineNumber);
  showDebug=true;
  logDebug("<BR/>|****JavaScript Error: " + err.message + " occurred in line " + err.lineNumber + " of ISA:BUILDING/*/*/*.js <BR/>|****Error Stack: " + err.stack);

  email("nfolman@santabarbaraca.gov","SBCityLDT_Test@santabarbaraca.gov", " ", "debug from catch error in ISA:BUILDING/*/*/*.js " + capIDString + " " + debug );
}

function addComboInspection(rInspArr) {
  for (var x in rInspArr) {
    var rInspection = rInspArr[x];
    var inspObj = aa.inspection.getInspection(capId, inspId).getOutput(); // current inspection object
    var rInsp = getAssignedStaff();
    var rPhone = inspObj.getRequestPhoneNum();
    var rCom = inspObj.getInspectionComments();

     if (inspObj.getScheduledDate()){
      rMonth = inspObj.getScheduledDate().getMonth();
      rDay = inspObj.getScheduledDate().getDayOfMonth();
      rYear = inspObj.getScheduledDate().getYear();

      scheduledDate = rMonth + "/" + rDay + "/" + rYear
    } else {
      scheduledDate = null;
    }
  }
    scheduleInspectDate(rInspection, scheduledDate, rInsp, null, rCom, rPhone);
}


function assignInspectionBasedOnArea(incrementedInspId) {
  var inspAssignArea = String(getGISInfo("SantaBarbara", "Building Permit Inspection Areas", "Region", "-5"));
  
  if (incrementedInspId && inspAssignArea.length > 0) {
    var inspectorId = String(lookup("BLD_INSP_ASSIGNMENT_MAPPING", inspAssignArea));
      
    if (inspectorId.length > 0) {
      assignInspection(incrementedInspId, inspectorId);
    }
  }
}
