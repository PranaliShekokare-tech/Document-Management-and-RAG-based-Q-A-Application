// src/users/users.controller.ts
import { Controller, Get, Patch, Param, Delete, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UpdateRoleDto } from './update-dto.ts/update-role.dto';


@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get all users (Admin only)
 
  @Roles('admin')
  @Get()
  findAll() {
    console.log('----here')
    return this.usersService.findAll();
  }

  // Update user role (Admin only)
  @Roles('admin')
  @Patch(':id/role')
  @ApiBody({ type: UpdateRoleDto })
  updateRole(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return this.usersService.updateRole(id, body.role);
  }

  // Delete user (Admin only)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return  this.usersService.delete(id);
   
  }
}
