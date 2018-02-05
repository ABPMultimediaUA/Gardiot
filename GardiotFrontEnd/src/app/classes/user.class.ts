export class User {

 constructor(
   public id?: string,
   public name?: string,
   public password?: string,
   public password2?: string,
   public oldPassword?: string,
   public plan?: string,
   public countryCode?: string,
   public city?: string,
   public birthDate?: Date) {

 }
}
