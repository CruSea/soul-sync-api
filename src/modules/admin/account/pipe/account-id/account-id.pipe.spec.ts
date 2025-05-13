import { AccountIdPipe } from './account-id.pipe';

describe('AccountIdPipe', () => {
  let pipe: AccountIdPipe;

  const mockPrismaService = {
    account: {
      findFirst: jest.fn(),
    },
  };

  const mockRequest = {
    user: { id: 'test-user-id' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    pipe = new AccountIdPipe(mockPrismaService as any, mockRequest);
  });

  it('should throw if account not found', async () => {
    mockPrismaService.account.findFirst.mockResolvedValue(null);

    await expect(pipe.transform({ accountId: 'invalid-id' })).rejects.toThrow(
      'Account not found!',
    );
  });

  it('should return value if account exists', async () => {
    mockPrismaService.account.findFirst.mockResolvedValue({ id: 'acc-id' });

    const result = await pipe.transform({ accountId: 'acc-id' });
    expect(result).toEqual({ accountId: 'acc-id' });
  });
});
