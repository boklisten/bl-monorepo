mongodump --uri="${FROM_MONGODB_URI}"
mongorestore --drop --uri="${TO_MONGODB_URI}" --nsFrom="production.*" --nsTo="staging.*" dump/
