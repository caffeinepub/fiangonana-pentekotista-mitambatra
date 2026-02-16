import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MemberAttendance {
    status: string;
    memberId: string;
    absenceReason?: string;
}
export interface Group {
    id: string;
    treasurerId: string;
    name: string;
    createdAt: bigint;
    presidentId: string;
    updatedAt: bigint;
    sectionId: string;
    memberIds: Array<string>;
    secretaryId: string;
}
export interface VowEntry {
    memberIds: Array<string>;
    amount: bigint;
}
export interface LinkedGroupFinancialEntry {
    transactionType: TransactionType;
    originatingGroupName: string;
    date: string;
    createdAt: bigint;
    updatedAt: bigint;
    groupTransactionId: string;
    amount: bigint;
}
export interface SectionCommittee {
    treasurerId?: string;
    presidentId?: string;
    updatedAt: bigint;
    sectionId: string;
    secretaryId?: string;
}
export interface Program {
    id: string;
    preacher: string;
    meetingLeader: string;
    date: string;
    createdAt: bigint;
    updatedAt: bigint;
    sectionId: string;
    devotionLeader: string;
    songLeader: string;
}
export interface Member {
    id: string;
    sex: string;
    dateOfBirth: string;
    createdAt: bigint;
    profession: string;
    fullName: string;
    updatedAt: bigint;
    sectionId: string;
    address: string;
    phone: string;
    mother: string;
    father: string;
}
export interface OtherIncomeEntry {
    amount: bigint;
    reason: string;
}
export interface FinancialReport {
    id: string;
    offerings: bigint;
    date: string;
    fundraising: bigint;
    expenses: Array<ExpenseEntry>;
    createdAt: bigint;
    vows: Array<VowEntry>;
    totalIncome: bigint;
    groupFinancialEntries: Array<LinkedGroupFinancialEntry>;
    sales: bigint;
    totalExpenses: bigint;
    updatedAt: bigint;
    sectionId: string;
    otherIncome: Array<OtherIncomeEntry>;
    endingBalance: bigint;
    startingBalance: bigint;
}
export interface MonthlyRemark {
    remark: string;
    month: bigint;
    year: bigint;
    updatedAt: bigint;
    sectionId: string;
}
export interface ExpenseEntry {
    description: string;
    amount: bigint;
}
export interface AttendanceRecord {
    id: string;
    records: Array<MemberAttendance>;
    date: string;
    totalAbsent: bigint;
    createdAt: bigint;
    updatedAt: bigint;
    sectionId: string;
    totalPresent: bigint;
}
export interface UserProfile {
    committeeRole?: string;
    name: string;
    section?: string;
}
export interface GroupFinancialReport {
    id: string;
    expense: bigint;
    date: string;
    createdAt: bigint;
    deposit: bigint;
    updatedAt: bigint;
    groupId: string;
    sectionId: string;
}
export enum TransactionType {
    expense = "expense",
    deposit = "deposit"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAttendanceRecord(record: AttendanceRecord): Promise<string>;
    createFinancialReport(report: FinancialReport): Promise<string>;
    createGroup(group: Group): Promise<string>;
    createGroupFinancialReport(report: GroupFinancialReport): Promise<string>;
    createMember(member: Member): Promise<string>;
    createProgram(program: Program): Promise<string>;
    deleteAttendanceRecord(recordId: string): Promise<void>;
    deleteFinancialReport(reportId: string): Promise<void>;
    deleteGroup(groupId: string): Promise<void>;
    deleteGroupFinancialReport(reportId: string): Promise<void>;
    deleteMember(memberId: string): Promise<void>;
    deleteProgram(programId: string): Promise<void>;
    getAttendanceRecord(recordId: string): Promise<AttendanceRecord | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFinancialReport(reportId: string): Promise<FinancialReport | null>;
    getGroup(groupId: string): Promise<Group | null>;
    getGroupFinancialReport(reportId: string): Promise<GroupFinancialReport | null>;
    getLastSyncTime(): Promise<bigint>;
    getMember(memberId: string): Promise<Member | null>;
    getMonthlyRemark(sectionId: string, year: bigint, month: bigint): Promise<MonthlyRemark | null>;
    getProgram(programId: string): Promise<Program | null>;
    getSectionCommittee(sectionId: string): Promise<SectionCommittee | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeCommitteeCredentials(users: Array<Principal>): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listAttendanceRecords(sectionId: string): Promise<Array<AttendanceRecord>>;
    listFinancialReports(sectionId: string): Promise<Array<FinancialReport>>;
    listGroupFinancialReports(groupId: string): Promise<Array<GroupFinancialReport>>;
    listGroups(sectionId: string): Promise<Array<Group>>;
    listMembers(sectionId: string): Promise<Array<Member>>;
    listPrograms(sectionId: string): Promise<Array<Program>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveMonthlyRemark(remark: MonthlyRemark): Promise<void>;
    updateAttendanceRecord(record: AttendanceRecord): Promise<void>;
    updateFinancialReport(report: FinancialReport): Promise<void>;
    updateGroup(group: Group): Promise<void>;
    updateGroupFinancialReport(report: GroupFinancialReport): Promise<void>;
    updateMember(member: Member): Promise<void>;
    updateProgram(program: Program): Promise<void>;
    updateSectionCommittee(committee: SectionCommittee): Promise<void>;
}
