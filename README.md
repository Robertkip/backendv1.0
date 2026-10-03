# WARIDI REAL ESTATE BACKEND 

## Overview
This is a real estate mobile application that connects users to LandLords, Property Owners and a possibility of becoming a tenant. It also connects users to users to come to  an agreement if they can be on a budget to co-exist or become room mates.

## Requirements

- Node.js 20 or newer
- PostgreSQL
- Redis
- MongoDB (posts and chat messages; the rest of the API runs without it)

### Quick start

1. `npm install --legacy-peer-deps`
2. Create an empty Postgres database (default name `waridi`).
3. Copy `env.example` to `.env` and set at least `DATABASE_PASSWORD`. `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER` and `DATABASE_NAME` default to `localhost`, `5432`, `postgres` and `waridi`; `MONGO_URI` defaults to `mongodb://localhost:27017/waridi` and `REDIS_URL` to `redis://localhost:6379`.
4. `npm run dev:server`

When there are no files in `migrations/`, startup creates any missing tables from the Sequelize models. Google sign-in is turned on only when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. Push notifications need a Firebase service account key: get it from an administrator and set `FIREBASE_SERVICE_ACCOUNT_PATH` to its location (default `waridi-793c4-firebase-adminsdk-4z45i-cf675a6b0d.json` in the project root). Without it the server starts with push notifications disabled. Never commit this file or `.env`. Insert the roles listed under **Configure Database** below before registering users.

### Running tests

Tests drop and recreate tables, so they only run against a database whose name ends in `_test` (default `waridi_test`; override with `TEST_DATABASE_NAME`).

1. Create the test database once: `CREATE DATABASE waridi_test;`
2. `npm test`

The connection uses the same `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER` and `DATABASE_PASSWORD` as the app.

Verify the Node.js version before installing dependencies:

```bash
node --version
```

The project declares Node.js `>=20.0.0` in `package.json`.

## Table of Content
           
   ### . Local Project Setup

   1) Clone Github Branch **backendv1.2** to your local setup
     
             git clone -b backendv1.2 --single-branch https://github.com/Waridi-RE/backendv1.0.git 

   2) CD into your cloned directory *cd backendv1* then install node modules

             npm install --legacy-peer-deps

         #### Setup Environment Variables

        We have environment variables example file pushed to the github repository, create .env file in local setup base directory. Obtain the values and paste where the keys belong           

        #### Setup Email For The Enviroment Variables.

        . Click on the link below to go to auth 2 playground to generate token.

          [Click Here](https://developers.google.com/oauthplayground/)    

          > [!TIP]
          > Read Out To Administrator to Provide a Token For Your Setup


         #### Setup Database 

         > [!IMPORTANT]      
         > Make Sure you have setup postgres locally if it is in Windows Os, Mac Os or Linux Family Of Distributions

         . Install sequelize cli

             npm install sequelize-cli --legacy-peer-deps

         . Delete config models and migrations folder in base directory


         . Initial Sequelize CLI

            npm sequelize-cli init 

         . Replace file config/config.json with appropriate database values

         . Create Database in postgres. Depending on the OS you use to access database. In ubuntu from terminal.

            CREATE DATABASE waridi;

            Then

            GRANT PRIVILEGES ON DATABASE waridi TO postgres;
           

        #### Run Sequelize Migrations

        . In help/migration_file.js there is migration for the Database Tables

           - Run Role migration.    

          
         > [!IMPORTANT]      
         > After Generating Migration For Role Or Any Other Table navigate to package.json and since this project runs on ES6 but sequelize migrations are run on ES5 we need to change this line: **"type": "module"** to **"type": "commonjs"** then after pushing migration revert back.

         . Push Migration After Generating Migration

            npx sequelize-cli db:migrate

       #### Configure Database

         Add this tables into Postgres Database:

         - Change Password of Postgres

             sudo -i -u postgres

             /password

         INSERT INTO "roles" ("id", "roleName", "active", "createdAt", "updatedAt") 
       VALUES 
          (1, 'USER', true, NOW(), NOW()),
           (2, 'AGENT', true, NOW(), NOW()),
          (3, 'LANDLORD', true, NOW(), NOW()),
          (4, 'SALES', true, NOW(), NOW()),
          (5, 'ADMIN', true, NOW(), NOW()),
          (6, 'SUPERADMIN', true, NOW(), NOW());

           




