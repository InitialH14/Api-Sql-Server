'use strict'

const {Command} = require('commander');
const { realtimeStream } = require('./src/app');
const timeScaleWorker = require('./src/services/websocket-method/timeScaleWorker');
const startProducer = require('./src/services/buffer-method/producer');
const runConsumer = require('./src/services/buffer-method/consumer');
const createSnapshot = require('./src/controller/snapshotController');

const args = new Command();

args
.name('node-command')
.usage('[command] [option] argument')
.description('CLI for get data from SQL Server and distribute it to Timescale DB')
.version('1.0.0');

args
.command('get')
.description('Start data ingestion from SQL server')
.option('-m, --mode <mode>', 'Set ingestion mode', 'request')
.option('-p, --port <port>', 'Port to use', 5003)
.option('-i, --interval <interval>', 'Interval time to get data per batch', 5000)
.action((options) => {

  console.log(`Getting data use ${options.mode} mode...`);

  if(options.mode === 'stream'){
      (
        async() => {
          try{
            await Promise.all([realtimeStream(options.interval), timeScaleWorker(options.port)])
            console.log('Websocket and Timescale DB connected successfully!');
          } catch(error) {
            console.log(`Failed to connect with socket ${error}`);
          }
        }
      )
  } else if(options.mode === 'event'){
    (
      async() => {
        try{
          await Promise.all([startProducer(), runConsumer()]);
          console.log('Producer and consumer already run! Enjoy get the data');
        } catch (error){
          console.log('Error while running the server: ', {error})
        }
      }
    )();
  } else if (options.mode === 'request'){
    exports.requestResponse = require('./src/app');
  } else {
    console.log('Please use the mode correctly');
  }
})

args
.command('create-snapshot')
.description('Create database snapshot in SQL Server')
.option('-s, --snapshotName <snapshot>', 'Snapshot name will create', 'Snapshot_JTD')
.option('-d, --databaseName <database>', 'Target database name')
.action((options) => {
  createSnapshot(options.snapshotName, options.databaseName);
})

args.parse(process.argv);




