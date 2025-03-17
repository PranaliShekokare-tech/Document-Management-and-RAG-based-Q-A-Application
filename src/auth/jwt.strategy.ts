import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'yourSuperSecretJWT', 
    }); 
  }

  async validate(payload: any) {
    const user = await this.usersService.findByUsername(payload.username);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
  
    return { userId: user.id, username: user.username, role: user.role };
  }
  
  
  
}
