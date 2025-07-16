export interface MatchableUser {
  id: string;
  items: Set<string>;
  wantedItems: Set<string>;
  groupMembership: string;
}
