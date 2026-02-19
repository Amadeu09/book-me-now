import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {};

describe('ClientsService', () => {
    let service: ClientsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClientsService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<ClientsService>(ClientsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
