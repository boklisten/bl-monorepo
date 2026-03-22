mongodump --uri="${FROM_MONGODB_URI}"
mongorestore --host "$MONGO_HOST:$MONGO_PORT" --username "$MONGO_USERNAME" --password "$MONGO_PASSWORD" --authenticationDatabase admin --drop --nsFrom="production.*" --nsTo="staging.*" dump/
