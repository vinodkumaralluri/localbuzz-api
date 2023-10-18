import { Test, TestingModule } from '@nestjs/testing';
import { ClassifiedsService } from './classifieds.service';

describe('ClassifiedsService', () => {
  let service: ClassifiedsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassifiedsService],
    }).compile();

    service = module.get<ClassifiedsService>(ClassifiedsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
