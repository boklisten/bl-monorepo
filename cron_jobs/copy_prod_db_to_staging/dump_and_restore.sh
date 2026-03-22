mongodump --uri="${FROM_MONGODB_URI}"
mongorestore --host "$MONGOHOST:$MONGOPORT" --username "$MONGOUSER" --password "$MONGOPASSWORD" --authenticationDatabase admin --drop --nsFrom="production.*" --nsTo="staging.*" dump/
