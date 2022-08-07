import { verify } from 'jsonwebtoken';
import { MiddlewareFn } from 'type-graphql';
import MyContext from '../context/myContext';

const isAuthenticated: MiddlewareFn<MyContext> = ({ context }, next) => {
  console.log('[isAuthenticated]: validating user authorization');
  const authorization = context.req.headers['authorization'];

  if (!authorization) {
    console.log('[isAuthenticated]: user not authenticated');
    throw new Error('user not authenticated');
  }

  try {
    console.log('[isAuthenticated]: getting accesstoken from request');
    const token = authorization.split(' ')[1];
    const payload = verify(token, 'APP_SECRET');
    context.payload = payload as any;
  } catch (error) {
    console.log('user not authenticated');
    throw new Error(`${error}`);
  }
  return next();
};

export default isAuthenticated;
