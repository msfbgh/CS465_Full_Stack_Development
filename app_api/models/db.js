const mongoose = require('mongoose');
const host = process.env.DB_HOST || '127.0.0.1'
const dbURI = `mongodb://${host}/travlr`;
const readLine = require('readline');

//mongoose.set('useUnifiedTopology', true);
mongoose.set('strictQuery', true);

if (process.env.NODE_ENV == 'production')
{
  dbURL = process.env.DB_HOST || process.env.MONGODB_URI;
}

//avoid 'current Server Discovery and Monitoring engine is deprecated'
//const connect = () => {
  //setTimeout(() => mongoose.connect(dbURI, {
    //useCreateIndex: true
    //}), 1000);
//}

mongoose.connect(dbURI,
  err => {
      if(err) throw err;
      console.log('connected to MongoDB')
  });

mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected`);
});
mongoose.connection.on('error', err => {
  console.log('Mongoose connection error:', + err);
  return connect();
});
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

if (process.platform === 'win32') {
    const rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
});
rl.on('SIGINT', () => {
  process.emit('SIGINT');
  });
}

const gracefulShutdown = (msg, callback) => {
  mongoose.connection.close(() => {
    console.log(`Mongoose disconnected through ${msg}`);
    callback();
  });
};

// For nodemon restarts                                 
process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2');
  });
});
// For app termination
process.on('SIGINT', () => {
  gracefulShutdown('app termination', () => {
    process.exit(0);
  });
});
// For Heroku app termination
process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app shutdown', () => {
    process.exit(0);
  });
});

//connect();

require('./travlr');