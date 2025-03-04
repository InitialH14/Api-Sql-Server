const { Kafka } = require('kafkajs');
const { io } = require('socket.io-client');
const timescalePool = require('../src/config/timescaleDb');
const { runConsumer } = require('../src/services/buffer-method/consumer');

jest.mock('kafkajs'); 
jest.mock('socket.io-client');
jest.mock('../src/config/timescaleDb');

describe('Kafka Consumer Tests', () => {
  let mockSocket;
  let mockConsumer;
  let mockTimescaleClient;
  
  beforeAll(() => {
    mockSocket = {
      emit: jest.fn(),
      on: jest.fn()
    };
    io.mockReturnValue(mockSocket);

    mockTimescaleClient = {
      connect: jest.fn().mockResolvedValue(),
      query: jest.fn().mockResolvedValue({}),
      release: jest.fn()
    };
    timescalePool.connect.mockResolvedValue(mockTimescaleClient);

    mockConsumer = {
      connect: jest.fn().mockResolvedValue(),
      subscribe: jest.fn().mockResolvedValue(),
      run: jest.fn().mockImplementation(({ eachMessage }) => {
        const message = {
          value: Buffer.from(JSON.stringify([
            { Tagname: 'tag1', Value: 123, Value_Timestamp: '2025-03-03T12:00:00Z' }
          ]))
        };
        eachMessage({ message });
      })
    };

    Kafka.mockImplementation(() => ({
      consumer: jest.fn().mockReturnValue(mockConsumer)
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to Kafka and emit data to WebSocket', async () => {
   
    await runConsumer();

    expect(mockConsumer.connect).toHaveBeenCalledTimes(1);
    
    expect(mockConsumer.subscribe).toHaveBeenCalledWith({ topic: 'scada-buffer', fromBeginning: true });

    expect(mockSocket.emit).toHaveBeenCalledWith('snapshotData', [
      { Tagname: 'tag1', Value: 123, Value_Timestamp: '2025-03-03T12:00:00Z' }
    ]);
  });

  it('should handle JSON parsing errors and not emit bad data to WebSocket', async () => {
    
    mockConsumer.run.mockImplementationOnce(({ eachMessage }) => {
      const message = {
        value: Buffer.from('Invalid JSON')
      };
      eachMessage({ message });
    });

    await runConsumer();

    expect(console.error).toHaveBeenCalledWith('JSON Parsing Error:', expect.any(Error));
    
    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  it('should insert data into TimescaleDB', async () => {
    const data = [
      { Tagname: 'tag1', Value: 123, Value_Timestamp: '2025-03-03T12:00:00Z' }
    ];

    mockConsumer.run.mockImplementationOnce(({ eachMessage }) => {
      const message = {
        value: Buffer.from(JSON.stringify(data))
      };
      eachMessage({ message });
    });

    await runConsumer();

    expect(mockTimescaleClient.query).toHaveBeenCalledWith(
      'BEGIN'
    );

    expect(mockTimescaleClient.query).toHaveBeenCalledWith(
      'INSERT INTO snapshots_data (tagname, value, value_timestamp) VALUES ($1, $2, $3) ON CONFLICT (id, create_at) DO NOTHING;',
      ['tag1', 123, '2025-03-03T12:00:00Z']
    );

    expect(mockTimescaleClient.query).toHaveBeenCalledWith(
      'COMMIT'
    );
  });

  it('should handle errors in database insertion and rollback', async () => {
    mockTimescaleClient.query.mockRejectedValueOnce(new Error('Database error'));

    const data = [
      { Tagname: 'tag1', Value: 123, Value_Timestamp: '2025-03-03T12:00:00Z' }
    ];

    mockConsumer.run.mockImplementationOnce(({ eachMessage }) => {
      const message = {
        value: Buffer.from(JSON.stringify(data))
      };
      eachMessage({ message });
    });

    await runConsumer();

    expect(mockTimescaleClient.query).toHaveBeenCalledWith('ROLLBACK');
  });
});

