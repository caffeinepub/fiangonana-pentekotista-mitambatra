import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  type Member = {
    id : Text;
    sectionId : Text;
    fullName : Text;
    address : Text;
    phone : Text;
    sex : Text;
    dateOfBirth : Text;
    father : Text;
    mother : Text;
    profession : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  type FinancialReport = {
    id : Text;
    sectionId : Text;
    date : Text;
    offerings : Nat;
    sales : Nat;
    fundraising : Nat;
    vows : [VowEntry];
    otherIncome : [OtherIncomeEntry];
    expenses : [ExpenseEntry];
    startingBalance : Int;
    totalIncome : Nat;
    totalExpenses : Nat;
    endingBalance : Int;
    createdAt : Int;
    updatedAt : Int;
    groupFinancialEntries : [LinkedGroupFinancialEntry];
  };

  type VowEntry = {
    amount : Nat;
    memberIds : [Text];
  };

  type OtherIncomeEntry = {
    amount : Nat;
    reason : Text;
  };

  type ExpenseEntry = {
    amount : Nat;
    description : Text;
  };

  type LinkedGroupFinancialEntry = {
    groupTransactionId : Text;
    transactionType : TransactionType;
    amount : Nat;
    originatingGroupName : Text;
    date : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  type TransactionType = {
    #deposit;
    #expense;
  };

  type MonthlyRemark = {
    sectionId : Text;
    year : Nat;
    month : Nat;
    remark : Text;
    updatedAt : Int;
  };

  type Program = {
    id : Text;
    sectionId : Text;
    date : Text;
    devotionLeader : Text;
    meetingLeader : Text;
    preacher : Text;
    songLeader : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  type Group = {
    id : Text;
    sectionId : Text;
    name : Text;
    presidentId : Text;
    secretaryId : Text;
    treasurerId : Text;
    memberIds : [Text];
    createdAt : Int;
    updatedAt : Int;
  };

  type GroupFinancialReport = {
    id : Text;
    groupId : Text;
    sectionId : Text;
    date : Text;
    deposit : Nat;
    expense : Nat;
    createdAt : Int;
    updatedAt : Int;
  };

  type AttendanceRecord = {
    id : Text;
    sectionId : Text;
    date : Text;
    records : [MemberAttendance];
    totalPresent : Nat;
    totalAbsent : Nat;
    createdAt : Int;
    updatedAt : Int;
  };

  type MemberAttendance = {
    memberId : Text;
    status : Text;
    absenceReason : ?Text;
  };

  type SectionCommittee = {
    sectionId : Text;
    presidentId : ?Text;
    treasurerId : ?Text;
    secretaryId : ?Text;
    updatedAt : Int;
  };

  type UserProfile = {
    name : Text;
    committeeRole : ?Text;
    section : ?Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    members : Map.Map<Text, Member>;
    financialReports : Map.Map<Text, FinancialReport>;
    monthlyRemarks : Map.Map<Text, MonthlyRemark>;
    programs : Map.Map<Text, Program>;
    groups : Map.Map<Text, Group>;
    groupFinancialReports : Map.Map<Text, GroupFinancialReport>;
    attendanceRecords : Map.Map<Text, AttendanceRecord>;
    sectionCommittees : Map.Map<Text, SectionCommittee>;
  };

  type Sentence = {
    id : Text;
    chinese : Text;
    english : Text;
    pinyin : Text;
    grammaticHints : ?Text;
    createdAt : Int;
    updatedAt : Int;
  };

  type Book = {
    id : Text;
    title : Text;
    author : Text;
    type_ : Text;
    topic : ?Text;
    level : Text;
    sentences : [Sentence];
    createdAt : Int;
    updatedAt : Int;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    members : Map.Map<Text, Member>;
    financialReports : Map.Map<Text, FinancialReport>;
    monthlyRemarks : Map.Map<Text, MonthlyRemark>;
    programs : Map.Map<Text, Program>;
    groups : Map.Map<Text, Group>;
    groupFinancialReports : Map.Map<Text, GroupFinancialReport>;
    attendanceRecords : Map.Map<Text, AttendanceRecord>;
    sectionCommittees : Map.Map<Text, SectionCommittee>;
    books : Map.Map<Text, Book>;
  };

  public func run(old : OldActor) : NewActor {
    let books = Map.empty<Text, Book>();
    { old with books };
  };
};
