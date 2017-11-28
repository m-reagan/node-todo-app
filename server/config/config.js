var env = process.env.NODE_ENV || "development";

env = env.trim();

if(env === 'test' || env === 'development') {
  var configObj = require('./config.json');
  var envConfig = configObj[env];

  Object.keys(envConfig).forEach( (key) => {
    process.env[key] = envConfig[key];
  });
}
