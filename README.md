# WARIDI REAL ESTATE BACKEND 

## Overview
This is a real estate mobile application that connects users to LandLords, Property Owners and a possibility of becoming a tenant. It also connects users to users to come to  an agreement if they can be on a budget to co-exist or become room mates.

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

         INSERT INTO "Roles" ("id", "roleName", "active", "createdAt", "updatedAt") 
       VALUES 
          (1, 'USER', true, NOW(), NOW()),
           (2, 'AGENT', true, NOW(), NOW()),
          (3, 'LANDLORD', true, NOW(), NOW())
          (4, 'SALES', true, NOW(), NOW()),
          (5, 'ADMIN', true, NOW(), NOW()),
          (6, 'SUPERADMIN', true, NOW(), NOW());

           




