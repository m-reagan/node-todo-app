if(process.env.NODE_ENV == "test"){
  process.env.port = 3000;
  process.env.MONGODB_URI = "mongodb://localhost:27017/TodoAppTest";
}else{
  process.env.port = 3000;
  process.env.MONGODB_URI = "mongodb://localhost:27017/TodoApp";
}
