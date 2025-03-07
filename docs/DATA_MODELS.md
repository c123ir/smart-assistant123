# مدل‌های داده دستیار هوشمند توسعه

<div dir="rtl">

این مستند، ساختار داده‌های اصلی مورد استفاده در برنامه دستیار هوشمند توسعه را توضیح می‌دهد. این مدل‌ها در لایه‌های مختلف نرم‌افزار از پایگاه داده تا رابط کاربری استفاده می‌شوند.

## مدل کاربر (User)

مدل کاربر، اطلاعات مربوط به کاربران سیستم را نگهداری می‌کند:

```typescript
interface User {
  id: number;
  username: string;
  fullname: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  last_active: string;
  active_projects: number;
  completed_tasks: number;
  pending_tasks: number;
  settings: UserSettings;
}

enum UserRole {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  MANAGER = 'manager',
  GUEST = 'guest'
}

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  auto_backup: boolean;
  language: string;
  font_size: number;
}
```

### جدول پایگاه داده

جدول `users` در پایگاه داده SQLite:

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  fullname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  avatar_url TEXT,
  created_at TEXT NOT NULL,
  last_active TEXT NOT NULL,
  active_projects INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  pending_tasks INTEGER DEFAULT 0,
  settings TEXT NOT NULL
);
```

نکته: فیلد `settings` به صورت JSON ذخیره می‌شود.

## مدل پروژه (Project)

مدل پروژه، اطلاعات مربوط به پروژه‌های توسعه را نگهداری می‌کند:

```typescript
interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  start_date: string;
  end_date?: string;
  owner_id: number;
  team_members: number[]; // آی‌دی کاربران
  created_at: string;
  updated_at: string;
  repository_url?: string;
  phases: DevelopmentPhase[];
}

enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELED = 'canceled'
}
```

### جدول پایگاه داده

جدول `projects` در پایگاه داده SQLite:

```sql
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  owner_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  repository_url TEXT,
  FOREIGN KEY (owner_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS project_members (
  project_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  joined_at TEXT NOT NULL,
  PRIMARY KEY (project_id, user_id),
  FOREIGN KEY (project_id) REFERENCES projects (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## مدل فاز توسعه (Development Phase)

مدل فاز توسعه، مراحل مختلف یک پروژه را نگهداری می‌کند:

```typescript
interface DevelopmentPhase {
  id: number;
  project_id: number;
  name: string;
  description: string;
  status: PhaseStatus;
  start_date: string;
  end_date?: string;
  order: number;
  tasks: Task[];
  created_at: string;
  updated_at: string;
}

enum PhaseStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}
```

### جدول پایگاه داده

جدول `development_phases` در پایگاه داده SQLite:

```sql
CREATE TABLE IF NOT EXISTS development_phases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  order_index INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects (id)
);
```

## مدل وظیفه (Task)

مدل وظیفه، کارهای مختلف در یک فاز توسعه را نگهداری می‌کند:

```typescript
interface Task {
  id: number;
  phase_id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: number;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
  attachments: Attachment[];
  comments: Comment[];
}

enum TaskStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
  BLOCKED = 'blocked'
}

enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

interface Attachment {
  id: number;
  task_id: number;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: number;
}

interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}
```

### جدول پایگاه داده

جدول‌های مربوط به وظایف در پایگاه داده SQLite:

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phase_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  assignee_id INTEGER,
  due_date TEXT,
  estimated_hours REAL,
  actual_hours REAL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (phase_id) REFERENCES development_phases (id),
  FOREIGN KEY (assignee_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS task_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TEXT NOT NULL,
  uploaded_by INTEGER NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks (id),
  FOREIGN KEY (uploaded_by) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS task_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## مدل تصویر صفحه (Screenshot)

مدل تصویر صفحه، اطلاعات مربوط به تصاویر گرفته شده از صفحه را نگهداری می‌کند:

```typescript
interface Screenshot {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  image_path: string;
  thumbnail_path: string;
  created_at: string;
  tags: string[];
  related_task_id?: number;
}
```

### جدول پایگاه داده

جدول `screenshots` در پایگاه داده SQLite:

```sql
CREATE TABLE IF NOT EXISTS screenshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_path TEXT NOT NULL,
  thumbnail_path TEXT NOT NULL,
  created_at TEXT NOT NULL,
  tags TEXT,
  related_task_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (related_task_id) REFERENCES tasks (id)
);
```

نکته: فیلد `tags` به صورت JSON ذخیره می‌شود.

## مدل قطعه کد (Code Snippet)

مدل قطعه کد، اطلاعات مربوط به قطعات کد ذخیره شده را نگهداری می‌کند:

```typescript
interface CodeSnippet {
  id: number;
  user_id: number;
  title: string;
  code: string;
  language: string;
  description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  is_public: boolean;
}
```

### جدول پایگاه داده

جدول `code_snippets` در پایگاه داده SQLite:

```sql
CREATE TABLE IF NOT EXISTS code_snippets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  description TEXT,
  tags TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

نکته: فیلد `tags` به صورت JSON ذخیره می‌شود.

## مدل گزارش خطا (Error Log)

مدل گزارش خطا، اطلاعات مربوط به خطاهای رخ داده در برنامه را نگهداری می‌کند:

```typescript
interface ErrorLog {
  id: number;
  error_type: string;
  message: string;
  stack_trace: string;
  context: object;
  occurred_at: string;
  user_id?: number;
  resolved: boolean;
  resolution_notes?: string;
}
```

### جدول پایگاه داده

جدول `error_logs` در پایگاه داده SQLite:

```sql
CREATE TABLE IF NOT EXISTS error_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  stack_trace TEXT,
  context TEXT,
  occurred_at TEXT NOT NULL,
  user_id INTEGER,
  resolved BOOLEAN NOT NULL DEFAULT 0,
  resolution_notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

نکته: فیلد `context` به صورت JSON ذخیره می‌شود.

## مدل تنظیمات برنامه (Application Settings)

مدل تنظیمات برنامه، تنظیمات کلی برنامه را نگهداری می‌کند:

```typescript
interface ApplicationSettings {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_description: string;
  updated_at: string;
  updated_by: number;
}
```

### جدول پایگاه داده

جدول `application_settings` در پایگاه داده SQLite:

```sql
CREATE TABLE IF NOT EXISTS application_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_description TEXT,
  updated_at TEXT NOT NULL,
  updated_by INTEGER,
  FOREIGN KEY (updated_by) REFERENCES users (id)
);
```

## نکات مهم در استفاده از مدل‌های داده

1. **تاریخ و زمان**: تمام مقادیر تاریخ و زمان به صورت ISO 8601 (YYYY-MM-DDTHH:MM:SS.sssZ) ذخیره می‌شوند.
2. **رابطه‌های خارجی**: رابطه‌های خارجی در پایگاه داده با استفاده از FOREIGN KEY مشخص می‌شوند.
3. **ذخیره‌سازی JSON**: برخی از فیلدها مانند `settings` در مدل کاربر، به صورت JSON ذخیره می‌شوند.
4. **نوع داده‌های شمارشی**: در پایگاه داده، مقادیر شمارشی (enums) به صورت TEXT ذخیره می‌شوند.
5. **میدان‌های اختیاری**: میدان‌های اختیاری با علامت `?` در TypeScript مشخص می‌شوند و در پایگاه داده می‌توانند NULL باشند.

</div> 