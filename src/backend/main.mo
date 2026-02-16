// Vondrona.mn ("Groups") - Church Group App
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Char "mo:core/Char";
import Migration "migration"; // Import the migration module

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Explicit migration via with clause
(with migration = Migration.run)
actor {
  // Initialize the access control system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    committeeRole : ?Text; // "President", "Treasurer", "Secretary"
    section : ?Text; // Current selected section
  };

  // Core Data Types
  public type Member = {
    id : Text;
    sectionId : Text;
    fullName : Text;
    address : Text;
    phone : Text;
    sex : Text; // "Male" or "Female"
    dateOfBirth : Text;
    father : Text;
    mother : Text;
    profession : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type FinancialReport = {
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

  public type VowEntry = {
    amount : Nat;
    memberIds : [Text];
  };

  public type OtherIncomeEntry = {
    amount : Nat;
    reason : Text;
  };

  public type ExpenseEntry = {
    amount : Nat;
    description : Text;
  };

  public type LinkedGroupFinancialEntry = {
    groupTransactionId : Text;
    transactionType : TransactionType;
    amount : Nat;
    originatingGroupName : Text;
    date : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type TransactionType = {
    #deposit;
    #expense;
  };

  public type MonthlyRemark = {
    sectionId : Text;
    year : Nat;
    month : Nat;
    remark : Text;
    updatedAt : Int;
  };

  public type Program = {
    id : Text;
    sectionId : Text;
    date : Text;
    devotionLeader : Text;
    meetingLeader : Text; // Member ID
    preacher : Text; // Member ID
    songLeader : Text; // Member ID
    createdAt : Int;
    updatedAt : Int;
  };

  public type Group = {
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

  public type GroupFinancialReport = {
    id : Text;
    groupId : Text;
    sectionId : Text;
    date : Text;
    deposit : Nat;
    expense : Nat;
    createdAt : Int;
    updatedAt : Int;
  };

  public type AttendanceRecord = {
    id : Text;
    sectionId : Text;
    date : Text;
    records : [MemberAttendance];
    totalPresent : Nat;
    totalAbsent : Nat;
    createdAt : Int;
    updatedAt : Int;
  };

  public type MemberAttendance = {
    memberId : Text;
    status : Text; // "Present" or "Absent"
    absenceReason : ?Text;
  };

  public type SectionCommittee = {
    sectionId : Text;
    presidentId : ?Text;
    treasurerId : ?Text;
    secretaryId : ?Text;
    updatedAt : Int;
  };

  // New Literature Type for Chinese Texts
  public type Sentence = {
    id : Text;
    chinese : Text;
    english : Text;
    pinyin : Text;
    grammaticHints : ?Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type Book = {
    id : Text;
    title : Text;
    author : Text;
    type_ : Text; // "Book" or "Lesson"
    topic : ?Text; // THEO, REL, CULTURE, ST (science/tech), GAME, 101
    level : Text; // A1, A2, B1, B2, C1, C2
    sentences : [Sentence];
    createdAt : Int;
    updatedAt : Int;
  };

  // Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let members = Map.empty<Text, Member>();
  let financialReports = Map.empty<Text, FinancialReport>();
  let monthlyRemarks = Map.empty<Text, MonthlyRemark>();
  let programs = Map.empty<Text, Program>();
  let groups = Map.empty<Text, Group>();
  let groupFinancialReports = Map.empty<Text, GroupFinancialReport>();
  let attendanceRecords = Map.empty<Text, AttendanceRecord>();
  let sectionCommittees = Map.empty<Text, SectionCommittee>();
  let books = Map.empty<Text, Book>();

  // Book Management
  public shared ({ caller }) func createBook(book : Book) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create books");
    };
    books.add(book.id, book);
    book.id;
  };

  public shared ({ caller }) func updateBook(book : Book) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update books");
    };
    books.add(book.id, book);
  };

  public shared ({ caller }) func deleteBook(bookId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete books");
    };
    books.remove(bookId);
  };

  public query ({ caller }) func getBook(bookId : Text) : async ?Book {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view books");
    };
    books.get(bookId);
  };

  public query ({ caller }) func listBooks() : async [Book] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list books");
    };
    books.values().toArray();
  };

  // Sentence Management
  public shared ({ caller }) func addSentenceToBook(bookId : Text, sentence : Sentence) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add sentences to books");
    };
    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book does not exist") };
      case (?book) {
        let updatedSentences = book.sentences.concat([sentence]);
        let updatedBook = { book with sentences = updatedSentences };
        books.add(bookId, updatedBook);
      };
    };
  };

  public shared ({ caller }) func updateSentenceInBook(bookId : Text, sentence : Sentence) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update sentences in books");
    };
    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book does not exist") };
      case (?book) {
        let updatedSentences = book.sentences.map(
          func(s) {
            if (s.id == sentence.id) { sentence } else { s };
          }
        );
        let updatedBook = { book with sentences = updatedSentences };
        books.add(bookId, updatedBook);
      };
    };
  };

  public shared ({ caller }) func deleteSentenceFromBook(bookId : Text, sentenceId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete sentences from books");
    };
    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book does not exist") };
      case (?book) {
        let updatedSentences = book.sentences.filter(
          func(s) { s.id != sentenceId }
        );
        let updatedBook = { book with sentences = updatedSentences };
        books.add(bookId, updatedBook);
      };
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Member Management
  public shared ({ caller }) func createMember(member : Member) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create members");
    };
    members.add(member.id, member);
    member.id;
  };

  public shared ({ caller }) func updateMember(member : Member) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update members");
    };
    members.add(member.id, member);
  };

  public shared ({ caller }) func deleteMember(memberId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete members");
    };
    members.remove(memberId);
  };

  public query ({ caller }) func getMember(memberId : Text) : async ?Member {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view members");
    };
    members.get(memberId);
  };

  public query ({ caller }) func listMembers(sectionId : Text) : async [Member] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list members");
    };
    members.values().filter(
        func(m : Member) : Bool { m.sectionId == sectionId }
      ).toArray();
  };

  // Financial Report Management
  public shared ({ caller }) func createFinancialReport(report : FinancialReport) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create financial reports");
    };
    financialReports.add(report.id, report);
    report.id;
  };

  public shared ({ caller }) func updateFinancialReport(report : FinancialReport) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update financial reports");
    };
    financialReports.add(report.id, report);
  };

  public shared ({ caller }) func deleteFinancialReport(reportId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete financial reports");
    };
    financialReports.remove(reportId);
  };

  public query ({ caller }) func getFinancialReport(reportId : Text) : async ?FinancialReport {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view financial reports");
    };
    financialReports.get(reportId);
  };

  public query ({ caller }) func listFinancialReports(sectionId : Text) : async [FinancialReport] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list financial reports");
    };
    financialReports.values().filter(
        func(r : FinancialReport) : Bool { r.sectionId == sectionId }
      ).toArray();
  };

  // Monthly Remark Management
  public shared ({ caller }) func saveMonthlyRemark(remark : MonthlyRemark) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save monthly remarks");
    };
    let key = remark.sectionId # "-" # remark.year.toText() # "-" # remark.month.toText();
    monthlyRemarks.add(key, remark);
  };

  public query ({ caller }) func getMonthlyRemark(sectionId : Text, year : Nat, month : Nat) : async ?MonthlyRemark {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view monthly remarks");
    };
    let key = sectionId # "-" # year.toText() # "-" # month.toText();
    monthlyRemarks.get(key);
  };

  // Program Management
  public shared ({ caller }) func createProgram(program : Program) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create programs");
    };
    programs.add(program.id, program);
    program.id;
  };

  public shared ({ caller }) func updateProgram(program : Program) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update programs");
    };
    programs.add(program.id, program);
  };

  public shared ({ caller }) func deleteProgram(programId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete programs");
    };
    programs.remove(programId);
  };

  public query ({ caller }) func getProgram(programId : Text) : async ?Program {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view programs");
    };
    programs.get(programId);
  };

  public query ({ caller }) func listPrograms(sectionId : Text) : async [Program] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list programs");
    };
    programs.values().filter(
        func(p : Program) : Bool { p.sectionId == sectionId }
      ).toArray();
  };

  // Group Management
  public shared ({ caller }) func createGroup(group : Group) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create groups");
    };
    groups.add(group.id, group);
    group.id;
  };

  public shared ({ caller }) func updateGroup(group : Group) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update groups");
    };
    groups.add(group.id, group);
  };

  public shared ({ caller }) func deleteGroup(groupId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete groups");
    };
    groups.remove(groupId);
  };

  public query ({ caller }) func getGroup(groupId : Text) : async ?Group {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view groups");
    };
    groups.get(groupId);
  };

  public query ({ caller }) func listGroups(sectionId : Text) : async [Group] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list groups");
    };
    groups.values().filter(
        func(g : Group) : Bool { g.sectionId == sectionId }
      ).toArray();
  };

  // Group Financial Report Management
  public shared ({ caller }) func createGroupFinancialReport(report : GroupFinancialReport) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create group financial reports");
    };
    groupFinancialReports.add(report.id, report);

    handleFinancialReportLink(report, #create);
    report.id;
  };

  public shared ({ caller }) func updateGroupFinancialReport(report : GroupFinancialReport) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update group financial reports");
    };
    groupFinancialReports.add(report.id, report);

    handleFinancialReportLink(report, #update);
  };

  public shared ({ caller }) func deleteGroupFinancialReport(reportId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete group financial reports");
    };

    let existingReport = groupFinancialReports.get(reportId);
    groupFinancialReports.remove(reportId);

    switch (existingReport) {
      case (null) {};
      case (?report) {
        handleFinancialReportLink(report, #delete);
      };
    };
  };

  public query ({ caller }) func getGroupFinancialReport(reportId : Text) : async ?GroupFinancialReport {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view group financial reports");
    };
    groupFinancialReports.get(reportId);
  };

  public query ({ caller }) func listGroupFinancialReports(groupId : Text) : async [GroupFinancialReport] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list group financial reports");
    };
    groupFinancialReports.values().filter(
        func(r : GroupFinancialReport) : Bool { r.groupId == groupId }
      ).toArray();
  };

  // Attendance Management
  public shared ({ caller }) func createAttendanceRecord(record : AttendanceRecord) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create attendance records");
    };
    attendanceRecords.add(record.id, record);
    record.id;
  };

  public shared ({ caller }) func updateAttendanceRecord(record : AttendanceRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update attendance records");
    };
    attendanceRecords.add(record.id, record);
  };

  public shared ({ caller }) func deleteAttendanceRecord(recordId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete attendance records");
    };
    attendanceRecords.remove(recordId);
  };

  public query ({ caller }) func getAttendanceRecord(recordId : Text) : async ?AttendanceRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view attendance records");
    };
    attendanceRecords.get(recordId);
  };

  public query ({ caller }) func listAttendanceRecords(sectionId : Text) : async [AttendanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list attendance records");
    };
    attendanceRecords.values().filter(
        func(r : AttendanceRecord) : Bool { r.sectionId == sectionId }
      ).toArray();
  };

  // Section Committee Management
  public shared ({ caller }) func updateSectionCommittee(committee : SectionCommittee) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update section committees");
    };
    sectionCommittees.add(committee.sectionId, committee);
  };

  public query ({ caller }) func getSectionCommittee(sectionId : Text) : async ?SectionCommittee {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view section committees");
    };
    sectionCommittees.get(sectionId);
  };

  // Admin-only: Committee Credential Management
  public shared ({ caller }) func initializeCommitteeCredentials(users : [Principal]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize committee credentials");
    };
    // Admin can assign user roles to the three committee members
    for (user in users.vals()) {
      AccessControl.assignRole(accessControlState, caller, user, #user);
    };
  };

  // Sync metadata (for UI feedback)
  public query ({ caller }) func getLastSyncTime() : async Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check sync time");
    };
    Time.now();
  };

  // Helper Types and Functions for Linking
  type LinkAction = {
    #create;
    #update;
    #delete;
  };

  func handleFinancialReportLink(groupReport : GroupFinancialReport, action : LinkAction) {
    let targetReportOpt = findOrCreateFinancialReport(groupReport.sectionId, groupReport.date);

    switch (targetReportOpt) {
      case (?targetReport) {
        let linkedEntries = updateLinkedEntries(groupReport, targetReport.groupFinancialEntries, action);

        let updatedReport : FinancialReport = {
          targetReport with
          totalIncome = calculateTotalIncome(targetReport) + calculateTotalLinkedIncome(linkedEntries);
          totalExpenses = calculateTotalExpenses(targetReport) + calculateTotalLinkedExpenses(linkedEntries);
          endingBalance = calculateEndingBalance(targetReport, linkedEntries);
          groupFinancialEntries = linkedEntries;
        };

        financialReports.add(targetReport.id, updatedReport);
      };
      case (null) {};
    };
  };

  func findOrCreateFinancialReport(sectionId : Text, date : Text) : ?FinancialReport {
    financialReports.values().find(
      func(r) { r.sectionId == sectionId and r.date == date }
    );
  };

  func updateLinkedEntries(groupReport : GroupFinancialReport, currentEntries : [LinkedGroupFinancialEntry], action : LinkAction) : [LinkedGroupFinancialEntry] {
    let depositEntry = {
      transactionType = #deposit;
      amount = groupReport.deposit;
      originatingGroupName = getGroupName(groupReport.groupId);
      date = groupReport.date;
      groupTransactionId = groupReport.id;
      createdAt = groupReport.createdAt;
      updatedAt = groupReport.updatedAt;
    };

    let expenseEntry = {
      transactionType = #expense;
      amount = groupReport.expense;
      originatingGroupName = getGroupName(groupReport.groupId);
      date = groupReport.date;
      groupTransactionId = groupReport.id;
      createdAt = groupReport.createdAt;
      updatedAt = groupReport.updatedAt;
    };

    switch (action) {
      case (#create) {
        currentEntries.concat([depositEntry, expenseEntry]);
      };
      case (#update) {
        currentEntries.map(
          func(entry) {
            if (entry.groupTransactionId == groupReport.id) {
              if (entry.transactionType == #deposit) { depositEntry } else {
                expenseEntry;
              };
            } else { entry };
          }
        );
      };
      case (#delete) {
        currentEntries.filter(
          func(entry) { entry.groupTransactionId != groupReport.id }
        );
      };
    };
  };

  func calculateTotalIncome(report : FinancialReport) : Nat {
    Nat.add(report.offerings, report.sales);
    // Additional income calculations...
  };

  func calculateTotalLinkedIncome(linkedEntries : [LinkedGroupFinancialEntry]) : Nat {
    linkedEntries.filter(
      func(entry) { entry.transactionType == #deposit }
    ).foldLeft(0, func(acc, entry) { acc + entry.amount });
  };

  func calculateTotalExpenses(report : FinancialReport) : Nat {
    report.expenses.foldLeft(0, func(acc, e) { acc + e.amount });
  };

  func calculateTotalLinkedExpenses(linkedEntries : [LinkedGroupFinancialEntry]) : Nat {
    linkedEntries.filter(
      func(entry) { entry.transactionType == #expense }
    ).foldLeft(0, func(acc, entry) { acc + entry.amount });
  };

  func calculateEndingBalance(report : FinancialReport, linkedEntries : [LinkedGroupFinancialEntry]) : Int {
    let totalIncome = calculateTotalIncome(report);
    let totalLinkedIncome = calculateTotalLinkedIncome(linkedEntries);

    let totalExpenses = calculateTotalExpenses(report);
    let totalLinkedExpenses = calculateTotalLinkedExpenses(linkedEntries);

    let totalIncomeInt = Int.abs(totalIncome + totalLinkedIncome);
    let sumExpenses = Nat.add(totalExpenses, totalLinkedExpenses);
    let totalExpenseInt = Int.abs(sumExpenses);

    totalIncomeInt - totalExpenseInt + report.startingBalance;
  };

  func getGroupName(groupId : Text) : Text {
    switch (groups.get(groupId)) {
      case (?group) { group.name };
      case (null) { "" };
    };
  };
};
