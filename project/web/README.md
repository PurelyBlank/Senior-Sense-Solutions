# Senior Sense Solutions (Web Application)

## About this Project

A full-stack application designed to store and analyze the patient’s data, including activity levels, heart rate, and blood oxygen trends. It also monitors medication compliance trends and falling incidents, sending alerts to the caregiver user when necessary. Finally, it displays the device's battery level and location.



## Get Started

### Install Required Dependencies

In the backend directory, execute:

```
npm install
```

In the web directory, execute:

```
npm install
```

### Launch Local Instance

1.) Log into your Google Cloud account, and create a new project.  

Navigate to Enable APIs and services, then enable the Maps JavaScript API. This will generate your new API key.  

In the web directory, create a ```.env``` file with the following line. Replace ```YOUR_API_KEY``` with your actual key:  

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY
```

2.) Create a PostgreSQL database with TimescaleDB extension according to the following information:  

Username: postgres  
Password: postgres  
Host: localhost  
Port: 5432  
Database name: testdb  

In the backend directory, create a ```.env``` file with the following fields:

```
JWT_SECRET_KEY=s34pkq13/+sWTiW+VXNGq6JTznEh/6UTqG0k2sZ+kxs=
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=testdb
```

3.) In one terminal, navigate to the backend directory and execute:

```
node server.js
```

4.) In a second terminal, navigate to the web directory and execute:

```
npm run dev
```

If the Next.js compiler is stuck, delete the .next folder and execute ```npm run dev``` again.