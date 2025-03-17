import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const token = request.headers['authorization'];
        console.log(' Authorization Header:', token);
      
        if (!token) {
          console.log('❌ No token found in request headers!');
        }
      
        if (err || !user) {
          console.error('❌ JwtAuthGuard error:', err);
          console.error('❌ JwtAuthGuard info:', info);
          throw new UnauthorizedException('You are not authorized!');
        }
      
        return user;
      }
      
}
