import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  public type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text; committeeRole : ?Text; section : ?Text }>;
    members : Map.Map<Text, { id : Text; sectionId : Text; fullName : Text; address : Text; phone : Text; sex : Text; dateOfBirth : Text; father : Text; mother : Text; profession : Text; createdAt : Int; updatedAt : Int }>;
    financialReports : Map.Map<Text, { id : Text; sectionId : Text; date : Text; offerings : Nat; sales : Nat; fundraising : Nat; vows : [{ amount : Nat; memberIds : [Text] }]; otherIncome : [{ amount : Nat; reason : Text }]; expenses : [{ amount : Nat; description : Text }]; startingBalance : Int; totalIncome : Nat; totalExpenses : Nat; endingBalance : Int; createdAt : Int; updatedAt : Int; groupFinancialEntries : [{ groupTransactionId : Text; transactionType : { #deposit; #expense }; amount : Nat; originatingGroupName : Text; date : Text; createdAt : Int; updatedAt : Int }] }>;
    monthlyRemarks : Map.Map<Text, { sectionId : Text; year : Nat; month : Nat; remark : Text; updatedAt : Int }>;
    programs : Map.Map<Text, { id : Text; sectionId : Text; date : Text; devotionLeader : Text; meetingLeader : Text; preacher : Text; songLeader : Text; createdAt : Int; updatedAt : Int }>;
    groups : Map.Map<Text, { id : Text; sectionId : Text; name : Text; presidentId : Text; secretaryId : Text; treasurerId : Text; memberIds : [Text]; createdAt : Int; updatedAt : Int }>;
    groupFinancialReports : Map.Map<Text, { id : Text; groupId : Text; sectionId : Text; date : Text; deposit : Nat; expense : Nat; createdAt : Int; updatedAt : Int }>;
    attendanceRecords : Map.Map<Text, { id : Text; sectionId : Text; date : Text; records : [{ memberId : Text; status : Text; absenceReason : ?Text }]; totalPresent : Nat; totalAbsent : Nat; createdAt : Int; updatedAt : Int }>;
    sectionCommittees : Map.Map<Text, { sectionId : Text; presidentId : ?Text; treasurerId : ?Text; secretaryId : ?Text; updatedAt : Int }>;
  };

  public func run(old : OldActor) : OldActor {
    old;
  };
};

