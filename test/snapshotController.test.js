const snapshotController = require('../src/controller/snapshotController');
const poolPromise = require('../src/config/db');

jest.mock('../src/config/db', () => ({
  then: jest.fn(() => ({
    request: jest.fn().mockReturnThis(),
    query: jest.fn().mockResolvedValue({
      recordset: [{ Tagname: 'Test_Tag', Value: 100 }],
    }),
  })),
}));

describe('Snapshot Controller', () => {
  it('should return snapshots successfully', async () => {
    const req = {};
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await snapshotController.getSnapshots(req, res);

    expect(res.json).toHaveBeenCalledWith([{ Tagname: 'Test_Tag', Value: 100 }]);
  });

  it('should handle errors properly', async () => {
    poolPromise.then.mockImplementationOnce(() => {
      throw new Error('Database Error');
    });

    const req = {};
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await snapshotController.getSnapshots(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  });
});
