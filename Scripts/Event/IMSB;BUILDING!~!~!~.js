//InspectionMultipleScheduleBefore is a BACK OFFICE (AA) script

var capStatus = cap.getCapStatus();

if(capStatus != "Issued" && capStatus != "Permit Issued"){
	showMessage = true;
	showDebug = false;
	comment("Inspections may not be scheduled until a permit has been issued!");
	cancel = true;
}
