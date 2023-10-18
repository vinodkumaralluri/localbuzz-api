import { Test, TestingModule } from '@nestjs/testing';
import { ClassifiedsController } from './classifieds.controller';

describe('ClassifiedsController', () => {
  let controller: ClassifiedsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassifiedsController],
    }).compile();

    controller = module.get<ClassifiedsController>(ClassifiedsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
