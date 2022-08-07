import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
export default class User {
  @Field((_type) => ID)
  id!: string;

  @Field((_type) => String)
  username!: string;

  @Field((_type) => String)
  name!: string;

  password!: string;
}
