## Error codes and their resemblance, for the frontend guys

// 4xx errors -> Errors because of incorrect client input, or something wrong on the client end
// 5xx errors -> Errors in the backend server side code (Not to be shown to the clients)

400 -> Record with same primary key already exists
404 (/search) -> No results for this search
404 (/checkout) -> No results for this product id
404 (/cancel) -> No results for this order id
404 (GET /product) -> No result for this product ID
451 -> Invalid parameters
452 -> Order already cancelled
452 (/checkout) -> Order quantity is too high
453 (/checkout) -> Order quantity cannot be negative
453 -> Invalid data 
454 -> New record is invalid

500 -> Invalid root folder of the database
501 -> Cannot manually create config files.
502 -> Schema not found
503 -> Database with same name already exists
504 -> Invalid database
505 -> Database is not empty
513 -> Collection with same name already exists
514 -> Invalid Collection
515 -> Collection is not empty
