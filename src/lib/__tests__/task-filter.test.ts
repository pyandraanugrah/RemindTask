import { filterTasks, hasActiveFilters, TaskWithSubject } from '../task-filter';

describe('Task Filter Engine', () => {
  const baseDate = new Date('2026-09-27T10:00:00Z'); // Sunday morning

  const sampleTasks: TaskWithSubject[] = [
    {
      id: 'task-1',
      title: 'Tugas Matematika Diskrit',
      description: 'Mengerjakan soal graph dan tree',
      deadline: new Date('2026-09-27T15:00:00Z'), // Today
      priority: 'HIGH',
      status: 'TODO',
      progress: 0,
      subjectId: 'sub-1',
      reminderTime: null,
      createdAt: baseDate,
      updatedAt: baseDate,
      subject: {
        id: 'sub-1',
        name: 'Matematika Diskrit',
        color: '#3b82f6',
        createdAt: baseDate,
        updatedAt: baseDate,
      },
    },
    {
      id: 'task-2',
      title: 'Laporan Basis Data',
      description: 'Query SQL lanjut',
      deadline: new Date('2026-09-26T10:00:00Z'), // Yesterday -> Overdue
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      progress: 50,
      subjectId: 'sub-2',
      reminderTime: null,
      createdAt: baseDate,
      updatedAt: baseDate,
      subject: {
        id: 'sub-2',
        name: 'Basis Data',
        color: '#10b981',
        createdAt: baseDate,
        updatedAt: baseDate,
      },
    },
    {
      id: 'task-3',
      title: 'Proyek Algoritma',
      description: 'Dynamic programming',
      deadline: new Date('2026-10-05T12:00:00Z'), // Future / Next week
      priority: 'LOW',
      status: 'COMPLETED',
      progress: 100,
      subjectId: 'sub-1',
      reminderTime: null,
      createdAt: baseDate,
      updatedAt: baseDate,
      subject: {
        id: 'sub-1',
        name: 'Matematika Diskrit',
        color: '#3b82f6',
        createdAt: baseDate,
        updatedAt: baseDate,
      },
    },
  ];

  describe('Search', () => {
    test('Searches by task title (case-insensitive)', () => {
      const results = filterTasks(sampleTasks, { search: 'matematika' }, baseDate);
      expect(results).toHaveLength(2); // task-1 (title & subject) and task-3 (subject name)
    });

    test('Searches by task description', () => {
      const results = filterTasks(sampleTasks, { search: 'graph' }, baseDate);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('task-1');
    });

    test('Searches by subject name', () => {
      const results = filterTasks(sampleTasks, { search: 'Basis Data' }, baseDate);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('task-2');
    });

    test('Returns empty when search has no match', () => {
      const results = filterTasks(sampleTasks, { search: 'Kimia' }, baseDate);
      expect(results).toHaveLength(0);
    });
  });

  describe('Filter by Subject', () => {
    test('Filters by specific subject ID', () => {
      const results = filterTasks(sampleTasks, { subjectId: 'sub-2' }, baseDate);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('task-2');
    });

    test('Shows all when subjectId is ALL', () => {
      const results = filterTasks(sampleTasks, { subjectId: 'ALL' }, baseDate);
      expect(results).toHaveLength(3);
    });
  });

  describe('Filter by Priority', () => {
    test('Filters by HIGH priority', () => {
      const results = filterTasks(sampleTasks, { priority: 'HIGH' }, baseDate);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('task-1');
    });

    test('Filters by MEDIUM priority', () => {
      const results = filterTasks(sampleTasks, { priority: 'MEDIUM' }, baseDate);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('task-2');
    });
  });

  describe('Filter by Status', () => {
    test('Filters by TODO status', () => {
      const results = filterTasks(sampleTasks, { status: 'TODO' }, baseDate);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('task-1');
    });

    test('Filters by COMPLETED status', () => {
      const results = filterTasks(sampleTasks, { status: 'COMPLETED' }, baseDate);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('task-3');
    });
  });

  describe('Filter by Deadline', () => {
    test('Filters by OVERDUE', () => {
      const results = filterTasks(sampleTasks, { deadline: 'OVERDUE' }, baseDate);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('task-2');
    });

    test('Filters by TODAY', () => {
      const results = filterTasks(sampleTasks, { deadline: 'TODAY' }, baseDate);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('task-1');
    });

    test('Filters by UPCOMING', () => {
      const results = filterTasks(sampleTasks, { deadline: 'UPCOMING' }, baseDate);
      expect(results.some((t) => t.id === 'task-1')).toBe(true);
    });
  });

  describe('Combined Filters', () => {
    test('Combines search and priority', () => {
      const results = filterTasks(
        sampleTasks,
        { search: 'Diskrit', priority: 'HIGH' },
        baseDate
      );
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('task-1');
    });

    test('Combines search, subject, status, priority', () => {
      const results = filterTasks(
        sampleTasks,
        {
          search: 'soal',
          subjectId: 'sub-1',
          priority: 'HIGH',
          status: 'TODO',
          deadline: 'TODAY',
        },
        baseDate
      );
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('task-1');
    });

    test('Returns empty when combination yields no matches', () => {
      const results = filterTasks(
        sampleTasks,
        {
          search: 'soal',
          priority: 'LOW',
        },
        baseDate
      );
      expect(results).toHaveLength(0);
    });
  });

  describe('hasActiveFilters', () => {
    test('Returns false when all filters default', () => {
      expect(
        hasActiveFilters({
          search: '',
          subjectId: 'ALL',
          priority: 'ALL',
          status: 'ALL',
          deadline: 'ALL',
        })
      ).toBe(false);
    });

    test('Returns true when search is filled', () => {
      expect(hasActiveFilters({ search: 'hello' })).toBe(true);
    });

    test('Returns true when priority is set', () => {
      expect(hasActiveFilters({ priority: 'HIGH' })).toBe(true);
    });
  });
});
