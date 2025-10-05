/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './users.schema';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    save: jest.fn(),
  };

  beforeEach(async () => {
    const mockUserInstance = {
      ...mockUser,
      save: jest.fn().mockResolvedValue(mockUser),
    };

    mockUserModel = jest.fn().mockReturnValue(mockUserInstance);
    mockUserModel.find = jest.fn();
    mockUserModel.create = jest.fn();
    mockUserModel.findById = jest.fn();
    mockUserModel.findByIdAndUpdate = jest.fn();
    mockUserModel.findByIdAndDelete = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const mockUserInstance = {
        ...mockUser,
        save: jest.fn().mockResolvedValue(mockUser),
      };

      mockUserModel.mockReturnValue(mockUserInstance);

      const result = await service.create(
        createUserDto.name,
        createUserDto.email,
      );

      expect(mockUserModel).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
      });
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should handle creation with only name (email optional)', async () => {
      const createUserDto = {
        name: 'Jane Doe',
        email: '',
      };

      const mockUserWithoutEmail = {
        ...mockUser,
        name: 'Jane Doe',
        email: '',
      };

      const mockUserInstance = {
        ...mockUserWithoutEmail,
        save: jest.fn().mockResolvedValue(mockUserWithoutEmail),
      };

      mockUserModel.mockReturnValue(mockUserInstance);

      const result = await service.create(
        createUserDto.name,
        createUserDto.email,
      );

      expect(result).toEqual(mockUserWithoutEmail);
    });

    it('should throw an error when creation fails', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const mockUserInstance = {
        save: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      mockUserModel.mockReturnValue(mockUserInstance);

      await expect(
        service.create(createUserDto.name, createUserDto.email),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        { _id: '1', name: 'John Doe', email: 'john@example.com' },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      ];

      const execMock = jest.fn().mockResolvedValue(mockUsers);
      mockUserModel.find.mockReturnValue({ exec: execMock });

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUserModel.find).toHaveBeenCalledWith();
      expect(execMock).toHaveBeenCalled();
    });

    it('should return an empty array when no users exist', async () => {
      const execMock = jest.fn().mockResolvedValue([]);
      mockUserModel.find.mockReturnValue({ exec: execMock });

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockUserModel.find).toHaveBeenCalledWith();
      expect(execMock).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const execMock = jest
        .fn()
        .mockRejectedValue(new Error('Database connection error'));
      mockUserModel.find.mockReturnValue({ exec: execMock });

      await expect(service.findAll()).rejects.toThrow(
        'Database connection error',
      );
    });
  });

  describe('edge cases and validation', () => {
    it('should handle empty string parameters gracefully', async () => {
      const emptyUser = {
        ...mockUser,
        name: '',
        email: '',
      };

      const mockUserInstance = {
        ...emptyUser,
        save: jest.fn().mockResolvedValue(emptyUser),
      };

      mockUserModel.mockReturnValue(mockUserInstance);

      const result = await service.create('', '');

      expect(result).toEqual(emptyUser);
    });

    it('should handle special characters in name and email', async () => {
      const specialCharUser = {
        ...mockUser,
        name: 'José María',
        email: 'josé@example.com',
      };

      const mockUserInstance = {
        ...specialCharUser,
        save: jest.fn().mockResolvedValue(specialCharUser),
      };

      mockUserModel.mockReturnValue(mockUserInstance);

      const result = await service.create('José María', 'josé@example.com');

      expect(result).toEqual(specialCharUser);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
