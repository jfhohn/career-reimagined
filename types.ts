export interface CareerImage {
  id: string;
  career: string;
  imageUrl: string;
  loading: boolean;
  error?: string;
}

export interface PlanWeek {
  weekNumber: number;
  theme: string;
  goals: string[];
  actionItems: string[];
}

export interface LinkableItem {
  title: string;
  url: string;
}

export interface CareerPlan {
  career: string;
  isFictional: boolean;
  intro: string;
  weeks: PlanWeek[];
  skillsToDevelop: string[];
  thoughtLeaders: LinkableItem[];
  recommendedCourses: LinkableItem[];
  targetCompanies: LinkableItem[];
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  GENERATING_IMAGES = 'GENERATING_IMAGES',
  GALLERY = 'GALLERY',
  GENERATING_PLAN = 'GENERATING_PLAN',
  PLAN_VIEW = 'PLAN_VIEW',
}
