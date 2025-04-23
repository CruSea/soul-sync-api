import { Test, TestingModule } from '@nestjs/testing';
import { MentorController } from './mentor.controller';
import { MentorService } from './mentor.service';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { GetMentorDto } from './dto/get-mentor.dto';
import { NotFoundException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '../../auth/guard/auth/auth.guard';

describe('MentorController', () => {
  let controller: MentorController;
  let service: MentorService;

  const mockMentorService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentorController],
      providers: [
        {
          provide: MentorService,
          useValue: mockMentorService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<MentorController>(MentorController);
    service = module.get<MentorService>(MentorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMentors', () => {
    it('should return a list of mentors', async () => {
      const result = { data: [], meta: { total: 0, page: 1, limit: 10 } };
      mockMentorService.findAll.mockResolvedValue(result);

      expect(await controller.getMentors({})).toEqual(result);
      expect(mockMentorService.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a mentor', async () => {
      const mentor = { id: '1', name: 'John Doe' };
      mockMentorService.findOne.mockResolvedValue(mentor);

      expect(await controller.findOne('1', new GetMentorDto())).toEqual(mentor);
      expect(mockMentorService.findOne).toHaveBeenCalledWith(
        '1',
        expect.any(GetMentorDto),
      );
    });

    it('should throw NotFoundException if mentor not found', async () => {
      mockMentorService.findOne.mockRejectedValue(
        new NotFoundException('Mentor not found'),
      );

      await expect(controller.findOne('1', new GetMentorDto())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a mentor', async () => {
      const createDto: CreateMentorDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        accountId: 'acc1',
      };
      const mentor = { id: '1', ...createDto };
      mockMentorService.create.mockResolvedValue(mentor);

      expect(await controller.create(createDto)).toEqual(mentor);
      expect(mockMentorService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update and return a mentor', async () => {
      const updateDto: UpdateMentorDto = {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
      };
      const mentor = { id: '1', ...updateDto };
      mockMentorService.update.mockResolvedValue(mentor);

      expect(await controller.update('1', updateDto)).toEqual(mentor);
      expect(mockMentorService.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should throw NotFoundException if mentor not found', async () => {
      mockMentorService.update.mockRejectedValue(
        new NotFoundException('Mentor not found'),
      );

      await expect(
        controller.update('1', new UpdateMentorDto()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a mentor and return status', async () => {
      const result = { status: true };
      mockMentorService.delete.mockResolvedValue(result);

      expect(await controller.delete('1')).toEqual(result);
      expect(mockMentorService.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if mentor not found', async () => {
      mockMentorService.delete.mockRejectedValue(
        new NotFoundException('Mentor not found'),
      );

      await expect(controller.delete('1')).rejects.toThrow(NotFoundException);
    });
  });
});
