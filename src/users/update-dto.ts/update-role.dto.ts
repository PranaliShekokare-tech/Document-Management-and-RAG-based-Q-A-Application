// src/users/dto/update-role.dto.ts
import { IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Role to assign',
    example: 'editor',
    enum: ['admin', 'editor', 'viewer'],
  })
  @IsNotEmpty()
  @IsIn(['admin', 'editor', 'viewer'])
  role!: string;
}
  
