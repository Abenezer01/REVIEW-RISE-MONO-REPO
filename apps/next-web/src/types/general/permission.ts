// Define the type for the ability rule
type Action = string;
type Subject = string;

export interface AbilityRule {
  action: Action;
  subject: Subject;
}
