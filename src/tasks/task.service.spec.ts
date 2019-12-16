import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './tasks-status.enum';
import { NotFoundException } from '@nestjs/common';

const mockUser = { id: 12, username: 'Test user' };

const mockTaskRepository = () => ({
  getTasks: jest.fn((filters, user) => {
    global.console.log(filters);
    global.console.log(user);
  }),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
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
      // taskRepository.getTasks.mockResolvedValue('someValue');
      jest.spyOn(taskRepository, 'getTasks').mockResolvedValue('someValue');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some search query',
      };
      const result = await tasksService.getTasks(filters, mockUser);
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

    it('trows an error as task is not found', () => {
      taskRepository.findOne.mockResolvedValue(null);
      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    describe('createTask', () => {
      it('create and return task', async () => {
        const mockTaskDto = {
          title: 'foo',
          description: 'bar',
        };
        taskRepository.createTask.mockResolvedValue('someValue');
        expect(taskRepository.createTask).not.toHaveBeenCalled();
        const result = await tasksService.createTask(mockTaskDto, mockUser);
        expect(taskRepository.createTask).toHaveBeenCalledWith(
          mockTaskDto,
          mockUser,
        );
        expect(result).toEqual('someValue');
      });
    });

    describe('deleteTask', () => {
      it('calls taskRepository.deleteTask() to delete a task', async () => {
        taskRepository.delete.mockResolvedValue({ affected: 1 });
        expect(taskRepository.delete).not.toHaveBeenCalled();
        await tasksService.deleteTask(1, mockUser);
        expect(taskRepository.delete).toHaveBeenCalledWith({
          id: 1,
          userId: mockUser.id,
        });
      });

      it('throws an error as task could not be found', () => {
        taskRepository.delete.mockResolvedValue({ affected: 0 });
        expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateTaskStatus', () => {
      it('updates a task status', async () => {
        const save = jest.fn().mockResolvedValue(true);

        tasksService.getTaskById = jest.fn().mockResolvedValue({
          status: TaskStatus.OPEN,
          save,
        });

        expect(tasksService.getTaskById).not.toHaveBeenCalled();
        expect(save).not.toHaveBeenCalled();
        const result = await tasksService.updateTaskStatus(
          1,
          TaskStatus.DONE,
          mockUser,
        );
        expect(tasksService.getTaskById).toHaveBeenCalled();
        expect(save).toHaveBeenCalled();
        expect(result.status).toEqual(TaskStatus.DONE);
      });
    });
  });
});
