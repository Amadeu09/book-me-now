import { Rol } from '@prisma/client';
import { CurrentUserData } from '../decorators/current-user.decorator';

export function mockCurrentUser(overrides: Partial<CurrentUserData> = {}): CurrentUserData {
    return {
        userId: 1,
        empresaId: 1,
        email: 'test@test.com',
        rol: Rol.ADMIN_GENERAL,
        ...overrides,
    };
}
