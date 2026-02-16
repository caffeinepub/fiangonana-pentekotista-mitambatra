import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeActor } from './useSafeActor';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  Member,
  FinancialReport,
  MonthlyRemark,
  Program,
  Group,
  GroupFinancialReport,
  AttendanceRecord,
  SectionCommittee,
  UserProfile,
} from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useSafeActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!identity && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Member Queries
export function useListMembers(sectionId: string | null) {
  const { actor, isFetching } = useSafeActor();

  return useQuery<Member[]>({
    queryKey: ['members', sectionId],
    queryFn: async () => {
      if (!actor || !sectionId) return [];
      return actor.listMembers(sectionId);
    },
    enabled: !!actor && !isFetching && !!sectionId,
  });
}

export function useCreateMember() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (member: Member) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createMember(member);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members', variables.sectionId] });
    },
  });
}

export function useUpdateMember() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (member: Member) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMember(member);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members', variables.sectionId] });
    },
  });
}

export function useDeleteMember() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, sectionId }: { memberId: string; sectionId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMember(memberId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members', variables.sectionId] });
    },
  });
}

// Financial Report Queries
export function useListFinancialReports(sectionId: string | null) {
  const { actor, isFetching } = useSafeActor();

  return useQuery<FinancialReport[]>({
    queryKey: ['financialReports', sectionId],
    queryFn: async () => {
      if (!actor || !sectionId) return [];
      return actor.listFinancialReports(sectionId);
    },
    enabled: !!actor && !isFetching && !!sectionId,
  });
}

export function useCreateFinancialReport() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: FinancialReport) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createFinancialReport(report);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financialReports', variables.sectionId] });
    },
  });
}

export function useUpdateFinancialReport() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: FinancialReport) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateFinancialReport(report);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financialReports', variables.sectionId] });
    },
  });
}

export function useDeleteFinancialReport() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, sectionId }: { reportId: string; sectionId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteFinancialReport(reportId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financialReports', variables.sectionId] });
    },
  });
}

// Monthly Remark Queries
export function useGetMonthlyRemark(sectionId: string | null, year: number, month: number) {
  const { actor, isFetching } = useSafeActor();

  return useQuery<MonthlyRemark | null>({
    queryKey: ['monthlyRemark', sectionId, year, month],
    queryFn: async () => {
      if (!actor || !sectionId) return null;
      return actor.getMonthlyRemark(sectionId, BigInt(year), BigInt(month));
    },
    enabled: !!actor && !isFetching && !!sectionId,
  });
}

export function useSaveMonthlyRemark() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (remark: MonthlyRemark) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveMonthlyRemark(remark);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['monthlyRemark', variables.sectionId, Number(variables.year), Number(variables.month)],
      });
    },
  });
}

// Program Queries
export function useListPrograms(sectionId: string | null) {
  const { actor, isFetching } = useSafeActor();

  return useQuery<Program[]>({
    queryKey: ['programs', sectionId],
    queryFn: async () => {
      if (!actor || !sectionId) return [];
      return actor.listPrograms(sectionId);
    },
    enabled: !!actor && !isFetching && !!sectionId,
  });
}

export function useCreateProgram() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (program: Program) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProgram(program);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['programs', variables.sectionId] });
    },
  });
}

export function useUpdateProgram() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (program: Program) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProgram(program);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['programs', variables.sectionId] });
    },
  });
}

export function useDeleteProgram() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ programId, sectionId }: { programId: string; sectionId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProgram(programId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['programs', variables.sectionId] });
    },
  });
}

// Group Queries
export function useListGroups(sectionId: string | null) {
  const { actor, isFetching } = useSafeActor();

  return useQuery<Group[]>({
    queryKey: ['groups', sectionId],
    queryFn: async () => {
      if (!actor || !sectionId) return [];
      return actor.listGroups(sectionId);
    },
    enabled: !!actor && !isFetching && !!sectionId,
  });
}

export function useCreateGroup() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (group: Group) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGroup(group);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.sectionId] });
    },
  });
}

export function useUpdateGroup() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (group: Group) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateGroup(group);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.sectionId] });
    },
  });
}

export function useDeleteGroup() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, sectionId }: { groupId: string; sectionId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteGroup(groupId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.sectionId] });
    },
  });
}

// Group Financial Report Queries
export function useListGroupFinancialReports(groupId: string | null) {
  const { actor, isFetching } = useSafeActor();

  return useQuery<GroupFinancialReport[]>({
    queryKey: ['groupFinancialReports', groupId],
    queryFn: async () => {
      if (!actor || !groupId) return [];
      return actor.listGroupFinancialReports(groupId);
    },
    enabled: !!actor && !isFetching && !!groupId,
  });
}

export function useCreateGroupFinancialReport() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: GroupFinancialReport) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGroupFinancialReport(report);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupFinancialReports', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['financialReports', variables.sectionId] });
    },
  });
}

export function useUpdateGroupFinancialReport() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: GroupFinancialReport) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateGroupFinancialReport(report);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupFinancialReports', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['financialReports', variables.sectionId] });
    },
  });
}

export function useDeleteGroupFinancialReport() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, groupId, sectionId }: { reportId: string; groupId: string; sectionId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteGroupFinancialReport(reportId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupFinancialReports', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['financialReports', variables.sectionId] });
    },
  });
}

// Attendance Queries
export function useListAttendanceRecords(sectionId: string | null) {
  const { actor, isFetching } = useSafeActor();

  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendanceRecords', sectionId],
    queryFn: async () => {
      if (!actor || !sectionId) return [];
      return actor.listAttendanceRecords(sectionId);
    },
    enabled: !!actor && !isFetching && !!sectionId,
  });
}

export function useCreateAttendanceRecord() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: AttendanceRecord) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAttendanceRecord(record);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendanceRecords', variables.sectionId] });
    },
  });
}

export function useUpdateAttendanceRecord() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: AttendanceRecord) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAttendanceRecord(record);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendanceRecords', variables.sectionId] });
    },
  });
}

export function useDeleteAttendanceRecord() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, sectionId }: { recordId: string; sectionId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAttendanceRecord(recordId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendanceRecords', variables.sectionId] });
    },
  });
}

// Section Committee Queries
export function useGetSectionCommittee(sectionId: string | null) {
  const { actor, isFetching } = useSafeActor();

  return useQuery<SectionCommittee | null>({
    queryKey: ['sectionCommittee', sectionId],
    queryFn: async () => {
      if (!actor || !sectionId) return null;
      return actor.getSectionCommittee(sectionId);
    },
    enabled: !!actor && !isFetching && !!sectionId,
  });
}

export function useUpdateSectionCommittee() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (committee: SectionCommittee) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSectionCommittee(committee);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sectionCommittee', variables.sectionId] });
    },
  });
}

// Sync Status Query
export function useGetLastSyncTime() {
  const { actor, isFetching } = useSafeActor();

  return useQuery<bigint>({
    queryKey: ['lastSyncTime'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getLastSyncTime();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
