export interface Deadline {
  soft: Date;
  hard: Date;
}

export interface OverdueTask {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  softDeadline: Date;
  hardDeadline: Date;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  completed: boolean;
  overdueStatus: 'on-time' | 'soft-overdue' | 'hard-overdue';
  overdueDays: number;
}

export interface OverdueSettings {
  softDeadlineOffset: number; // days before hard deadline
  hardDeadlineOffset: number; // days after due date
  enableNotifications: boolean;
  notificationThreshold: number; // days before soft deadline
}

export class OverdueManager {
  private settings: OverdueSettings;

  constructor(settings: Partial<OverdueSettings> = {}) {
    this.settings = {
      softDeadlineOffset: 3,
      hardDeadlineOffset: 7,
      enableNotifications: true,
      notificationThreshold: 1,
      ...settings
    };
  }

  calculateDeadlines(dueDate: Date): Deadline {
    const softDeadline = new Date(dueDate);
    softDeadline.setDate(softDeadline.getDate() - this.settings.softDeadlineOffset);

    const hardDeadline = new Date(dueDate);
    hardDeadline.setDate(hardDeadline.getDate() + this.settings.hardDeadlineOffset);

    return { soft: softDeadline, hard: hardDeadline };
  }

  getOverdueStatus(task: Omit<OverdueTask, 'overdueStatus' | 'overdueDays'>): {
    status: OverdueTask['overdueStatus'];
    days: number;
  } {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const softDeadline = new Date(task.softDeadline);
    const hardDeadline = new Date(task.hardDeadline);

    if (now > hardDeadline) {
      const days = Math.floor((now.getTime() - hardDeadline.getTime()) / (1000 * 60 * 60 * 24));
      return { status: 'hard-overdue', days };
    } else if (now > softDeadline) {
      const days = Math.floor((now.getTime() - softDeadline.getTime()) / (1000 * 60 * 60 * 24));
      return { status: 'soft-overdue', days };
    } else {
      const days = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { status: 'on-time', days: Math.max(0, days) };
    }
  }

  getOverdueTasks(tasks: Omit<OverdueTask, 'overdueStatus' | 'overdueDays'>[]): OverdueTask[] {
    return tasks.map(task => {
      const deadlines = this.calculateDeadlines(task.dueDate);
      const overdueInfo = this.getOverdueStatus({
        ...task,
        softDeadline: deadlines.soft,
        hardDeadline: deadlines.hard
      });

      return {
        ...task,
        softDeadline: deadlines.soft,
        hardDeadline: deadlines.hard,
        overdueStatus: overdueInfo.status,
        overdueDays: overdueInfo.days
      };
    });
  }

  getOverdueSummary(tasks: OverdueTask[]): {
    onTime: number;
    softOverdue: number;
    hardOverdue: number;
    totalOverdue: number;
  } {
    const summary = {
      onTime: 0,
      softOverdue: 0,
      hardOverdue: 0,
      totalOverdue: 0
    };

    tasks.forEach(task => {
      if (!task.completed) {
        switch (task.overdueStatus) {
          case 'on-time':
            summary.onTime++;
            break;
          case 'soft-overdue':
            summary.softOverdue++;
            summary.totalOverdue++;
            break;
          case 'hard-overdue':
            summary.hardOverdue++;
            summary.totalOverdue++;
            break;
        }
      }
    });

    return summary;
  }

  shouldShowNotification(task: OverdueTask): boolean {
    if (!this.settings.enableNotifications) return false;
    
    const now = new Date();
    const notificationDate = new Date(task.softDeadline);
    notificationDate.setDate(notificationDate.getDate() - this.settings.notificationThreshold);

    return now >= notificationDate && !task.completed;
  }

  updateSettings(newSettings: Partial<OverdueSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  getSettings(): OverdueSettings {
    return { ...this.settings };
  }
} 