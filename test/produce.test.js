const { Kafka } = require('kafkajs');
const poolPromise = require('../src/config/db');
const { fetchDataAndSendToKafka, startProducer } = require('../src/services/buffer-method/producer');  

jest.mock('kafkajs');
jest.mock('../src/config/db');

describe('Kafka Producer Tests', () => {
  let mockPool;
  let mockProducer;
  
  beforeAll(() => {
    mockPool = {
      request: jest.fn().mockReturnValue({
        query: jest.fn().mockResolvedValue({
          recordset: [
            { Tagname: 'tag1', Value: 123, Value_Timestamp: '2025-03-03T12:00:00Z' },
            { Tagname: 'tag2', Value: 456, Value_Timestamp: '2025-03-03T12:05:00Z' }
          ]
        })
      })
    };

    mockProducer = {
      connect: jest.fn().mockResolvedValue(),
      send: jest.fn().mockResolvedValue()
    };

    poolPromise.mockResolvedValue(mockPool);

    Kafka.mockImplementation(() => ({
      producer: jest.fn().mockReturnValue(mockProducer)
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch data and send messages to Kafka', async () => {
    await fetchDataAndSendToKafka();

    expect(mockProducer.send).toHaveBeenCalledTimes(2); 
    expect(mockProducer.send).toHaveBeenCalledWith({
      topic: 'scada-buffer',
      messages: [{ value: '{"Tagname":"tag1","Value":123,"Value_Timestamp":"2025-03-03T12:00:00Z"}' }]
    });
    expect(mockProducer.send).toHaveBeenCalledWith({
      topic: 'scada-buffer',
      messages: [{ value: '{"Tagname":"tag2","Value":456,"Value_Timestamp":"2025-03-03T12:05:00Z"}' }]
    });
  });

  it('should handle database connection error', async () => {
    poolPromise.mockResolvedValueOnce(null);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    await fetchDataAndSendToKafka();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching data:', new Error('Database connection is not available'));
    consoleErrorSpy.mockRestore();
  });

  it('should handle Kafka producer connection error', async () => {
    mockProducer.connect.mockRejectedValueOnce(new Error('Kafka connection failed'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await startProducer();
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to connect Kafka Producer:', new Error('Kafka connection failed'));
    consoleErrorSpy.mockRestore();
  });

  it('should call fetchDataAndSendToKafka every 5 seconds', async () => {
    jest.useFakeTimers();
    
    const fetchDataSpy = jest.spyOn(global, 'fetchDataAndSendToKafka').mockImplementation();
    
    startProducer();
    
    jest.advanceTimersByTime(5000);
    expect(fetchDataSpy).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});

