import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { GoogleProfilePayload } from '../strategies/google.strategy';

export const CurrentGoogleProfile = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): GoogleProfilePayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
