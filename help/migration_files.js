// npx sequelize-cli model:generate --name Role --attributes roleName:string,active:boolean;
// npx sequelize-cli model:generate --name User --attributes roleId:integer,username:string,email:string,password:string,confirm_password:string,accessToken:text,resetPasswordToken:text,resetPasswordExpires:date,verified:boolean,active:boolean;
// npx sequelize-cli model:generate --name Otp --attributes userId:string,code:string,createdAt:date,expireIn:date;
// npx sequelize-cli model:generate --name Apartment --attributes logent_id:integer,apartment_name:string,apartment_location:string,apartment_description:text,type1:string,name1:string,data1:blob,type2:string,name2:string,data2:blob,type3:string,name3:string,data3:blob,type4:string,name4:string,data4:blob;
// npx sequelize-cli model:generate --name Tenant --attributes userId:integer,logentId:string,tenant_lname:string,tenent_location:string,tenant_idno:integer,tenant_phonenumber:integer,tenant_avatar:string,type:string;
