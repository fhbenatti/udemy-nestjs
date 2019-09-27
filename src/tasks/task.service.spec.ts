import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './tasks-status.enum';

const mockUser = { id: 12, username: 'Test user' };

const mockTaskRepository = () => ({
  getTasks: jest.fn((filters, user) => {
    global.console.log(filters);
    global.console.log(user);
  }),
  findOne: jest.fn(filters => {
    global.console.log('findOne');
    global.console.log(filters);
  }),
});

describe('TaskService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('gets all tasks from the repository', async () => {
      taskRepository.getTasks.mockResolvedValue('someValue');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some search query',
      };
      const result = await tasksService.getTasks(filters, mockUser);
      tasksService.getTasks(filters, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and successfully retrieve and return the task', async () => {
      const mockTask = {
        title: 'Test task',
        description: 'Test desc',
      };
      taskRepository.findOne.mockResolvedValue(mockTask);
      const result = await tasksService.getTaskById(1, mockUser);
      expect(result).toEqual(mockTask);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        id: 1,
        userId: mockUser.id,
      });
    });

    it('trows an error as task is not found', () => {});
  });
});
