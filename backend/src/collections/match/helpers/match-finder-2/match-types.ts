export interface MatchableUser {
  id: string;
  items: Set<string>;
}

export enum CandidateMatchVariant {
  UserMatch = "UserMatch",
  StandMatch = "StandMatch",
}

export interface CandidateUserMatch {
  senderId: string;
  receiverId: string;
  items: Set<string>;
  variant: CandidateMatchVariant.UserMatch;
}

export interface CandidateStandMatch {
  userId: string;
  handoffItems: Set<string>;
  pickupItems: Set<string>;
  variant: CandidateMatchVariant.StandMatch;
}

export type CandidateMatch = CandidateStandMatch | CandidateUserMatch;

interface MatchMeetingInfo {
  meetingInfo: {
    location: string;
    date: Date;
  };
}

export interface MatchLocation {
  name: string;
  simultaneousMatchLimit?: number;
}

export type UserMatchWithMeetingInfo = CandidateUserMatch & MatchMeetingInfo;
export type StandMatchWithMeetingInfo = CandidateStandMatch & MatchMeetingInfo;
export type MatchWithMeetingInfo =
  | UserMatchWithMeetingInfo
  | StandMatchWithMeetingInfo;
