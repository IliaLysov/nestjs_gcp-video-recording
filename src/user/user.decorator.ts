import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): { id: string; email: string } => {
    // const req = context.switchToHttp().getRequest();
    const client = context.switchToWs().getClient();
    console.log('curent user decorator');
    return client.user;
  },
);
